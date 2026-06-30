import { ConversationAgent } from './conversation.agent';
import { AgentName } from '../../core/agent/agent-name.enum';

/** Extrait les événements SSE écrits dans la Response factice. */
function sseEvents(res: any): any[] {
  return res.write.mock.calls
    .map((c: any[]) => String(c[0]))
    .filter((s: string) => s.startsWith('data: '))
    .map((s: string) => JSON.parse(s.slice(6).trim()));
}

function buildAgent(opts: { streamThrows?: boolean } = {}) {
  const orchestrator = {
    run: jest.fn(async (ctx: any, hooks: any) => {
      hooks?.onAgentStep?.(AgentName.Knowledge, 'success', {});
      ctx.outputs[AgentName.Knowledge] = {
        agent: AgentName.Knowledge,
        status: 'success',
        confidence: 1,
        data: {
          chunks: [{ id: 'c1', titre: 'CEPICI', extrait: 'extrait officiel' }],
          context: 'CONTEXTE-DOC',
          sufficient: true,
        },
      };
      ctx.outputs[AgentName.Quality] = {
        agent: AgentName.Quality,
        status: 'success',
        confidence: 0.8,
        data: { passed: true, confidence: 0.8, hallucinationRisk: 0.2 },
      };
    }),
  };

  const prisma = {
    conversation: {
      findFirst: jest.fn().mockResolvedValue({ id: 'conv-1' }),
      create: jest.fn().mockResolvedValue({ id: 'conv-new' }),
    },
    message: {
      create: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([{ sender: 'USER', contenu: 'Je veux créer une SARL' }]),
    },
    aiSettings: { findFirst: jest.fn().mockResolvedValue({ promptSysteme: 'SYS' }) },
    aiLog: { create: jest.fn().mockResolvedValue({}) },
  };

  const llm = {
    stream: jest.fn(async (optsArg: any, handlers: any) => {
      if (opts.streamThrows) throw new Error('LLM indisponible');
      handlers.onText('Bonjour');
      handlers.onText(' SARL');
      return { text: 'Bonjour SARL', model: 'claude-sonnet-4-6', inputTokens: 10, outputTokens: 5 };
    }),
  };

  const res = { setHeader: jest.fn(), write: jest.fn(), end: jest.fn() };
  const agent = new ConversationAgent(orchestrator as any, prisma as any, llm as any);
  return { agent, res, orchestrator, prisma, llm };
}

describe('ConversationAgent (SSE)', () => {
  it('émet la séquence SSE complète: status, agent_step, sources, quality, chunk, done', async () => {
    const { agent, res } = buildAgent();

    await agent.handle(
      { userId: 'user-1', message: 'Je veux créer une SARL', conversationId: 'conv-1' },
      res as any,
    );

    const types = sseEvents(res).map((e) => e.type);
    expect(types).toEqual(
      expect.arrayContaining(['status', 'agent_step', 'sources', 'quality', 'chunk', 'done']),
    );
  });

  it('streame le contenu de la réponse par morceaux (chunks)', async () => {
    const { agent, res } = buildAgent();
    await agent.handle({ userId: 'user-1', message: 'x', conversationId: 'conv-1' }, res as any);

    const chunks = sseEvents(res).filter((e) => e.type === 'chunk').map((e) => e.content);
    expect(chunks.join('')).toBe('Bonjour SARL');
  });

  it('ancre la synthèse sur le contexte documentaire du Knowledge Agent', async () => {
    const { agent, res, llm } = buildAgent();
    await agent.handle({ userId: 'user-1', message: 'x', conversationId: 'conv-1' }, res as any);

    const system = (llm.stream.mock.calls[0][0] as any).system;
    expect(system).toContain('CONTEXTE-DOC');
  });

  it('expose le verdict qualité dans l\'événement quality', async () => {
    const { agent, res } = buildAgent();
    await agent.handle({ userId: 'user-1', message: 'x', conversationId: 'conv-1' }, res as any);

    const quality = sseEvents(res).find((e) => e.type === 'quality');
    expect(quality.passed).toBe(true);
    expect(quality.confidence).toBe(0.8);
  });

  it('persiste le message utilisateur, la réponse IA et le log', async () => {
    const { agent, res, prisma } = buildAgent();
    await agent.handle({ userId: 'user-1', message: 'x', conversationId: 'conv-1' }, res as any);

    expect(prisma.message.create).toHaveBeenCalledTimes(2); // user + IA
    expect(prisma.aiLog.create).toHaveBeenCalled();
    expect(res.end).toHaveBeenCalled();
  });

  it('émet un événement error si le LLM est indisponible', async () => {
    const { agent, res } = buildAgent({ streamThrows: true });
    await agent.handle({ userId: 'user-1', message: 'x', conversationId: 'conv-1' }, res as any);

    const types = sseEvents(res).map((e) => e.type);
    expect(types).toContain('error');
    expect(res.end).toHaveBeenCalled();
  });
});

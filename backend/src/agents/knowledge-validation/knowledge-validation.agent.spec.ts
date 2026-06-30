import { KnowledgeValidationAgent } from './knowledge-validation.agent';
import { AgentName } from '../../core/agent/agent-name.enum';
import { makeContext, withOutput } from '../../test-utils/agent-context.fixture';

function makeAgent(candidatesById: Record<string, any>) {
  const prisma = {
    knowledgeCandidate: {
      findUnique: jest.fn(({ where }: any) => Promise.resolve(candidatesById[where.id] ?? null)),
      update: jest.fn().mockResolvedValue({}),
    },
  };
  return { agent: new KnowledgeValidationAgent(prisma as any), prisma };
}

describe('KnowledgeValidationAgent', () => {
  it('accepte un candidat de qualité et cohérent, et réclame le Manager', async () => {
    const longRelevant =
      'Pour créer une SARL en Côte d\'Ivoire, le CEPICI accompagne la création. '.repeat(20);
    const { agent, prisma } = makeAgent({
      cand1: { id: 'cand1', cleanedText: longRelevant, createdAt: new Date() },
    });
    const ctx = makeContext({ userMessage: 'Je veux créer une SARL' });
    withOutput(ctx, AgentName.WebResearch, { candidates: [{ id: 'cand1' }] });

    const res = await agent.execute(ctx);

    expect(res.data.acceptedIds).toContain('cand1');
    expect(res.followups).toEqual([AgentName.KnowledgeManager]);
    expect(prisma.knowledgeCandidate.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ statut: 'valide' }) }),
    );
  });

  it('rejette un candidat trop court (qualité insuffisante)', async () => {
    const { agent } = makeAgent({
      cand2: { id: 'cand2', cleanedText: 'trop court', createdAt: new Date() },
    });
    const ctx = makeContext({ userMessage: 'créer une SARL' });
    withOutput(ctx, AgentName.WebResearch, { candidates: [{ id: 'cand2' }] });

    const res = await agent.execute(ctx);

    expect(res.data.acceptedIds).toEqual([]);
    expect(res.data.rejected[0].id).toBe('cand2');
    expect(res.followups).toEqual([]);
  });
});

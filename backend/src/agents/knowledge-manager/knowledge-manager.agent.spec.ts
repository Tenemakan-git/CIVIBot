import { KnowledgeManagerAgent } from './knowledge-manager.agent';
import { AgentName } from '../../core/agent/agent-name.enum';
import { Events } from '../../core/events/event-names';
import { makeContext, withOutput } from '../../test-utils/agent-context.fixture';

function makeAgent() {
  const prisma = {
    knowledgeCandidate: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'cand1',
        titre: 'Création SARL',
        organisme: 'CEPICI',
        sourceUrl: 'https://www.cepici.ci/x',
        cleanedText: 'contenu officiel',
        statut: 'valide',
      }),
      update: jest.fn().mockResolvedValue({}),
    },
    knowledgeDocument: { create: jest.fn().mockResolvedValue({ id: 'doc1', titre: 'Création SARL' }) },
    knowledgeVersion: { create: jest.fn().mockResolvedValue({}) },
    $executeRaw: jest.fn().mockResolvedValue(1),
  };
  const embedding = { embedBatch: jest.fn().mockResolvedValue([[0.1], [0.2]]) };
  const splitter = { splitIntoChunks: jest.fn().mockResolvedValue(['chunk1', 'chunk2']) };
  const events = { emit: jest.fn() };
  const agent = new KnowledgeManagerAgent(
    prisma as any,
    embedding as any,
    splitter as any,
    events as any,
  );
  return { agent, prisma, embedding, events };
}

describe('KnowledgeManagerAgent', () => {
  it('crée le document, insère les embeddings pgvector, versionne et notifie', async () => {
    const { agent, prisma, events } = makeAgent();
    const ctx = makeContext();
    withOutput(ctx, AgentName.KnowledgeValidation, { acceptedIds: ['cand1'] });

    const res = await agent.execute(ctx);

    expect(res.data.documents).toHaveLength(1);
    expect(res.data.totalChunks).toBe(2);
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(2); // 1 insert par chunk
    expect(prisma.knowledgeVersion.create).toHaveBeenCalled();
    expect(prisma.knowledgeCandidate.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { statut: 'insere' } }),
    );
    expect(events.emit).toHaveBeenCalledWith(Events.Knowledge.Committed, expect.anything());
    expect(res.followups).toEqual([AgentName.Knowledge]); // re-run enrichi
  });

  it('ne fait rien sans candidat accepté', async () => {
    const { agent, prisma } = makeAgent();
    const ctx = makeContext();
    withOutput(ctx, AgentName.KnowledgeValidation, { acceptedIds: [] });

    const res = await agent.execute(ctx);

    expect(res.data.documents).toEqual([]);
    expect(prisma.knowledgeDocument.create).not.toHaveBeenCalled();
    expect(res.followups).toEqual([]);
  });
});

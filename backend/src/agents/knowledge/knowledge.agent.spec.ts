import { KnowledgeAgent } from './knowledge.agent';
import { AgentName } from '../../core/agent/agent-name.enum';
import { Events } from '../../core/events/event-names';
import { makeContext } from '../../test-utils/agent-context.fixture';

function chunk(score: number, titre = 'CEPICI', id = 'c1') {
  return { id, titre, texte: 'texte officiel '.repeat(20), extrait: 'extrait', score };
}

function makeAgent(searchResult: any[]) {
  const search = { search: jest.fn().mockResolvedValue(searchResult) };
  const prisma = { aiSettings: { findFirst: jest.fn().mockResolvedValue(null) } };
  const events = { emit: jest.fn() };
  const agent = new KnowledgeAgent(search as any, prisma as any, events as any);
  return { agent, search, events };
}

describe('KnowledgeAgent', () => {
  it('recherche pgvector et juge la connaissance suffisante (score élevé)', async () => {
    const { agent, search } = makeAgent([chunk(0.9), chunk(0.7, 'DGI', 'c2')]);

    const res = await agent.execute(makeContext());

    expect(search.search).toHaveBeenCalled();
    expect(res.data.sufficient).toBe(true);
    expect(res.followups).toBeUndefined();
    expect(res.data.context).toContain('CEPICI');
    expect(res.sources?.length).toBe(2); // dédup par titre
  });

  it('déclenche le Web Research quand la connaissance est insuffisante', async () => {
    const { agent, events } = makeAgent([chunk(0.3)]);

    const res = await agent.execute(makeContext());

    expect(res.data.sufficient).toBe(false);
    expect(res.status).toBe('needs_followup');
    expect(res.followups).toEqual([AgentName.WebResearch]);
    expect(events.emit).toHaveBeenCalledWith(
      Events.Knowledge.InsufficientLocal,
      expect.objectContaining({ query: expect.any(String) }),
    );
  });

  it('ne relance PAS la recherche web si déjà enrichi (garde anti-boucle)', async () => {
    const { agent, events } = makeAgent([chunk(0.2)]);
    const ctx = makeContext({ metadata: { webResearchDone: true } });

    const res = await agent.execute(ctx);

    expect(res.followups).toBeUndefined();
    expect(events.emit).not.toHaveBeenCalled();
  });

  it('gère l\'absence de résultats (insuffisant, contexte vide)', async () => {
    const { agent } = makeAgent([]);

    const res = await agent.execute(makeContext());

    expect(res.data.sufficient).toBe(false);
    expect(res.data.context).toBe('');
    expect(res.data.chunks).toEqual([]);
  });
});

import { WebResearchAgent } from './web-research.agent';
import { AgentName } from '../../core/agent/agent-name.enum';
import { Events } from '../../core/events/event-names';
import { makeContext } from '../../test-utils/agent-context.fixture';

function makeAgent(candidates: any[]) {
  const pipeline = { run: jest.fn().mockResolvedValue(candidates) };
  const events = { emit: jest.fn() };
  return { agent: new WebResearchAgent(pipeline as any, events as any), events };
}

const candidate = {
  id: 'cand1',
  organisme: 'CEPICI',
  sourceUrl: 'https://www.cepici.ci/x',
  titre: 'Création',
  contentHash: 'h1',
};

describe('WebResearchAgent', () => {
  it('met les candidats en staging et réclame la validation', async () => {
    const { agent, events } = makeAgent([candidate]);
    const ctx = makeContext();

    const res = await agent.execute(ctx);

    expect(res.followups).toEqual([AgentName.KnowledgeValidation]);
    expect(res.sources?.[0].organisme).toBe('CEPICI');
    expect(ctx.metadata['webResearchDone']).toBe(true); // garde anti-boucle
    expect(events.emit).toHaveBeenCalledWith(
      Events.Knowledge.CandidatesReady,
      expect.objectContaining({ count: 1 }),
    );
  });

  it('reste partiel sans followup quand aucune source officielle n\'est trouvée', async () => {
    const { agent } = makeAgent([]);
    const res = await agent.execute(makeContext());

    expect(res.status).toBe('partial');
    expect(res.followups).toEqual([]);
  });
});

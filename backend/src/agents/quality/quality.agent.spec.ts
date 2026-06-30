import { QualityAgent } from './quality.agent';
import { AgentName } from '../../core/agent/agent-name.enum';
import { Events } from '../../core/events/event-names';
import { Domain } from '../../core/agent/domain.enum';
import { makeContext, withOutput } from '../../test-utils/agent-context.fixture';

function makeAgent() {
  const events = { emit: jest.fn() };
  return { agent: new QualityAgent(events as any), events };
}

describe('QualityAgent', () => {
  it('valide quand l\'ancrage documentaire est fort', async () => {
    const { agent, events } = makeAgent();
    const ctx = makeContext({
      intent: {
        intent: 'x',
        domain: Domain.CreationEntreprise,
        procedure: 'sarl',
        confidence: 0.9,
        priority: 'normal',
        detectedNeeds: [],
        actions: [],
      },
    });
    withOutput(
      ctx,
      AgentName.Knowledge,
      { sufficient: true, chunks: [{ score: 0.85 }] },
      { confidence: 0.85, sources: [{ organisme: 'CEPICI', url: 'u' }] },
    );

    const res = await agent.execute(ctx);

    expect(res.data.passed).toBe(true);
    expect(res.data.hallucinationRisk).toBeLessThanOrEqual(0.6);
    expect(events.emit).not.toHaveBeenCalled();
  });

  it('échoue et émet quality.failed quand il n\'y a aucun ancrage', async () => {
    const { agent, events } = makeAgent();
    const ctx = makeContext();
    withOutput(ctx, AgentName.Knowledge, { sufficient: false, chunks: [] }, { confidence: 0.2 });

    const res = await agent.execute(ctx);

    expect(res.data.passed).toBe(false);
    expect(res.data.hallucinationRisk).toBeGreaterThan(0.6);
    expect(res.data.notes.length).toBeGreaterThan(0);
    expect(events.emit).toHaveBeenCalledWith(
      Events.Quality.Failed,
      expect.objectContaining({ folderId: 'folder-1' }),
    );
  });
});

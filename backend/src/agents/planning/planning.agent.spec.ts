import { PlanningAgent } from './planning.agent';
import { makeContext } from '../../test-utils/agent-context.fixture';

const makeAgent = (completeJson: jest.Mock) =>
  new PlanningAgent({ completeJson } as any);

describe('PlanningAgent', () => {
  it('construit un plan structuré (étapes, durée, coût)', async () => {
    const agent = makeAgent(
      jest.fn().mockResolvedValue({
        steps: [
          { ordre: 1, titre: 'Statuts', description: 'Rédiger', dependsOn: [] },
          { ordre: 2, titre: 'Dépôt', description: 'Déposer', dependsOn: [1] },
        ],
        estimatedDurationDays: 7,
        estimatedCost: '15 000 FCFA',
        dependencies: ['statuts'],
      }),
    );

    const res = await agent.execute(makeContext());

    expect(res.status).toBe('success');
    expect(res.data.steps).toHaveLength(2);
    expect(res.data.estimatedCost).toBe('15 000 FCFA');
    expect(res.data.steps[1].dependsOn).toEqual([1]);
  });

  it('reste partiel et normalise quand le LLM ne renvoie pas d\'étapes', async () => {
    const agent = makeAgent(jest.fn().mockResolvedValue({ steps: 'invalide' }));

    const res = await agent.execute(makeContext());

    expect(res.status).toBe('partial');
    expect(res.data.steps).toEqual([]);
    expect(res.data.estimatedCost).toBeNull();
  });
});

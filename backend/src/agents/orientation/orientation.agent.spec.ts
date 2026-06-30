import { OrientationAgent } from './orientation.agent';
import { Domain } from '../../core/agent/domain.enum';
import { makeContext } from '../../test-utils/agent-context.fixture';
import { IntentResult } from '../../core/agent/intent.types';

function intent(domain: Domain): IntentResult {
  return {
    intent: 'demande',
    domain,
    confidence: 0.9,
    priority: 'normal',
    detectedNeeds: [],
    actions: [],
  } as unknown as IntentResult;
}

function makeAgent(points: any[] = []) {
  const directory = { find: jest.fn().mockResolvedValue(points) };
  return { agent: new OrientationAgent(directory as any), directory };
}

describe('OrientationAgent', () => {
  it('remonte les services compétents du domaine', async () => {
    const { agent, directory } = makeAgent([
      {
        id: 's1',
        type: 'cepici',
        nom: 'CEPICI Plateau',
        adresse: 'CCIA',
        ville: 'Abidjan',
        telephone: null,
        horaires: 'Lun–Ven',
        url: 'https://cepici.gouv.ci',
      },
    ]);
    const ctx = makeContext({ intent: intent(Domain.CreationEntreprise) });

    const res = await agent.execute(ctx);

    expect(directory.find).toHaveBeenCalledWith({
      domaine: 'creation_entreprise',
      limit: 5,
    });
    expect(res.data.servicePoints).toHaveLength(1);
    expect(res.data.servicePoints[0].nom).toBe('CEPICI Plateau');
    expect(res.status).toBe('success');
  });

  it('transmet la position et propage distanceKm quand une géoloc est fournie', async () => {
    const { agent, directory } = makeAgent([
      {
        id: 's1',
        type: 'mairie',
        nom: 'Mairie du Plateau',
        adresse: 'Plateau',
        ville: 'Abidjan',
        telephone: null,
        horaires: null,
        url: null,
        distanceKm: 0.4,
      },
    ]);
    const ctx = makeContext({
      intent: intent(Domain.EtatCivil),
      metadata: { userLocation: { lat: 5.32, lng: -4.02 } },
    });

    const res = await agent.execute(ctx);

    expect(directory.find).toHaveBeenCalledWith({
      domaine: 'etat_civil',
      limit: 5,
      lat: 5.32,
      lng: -4.02,
    });
    expect(res.data.servicePoints[0].distanceKm).toBe(0.4);
  });

  it("renvoie une liste vide sans intention", async () => {
    const { agent, directory } = makeAgent();
    const ctx = makeContext({ intent: undefined });

    const res = await agent.execute(ctx);

    expect(directory.find).not.toHaveBeenCalled();
    expect(res.data.servicePoints).toEqual([]);
    expect(res.status).toBe('partial');
  });
});

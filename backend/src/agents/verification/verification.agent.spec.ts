import { VerificationAgent } from './verification.agent';
import { Events } from '../../core/events/event-names';
import { makeContext } from '../../test-utils/agent-context.fixture';

function makeAgent(documents: any[]) {
  const folders = { getView: jest.fn().mockResolvedValue({ documents }) };
  const events = { emit: jest.fn() };
  return { agent: new VerificationAgent(folders as any, events as any), events };
}

describe('VerificationAgent', () => {
  it('déclare le dossier complet quand toutes les pièces obligatoires sont fournies', async () => {
    const { agent } = makeAgent([
      { nom: 'CNI', statut: 'fourni', obligatoire: true },
      { nom: 'Justificatif', statut: 'fourni', obligatoire: true },
    ]);

    const res = await agent.execute(makeContext());

    expect(res.data.status).toBe('complet');
    expect(res.data.missing).toEqual([]);
    expect(res.status).toBe('success');
  });

  it('déclare incomplet et liste les pièces manquantes + émet l\'événement', async () => {
    const { agent, events } = makeAgent([
      { nom: 'CNI', statut: 'fourni', obligatoire: true },
      { nom: 'Acte de naissance', statut: 'manquant', obligatoire: true },
    ]);

    const res = await agent.execute(makeContext());

    expect(res.data.status).toBe('incomplet');
    expect(res.data.missing).toContain('Acte de naissance');
    expect(res.data.recommendations.length).toBeGreaterThan(0);
    expect(res.status).toBe('partial');
    expect(events.emit).toHaveBeenCalledWith(
      Events.Verification.Completed,
      expect.objectContaining({ status: 'incomplet', missing: ['Acte de naissance'] }),
    );
  });

  it('déclare incomplet quand aucun document n\'est listé', async () => {
    const { agent } = makeAgent([]);
    const res = await agent.execute(makeContext());
    expect(res.data.status).toBe('incomplet');
  });
});

import { LearningAgent } from './learning.agent';
import { Events } from '../../core/events/event-names';

function makeAgent() {
  const learning = { record: jest.fn().mockResolvedValue(undefined) };
  const events = { emit: jest.fn() };
  return { agent: new LearningAgent(learning as any, events as any), learning, events };
}

describe('LearningAgent (réactif)', () => {
  it('enregistre une procédure demandée à la création d\'un dossier', async () => {
    const { agent, learning } = makeAgent();

    await agent.onFolderCreated({
      folderId: 'f1',
      userId: 'u1',
      domaine: 'creation_entreprise',
      statut: 'ouvert',
      progression: 0,
      procedureSlug: 'creation-sarl',
      titre: 'Créer une SARL',
    });

    expect(learning.record).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'procedure_demandee', cle: 'creation-sarl' }),
    );
  });

  it('enregistre un manque documentaire quand la recherche est insuffisante', async () => {
    const { agent, learning, events } = makeAgent();

    await agent.onKnowledgeInsufficient({ query: 'mariage coutumier', folderId: 'f1' });

    expect(learning.record).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'recherche_insuffisante', cle: 'mariage coutumier' }),
    );
    expect(events.emit).toHaveBeenCalledWith(Events.Learning.GapDetected, expect.anything());
  });

  it('enregistre chaque pièce manquante issue de la vérification', async () => {
    const { agent, learning } = makeAgent();

    await agent.onVerification({
      domaine: 'etat_civil',
      status: 'incomplet',
      missing: ['Acte de naissance', 'Justificatif de domicile'],
    });

    expect(learning.record).toHaveBeenCalledTimes(2);
    expect(learning.record).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'document_manquant' }),
    );
  });
});

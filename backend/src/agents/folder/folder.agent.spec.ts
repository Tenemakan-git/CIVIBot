import { FolderAgent } from './folder.agent';
import { AgentName } from '../../core/agent/agent-name.enum';
import { makeContext, withOutput } from '../../test-utils/agent-context.fixture';

function makeAgent() {
  const folders = {
    recordPlan: jest.fn().mockResolvedValue(undefined),
    recordDocuments: jest.fn().mockResolvedValue(undefined),
    recordSources: jest.fn().mockResolvedValue(undefined),
    recordTimeline: jest.fn().mockResolvedValue(undefined),
    recordHistory: jest.fn().mockResolvedValue(undefined),
    recomputeProgress: jest.fn().mockResolvedValue({
      id: 'folder-1',
      titre: 'Créer une SARL',
      domaine: 'creation_entreprise',
      statut: 'en_cours',
      progression: 50,
    }),
  };
  const requiredDocs = { sync: jest.fn().mockResolvedValue(undefined) };
  return { agent: new FolderAgent(folders as any, requiredDocs as any), folders, requiredDocs };
}

describe('FolderAgent', () => {
  it('assemble le dossier à partir des sorties des agents précédents', async () => {
    const { agent, folders } = makeAgent();
    const ctx = makeContext();
    withOutput(ctx, AgentName.Planning, {
      steps: [{ ordre: 1, titre: 'A', description: '' }],
      estimatedCost: '10 000 FCFA',
      estimatedDurationDays: 5,
    });
    withOutput(ctx, AgentName.Procedure, {
      requiredDocuments: [{ nom: 'CNI', obligatoire: true }],
    });
    withOutput(
      ctx,
      AgentName.Document,
      { documents: [{ nom: 'Statuts', statut: 'manquant' }] },
      { sources: [{ organisme: 'CEPICI', url: 'u' }] },
    );

    const res = await agent.execute(ctx);

    expect(folders.recordPlan).toHaveBeenCalledWith(
      'folder-1',
      expect.objectContaining({ cout: '10 000 FCFA', delai: '5 jours' }),
    );
    expect(folders.recordDocuments).toHaveBeenCalled();
    expect(folders.recordSources).toHaveBeenCalled();
    expect(folders.recomputeProgress).toHaveBeenCalledWith('folder-1');
    expect(res.data.documentsCount).toBe(2); // CNI + Statuts dédupliqués
    expect(res.data.hasPlan).toBe(true);
  });

  it('déduplique les documents par nom (insensible à la casse)', async () => {
    const { agent, folders } = makeAgent();
    const ctx = makeContext();
    withOutput(ctx, AgentName.Procedure, {
      requiredDocuments: [{ nom: 'CNI', obligatoire: true }],
    });
    withOutput(ctx, AgentName.Document, { documents: [{ nom: 'cni', statut: 'manquant' }] });

    await agent.execute(ctx);

    const docsArg = folders.recordDocuments.mock.calls[0][1];
    expect(docsArg).toHaveLength(1);
  });
});

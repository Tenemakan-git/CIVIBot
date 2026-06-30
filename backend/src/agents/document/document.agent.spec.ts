import { DocumentAgent } from './document.agent';
import { AgentName } from '../../core/agent/agent-name.enum';
import { makeContext, withOutput } from '../../test-utils/agent-context.fixture';

const makeAgent = (completeJson: jest.Mock) =>
  new DocumentAgent({ completeJson } as any);

describe('DocumentAgent', () => {
  it('construit le dossier documentaire (résumé, documents, pièces)', async () => {
    const agent = makeAgent(
      jest.fn().mockResolvedValue({
        resume: 'Dossier de création SARL',
        documents: [
          { nom: 'CNI', statut: 'manquant' },
          { nom: 'Statuts', statut: 'fourni' },
        ],
        piecesNecessaires: ['2 photos'],
      }),
    );

    const res = await agent.execute(makeContext());

    expect(res.data.documents).toHaveLength(2);
    expect(res.data.documents[1].statut).toBe('fourni');
    expect(res.data.piecesNecessaires).toContain('2 photos');
  });

  it('retombe sur les documents du Procedure Agent si le LLM n\'en fournit pas', async () => {
    const agent = makeAgent(
      jest.fn().mockResolvedValue({ resume: '', documents: [], piecesNecessaires: [] }),
    );
    const ctx = makeContext();
    withOutput(ctx, AgentName.Procedure, {
      requiredDocuments: [{ nom: 'Extrait de naissance' }],
    });

    const res = await agent.execute(ctx);

    expect(res.data.documents).toEqual([
      { nom: 'Extrait de naissance', statut: 'manquant' },
    ]);
  });
});

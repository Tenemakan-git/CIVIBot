import { ProcedureAgent } from './procedure.agent';
import { makeContext } from '../../test-utils/agent-context.fixture';

const makeAgent = (completeJson: jest.Mock) =>
  new ProcedureAgent({ completeJson } as any);

describe('ProcedureAgent', () => {
  it('construit la procédure (étapes, documents, contraintes, conseils)', async () => {
    const agent = makeAgent(
      jest.fn().mockResolvedValue({
        titre: 'Création SARL',
        steps: [{ ordre: 1, titre: 'CEPICI', description: 'Guichet unique' }],
        requiredDocuments: [
          { nom: 'CNI', obligatoire: true },
          { nom: 'Justificatif', obligatoire: false, remarque: 'optionnel' },
        ],
        constraints: ['capital minimum'],
        tips: ['Prévoir des copies'],
      }),
    );

    const res = await agent.execute(makeContext());

    expect(res.status).toBe('success');
    expect(res.data.titre).toBe('Création SARL');
    expect(res.data.requiredDocuments).toHaveLength(2);
    expect(res.data.requiredDocuments[1].obligatoire).toBe(false);
    expect(res.data.tips).toContain('Prévoir des copies');
  });

  it('filtre les documents invalides renvoyés par le LLM', async () => {
    const agent = makeAgent(
      jest.fn().mockResolvedValue({
        titre: 'X',
        steps: [{ ordre: 1, titre: 'A', description: '' }],
        requiredDocuments: [{ nom: 'CNI' }, { remarque: 'sans nom' }],
        constraints: 'pas-un-tableau',
        tips: null,
      }),
    );

    const res = await agent.execute(makeContext());

    expect(res.data.requiredDocuments).toHaveLength(1);
    expect(res.data.requiredDocuments[0].obligatoire).toBe(true); // défaut
    expect(res.data.constraints).toEqual([]);
  });
});

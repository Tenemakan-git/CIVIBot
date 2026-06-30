import { IntentAnalysisAgent } from './intent-analysis.agent';
import { Domain } from '../../core/agent/domain.enum';
import { AgentName } from '../../core/agent/agent-name.enum';
import { makeContext } from '../../test-utils/agent-context.fixture';

function makeAgent(completeJson: jest.Mock) {
  const llm = { completeJson, complete: jest.fn(), stream: jest.fn() };
  return new IntentAnalysisAgent(llm as any);
}

describe('IntentAnalysisAgent', () => {
  it('détecte correctement la création d\'entreprise', async () => {
    const agent = makeAgent(
      jest.fn().mockResolvedValue({
        intent: 'creer_entreprise',
        domain: 'creation_entreprise',
        procedure: 'creation-sarl',
        confidence: 0.92,
        priority: 'high',
        detectedNeeds: ['statuts', 'capital'],
        actions: ['planning', 'knowledge'],
      }),
    );

    const res = await agent.execute(makeContext({ userMessage: 'Je veux créer une SARL' }));

    expect(res.status).toBe('success');
    expect(res.data.domain).toBe(Domain.CreationEntreprise);
    expect(res.data.procedure).toBe('creation-sarl');
    expect(res.data.confidence).toBeCloseTo(0.92);
    expect(res.data.actions).toEqual([AgentName.Planning, AgentName.Knowledge]);
  });

  it('détecte correctement l\'état civil', async () => {
    const agent = makeAgent(
      jest.fn().mockResolvedValue({
        intent: 'obtenir_acte_naissance',
        domain: 'etat_civil',
        procedure: null,
        confidence: 0.8,
        priority: 'normal',
        detectedNeeds: [],
        actions: [],
      }),
    );

    const res = await agent.execute(makeContext({ userMessage: "acte de naissance" }));

    expect(res.data.domain).toBe(Domain.EtatCivil);
    expect(res.data.procedure).toBeNull();
  });

  it('marque un résultat partiel quand la confiance est faible', async () => {
    const agent = makeAgent(
      jest.fn().mockResolvedValue({
        intent: 'flou',
        domain: 'etat_civil',
        procedure: null,
        confidence: 0.2,
        priority: 'low',
        detectedNeeds: [],
        actions: [],
      }),
    );

    const res = await agent.execute(makeContext());
    expect(res.status).toBe('partial');
  });

  it('normalise une sortie LLM invalide (domaine, confiance, actions, priorité)', async () => {
    const agent = makeAgent(
      jest.fn().mockResolvedValue({
        intent: 42,
        domain: 'domaine_inconnu',
        procedure: 123,
        confidence: 5,
        priority: 'urgent',
        detectedNeeds: 'pas-un-tableau',
        actions: ['planning', 'agent_bidon'],
      }),
    );

    const res = await agent.execute(makeContext());

    expect(res.data.domain).toBe(Domain.EtatCivil); // fallback
    expect(res.data.confidence).toBe(1); // borné 0..1
    expect(res.data.procedure).toBeNull(); // type invalide -> null
    expect(res.data.priority).toBe('normal'); // valeur invalide -> normal
    expect(res.data.detectedNeeds).toEqual([]);
    expect(res.data.actions).toEqual([AgentName.Planning]); // action invalide filtrée
    expect(res.data.intent).toBe('inconnu'); // intent non-string -> 'inconnu'
  });

  it('ne casse pas le workflow en cas d\'erreur LLM (status failed)', async () => {
    const agent = makeAgent(jest.fn().mockRejectedValue(new Error('LLM down')));

    const res = await agent.execute(makeContext());

    expect(res.status).toBe('failed');
    expect(res.confidence).toBe(0);
    expect(res.errors?.[0]).toContain('LLM down');
  });
});

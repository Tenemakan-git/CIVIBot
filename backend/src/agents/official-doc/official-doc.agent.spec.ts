import { OfficialDocAgent } from './official-doc.agent';
import { Domain } from '../../core/agent/domain.enum';
import { makeContext } from '../../test-utils/agent-context.fixture';
import { IntentResult } from '../../core/agent/intent.types';

function intent(domain: Domain): IntentResult {
  return {
    intent: 'demande',
    domain,
    procedure: undefined,
    confidence: 0.9,
    priority: 'normal',
    detectedNeeds: [],
    actions: [],
  } as unknown as IntentResult;
}

describe('OfficialDocAgent', () => {
  it("propose les modèles du domaine état civil", async () => {
    const agent = new OfficialDocAgent();
    const ctx = makeContext({ intent: intent(Domain.EtatCivil) });

    const res = await agent.execute(ctx);

    const keys = res.data.availableTemplates.map((t) => t.key);
    expect(keys).toContain('demande-acte-naissance');
    expect(keys).toContain('lettre-requisition');
    expect(keys).not.toContain('declaration-cepici-entreprise');
    expect(res.status).toBe('success');
  });

  it('ne propose rien en absence d\'intention', async () => {
    const agent = new OfficialDocAgent();
    const ctx = makeContext({ intent: undefined });

    const res = await agent.execute(ctx);

    expect(res.data.availableTemplates).toEqual([]);
  });
});

import { OrchestratorService } from './orchestrator.service';
import { WorkflowFactory } from './workflow.factory';
import { AgentName } from '../core/agent/agent-name.enum';
import { AgentContext } from '../core/agent/agent-context';
import { makeContext } from '../test-utils/agent-context.fixture';

const INTENT_DATA = {
  intent: 'creer_entreprise',
  domain: 'creation_entreprise',
  procedure: 'creation-sarl',
  confidence: 0.9,
  priority: 'normal',
  detectedNeeds: [],
  actions: [],
};

/** Construit un registre factice + un tracker d'ordre d'exécution. */
function buildHarness() {
  const order: AgentName[] = [];
  const agents = new Map<AgentName, any>();

  const stub = (name: AgentName, result: any = {}) => {
    agents.set(name, {
      name,
      execute: jest.fn(async (_ctx: AgentContext) => {
        order.push(name);
        return {
          agent: name,
          status: 'success',
          confidence: 1,
          data: {},
          ...result,
        };
      }),
    });
  };

  const registry = {
    has: (n: AgentName) => agents.has(n),
    get: (n: AgentName) => agents.get(n),
  };
  const folders = {
    findByConversation: jest.fn().mockResolvedValue(null),
    createFolder: jest.fn().mockResolvedValue({ id: 'folder-new' }),
  };
  const prisma = { agentRun: { create: jest.fn().mockResolvedValue({}) } };

  const orchestrator = new OrchestratorService(
    registry as any,
    new WorkflowFactory(),
    folders as any,
    prisma as any,
  );

  return { orchestrator, order, stub, registry, folders, prisma };
}

function registerFullPipeline(stub: (n: AgentName, r?: any) => void) {
  stub(AgentName.IntentAnalysis, { data: INTENT_DATA });
  stub(AgentName.Knowledge);
  stub(AgentName.Planning);
  stub(AgentName.Procedure);
  stub(AgentName.Checklist);
  stub(AgentName.Document);
  stub(AgentName.Folder);
  stub(AgentName.Verification);
  stub(AgentName.Quality);
}

describe('OrchestratorService', () => {
  it('exécute le workflow complet dans l\'ordre attendu', async () => {
    const h = buildHarness();
    registerFullPipeline(h.stub);

    const ctx = makeContext({ folderId: '' });
    await h.orchestrator.run(ctx);

    expect(h.order).toEqual([
      AgentName.IntentAnalysis,
      AgentName.Knowledge,
      AgentName.Planning,
      AgentName.Procedure,
      AgentName.Checklist,
      AgentName.Document,
      AgentName.Folder,
      AgentName.Verification,
      AgentName.Quality,
    ]);
    expect(ctx.intent?.domain).toBe('creation_entreprise');
  });

  it('crée automatiquement le dossier après l\'analyse d\'intention', async () => {
    const h = buildHarness();
    registerFullPipeline(h.stub);

    const ctx = makeContext({ folderId: '' });
    await h.orchestrator.run(ctx);

    expect(h.folders.createFolder).toHaveBeenCalledWith(
      expect.objectContaining({ domaine: 'creation_entreprise', userId: 'user-1' }),
    );
    expect(ctx.folderId).toBe('folder-new');
  });

  it('réutilise un dossier existant rattaché à la conversation', async () => {
    const h = buildHarness();
    registerFullPipeline(h.stub);
    h.folders.findByConversation.mockResolvedValue({ id: 'folder-existant' });

    const ctx = makeContext({ folderId: '' });
    await h.orchestrator.run(ctx);

    expect(h.folders.createFolder).not.toHaveBeenCalled();
    expect(ctx.folderId).toBe('folder-existant');
  });

  it('insère le sous-graphe (Web Research) en priorité via followups', async () => {
    const h = buildHarness();
    registerFullPipeline(h.stub);
    // Knowledge réclame Web Research au 1er passage.
    h.stub(AgentName.Knowledge, { followups: [AgentName.WebResearch] });
    h.stub(AgentName.WebResearch);

    const ctx = makeContext({ folderId: '' });
    await h.orchestrator.run(ctx);

    expect(h.order).toContain(AgentName.WebResearch);
    // le followup s'exécute avant la suite du pipeline (Planning)
    expect(h.order.indexOf(AgentName.WebResearch)).toBeLessThan(
      h.order.indexOf(AgentName.Planning),
    );
  });

  it('ignore proprement les agents non enregistrés (montée en charge incrémentale)', async () => {
    const h = buildHarness();
    h.stub(AgentName.IntentAnalysis, { data: INTENT_DATA });
    h.stub(AgentName.Knowledge);
    // Aucun autre agent enregistré.

    const ctx = makeContext({ folderId: '' });
    await expect(h.orchestrator.run(ctx)).resolves.toBeUndefined();
    expect(h.order).toEqual([AgentName.IntentAnalysis, AgentName.Knowledge]);
  });

  it('journalise chaque exécution d\'agent dans AgentRun', async () => {
    const h = buildHarness();
    registerFullPipeline(h.stub);

    await h.orchestrator.run(makeContext({ folderId: '' }));

    expect(h.prisma.agentRun.create).toHaveBeenCalledTimes(h.order.length);
  });

  it('notifie chaque étape via le hook onAgentStep (pour le streaming SSE)', async () => {
    const h = buildHarness();
    registerFullPipeline(h.stub);
    const onAgentStep = jest.fn();

    await h.orchestrator.run(makeContext({ folderId: '' }), { onAgentStep });

    expect(onAgentStep).toHaveBeenCalledWith(
      AgentName.IntentAnalysis,
      'success',
      expect.anything(),
    );
    expect(onAgentStep).toHaveBeenCalledTimes(h.order.length);
  });

  it("signale l'analyse d'intention échouée comme 'partial' quand le fallback prend le relais", async () => {
    const h = buildHarness();
    registerFullPipeline(h.stub);
    // L'analyse d'intention échoue : l'orchestrateur poursuit en mode dégradé.
    h.stub(AgentName.IntentAnalysis, { status: 'failed', data: null });
    const onAgentStep = jest.fn();

    const ctx = makeContext({ folderId: '' });
    await h.orchestrator.run(ctx, { onAgentStep });

    // Le step exposé à l'UI est 'partial' (✕ incohérent avec les ✓ suivants),
    // jamais 'failed'.
    expect(onAgentStep).toHaveBeenCalledWith(
      AgentName.IntentAnalysis,
      'partial',
      expect.objectContaining({ status: 'partial' }),
    );
    expect(onAgentStep).not.toHaveBeenCalledWith(
      AgentName.IntentAnalysis,
      'failed',
      expect.anything(),
    );
    // Le workflow se poursuit avec l'intention de repli.
    expect(ctx.intent?.intent).toBe('inconnu');
    expect(h.order).toContain(AgentName.Planning);
    // La trace interne conserve le vrai statut 'failed' (débogage).
    expect(h.prisma.agentRun.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ agent: AgentName.IntentAnalysis, status: 'failed' }),
      }),
    );
  });
});

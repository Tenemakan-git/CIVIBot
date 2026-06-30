import { Injectable, Logger } from '@nestjs/common';
import { AgentName } from '../core/agent/agent-name.enum';
import { AgentContext } from '../core/agent/agent-context';
import { AgentResult, AgentStatus } from '../core/agent/agent-result';
import { Domain } from '../core/agent/domain.enum';
import { IntentResult } from '../core/agent/intent.types';
import { PrismaService } from '../prisma/prisma.service';
import { FolderService } from '../folders/application/folder.service';
import { AgentRegistry } from './agent-registry';
import { WorkflowFactory } from './workflow.factory';

/** Garde-fou anti-emballement de la boucle d'orchestration. */
const MAX_DISPATCHES = 64;

export interface OrchestrationHooks {
  onAgentStep?: (
    agent: AgentName,
    status: AgentStatus,
    result: AgentResult,
  ) => void;
}

/**
 * Orchestrator Agent — cœur du système. Décide quels agents exécuter et dans
 * quel ordre ; NE contient aucune logique métier (déléguée aux agents). La
 * communication inter-agents passe exclusivement par lui (lecture des
 * `followups`).
 */
@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);

  constructor(
    private readonly registry: AgentRegistry,
    private readonly workflow: WorkflowFactory,
    private readonly folders: FolderService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Exécute le workflow complet, en enrichissant `ctx.outputs`. À l'issue, le
   * Conversation Agent (façade) synthétise et diffuse la réponse finale.
   */
  async run(ctx: AgentContext, hooks?: OrchestrationHooks): Promise<void> {
    // 1) Analyse d'intention
    ctx.intent = await this.resolveIntent(ctx, hooks);

    // 2) Dossier (auto-création si nouvelle démarche)
    ctx.folderId = await this.ensureFolder(ctx);

    // 3) Plan d'exécution + boucle d'orchestration
    const plan = this.workflow.build(ctx.intent);
    let name: AgentName | undefined;
    let guard = 0;
    while ((name = plan.next())) {
      if (++guard > MAX_DISPATCHES) {
        this.logger.warn(
          `Limite de dispatch atteinte (${MAX_DISPATCHES}) — arrêt de la boucle`,
        );
        break;
      }
      if (!this.registry.has(name)) {
        this.logger.debug(`Agent "${name}" non disponible — ignoré`);
        continue;
      }
      const result = await this.dispatch(name, ctx, hooks);
      ctx.outputs[name] = result;
      plan.markDone(name);
      // Les followups (sous-graphe connaissance) s'exécutent en priorité, et
      // peuvent ré-exécuter un agent déjà fait (re-run de Knowledge enrichi).
      if (result.followups?.length) {
        plan.enqueue(result.followups, { front: true, allowRerun: true });
      }
    }
  }

  // ── Intention ──
  private async resolveIntent(
    ctx: AgentContext,
    hooks?: OrchestrationHooks,
  ): Promise<IntentResult> {
    if (!this.registry.has(AgentName.IntentAnalysis)) {
      return this.fallbackIntent();
    }
    // On émet le step manuellement (hooks omis ici) : en cas d'échec récupéré
    // par un fallback, le workflow se poursuit en mode dégradé et réussit. Un
    // ✕ « échec dur » serait alors incohérent avec les étapes ✓ qui suivent —
    // on signale donc un état « partiel ». La trace AgentRun garde le vrai
    // statut 'failed' pour le débogage (cf. dispatch → logRun).
    const res = await this.dispatch(AgentName.IntentAnalysis, ctx);
    ctx.outputs[AgentName.IntentAnalysis] = res;

    if (res.status === 'failed') {
      hooks?.onAgentStep?.(AgentName.IntentAnalysis, 'partial', {
        ...res,
        status: 'partial',
      });
      return this.fallbackIntent();
    }

    hooks?.onAgentStep?.(AgentName.IntentAnalysis, res.status, res);
    return res.data as IntentResult;
  }

  private fallbackIntent(): IntentResult {
    return {
      intent: 'inconnu',
      domain: Domain.EtatCivil,
      procedure: null,
      confidence: 0,
      priority: 'normal',
      detectedNeeds: [],
      actions: [],
    };
  }

  // ── Dossier ──
  private async ensureFolder(ctx: AgentContext): Promise<string> {
    if (ctx.folderId) return ctx.folderId;

    const existing = await this.folders.findByConversation(ctx.conversationId);
    if (existing) return existing.id;

    const intent = ctx.intent!;
    const titre = this.buildFolderTitle(intent);

    const folder = await this.folders.createFolder({
      userId: ctx.userId,
      domaine: intent.domain,
      titre,
      procedureSlug: intent.procedure,
      conversationId: ctx.conversationId,
    });
    return folder.id;
  }

  /**
   * Titre du dossier, du plus spécifique au plus générique :
   * 1) slug de procédure (« creation-sarl » → « Creation sarl »)
   * 2) à défaut, l'intention détectée (« obtenir_acte_naissance » → …) —
   *    bien plus souvent renseignée que `procedure` par le LLM
   * 3) en dernier recours, le domaine (« Démarche État civil »).
   * Évite que toutes les démarches se confondent en « Démarche etat civil ».
   */
  private buildFolderTitle(intent: IntentResult): string {
    if (intent.procedure?.trim()) return this.humanize(intent.procedure);

    const generic = new Set(['inconnu', 'unknown', 'autre', '']);
    if (intent.intent && !generic.has(intent.intent.trim().toLowerCase())) {
      return this.humanize(intent.intent);
    }
    return `Démarche ${this.humanize(intent.domain)}`;
  }

  private humanize(slug: string): string {
    const s = slug.replace(/[-_]/g, ' ').trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // ── Dispatch + traçabilité ──
  private async dispatch(
    name: AgentName,
    ctx: AgentContext,
    hooks?: OrchestrationHooks,
  ): Promise<AgentResult> {
    const agent = this.registry.get(name);
    const result = await agent.execute(ctx);
    await this.logRun(ctx, result);
    hooks?.onAgentStep?.(name, result.status, result);
    return result;
  }

  private async logRun(ctx: AgentContext, result: AgentResult): Promise<void> {
    try {
      await this.prisma.agentRun.create({
        data: {
          runId: ctx.runId,
          folderId: ctx.folderId || null,
          agent: result.agent,
          status: result.status,
          confidence: result.confidence ?? null,
          durationMs: result.durationMs ?? null,
          output: this.truncate(result.data),
        },
      });
    } catch (err) {
      this.logger.warn(`AgentRun non journalisé: ${(err as Error).message}`);
    }
  }

  /** Évite de stocker des payloads volumineux en table de trace. */
  private truncate(data: unknown): any {
    try {
      const json = JSON.stringify(data ?? null);
      return json.length > 8000 ? { _truncated: json.slice(0, 8000) } : JSON.parse(json);
    } catch {
      return null;
    }
  }
}

import { AgentName } from './agent-name.enum';
import { AgentResult } from './agent-result';
import { IntentResult } from './intent.types';

/**
 * État partagé d'un run d'orchestration, porté de bout en bout par
 * l'Orchestrator. Les agents le LISENT (et lisent les sorties des agents
 * précédents via `outputs`) mais ne se l'échangent jamais directement.
 */
export interface AgentContext {
  /** Corrèle l'ensemble des agents d'un même workflow (cf. AgentRun.runId). */
  runId: string;
  folderId: string;
  userId: string;
  conversationId: string;
  locale: 'fr';
  /** Dernier message utilisateur déclencheur du run. */
  userMessage: string;
  /** Renseigné après l'IntentAnalysisAgent. */
  intent?: IntentResult;
  /** Sorties accumulées des agents déjà exécutés (lecture seule pour les agents). */
  outputs: Partial<Record<AgentName, AgentResult>>;
  /** Bac à sable pour données transverses non typées du run. */
  metadata: Record<string, unknown>;
}

/** Récupère, typée, la sortie d'un agent précédent depuis le contexte. */
export function readOutput<T>(
  ctx: AgentContext,
  agent: AgentName,
): AgentResult<T> | undefined {
  return ctx.outputs[agent] as AgentResult<T> | undefined;
}

import { AgentName } from './agent-name.enum';

export type AgentStatus = 'success' | 'partial' | 'failed' | 'needs_followup';

/** Référence à une source officielle citée par un agent. */
export interface SourceRef {
  organisme: string;
  url?: string;
  titre?: string;
  date?: string;
}

/**
 * Résultat normalisé renvoyé par TOUT agent.
 * `followups` est le seul canal par lequel un agent peut « réclamer » le
 * déclenchement d'autres agents : l'Orchestrator les lit, l'agent ne les
 * appelle jamais lui-même (découplage strict).
 */
export interface AgentResult<T = unknown> {
  agent: AgentName;
  status: AgentStatus;
  data: T;
  /** Confiance globale du résultat 0..1. */
  confidence: number;
  followups?: AgentName[];
  sources?: SourceRef[];
  warnings?: string[];
  errors?: string[];
  durationMs?: number;
}

/**
 * Sortie « brute » que la logique d'un agent (méthode `run`) renvoie à
 * `BaseAgent`. Ce dernier la complète (agent, durée, statut/conf par défaut)
 * pour produire un `AgentResult` cohérent.
 */
export interface AgentRunOutput<T = unknown> {
  data: T;
  status?: AgentStatus;
  confidence?: number;
  followups?: AgentName[];
  sources?: SourceRef[];
  warnings?: string[];
}

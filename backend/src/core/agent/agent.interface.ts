import { AgentName } from './agent-name.enum';
import { AgentContext } from './agent-context';
import { AgentResult } from './agent-result';

/**
 * Contrat commun à TOUS les agents.
 *
 * Invariants :
 *  - un agent ne dépend jamais d'un autre agent (aucune injection croisée) ;
 *  - il lit l'`AgentContext`, renvoie un `AgentResult` ;
 *  - pour réclamer la suite, il remplit `result.followups` — c'est
 *    l'Orchestrator qui décide et déclenche.
 */
export interface IAgent<TOut = unknown> {
  readonly name: AgentName;
  execute(ctx: AgentContext): Promise<AgentResult<TOut>>;
}

import { Injectable } from '@nestjs/common';
import { AgentName } from '../core/agent/agent-name.enum';
import { IntentResult } from '../core/agent/intent.types';
import { ExecutionPlan } from './execution-plan';

/**
 * Traduit une intention en plan d'exécution (séquence ordonnée d'agents).
 * L'Orchestrator filtrera les agents non encore disponibles dans le registre,
 * ce qui permet une montée en charge incrémentale du système.
 */
@Injectable()
export class WorkflowFactory {
  /** Pipeline nominal d'une démarche administrative. */
  private readonly basePipeline: AgentName[] = [
    AgentName.Knowledge,
    AgentName.Planning,
    AgentName.Procedure,
    AgentName.Checklist,
    AgentName.Document,
    AgentName.OfficialDocument,
    AgentName.Orientation,
    AgentName.Folder,
    AgentName.Verification,
    AgentName.Quality,
  ];

  build(intent: IntentResult): ExecutionPlan {
    // Point d'extension : adapter l'ordre selon le domaine / la priorité.
    // (ex: création d'entreprise => Planning avant Knowledge, etc.)
    void intent;
    return new ExecutionPlan([...this.basePipeline]);
  }
}

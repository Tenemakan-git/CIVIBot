import { IAgent } from '../../../core/agent/agent.interface';
import { ValidationVerdictDto } from '../dto/validation-verdict.dto';

/**
 * Contrat du Knowledge Validation Agent : vérifie doublons, qualité, cohérence
 * et fraîcheur des candidats avant insertion.
 */
export interface IKnowledgeValidationAgent
  extends IAgent<ValidationVerdictDto> {}

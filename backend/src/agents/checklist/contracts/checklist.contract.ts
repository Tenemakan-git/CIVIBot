import { IAgent } from '../../../core/agent/agent.interface';
import { ChecklistDto } from '../dto/checklist.dto';

/** Contrat du Checklist Agent : génère une checklist complète et ordonnée. */
export interface IChecklistAgent extends IAgent<ChecklistDto> {}

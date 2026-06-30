import { IAgent } from '../../../core/agent/agent.interface';
import { PlanDto } from '../dto/plan.dto';

/** Contrat du Planning Agent : construit le plan d'une procédure. */
export interface IPlanningAgent extends IAgent<PlanDto> {}

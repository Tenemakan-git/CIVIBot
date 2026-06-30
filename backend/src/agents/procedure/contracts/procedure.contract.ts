import { IAgent } from '../../../core/agent/agent.interface';
import { ProcedureDto } from '../dto/procedure.dto';

/** Contrat du Procedure Agent : construit la procédure personnalisée. */
export interface IProcedureAgent extends IAgent<ProcedureDto> {}

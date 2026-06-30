import { IAgent } from '../../../core/agent/agent.interface';
import { ValidationVerdictDto } from '../dto/validation-verdict.dto';
export interface IKnowledgeValidationAgent extends IAgent<ValidationVerdictDto> {
}

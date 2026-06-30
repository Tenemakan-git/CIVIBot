import { IAgent } from '../../../core/agent/agent.interface';
import { QualityVerdictDto } from '../dto/quality-verdict.dto';
export interface IQualityAgent extends IAgent<QualityVerdictDto> {
}

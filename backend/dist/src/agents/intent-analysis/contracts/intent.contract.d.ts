import { IAgent } from '../../../core/agent/agent.interface';
import { IntentResultDto } from '../dto/intent-result.dto';
export interface IIntentAnalysisAgent extends IAgent<IntentResultDto> {
}

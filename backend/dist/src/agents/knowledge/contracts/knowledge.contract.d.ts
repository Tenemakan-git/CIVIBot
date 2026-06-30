import { IAgent } from '../../../core/agent/agent.interface';
import { KnowledgeAnswerDto } from '../dto/knowledge-io.dto';
export interface IKnowledgeAgent extends IAgent<KnowledgeAnswerDto> {
}

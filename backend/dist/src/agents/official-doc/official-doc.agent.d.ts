import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { IOfficialDocAgent } from './contracts/official-doc.contract';
import { OfficialDocSuggestionDto } from './dto/official-doc-suggestion.dto';
export declare class OfficialDocAgent extends BaseAgent<OfficialDocSuggestionDto> implements IOfficialDocAgent {
    readonly name = AgentName.OfficialDocument;
    protected run(ctx: AgentContext): Promise<AgentRunOutput<OfficialDocSuggestionDto>>;
}

import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import type { ILlmProvider } from '../../core/ports/llm.port';
import { IIntentAnalysisAgent } from './contracts/intent.contract';
import { IntentResultDto } from './dto/intent-result.dto';
export declare class IntentAnalysisAgent extends BaseAgent<IntentResultDto> implements IIntentAnalysisAgent {
    private readonly llm;
    readonly name = AgentName.IntentAnalysis;
    private readonly system;
    constructor(llm: ILlmProvider);
    protected run(ctx: AgentContext): Promise<AgentRunOutput<IntentResultDto>>;
    private normalize;
}

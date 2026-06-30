import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import type { ILlmProvider } from '../../core/ports/llm.port';
import { IPlanningAgent } from './contracts/planning.contract';
import { PlanDto } from './dto/plan.dto';
export declare class PlanningAgent extends BaseAgent<PlanDto> implements IPlanningAgent {
    private readonly llm;
    readonly name = AgentName.Planning;
    private readonly system;
    constructor(llm: ILlmProvider);
    protected run(ctx: AgentContext): Promise<AgentRunOutput<PlanDto>>;
}

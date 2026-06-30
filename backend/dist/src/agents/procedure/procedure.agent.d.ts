import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import type { ILlmProvider } from '../../core/ports/llm.port';
import { IProcedureAgent } from './contracts/procedure.contract';
import { ProcedureDto } from './dto/procedure.dto';
export declare class ProcedureAgent extends BaseAgent<ProcedureDto> implements IProcedureAgent {
    private readonly llm;
    readonly name = AgentName.Procedure;
    private readonly system;
    constructor(llm: ILlmProvider);
    protected run(ctx: AgentContext): Promise<AgentRunOutput<ProcedureDto>>;
    private strings;
}

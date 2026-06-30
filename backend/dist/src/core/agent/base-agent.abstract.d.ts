import { Logger } from '@nestjs/common';
import { AgentName } from './agent-name.enum';
import { AgentContext } from './agent-context';
import { AgentResult, AgentRunOutput } from './agent-result';
import { IAgent } from './agent.interface';
export declare abstract class BaseAgent<TOut = unknown> implements IAgent<TOut> {
    abstract readonly name: AgentName;
    protected readonly logger: Logger;
    protected abstract run(ctx: AgentContext): Promise<AgentRunOutput<TOut>>;
    execute(ctx: AgentContext): Promise<AgentResult<TOut>>;
}

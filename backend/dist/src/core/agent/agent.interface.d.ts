import { AgentName } from './agent-name.enum';
import { AgentContext } from './agent-context';
import { AgentResult } from './agent-result';
export interface IAgent<TOut = unknown> {
    readonly name: AgentName;
    execute(ctx: AgentContext): Promise<AgentResult<TOut>>;
}

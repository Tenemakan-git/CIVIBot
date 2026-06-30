import { AgentContext } from '../core/agent/agent-context';
import { AgentName } from '../core/agent/agent-name.enum';
import { AgentResult } from '../core/agent/agent-result';
export declare function makeContext(overrides?: Partial<AgentContext>): AgentContext;
export declare function withOutput<T>(ctx: AgentContext, agent: AgentName, data: T, extra?: Partial<AgentResult<T>>): AgentContext;

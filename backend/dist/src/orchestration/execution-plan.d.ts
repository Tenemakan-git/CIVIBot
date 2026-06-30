import { AgentName } from '../core/agent/agent-name.enum';
export declare class ExecutionPlan {
    private readonly queue;
    private readonly done;
    constructor(initial: AgentName[]);
    next(): AgentName | undefined;
    markDone(agent: AgentName): void;
    enqueue(agents: AgentName[], options?: {
        allowRerun?: boolean;
        front?: boolean;
    }): void;
    get pending(): AgentName[];
}

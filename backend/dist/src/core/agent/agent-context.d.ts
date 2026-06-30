import { AgentName } from './agent-name.enum';
import { AgentResult } from './agent-result';
import { IntentResult } from './intent.types';
export interface AgentContext {
    runId: string;
    folderId: string;
    userId: string;
    conversationId: string;
    locale: 'fr';
    userMessage: string;
    intent?: IntentResult;
    outputs: Partial<Record<AgentName, AgentResult>>;
    metadata: Record<string, unknown>;
}
export declare function readOutput<T>(ctx: AgentContext, agent: AgentName): AgentResult<T> | undefined;

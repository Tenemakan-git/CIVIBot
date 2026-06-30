import { AgentName } from './agent-name.enum';
export type AgentStatus = 'success' | 'partial' | 'failed' | 'needs_followup';
export interface SourceRef {
    organisme: string;
    url?: string;
    titre?: string;
    date?: string;
}
export interface AgentResult<T = unknown> {
    agent: AgentName;
    status: AgentStatus;
    data: T;
    confidence: number;
    followups?: AgentName[];
    sources?: SourceRef[];
    warnings?: string[];
    errors?: string[];
    durationMs?: number;
}
export interface AgentRunOutput<T = unknown> {
    data: T;
    status?: AgentStatus;
    confidence?: number;
    followups?: AgentName[];
    sources?: SourceRef[];
    warnings?: string[];
}

import { AgentName } from './agent-name.enum';
import { Domain } from './domain.enum';
export type IntentPriority = 'low' | 'normal' | 'high';
export interface IntentResult {
    intent: string;
    domain: Domain;
    procedure: string | null;
    confidence: number;
    priority: IntentPriority;
    detectedNeeds: string[];
    actions: AgentName[];
}

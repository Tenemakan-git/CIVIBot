import { AgentName } from '../../../core/agent/agent-name.enum';
import { Domain } from '../../../core/agent/domain.enum';
import type { IntentPriority, IntentResult } from '../../../core/agent/intent.types';
export declare class IntentResultDto implements IntentResult {
    intent: string;
    domain: Domain;
    procedure: string | null;
    confidence: number;
    priority: IntentPriority;
    detectedNeeds: string[];
    actions: AgentName[];
}

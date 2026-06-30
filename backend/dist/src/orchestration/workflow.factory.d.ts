import { IntentResult } from '../core/agent/intent.types';
import { ExecutionPlan } from './execution-plan';
export declare class WorkflowFactory {
    private readonly basePipeline;
    build(intent: IntentResult): ExecutionPlan;
}

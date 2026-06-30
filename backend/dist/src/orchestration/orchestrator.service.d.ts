import { AgentName } from '../core/agent/agent-name.enum';
import { AgentContext } from '../core/agent/agent-context';
import { AgentResult, AgentStatus } from '../core/agent/agent-result';
import { PrismaService } from '../prisma/prisma.service';
import { FolderService } from '../folders/application/folder.service';
import { AgentRegistry } from './agent-registry';
import { WorkflowFactory } from './workflow.factory';
export interface OrchestrationHooks {
    onAgentStep?: (agent: AgentName, status: AgentStatus, result: AgentResult) => void;
}
export declare class OrchestratorService {
    private readonly registry;
    private readonly workflow;
    private readonly folders;
    private readonly prisma;
    private readonly logger;
    constructor(registry: AgentRegistry, workflow: WorkflowFactory, folders: FolderService, prisma: PrismaService);
    run(ctx: AgentContext, hooks?: OrchestrationHooks): Promise<void>;
    private resolveIntent;
    private fallbackIntent;
    private ensureFolder;
    private buildFolderTitle;
    private humanize;
    private dispatch;
    private logRun;
    private truncate;
}

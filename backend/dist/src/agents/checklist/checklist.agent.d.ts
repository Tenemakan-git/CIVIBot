import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import type { ILlmProvider } from '../../core/ports/llm.port';
import { PrismaService } from '../../prisma/prisma.service';
import { IChecklistAgent } from './contracts/checklist.contract';
import { ChecklistDto } from './dto/checklist.dto';
export declare class ChecklistAgent extends BaseAgent<ChecklistDto> implements IChecklistAgent {
    private readonly llm;
    private readonly prisma;
    readonly name = AgentName.Checklist;
    private readonly system;
    constructor(llm: ILlmProvider, prisma: PrismaService);
    protected run(ctx: AgentContext): Promise<AgentRunOutput<ChecklistDto>>;
    private requiredDocNames;
    private matchesDocument;
    private persist;
}

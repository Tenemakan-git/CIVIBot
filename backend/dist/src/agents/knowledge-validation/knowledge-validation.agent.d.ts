import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { PrismaService } from '../../prisma/prisma.service';
import { IKnowledgeValidationAgent } from './contracts/knowledge-validation.contract';
import { ValidationVerdictDto } from './dto/validation-verdict.dto';
export declare class KnowledgeValidationAgent extends BaseAgent<ValidationVerdictDto> implements IKnowledgeValidationAgent {
    private readonly prisma;
    readonly name = AgentName.KnowledgeValidation;
    constructor(prisma: PrismaService);
    protected run(ctx: AgentContext): Promise<AgentRunOutput<ValidationVerdictDto>>;
    private score;
    private tokenize;
}

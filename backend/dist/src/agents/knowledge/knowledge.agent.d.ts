import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { PrismaService } from '../../prisma/prisma.service';
import { IKnowledgeAgent } from './contracts/knowledge.contract';
import { KnowledgeAnswerDto } from './dto/knowledge-io.dto';
import { KnowledgeSearchService } from './knowledge-search.service';
export declare class KnowledgeAgent extends BaseAgent<KnowledgeAnswerDto> implements IKnowledgeAgent {
    private readonly search;
    private readonly prisma;
    private readonly events;
    readonly name = AgentName.Knowledge;
    constructor(search: KnowledgeSearchService, prisma: PrismaService, events: EventEmitter2);
    protected run(ctx: AgentContext): Promise<AgentRunOutput<KnowledgeAnswerDto>>;
    private tuning;
    private buildContext;
    private toSources;
}

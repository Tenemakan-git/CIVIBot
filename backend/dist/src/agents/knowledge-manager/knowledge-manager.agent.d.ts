import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import type { IEmbeddingProvider } from '../../core/ports/embedding.port';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfTextExtractor } from '../../infrastructure/pdf/pdf-text-extractor';
import { IKnowledgeManagerAgent } from './contracts/knowledge-manager.contract';
import { KnowledgeCommitDto } from './dto/knowledge-commit.dto';
export declare class KnowledgeManagerAgent extends BaseAgent<KnowledgeCommitDto> implements IKnowledgeManagerAgent {
    private readonly prisma;
    private readonly embedding;
    private readonly splitter;
    private readonly events;
    readonly name = AgentName.KnowledgeManager;
    constructor(prisma: PrismaService, embedding: IEmbeddingProvider, splitter: PdfTextExtractor, events: EventEmitter2);
    protected run(ctx: AgentContext): Promise<AgentRunOutput<KnowledgeCommitDto>>;
    private commit;
}

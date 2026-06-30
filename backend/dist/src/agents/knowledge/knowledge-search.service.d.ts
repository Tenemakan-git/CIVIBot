import { PrismaService } from '../../prisma/prisma.service';
import type { IEmbeddingProvider } from '../../core/ports/embedding.port';
import { KnowledgeChunkDto } from './dto/knowledge-io.dto';
export declare class KnowledgeSearchService {
    private readonly embedding;
    private readonly prisma;
    constructor(embedding: IEmbeddingProvider, prisma: PrismaService);
    search(query: string, topK?: number): Promise<KnowledgeChunkDto[]>;
}

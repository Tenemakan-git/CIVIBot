import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EMBEDDING_PROVIDER } from '../../core/ports/embedding.port';
import type { IEmbeddingProvider } from '../../core/ports/embedding.port';
import { KnowledgeChunkDto } from './dto/knowledge-io.dto';

/**
 * Recherche sémantique dans la base documentaire (PostgreSQL + pgvector).
 * Infrastructure du Knowledge Agent (reprend la logique de l'ancien RagService).
 */
@Injectable()
export class KnowledgeSearchService {
  constructor(
    @Inject(EMBEDDING_PROVIDER) private readonly embedding: IEmbeddingProvider,
    private readonly prisma: PrismaService,
  ) {}

  async search(query: string, topK = 5): Promise<KnowledgeChunkDto[]> {
    const vector = await this.embedding.embed(query);
    const vectorStr = `[${vector.join(',')}]`;

    const rows = await this.prisma.$queryRaw<
      {
        id: string;
        texte: string;
        documentTitre: string;
        score: number;
      }[]
    >`
      SELECT kc.id, kc.texte, kd.titre as "documentTitre",
             1 - (kc.embedding <=> ${vectorStr}::vector) AS score
      FROM "KnowledgeChunk" kc
      JOIN "KnowledgeDocument" kd ON kd.id = kc."documentId"
      WHERE kd.actif = true
      ORDER BY kc.embedding <=> ${vectorStr}::vector
      LIMIT ${topK}
    `;

    return rows.map((r) => ({
      id: r.id,
      titre: r.documentTitre,
      texte: r.texte,
      extrait: r.texte.slice(0, 160) + (r.texte.length > 160 ? '…' : ''),
      score: Number(r.score),
    }));
  }
}

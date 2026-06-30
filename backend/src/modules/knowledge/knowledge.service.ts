import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfTextExtractor } from '../../infrastructure/pdf/pdf-text-extractor';
import { EMBEDDING_PROVIDER } from '../../core/ports/embedding.port';
import type { IEmbeddingProvider } from '../../core/ports/embedding.port';

@Injectable()
export class KnowledgeService {
  constructor(
    private prisma: PrismaService,
    private pdf: PdfTextExtractor,
    @Inject(EMBEDDING_PROVIDER) private embedding: IEmbeddingProvider,
  ) {}

  findAll() {
    return this.prisma.knowledgeDocument.findMany({
      include: { _count: { select: { chunks: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.knowledgeDocument.findUnique({
      where: { id },
      include: { chunks: { select: { id: true, texte: true, ordre: true, page: true } } },
    });
  }

  async import(filePath: string, titre: string, categorie?: string, organisme?: string) {
    const doc = await this.prisma.knowledgeDocument.create({
      data: { titre, fichier: filePath, categorie, organisme },
    });

    const chunks = await this.pdf.processDocument(filePath);
    const embeddings = await this.embedding.embedBatch(chunks);

    for (let i = 0; i < chunks.length; i++) {
      const vectorStr = `[${embeddings[i].join(',')}]`;
      await this.prisma.$executeRaw`
        INSERT INTO "KnowledgeChunk" (id, "documentId", texte, embedding, ordre)
        VALUES (gen_random_uuid(), ${doc.id}, ${chunks[i]}, ${vectorStr}::vector, ${i})
      `;
    }

    return { documentId: doc.id, chunksCount: chunks.length };
  }

  async reindex(id: string) {
    const doc = await this.prisma.knowledgeDocument.findUniqueOrThrow({ where: { id } });
    await this.prisma.knowledgeChunk.deleteMany({ where: { documentId: id } });

    const chunks = await this.pdf.processDocument(doc.fichier);
    const embeddings = await this.embedding.embedBatch(chunks);

    for (let i = 0; i < chunks.length; i++) {
      const vectorStr = `[${embeddings[i].join(',')}]`;
      await this.prisma.$executeRaw`
        INSERT INTO "KnowledgeChunk" (id, "documentId", texte, embedding, ordre)
        VALUES (gen_random_uuid(), ${id}, ${chunks[i]}, ${vectorStr}::vector, ${i})
      `;
    }

    return { chunksCount: chunks.length };
  }

  async remove(id: string) {
    return this.prisma.knowledgeDocument.delete({ where: { id } });
  }
}

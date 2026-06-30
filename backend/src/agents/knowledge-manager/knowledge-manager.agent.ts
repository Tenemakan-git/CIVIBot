import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext, readOutput } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { Events } from '../../core/events/event-names';
import { EMBEDDING_PROVIDER } from '../../core/ports/embedding.port';
import type { IEmbeddingProvider } from '../../core/ports/embedding.port';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfTextExtractor } from '../../infrastructure/pdf/pdf-text-extractor';
import { IKnowledgeManagerAgent } from './contracts/knowledge-manager.contract';
import {
  CommittedDocument,
  KnowledgeCommitDto,
} from './dto/knowledge-commit.dto';

/**
 * Knowledge Manager Agent — dernière étape du pipeline. Pour chaque candidat
 * validé : crée le document, découpe en chunks, génère les embeddings (Voyage),
 * insère dans pgvector et versionne. Marque le candidat "insere".
 */
@Injectable()
export class KnowledgeManagerAgent
  extends BaseAgent<KnowledgeCommitDto>
  implements IKnowledgeManagerAgent
{
  readonly name = AgentName.KnowledgeManager;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(EMBEDDING_PROVIDER) private readonly embedding: IEmbeddingProvider,
    private readonly splitter: PdfTextExtractor,
    private readonly events: EventEmitter2,
  ) {
    super();
  }

  protected async run(
    ctx: AgentContext,
  ): Promise<AgentRunOutput<KnowledgeCommitDto>> {
    const validation = readOutput<{ acceptedIds?: string[] }>(
      ctx,
      AgentName.KnowledgeValidation,
    );
    const ids = validation?.data?.acceptedIds ?? [];

    const documents: CommittedDocument[] = [];
    let totalChunks = 0;

    for (const id of ids) {
      const candidate = await this.prisma.knowledgeCandidate.findUnique({
        where: { id },
      });
      if (!candidate || candidate.statut === 'insere') continue;

      const committed = await this.commit(candidate);
      if (committed) {
        documents.push(committed);
        totalChunks += committed.chunksInserted;
      }
    }

    if (documents.length > 0) {
      this.events.emit(Events.Knowledge.Committed, {
        folderId: ctx.folderId,
        documents: documents.length,
        chunks: totalChunks,
      });
    }

    return {
      data: { documents, totalChunks },
      confidence: documents.length > 0 ? 0.9 : 0.3,
      status: documents.length > 0 ? 'success' : 'partial',
      // Demande la ré-exécution du Knowledge Agent (désormais enrichi).
      followups: documents.length > 0 ? [AgentName.Knowledge] : [],
    };
  }

  private async commit(candidate: {
    id: string;
    titre: string;
    organisme: string;
    sourceUrl: string;
    cleanedText: string;
  }): Promise<CommittedDocument | null> {
    const chunks = await this.splitter.splitIntoChunks(candidate.cleanedText);
    if (chunks.length === 0) return null;

    const document = await this.prisma.knowledgeDocument.create({
      data: {
        titre: candidate.titre,
        fichier: candidate.sourceUrl,
        organisme: candidate.organisme,
        version: '1',
        actif: true,
      },
    });

    const embeddings = await this.embedding.embedBatch(chunks);
    for (let i = 0; i < chunks.length; i++) {
      const vectorStr = `[${embeddings[i].join(',')}]`;
      await this.prisma.$executeRaw`
        INSERT INTO "KnowledgeChunk" (id, "documentId", texte, embedding, ordre)
        VALUES (${randomUUID()}, ${document.id}, ${chunks[i]}, ${vectorStr}::vector, ${i})
      `;
    }

    await this.prisma.knowledgeVersion.create({
      data: {
        documentId: document.id,
        version: '1',
        changeNote: `Import Web Research depuis ${candidate.organisme}`,
      },
    });

    await this.prisma.knowledgeCandidate.update({
      where: { id: candidate.id },
      data: { statut: 'insere' },
    });

    return {
      documentId: document.id,
      titre: document.titre,
      version: '1',
      chunksInserted: chunks.length,
    };
  }
}

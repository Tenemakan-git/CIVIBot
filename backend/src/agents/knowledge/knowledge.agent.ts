import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput, SourceRef } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { Events } from '../../core/events/event-names';
import { PrismaService } from '../../prisma/prisma.service';
import { IKnowledgeAgent } from './contracts/knowledge.contract';
import { KnowledgeAnswerDto, KnowledgeChunkDto } from './dto/knowledge-io.dto';
import { KnowledgeSearchService } from './knowledge-search.service';

const DEFAULT_TOP_K = 5;
// Seuil calibré pour les scores cosinus de voyage-3 sur du Q&A court en
// français (~0,5–0,6 pour un bon match). Au-delà de ~0,5, même les bonnes
// récupérations sont rejetées et tout bascule en recherche web.
const DEFAULT_THRESHOLD = 0.45;

/**
 * Knowledge Agent — recherche dans la base locale (pgvector). Décide si la
 * connaissance locale suffit ; sinon, demande le sous-pipeline Web Research
 * via `followups` et émet `knowledge.insufficient`.
 */
@Injectable()
export class KnowledgeAgent
  extends BaseAgent<KnowledgeAnswerDto>
  implements IKnowledgeAgent
{
  readonly name = AgentName.Knowledge;

  constructor(
    private readonly search: KnowledgeSearchService,
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {
    super();
  }

  protected async run(
    ctx: AgentContext,
  ): Promise<AgentRunOutput<KnowledgeAnswerDto>> {
    const { topK, threshold } = await this.tuning();
    const chunks = await this.search.search(ctx.userMessage, topK);
    const best = chunks[0]?.score ?? 0;
    const sufficient = chunks.length > 0 && best >= threshold;

    const data: KnowledgeAnswerDto = {
      context: this.buildContext(chunks),
      chunks,
      sufficient,
    };

    // Garde anti-boucle : on ne relance la recherche web qu'une seule fois.
    const alreadyEnriched = ctx.metadata['webResearchDone'] === true;

    if (!sufficient && !alreadyEnriched) {
      this.events.emit(Events.Knowledge.InsufficientLocal, {
        folderId: ctx.folderId,
        query: ctx.userMessage,
        bestScore: best,
      });
      return {
        data,
        status: 'needs_followup',
        confidence: best,
        followups: [AgentName.WebResearch],
        sources: this.toSources(chunks),
      };
    }

    return {
      data,
      confidence: best,
      sources: this.toSources(chunks),
    };
  }

  private async tuning(): Promise<{ topK: number; threshold: number }> {
    const settings = await this.prisma.aiSettings.findFirst();
    return {
      topK: settings?.topK ?? DEFAULT_TOP_K,
      threshold: settings?.seuilSimilarite ?? DEFAULT_THRESHOLD,
    };
  }

  private buildContext(chunks: KnowledgeChunkDto[]): string {
    if (chunks.length === 0) return '';
    return chunks
      .map((c, i) => `[Source ${i + 1} — ${c.titre}]\n${c.texte}`)
      .join('\n\n---\n\n');
  }

  private toSources(chunks: KnowledgeChunkDto[]): SourceRef[] {
    const seen = new Set<string>();
    const sources: SourceRef[] = [];
    for (const c of chunks) {
      if (seen.has(c.titre)) continue;
      seen.add(c.titre);
      sources.push({ organisme: c.titre, titre: c.titre });
    }
    return sources;
  }
}

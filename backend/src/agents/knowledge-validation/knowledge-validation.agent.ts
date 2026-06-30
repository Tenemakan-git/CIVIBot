import { Injectable } from '@nestjs/common';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext, readOutput } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { PrismaService } from '../../prisma/prisma.service';
import { IKnowledgeValidationAgent } from './contracts/knowledge-validation.contract';
import {
  ValidationScores,
  ValidationVerdictDto,
} from './dto/validation-verdict.dto';

const QUALITY_MIN = 0.4;
const COHERENCE_MIN = 0.12;

/**
 * Knowledge Validation Agent — porte de qualité AVANT insertion. Score chaque
 * candidat (doublons / qualité / cohérence / fraîcheur) de façon déterministe
 * et met à jour son statut (valide | rejete).
 */
@Injectable()
export class KnowledgeValidationAgent
  extends BaseAgent<ValidationVerdictDto>
  implements IKnowledgeValidationAgent
{
  readonly name = AgentName.KnowledgeValidation;

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  protected async run(
    ctx: AgentContext,
  ): Promise<AgentRunOutput<ValidationVerdictDto>> {
    const web = readOutput<{ candidates?: { id: string }[] }>(
      ctx,
      AgentName.WebResearch,
    );
    const ids = (web?.data?.candidates ?? []).map((c) => c.id);

    const acceptedIds: string[] = [];
    const rejected: ValidationVerdictDto['rejected'] = [];
    const scoresMap: Record<string, ValidationScores> = {};

    const tokens = this.tokenize(ctx.userMessage);

    for (const id of ids) {
      const candidate = await this.prisma.knowledgeCandidate.findUnique({
        where: { id },
      });
      if (!candidate) continue;

      const scores = this.score(candidate.cleanedText, candidate.createdAt, tokens);
      scoresMap[id] = scores;

      const accepted = scores.quality >= QUALITY_MIN && scores.coherence >= COHERENCE_MIN;
      const reason = !accepted
        ? scores.quality < QUALITY_MIN
          ? 'qualité insuffisante'
          : 'cohérence insuffisante avec la demande'
        : null;

      await this.prisma.knowledgeCandidate.update({
        where: { id },
        data: {
          statut: accepted ? 'valide' : 'rejete',
          scores: scores as unknown as object,
          rejectReason: reason,
        },
      });

      if (accepted) acceptedIds.push(id);
      else rejected.push({ id, reason: reason ?? 'rejeté' });
    }

    return {
      data: { acceptedIds, rejected, scores: scoresMap },
      confidence: ids.length ? acceptedIds.length / ids.length : 0,
      status: acceptedIds.length > 0 ? 'success' : 'partial',
      followups: acceptedIds.length > 0 ? [AgentName.KnowledgeManager] : [],
    };
  }

  private score(
    text: string,
    createdAt: Date,
    queryTokens: string[],
  ): ValidationScores {
    // Qualité : volume de texte exploitable.
    const quality = Math.max(0, Math.min(1, text.length / 1500));

    // Cohérence : recouvrement lexical avec la demande.
    const lower = text.toLowerCase();
    const hits = queryTokens.filter((t) => lower.includes(t)).length;
    const coherence = queryTokens.length ? hits / queryTokens.length : 0;

    // Fraîcheur : candidat tout juste récupéré.
    const ageHours = (Date.now() - createdAt.getTime()) / 3_600_000;
    const freshness = ageHours < 24 ? 1 : Math.max(0, 1 - ageHours / (24 * 30));

    // Doublon : la mise en staging a déjà filtré par hash → faible.
    const duplicate = 0;

    return { duplicate, quality, coherence, freshness };
  }

  private tokenize(q: string): string[] {
    return q
      .toLowerCase()
      .split(/[^a-zàâäéèêëîïôöùûüç0-9]+/i)
      .filter((t) => t.length >= 4);
  }
}

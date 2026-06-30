import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LearningInsightDto } from './dto/learning-insight.dto';

export interface RecordInsightInput {
  type: string;
  cle: string;
  domaine?: string | null;
  recommandation?: string | null;
}

/**
 * Persistance des recommandations du Learning Agent. Chaque observation
 * incrémente un compteur (upsert sur type+clé) pour faire émerger les manques
 * récurrents auprès des administrateurs.
 */
@Injectable()
export class LearningService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordInsightInput): Promise<void> {
    const cle = input.cle.slice(0, 200);
    await this.prisma.learningInsight.upsert({
      where: { type_cle: { type: input.type, cle } },
      create: {
        type: input.type,
        cle,
        domaine: input.domaine ?? null,
        recommandation: input.recommandation ?? null,
      },
      update: {
        count: { increment: 1 },
        recommandation: input.recommandation ?? undefined,
      },
    });
  }

  async topInsights(limit = 50): Promise<LearningInsightDto[]> {
    return this.prisma.learningInsight.findMany({
      orderBy: [{ count: 'desc' }, { lastSeen: 'desc' }],
      take: limit,
      select: {
        type: true,
        cle: true,
        domaine: true,
        count: true,
        recommandation: true,
        lastSeen: true,
      },
    });
  }
}

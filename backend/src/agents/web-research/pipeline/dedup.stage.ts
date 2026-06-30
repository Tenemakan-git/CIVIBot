import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';

/** Étape 4 — Déduplication par empreinte de contenu. */
@Injectable()
export class DedupStage {
  constructor(private readonly prisma: PrismaService) {}

  hash(text: string): string {
    return createHash('sha256').update(text).digest('hex');
  }

  /** Vrai si ce contenu n'existe pas déjà en staging. */
  async isNew(contentHash: string): Promise<boolean> {
    const existing = await this.prisma.knowledgeCandidate.findUnique({
      where: { contentHash },
    });
    return !existing;
  }
}

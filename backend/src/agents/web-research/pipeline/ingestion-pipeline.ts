import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SearchStage } from './search.stage';
import { ExtractStage } from './extract.stage';
import { CleanStage } from './clean.stage';
import { DedupStage } from './dedup.stage';

const MIN_USEFUL_LENGTH = 200;
const RAW_CAP = 20000;

export interface StagedCandidate {
  id: string;
  organisme: string;
  sourceUrl: string;
  titre: string;
  contentHash: string;
}

/**
 * Pipeline d'ingestion du Web Research Agent :
 *   Recherche → Extraction → Nettoyage → Déduplication → (mise en staging).
 *
 * Le résultat n'est JAMAIS inséré directement dans la base documentaire : il
 * est mis en attente dans `KnowledgeCandidate` (statut "en_attente"), pour
 * validation puis insertion par les agents dédiés.
 */
@Injectable()
export class IngestionPipeline {
  private readonly logger = new Logger(IngestionPipeline.name);

  constructor(
    private readonly search: SearchStage,
    private readonly extract: ExtractStage,
    private readonly clean: CleanStage,
    private readonly dedup: DedupStage,
    private readonly prisma: PrismaService,
  ) {}

  async run(query: string, limit = 5): Promise<StagedCandidate[]> {
    const hits = await this.search.run(query, limit);
    const staged: StagedCandidate[] = [];
    const seenInBatch = new Set<string>();

    for (const hit of hits) {
      try {
        const page = await this.extract.run(hit); // extraction
        const cleaned = this.clean.run(page.text); // nettoyage
        if (cleaned.length < MIN_USEFUL_LENGTH) continue;

        const contentHash = this.dedup.hash(cleaned); // déduplication
        if (seenInBatch.has(contentHash)) continue;
        seenInBatch.add(contentHash);
        if (!(await this.dedup.isNew(contentHash))) continue;

        const record = await this.prisma.knowledgeCandidate.create({
          data: {
            organisme: page.organisme,
            sourceUrl: page.sourceUrl,
            titre: page.titre,
            rawText: page.text.slice(0, RAW_CAP),
            cleanedText: cleaned,
            contentHash,
            statut: 'en_attente',
          },
        });

        staged.push({
          id: record.id,
          organisme: record.organisme,
          sourceUrl: record.sourceUrl,
          titre: record.titre,
          contentHash,
        });
      } catch (err) {
        this.logger.warn(
          `Ingestion ignorée pour ${hit.url}: ${(err as Error).message}`,
        );
      }
    }

    return staged;
  }
}

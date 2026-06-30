import { PrismaService } from '../../../prisma/prisma.service';
import { SearchStage } from './search.stage';
import { ExtractStage } from './extract.stage';
import { CleanStage } from './clean.stage';
import { DedupStage } from './dedup.stage';
export interface StagedCandidate {
    id: string;
    organisme: string;
    sourceUrl: string;
    titre: string;
    contentHash: string;
}
export declare class IngestionPipeline {
    private readonly search;
    private readonly extract;
    private readonly clean;
    private readonly dedup;
    private readonly prisma;
    private readonly logger;
    constructor(search: SearchStage, extract: ExtractStage, clean: CleanStage, dedup: DedupStage, prisma: PrismaService);
    run(query: string, limit?: number): Promise<StagedCandidate[]>;
}

import { PrismaService } from '../../prisma/prisma.service';
import { LearningInsightDto } from './dto/learning-insight.dto';
export interface RecordInsightInput {
    type: string;
    cle: string;
    domaine?: string | null;
    recommandation?: string | null;
}
export declare class LearningService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    record(input: RecordInsightInput): Promise<void>;
    topInsights(limit?: number): Promise<LearningInsightDto[]>;
}

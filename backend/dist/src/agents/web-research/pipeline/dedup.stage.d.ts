import { PrismaService } from '../../../prisma/prisma.service';
export declare class DedupStage {
    private readonly prisma;
    constructor(prisma: PrismaService);
    hash(text: string): string;
    isNew(contentHash: string): Promise<boolean>;
}

import { PrismaService } from '../../prisma/prisma.service';
export interface UsageDailyPoint {
    date: string;
    calls: number;
    cost: number;
    tokens: number;
}
export interface UsageByModel {
    modele: string;
    calls: number;
    cost: number;
    tokensInput: number;
    tokensOutput: number;
}
export interface UsageReport {
    window: {
        days: number;
        calls: number;
        cost: number;
        tokensInput: number;
        tokensOutput: number;
        avgDurationMs: number;
    };
    allTime: {
        calls: number;
        cost: number;
        tokensInput: number;
        tokensOutput: number;
    };
    daily: UsageDailyPoint[];
    byModel: UsageByModel[];
}
export declare class StatsService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        users: number;
        conversations: number;
        documents: number;
        aiLogs: number;
        folders: number;
    }>;
    getUsage(days?: number): Promise<UsageReport>;
}

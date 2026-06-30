import { StatsService } from './stats.service';
export declare class StatsController {
    private service;
    constructor(service: StatsService);
    getStats(): Promise<{
        users: number;
        conversations: number;
        documents: number;
        aiLogs: number;
        folders: number;
    }>;
    getUsage(days?: string): Promise<import("./stats.service").UsageReport>;
}

import { PrismaService } from '../../prisma/prisma.service';
export declare class AiSettingsController {
    private prisma;
    constructor(prisma: PrismaService);
    getSettings(): Promise<{
        id: string;
        updatedAt: Date;
        modele: string;
        modeleSecours: string;
        temperature: number;
        maxTokens: number;
        topK: number;
        seuilSimilarite: number;
        promptSysteme: string;
    }>;
    updateSettings(body: any): Promise<{
        id: string;
        updatedAt: Date;
        modele: string;
        modeleSecours: string;
        temperature: number;
        maxTokens: number;
        topK: number;
        seuilSimilarite: number;
        promptSysteme: string;
    }>;
}

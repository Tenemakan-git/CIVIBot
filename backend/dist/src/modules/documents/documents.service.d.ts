import { PrismaService } from '../../prisma/prisma.service';
import type { ILlmProvider } from '../../core/ports/llm.port';
import { PdfTextExtractor } from '../../infrastructure/pdf/pdf-text-extractor';
export declare class DocumentsService {
    private prisma;
    private llm;
    private pdf;
    constructor(prisma: PrismaService, llm: ILlmProvider, pdf: PdfTextExtractor);
    findAll(userId: string): import("@prisma/client").Prisma.PrismaPromise<({
        analysis: {
            id: string;
            createdAt: Date;
            documentId: string;
            resume: string | null;
            texteOcr: string | null;
            lisible: boolean;
            score: number | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        nom: string;
        type: string;
        userId: string;
        chemin: string;
        taille: number;
    })[]>;
    findOne(id: string, userId: string): import("@prisma/client").Prisma.Prisma__UserDocumentClient<({
        analysis: {
            id: string;
            createdAt: Date;
            documentId: string;
            resume: string | null;
            texteOcr: string | null;
            lisible: boolean;
            score: number | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        nom: string;
        type: string;
        userId: string;
        chemin: string;
        taille: number;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    upload(userId: string, file: Express.Multer.File, nom?: string): Promise<({
        analysis: {
            id: string;
            createdAt: Date;
            documentId: string;
            resume: string | null;
            texteOcr: string | null;
            lisible: boolean;
            score: number | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        nom: string;
        type: string;
        userId: string;
        chemin: string;
        taille: number;
    }) | null>;
    remove(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        nom: string;
        type: string;
        userId: string;
        chemin: string;
        taille: number;
    }>;
    private summarize;
}

import { PrismaService } from '../../prisma/prisma.service';
import { PdfTextExtractor } from '../../infrastructure/pdf/pdf-text-extractor';
import type { IEmbeddingProvider } from '../../core/ports/embedding.port';
export declare class KnowledgeService {
    private prisma;
    private pdf;
    private embedding;
    constructor(prisma: PrismaService, pdf: PdfTextExtractor, embedding: IEmbeddingProvider);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        _count: {
            chunks: number;
        };
    } & {
        id: string;
        titre: string;
        fichier: string;
        version: string;
        categorie: string | null;
        organisme: string | null;
        actif: boolean;
        createdAt: Date;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__KnowledgeDocumentClient<({
        chunks: {
            id: string;
            texte: string;
            page: number | null;
            ordre: number;
        }[];
    } & {
        id: string;
        titre: string;
        fichier: string;
        version: string;
        categorie: string | null;
        organisme: string | null;
        actif: boolean;
        createdAt: Date;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    import(filePath: string, titre: string, categorie?: string, organisme?: string): Promise<{
        documentId: string;
        chunksCount: number;
    }>;
    reindex(id: string): Promise<{
        chunksCount: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        titre: string;
        fichier: string;
        version: string;
        categorie: string | null;
        organisme: string | null;
        actif: boolean;
        createdAt: Date;
    }>;
}

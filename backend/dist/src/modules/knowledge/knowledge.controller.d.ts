import { KnowledgeService } from './knowledge.service';
export declare class KnowledgeController {
    private service;
    constructor(service: KnowledgeService);
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
    import(file: Express.Multer.File, body: any): Promise<{
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

import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private service;
    constructor(service: DocumentsService);
    findAll(user: any): import("@prisma/client").Prisma.PrismaPromise<({
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
    findOne(id: string, user: any): import("@prisma/client").Prisma.Prisma__UserDocumentClient<({
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
    upload(file: Express.Multer.File, user: any, body: any): Promise<({
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
    remove(id: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        nom: string;
        type: string;
        userId: string;
        chemin: string;
        taille: number;
    }>;
}

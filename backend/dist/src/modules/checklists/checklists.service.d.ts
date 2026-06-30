import { PrismaService } from '../../prisma/prisma.service';
import { RequiredDocsChecklistService } from '../../folders/application/required-docs-checklist.service';
export declare class ChecklistsService {
    private prisma;
    private requiredDocs;
    constructor(prisma: PrismaService, requiredDocs: RequiredDocsChecklistService);
    findAll(userId: string): import("@prisma/client").Prisma.PrismaPromise<({
        items: {
            id: string;
            texte: string;
            ordre: number;
            checklistId: string;
            folderDocumentId: string | null;
            coche: boolean;
        }[];
    } & {
        id: string;
        titre: string;
        createdAt: Date;
        userId: string;
        folderId: string | null;
    })[]>;
    findOne(id: string, userId: string): import("@prisma/client").Prisma.Prisma__ChecklistClient<({
        items: {
            id: string;
            texte: string;
            ordre: number;
            checklistId: string;
            folderDocumentId: string | null;
            coche: boolean;
        }[];
    } & {
        id: string;
        titre: string;
        createdAt: Date;
        userId: string;
        folderId: string | null;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    create(userId: string, titre: string, items: string[]): Promise<{
        items: {
            id: string;
            texte: string;
            ordre: number;
            checklistId: string;
            folderDocumentId: string | null;
            coche: boolean;
        }[];
    } & {
        id: string;
        titre: string;
        createdAt: Date;
        userId: string;
        folderId: string | null;
    }>;
    toggleItem(checklistId: string, itemId: string, userId: string, coche: boolean): Promise<{
        id: string;
        texte: string;
        ordre: number;
        checklistId: string;
        folderDocumentId: string | null;
        coche: boolean;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        titre: string;
        createdAt: Date;
        userId: string;
        folderId: string | null;
    }>;
}

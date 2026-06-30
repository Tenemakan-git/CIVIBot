import { ChecklistsService } from './checklists.service';
import { ToggleItemDto } from './dto/toggle-item.dto';
export declare class ChecklistsController {
    private service;
    constructor(service: ChecklistsService);
    findAll(user: any): import("@prisma/client").Prisma.PrismaPromise<({
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
    findOne(id: string, user: any): import("@prisma/client").Prisma.Prisma__ChecklistClient<({
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
    create(user: any, body: {
        titre: string;
        items: string[];
    }): Promise<{
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
    toggleItem(id: string, itemId: string, user: any, dto: ToggleItemDto): Promise<{
        id: string;
        texte: string;
        ordre: number;
        checklistId: string;
        folderDocumentId: string | null;
        coche: boolean;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        titre: string;
        createdAt: Date;
        userId: string;
        folderId: string | null;
    }>;
}

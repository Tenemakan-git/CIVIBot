import { PrismaService } from '../../prisma/prisma.service';
export declare class ConversationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): import("@prisma/client").Prisma.PrismaPromise<({
        _count: {
            messages: number;
        };
    } & {
        id: string;
        titre: string;
        createdAt: Date;
        statut: string;
        updatedAt: Date;
        userId: string;
    })[]>;
    create(userId: string, titre?: string): import("@prisma/client").Prisma.Prisma__ConversationClient<{
        id: string;
        titre: string;
        createdAt: Date;
        statut: string;
        updatedAt: Date;
        userId: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findOne(id: string, userId: string): Promise<{
        messages: {
            id: string;
            createdAt: Date;
            conversationId: string;
            sender: string;
            contenu: string;
            tokens: number | null;
            modeleUtilise: string | null;
        }[];
    } & {
        id: string;
        titre: string;
        createdAt: Date;
        statut: string;
        updatedAt: Date;
        userId: string;
    }>;
    update(id: string, userId: string, data: {
        titre?: string;
    }): Promise<{
        id: string;
        titre: string;
        createdAt: Date;
        statut: string;
        updatedAt: Date;
        userId: string;
    }>;
    archive(id: string, userId: string): Promise<{
        id: string;
        titre: string;
        createdAt: Date;
        statut: string;
        updatedAt: Date;
        userId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        titre: string;
        createdAt: Date;
        statut: string;
        updatedAt: Date;
        userId: string;
    }>;
}

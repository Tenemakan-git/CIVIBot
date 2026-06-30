import { ConversationsService } from './conversations.service';
export declare class ConversationsController {
    private service;
    constructor(service: ConversationsService);
    findAll(user: any): import("@prisma/client").Prisma.PrismaPromise<({
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
    create(user: any, body: any): import("@prisma/client").Prisma.Prisma__ConversationClient<{
        id: string;
        titre: string;
        createdAt: Date;
        statut: string;
        updatedAt: Date;
        userId: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findOne(id: string, user: any): Promise<{
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
    update(id: string, user: any, body: any): Promise<{
        id: string;
        titre: string;
        createdAt: Date;
        statut: string;
        updatedAt: Date;
        userId: string;
    }>;
    archive(id: string, user: any): Promise<{
        id: string;
        titre: string;
        createdAt: Date;
        statut: string;
        updatedAt: Date;
        userId: string;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        titre: string;
        createdAt: Date;
        statut: string;
        updatedAt: Date;
        userId: string;
    }>;
}

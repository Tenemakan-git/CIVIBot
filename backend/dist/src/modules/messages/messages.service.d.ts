import { PrismaService } from '../../prisma/prisma.service';
export declare class MessagesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(conversationId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        conversationId: string;
        sender: string;
        contenu: string;
        tokens: number | null;
        modeleUtilise: string | null;
    }[]>;
    saveUserMessage(conversationId: string, contenu: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        conversationId: string;
        sender: string;
        contenu: string;
        tokens: number | null;
        modeleUtilise: string | null;
    }>;
    getLastUserMessage(conversationId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        conversationId: string;
        sender: string;
        contenu: string;
        tokens: number | null;
        modeleUtilise: string | null;
    }>;
}

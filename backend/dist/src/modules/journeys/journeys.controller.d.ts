import { JourneysService } from './journeys.service';
import { AnswerQuestionDto } from './dto/answer-question.dto';
export declare class JourneysController {
    private service;
    constructor(service: JourneysService);
    findAll(user: any): import("@prisma/client").Prisma.PrismaPromise<({
        answers: {
            id: string;
            createdAt: Date;
            reponse: string;
            ordre: number;
            question: string;
            sessionId: string;
        }[];
    } & {
        id: string;
        folderId: string | null;
        createdAt: Date;
        conversationId: string | null;
        userId: string;
        statut: string;
    })[]>;
    questionnaire(): import("./questionnaire").Questionnaire;
    create(user: any): import("@prisma/client").Prisma.Prisma__GuidedSessionClient<{
        id: string;
        folderId: string | null;
        createdAt: Date;
        conversationId: string | null;
        userId: string;
        statut: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findOne(id: string, user: any): import("@prisma/client").Prisma.Prisma__GuidedSessionClient<({
        answers: {
            id: string;
            createdAt: Date;
            reponse: string;
            ordre: number;
            question: string;
            sessionId: string;
        }[];
    } & {
        id: string;
        folderId: string | null;
        createdAt: Date;
        conversationId: string | null;
        userId: string;
        statut: string;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    addAnswer(id: string, user: any, dto: AnswerQuestionDto): Promise<{
        id: string;
        createdAt: Date;
        reponse: string;
        ordre: number;
        question: string;
        sessionId: string;
    }>;
    complete(id: string, user: any): Promise<{
        sessionId: string;
        folderId: string;
        conversationId: string | null;
    } | {
        sessionId: string;
        folderId: string | null;
        conversationId: string;
    }>;
}

import { PrismaService } from '../../prisma/prisma.service';
import { OrchestratorService } from '../../orchestration/orchestrator.service';
import { AnswerQuestionDto } from './dto/answer-question.dto';
export declare class JourneysService {
    private prisma;
    private orchestrator;
    constructor(prisma: PrismaService, orchestrator: OrchestratorService);
    questionnaire(): import("./questionnaire").Questionnaire;
    findAll(userId: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    findOne(id: string, userId: string): import("@prisma/client").Prisma.Prisma__GuidedSessionClient<({
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
    create(userId: string): import("@prisma/client").Prisma.Prisma__GuidedSessionClient<{
        id: string;
        folderId: string | null;
        createdAt: Date;
        conversationId: string | null;
        userId: string;
        statut: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    addAnswer(sessionId: string, userId: string, dto: AnswerQuestionDto): Promise<{
        id: string;
        createdAt: Date;
        reponse: string;
        ordre: number;
        question: string;
        sessionId: string;
    }>;
    complete(sessionId: string, userId: string): Promise<{
        sessionId: string;
        folderId: string;
        conversationId: string | null;
    } | {
        sessionId: string;
        folderId: string | null;
        conversationId: string;
    }>;
    private synthesize;
}

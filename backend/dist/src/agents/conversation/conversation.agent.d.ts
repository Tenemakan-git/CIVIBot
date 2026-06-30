import { Response } from 'express';
import type { ILlmProvider } from '../../core/ports/llm.port';
import { PrismaService } from '../../prisma/prisma.service';
import { OrchestratorService } from '../../orchestration/orchestrator.service';
import { HandleConversationParams, IConversationAgent } from './contracts/conversation.contract';
export declare class ConversationAgent implements IConversationAgent {
    private readonly orchestrator;
    private readonly prisma;
    private readonly llm;
    private readonly logger;
    constructor(orchestrator: OrchestratorService, prisma: PrismaService, llm: ILlmProvider);
    handle(params: HandleConversationParams, res: Response): Promise<void>;
    private orientationContext;
    private streamAnswer;
    private buildHistory;
    private ensureConversation;
    private openSse;
    private send;
}

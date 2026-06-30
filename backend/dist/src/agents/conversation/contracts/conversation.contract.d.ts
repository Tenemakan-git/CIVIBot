import { Response } from 'express';
export interface HandleConversationParams {
    userId: string;
    message: string;
    conversationId?: string;
    folderId?: string;
    lat?: number;
    lng?: number;
}
export interface IConversationAgent {
    handle(params: HandleConversationParams, res: Response): Promise<void>;
}

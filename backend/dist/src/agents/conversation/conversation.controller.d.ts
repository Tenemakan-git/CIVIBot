import type { Response } from 'express';
import { HandleMessageDto } from '../../orchestration/dto/handle-message.dto';
import { ConversationAgent } from './conversation.agent';
export declare class ConversationController {
    private readonly agent;
    constructor(agent: ConversationAgent);
    message(user: any, dto: HandleMessageDto, res: Response): Promise<void>;
}

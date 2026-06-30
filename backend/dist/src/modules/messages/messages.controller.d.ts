import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class MessagesController {
    private messages;
    constructor(messages: MessagesService);
    findAll(id: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        conversationId: string;
        sender: string;
        contenu: string;
        tokens: number | null;
        modeleUtilise: string | null;
    }[]>;
    send(conversationId: string, dto: SendMessageDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        conversationId: string;
        sender: string;
        contenu: string;
        tokens: number | null;
        modeleUtilise: string | null;
    }>;
}

import { EventEmitter2 } from '@nestjs/event-emitter';
import type { FolderEventPayload } from '../../folders/domain/events/folder.events';
import { ILearningAgent } from './contracts/learning.contract';
import { LearningService } from './learning.service';
export declare class LearningAgent implements ILearningAgent {
    private readonly learning;
    private readonly events;
    constructor(learning: LearningService, events: EventEmitter2);
    onFolderCreated(payload: FolderEventPayload): Promise<void>;
    onKnowledgeInsufficient(payload: {
        query: string;
        folderId: string;
    }): Promise<void>;
    onVerification(payload: {
        domaine: string | null;
        status: string;
        missing: string[];
    }): Promise<void>;
}

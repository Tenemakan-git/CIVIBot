import { EventEmitter2 } from '@nestjs/event-emitter';
import { FolderService } from '../../folders/application/folder.service';
import type { FolderEventPayload } from '../../folders/domain/events/folder.events';
import { IMonitoringAgent } from './contracts/monitoring.contract';
export declare class MonitoringAgent implements IMonitoringAgent {
    private readonly folders;
    private readonly events;
    private readonly logger;
    constructor(folders: FolderService, events: EventEmitter2);
    onFolderChanged(payload: FolderEventPayload): Promise<void>;
}

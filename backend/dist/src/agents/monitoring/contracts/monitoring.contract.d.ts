import { FolderEventPayload } from '../../../folders/domain/events/folder.events';
export interface IMonitoringAgent {
    onFolderChanged(payload: FolderEventPayload): Promise<void>;
}

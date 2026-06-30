import { FolderService } from '../application/folder.service';
import { RequiredDocsChecklistService } from '../application/required-docs-checklist.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { RenameFolderDto, SetProgressDto } from './dto/update-folder.dto';
export declare class FolderController {
    private readonly service;
    private readonly requiredDocs;
    constructor(service: FolderService, requiredDocs: RequiredDocsChecklistService);
    list(user: any): Promise<import("../domain/administrative-folder.entity").FolderSnapshot[]>;
    notifications(user: any): Promise<import("../domain/folder.repository.port").UserNotificationView[]>;
    readAllNotifications(user: any): Promise<void>;
    readNotification(id: string, user: any): Promise<void>;
    create(user: any, dto: CreateFolderDto): Promise<import("../domain/administrative-folder.entity").FolderSnapshot>;
    view(id: string, user: any): Promise<import("../domain/folder.repository.port").FolderView>;
    rename(id: string, user: any, dto: RenameFolderDto): Promise<void>;
    progress(id: string, user: any, dto: SetProgressDto): Promise<import("../domain/administrative-folder.entity").FolderSnapshot>;
    terminate(id: string, user: any): Promise<void>;
    setDocument(id: string, docId: string, user: any, body: {
        fourni: boolean;
    }): Promise<import("../domain/folder.repository.port").FolderView>;
}

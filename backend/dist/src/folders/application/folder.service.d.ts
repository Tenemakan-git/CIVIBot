import { EventEmitter2 } from '@nestjs/event-emitter';
import { Domain } from '../../core/agent/domain.enum';
import { AdministrativeFolder } from '../domain/administrative-folder.entity';
import type { FolderDocumentInput, FolderView, HistoryInput, IFolderRepository, NotificationInput, PdfInput, PlanInput, SourceInput, TimelineInput, UserNotificationView } from '../domain/folder.repository.port';
export interface CreateFolderInput {
    userId: string;
    domaine: Domain;
    titre: string;
    procedureSlug?: string | null;
    conversationId?: string | null;
}
export declare class FolderService {
    private readonly repo;
    private readonly events;
    constructor(repo: IFolderRepository, events: EventEmitter2);
    createFolder(input: CreateFolderInput): Promise<AdministrativeFolder>;
    getView(id: string, userId: string): Promise<FolderView>;
    listForUser(userId: string): Promise<AdministrativeFolder[]>;
    findByConversation(conversationId: string): Promise<AdministrativeFolder | null>;
    listNotifications(userId: string): Promise<UserNotificationView[]>;
    markNotificationRead(id: string, userId: string): Promise<void>;
    markAllNotificationsRead(userId: string): Promise<void>;
    private requireOwned;
    rename(id: string, userId: string, titre: string): Promise<void>;
    setProgress(id: string, userId: string | null, value: number): Promise<AdministrativeFolder>;
    terminate(id: string, userId: string): Promise<void>;
    attachConversation(id: string, conversationId: string): Promise<void>;
    setProcedure(id: string, slug: string): Promise<void>;
    recordPlan(id: string, plan: PlanInput): Promise<void>;
    recordDocuments(id: string, docs: FolderDocumentInput[]): Promise<void>;
    recordSources(id: string, sources: SourceInput[]): Promise<void>;
    recordTimeline(id: string, entry: TimelineInput): Promise<void>;
    recordHistory(id: string, h: HistoryInput): Promise<void>;
    recordNotification(id: string, n: NotificationInput): Promise<void>;
    recordPdf(id: string, pdf: PdfInput): Promise<void>;
    recomputeProgress(id: string): Promise<AdministrativeFolder>;
    private mustFind;
    private emitUpdated;
    private payload;
}

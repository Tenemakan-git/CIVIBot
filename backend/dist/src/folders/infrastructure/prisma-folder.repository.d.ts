import { PrismaService } from '../../prisma/prisma.service';
import { AdministrativeFolder } from '../domain/administrative-folder.entity';
import { FolderDocumentInput, FolderView, HistoryInput, IFolderRepository, NotificationInput, PdfInput, PlanInput, SourceInput, TimelineInput, UserNotificationView } from '../domain/folder.repository.port';
export declare class PrismaFolderRepository implements IFolderRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(folder: AdministrativeFolder): Promise<AdministrativeFolder>;
    save(folder: AdministrativeFolder): Promise<AdministrativeFolder>;
    findById(id: string): Promise<AdministrativeFolder | null>;
    findByUser(userId: string): Promise<AdministrativeFolder[]>;
    findByConversation(conversationId: string): Promise<AdministrativeFolder | null>;
    getView(id: string): Promise<FolderView | null>;
    upsertPlan(folderId: string, plan: PlanInput): Promise<void>;
    addDocuments(folderId: string, docs: FolderDocumentInput[]): Promise<void>;
    addTimeline(folderId: string, entry: TimelineInput): Promise<void>;
    addNotification(folderId: string, n: NotificationInput): Promise<void>;
    addSources(folderId: string, sources: SourceInput[]): Promise<void>;
    addHistory(folderId: string, h: HistoryInput): Promise<void>;
    addPdf(folderId: string, pdf: PdfInput): Promise<void>;
    listNotificationsForUser(userId: string): Promise<UserNotificationView[]>;
    markNotificationRead(id: string, userId: string): Promise<void>;
    markAllNotificationsRead(userId: string): Promise<void>;
    private toSnapshot;
}

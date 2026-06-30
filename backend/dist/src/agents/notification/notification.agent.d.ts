import { FolderService } from '../../folders/application/folder.service';
import type { FolderEventPayload } from '../../folders/domain/events/folder.events';
import { PrismaService } from '../../prisma/prisma.service';
import { ProgressReportDto } from '../monitoring/dto/progress-report.dto';
export declare class NotificationAgent {
    private readonly folders;
    private readonly prisma;
    private readonly logger;
    constructor(folders: FolderService, prisma: PrismaService);
    onProgress(report: ProgressReportDto): Promise<void>;
    onCompleted(payload: FolderEventPayload): Promise<void>;
    onVerification(payload: {
        folderId: string;
        status: string;
        missing: string[];
    }): Promise<void>;
    onKnowledgeCommitted(payload: {
        folderId: string;
        documents: number;
    }): Promise<void>;
    private notifyOnce;
    private send;
}

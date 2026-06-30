import { PrismaService } from '../../prisma/prisma.service';
import { FolderService } from './folder.service';
export declare class RequiredDocsChecklistService {
    private readonly prisma;
    private readonly folders;
    static readonly TITLE = "Documents \u00E0 fournir";
    constructor(prisma: PrismaService, folders: FolderService);
    sync(folderId: string): Promise<void>;
    setDocProvided(folderDocumentId: string, fourni: boolean): Promise<void>;
}

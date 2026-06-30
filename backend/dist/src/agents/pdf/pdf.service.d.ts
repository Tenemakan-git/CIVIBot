import { PrismaService } from '../../prisma/prisma.service';
import { FolderService } from '../../folders/application/folder.service';
import { PdfRenderer } from '../../infrastructure/pdf/pdf-renderer';
export interface RenderedPdf {
    buffer: Buffer;
    storageKey: string;
    filename: string;
    bytes: number;
}
export declare class PdfService {
    private readonly folders;
    private readonly prisma;
    private readonly renderer;
    private readonly storageDir;
    constructor(folders: FolderService, prisma: PrismaService, renderer: PdfRenderer);
    generate(folderId: string, userId: string, tips?: string[]): Promise<RenderedPdf>;
    private buildModel;
}

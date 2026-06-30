import { PrismaService } from '../../prisma/prisma.service';
import { FolderService } from '../../folders/application/folder.service';
import type { ILlmProvider } from '../../core/ports/llm.port';
import { OfficialDocRenderer } from '../../infrastructure/pdf/official-doc-renderer';
import { GeneratedDocMeta, TemplateSummary } from './dto/official-doc.dto';
export interface GeneratedDoc extends GeneratedDocMeta {
    storageKey: string;
    buffer: Buffer;
}
export declare class OfficialDocService {
    private readonly folders;
    private readonly prisma;
    private readonly renderer;
    private readonly llm;
    private readonly storageDir;
    private readonly system;
    constructor(folders: FolderService, prisma: PrismaService, renderer: OfficialDocRenderer, llm: ILlmProvider);
    listTemplates(folderId: string, userId: string): Promise<TemplateSummary[]>;
    listGenerated(folderId: string, userId: string): Promise<GeneratedDocMeta[]>;
    generate(folderId: string, userId: string, templateKey: string, askFields?: Record<string, string>): Promise<GeneratedDoc>;
    getFile(folderId: string, docId: string, userId: string): Promise<{
        buffer: Buffer;
        filename: string;
    }>;
    private resolveFields;
    private readField;
    private buildCorps;
    private interpolate;
}

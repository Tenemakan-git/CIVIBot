import type { Response } from 'express';
import { OfficialDocService } from './official-doc.service';
export declare class OfficialDocController {
    private readonly docs;
    constructor(docs: OfficialDocService);
    templates(id: string, user: any): Promise<import("./dto/official-doc.dto").TemplateSummary[]>;
    list(id: string, user: any): Promise<import("./dto/official-doc.dto").GeneratedDocMeta[]>;
    generate(id: string, user: any, body: {
        templateKey: string;
        fields?: Record<string, string>;
    }): Promise<{
        id: string;
        templateKey: string;
        titre: string;
        filename: string;
        bytes: number;
        createdAt: Date;
    }>;
    download(id: string, docId: string, user: any, res: Response): Promise<void>;
}

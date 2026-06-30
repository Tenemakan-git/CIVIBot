import type { Response } from 'express';
import { PdfService } from './pdf.service';
export declare class PdfController {
    private readonly pdf;
    constructor(pdf: PdfService);
    download(id: string, user: any, res: Response): Promise<void>;
}

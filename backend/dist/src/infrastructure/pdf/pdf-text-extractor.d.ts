export declare class PdfTextExtractor {
    private splitter;
    extractText(filePath: string): Promise<string>;
    splitIntoChunks(text: string): Promise<string[]>;
    processDocument(filePath: string): Promise<string[]>;
}

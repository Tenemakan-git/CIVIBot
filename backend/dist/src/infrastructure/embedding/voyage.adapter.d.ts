import { IEmbeddingProvider } from '../../core/ports/embedding.port';
export declare class VoyageAdapter implements IEmbeddingProvider {
    readonly dimensions = 1024;
    private readonly apiKey;
    private readonly model;
    private readonly apiUrl;
    embed(text: string): Promise<number[]>;
    embedBatch(texts: string[]): Promise<number[][]>;
    private request;
}

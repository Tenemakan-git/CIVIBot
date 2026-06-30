export declare const EMBEDDING_PROVIDER: unique symbol;
export interface IEmbeddingProvider {
    readonly dimensions: number;
    embed(text: string): Promise<number[]>;
    embedBatch(texts: string[]): Promise<number[][]>;
}

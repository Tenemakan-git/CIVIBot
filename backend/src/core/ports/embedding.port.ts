/** Token DI du fournisseur d'embeddings (implémenté par VoyageAdapter). */
export const EMBEDDING_PROVIDER = Symbol('EMBEDDING_PROVIDER');

/**
 * Abstraction du fournisseur d'embeddings (Voyage AI, voyage-3, 1024-dim).
 * Utilisée par le KnowledgeAgent (requête) et le KnowledgeManagerAgent
 * (indexation pgvector).
 */
export interface IEmbeddingProvider {
  /** Dimension des vecteurs produits (doit correspondre à vector(N) en base). */
  readonly dimensions: number;
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

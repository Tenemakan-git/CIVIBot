import { Injectable } from '@nestjs/common';
import { IEmbeddingProvider } from '../../core/ports/embedding.port';

/**
 * Adapter du port `IEmbeddingProvider` → Voyage AI (modèle voyage-3, 1024-dim,
 * aligné sur `KnowledgeChunk.embedding vector(1024)`).
 * Reprend la logique de l'ancien `EmbeddingService`.
 */
@Injectable()
export class VoyageAdapter implements IEmbeddingProvider {
  readonly dimensions = 1024;

  private readonly apiKey = process.env.VOYAGE_API_KEY!;
  private readonly model = process.env.VOYAGE_MODEL || 'voyage-3';
  private readonly apiUrl = 'https://api.voyageai.com/v1/embeddings';

  async embed(text: string): Promise<number[]> {
    const [vector] = await this.request([text]);
    return vector;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    return this.request(texts);
  }

  private async request(input: string[]): Promise<number[][]> {
    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, input }),
    });
    if (!res.ok) {
      throw new Error(
        `Voyage AI a répondu ${res.status}: ${await res.text()}`,
      );
    }
    const data = (await res.json()) as { data: { embedding: number[] }[] };
    return data.data.map((d) => d.embedding);
  }
}

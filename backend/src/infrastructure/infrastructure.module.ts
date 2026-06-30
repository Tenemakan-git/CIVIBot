import { Global, Module } from '@nestjs/common';
import { LLM_PROVIDER } from '../core/ports/llm.port';
import { EMBEDDING_PROVIDER } from '../core/ports/embedding.port';
import { WEB_SEARCH_PROVIDER } from '../core/ports/web-search.port';
import { AnthropicAdapter } from './llm/anthropic.adapter';
import { VoyageAdapter } from './embedding/voyage.adapter';
import { WebSearchAdapter } from './web/web-search.adapter';
import { PdfTextExtractor } from './pdf/pdf-text-extractor';
import { PdfRenderer } from './pdf/pdf-renderer';
import { OfficialDocRenderer } from './pdf/official-doc-renderer';

/**
 * Couche infrastructure : branche les implémentations concrètes sur les ports
 * du shared kernel. Global pour que tout agent puisse injecter un port par son
 * token sans connaître l'adapter.
 */
@Global()
@Module({
  providers: [
    { provide: LLM_PROVIDER, useClass: AnthropicAdapter },
    { provide: EMBEDDING_PROVIDER, useClass: VoyageAdapter },
    { provide: WEB_SEARCH_PROVIDER, useClass: WebSearchAdapter },
    PdfTextExtractor,
    PdfRenderer,
    OfficialDocRenderer,
  ],
  exports: [
    LLM_PROVIDER,
    EMBEDDING_PROVIDER,
    WEB_SEARCH_PROVIDER,
    PdfTextExtractor,
    PdfRenderer,
    OfficialDocRenderer,
  ],
})
export class InfrastructureModule {}

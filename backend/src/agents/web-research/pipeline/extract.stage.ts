import { Inject, Injectable } from '@nestjs/common';
import { WEB_SEARCH_PROVIDER } from '../../../core/ports/web-search.port';
import type {
  IWebSearchProvider,
  WebSearchHit,
} from '../../../core/ports/web-search.port';

export interface ExtractedPage {
  organisme: string;
  sourceUrl: string;
  titre: string;
  text: string;
  fetchedAt: string;
}

/** Étape 2 — Extraction du contenu d'une page officielle. */
@Injectable()
export class ExtractStage {
  constructor(
    @Inject(WEB_SEARCH_PROVIDER) private readonly web: IWebSearchProvider,
  ) {}

  async run(hit: WebSearchHit): Promise<ExtractedPage> {
    const page = await this.web.fetchPage(hit.url);
    return {
      organisme: page.organisme || hit.organisme,
      sourceUrl: page.url,
      titre: page.titre || hit.titre,
      text: page.text,
      fetchedAt: page.fetchedAt,
    };
  }
}

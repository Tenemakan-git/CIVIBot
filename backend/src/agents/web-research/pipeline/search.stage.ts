import { Inject, Injectable } from '@nestjs/common';
import { WEB_SEARCH_PROVIDER } from '../../../core/ports/web-search.port';
import type {
  IWebSearchProvider,
  WebSearchHit,
} from '../../../core/ports/web-search.port';

/** Étape 1 — Recherche (restreinte à l'allowlist officielle). */
@Injectable()
export class SearchStage {
  constructor(
    @Inject(WEB_SEARCH_PROVIDER) private readonly web: IWebSearchProvider,
  ) {}

  run(query: string, limit = 5): Promise<WebSearchHit[]> {
    return this.web.search(query, limit);
  }
}

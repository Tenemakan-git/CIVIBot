import type { IWebSearchProvider, WebSearchHit } from '../../../core/ports/web-search.port';
export declare class SearchStage {
    private readonly web;
    constructor(web: IWebSearchProvider);
    run(query: string, limit?: number): Promise<WebSearchHit[]>;
}

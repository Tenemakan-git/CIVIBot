import type { IWebSearchProvider, WebSearchHit } from '../../../core/ports/web-search.port';
export interface ExtractedPage {
    organisme: string;
    sourceUrl: string;
    titre: string;
    text: string;
    fetchedAt: string;
}
export declare class ExtractStage {
    private readonly web;
    constructor(web: IWebSearchProvider);
    run(hit: WebSearchHit): Promise<ExtractedPage>;
}

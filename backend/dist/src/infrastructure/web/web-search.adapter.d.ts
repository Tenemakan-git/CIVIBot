import { IWebSearchProvider, WebPageContent, WebSearchHit } from '../../core/ports/web-search.port';
export declare class WebSearchAdapter implements IWebSearchProvider {
    private readonly logger;
    private readonly claude;
    private readonly searchModel;
    private readonly allowedDomains;
    private readonly organismeByDomain;
    private readonly catalog;
    isAllowed(url: string): boolean;
    search(query: string, limit?: number): Promise<WebSearchHit[]>;
    private claudeWebSearch;
    private catalogSearch;
    private organismeFor;
    fetchPage(url: string): Promise<WebPageContent>;
    private extractTitle;
    private htmlToText;
}

export declare const WEB_SEARCH_PROVIDER: unique symbol;
export interface WebSearchHit {
    url: string;
    organisme: string;
    titre: string;
    snippet?: string;
}
export interface WebPageContent {
    url: string;
    organisme: string;
    titre: string;
    html: string;
    text: string;
    fetchedAt: string;
}
export interface IWebSearchProvider {
    search(query: string, limit?: number): Promise<WebSearchHit[]>;
    fetchPage(url: string): Promise<WebPageContent>;
    isAllowed(url: string): boolean;
}

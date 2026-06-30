/** Token DI du fournisseur de recherche web (implémenté par WebSearchAdapter). */
export const WEB_SEARCH_PROVIDER = Symbol('WEB_SEARCH_PROVIDER');

export interface WebSearchHit {
  url: string;
  /** Organisme officiel rattaché au domaine (CEPICI, ministère…). */
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

/**
 * Recherche web STRICTEMENT restreinte à une allowlist de domaines officiels.
 * Toute URL hors allowlist est rejetée (`isAllowed` => false, `fetchPage` lève).
 */
export interface IWebSearchProvider {
  search(query: string, limit?: number): Promise<WebSearchHit[]>;
  fetchPage(url: string): Promise<WebPageContent>;
  isAllowed(url: string): boolean;
}

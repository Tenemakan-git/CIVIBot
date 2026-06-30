import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import {
  IWebSearchProvider,
  WebPageContent,
  WebSearchHit,
} from '../../core/ports/web-search.port';

/** Source officielle curée (entrée de la stratégie « scraping allowlist »). */
interface OfficialSource {
  url: string;
  organisme: string;
  titre: string;
  keywords: string[];
}

/**
 * Adapter du port `IWebSearchProvider` (stratégie validée : scraping d'une
 * ALLOWLIST de domaines officiels ivoiriens).
 *
 * - `isAllowed` / `fetchPage` : seules les URLs dont l'hôte appartient à un
 *   domaine officiel sont récupérables ; tout le reste est rejeté.
 * - `search` : moteur de recherche RÉEL via l'outil natif `web_search` de
 *   Claude, restreint à l'allowlist officielle (`allowed_domains`). En cas
 *   d'indisponibilité, repli sur un catalogue curé filtré par mots-clés.
 */
@Injectable()
export class WebSearchAdapter implements IWebSearchProvider {
  private readonly logger = new Logger(WebSearchAdapter.name);

  /** Client Anthropic dédié à la recherche web (outil serveur `web_search`). */
  private readonly claude = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  /** Modèle supportant `web_search_20260209` (Sonnet 4.6 par défaut, moins coûteux). */
  private readonly searchModel =
    process.env.ANTHROPIC_SEARCH_MODEL || 'claude-sonnet-4-6';

  /** Domaines officiels autorisés (suffixes d'hôte). */
  private readonly allowedDomains = [
    'cepici.ci',
    'gouv.ci',
    'service-public.ci',
    'interieur.gouv.ci',
    'justice.gouv.ci',
    'finances.gouv.ci',
    'dgi.gouv.ci',
  ];

  /** Libellé d'organisme par domaine officiel (pour la traçabilité des sources). */
  private readonly organismeByDomain: Record<string, string> = {
    'cepici.ci': 'CEPICI',
    'cepici.gouv.ci': 'CEPICI',
    'service-public.ci': 'Service Public CI',
    'servicepublic.gouv.ci': 'Service Public CI',
    'dgi.gouv.ci': 'DGI',
    'interieur.gouv.ci': "Ministère de l'Intérieur",
    'justice.gouv.ci': 'Ministère de la Justice',
    'finances.gouv.ci': 'Ministère des Finances',
    'gouv.ci': "Gouvernement de Côte d'Ivoire",
  };

  /** Catalogue curé de points d'entrée officiels. */
  private readonly catalog: OfficialSource[] = [
    {
      url: 'https://www.cepici.ci/creation-entreprise',
      organisme: 'CEPICI',
      titre: "Création d'entreprise en Côte d'Ivoire",
      keywords: ['entreprise', 'creation', 'societe', 'cepici', 'guichet'],
    },
    {
      url: 'https://www.service-public.ci/etat-civil',
      organisme: 'Service Public CI',
      titre: "Démarches d'état civil",
      keywords: ['etat civil', 'naissance', 'acte', 'mariage', 'deces'],
    },
  ];

  isAllowed(url: string): boolean {
    try {
      const host = new URL(url).hostname.toLowerCase();
      return this.allowedDomains.some(
        (d) => host === d || host.endsWith(`.${d}`),
      );
    } catch {
      return false;
    }
  }

  async search(query: string, limit = 5): Promise<WebSearchHit[]> {
    // 1) Moteur réel : recherche web native de Claude, bridée à l'allowlist.
    try {
      const hits = await this.claudeWebSearch(query, limit);
      if (hits.length > 0) return hits;
      this.logger.debug('web_search sans résultat → repli catalogue');
    } catch (err) {
      this.logger.warn(
        `Recherche web Claude indisponible (${(err as Error).message}) → repli catalogue`,
      );
    }
    // 2) Repli : catalogue curé filtré par mots-clés.
    return this.catalogSearch(query, limit);
  }

  /**
   * Recherche via l'outil serveur `web_search_20260209`, dont le filtrage
   * dynamique est restreint aux domaines officiels (`allowed_domains`). On lit
   * directement les blocs `web_search_tool_result` pour récupérer les hits
   * structurés (url + titre), sans dépendre du texte de synthèse du modèle.
   */
  private async claudeWebSearch(
    query: string,
    limit: number,
  ): Promise<WebSearchHit[]> {
    const res = await this.claude.messages.create({
      model: this.searchModel,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Recherche les pages officielles ivoiriennes les plus pertinentes pour la démarche suivante : ${query}`,
        },
      ],
      tools: [
        {
          type: 'web_search_20260209',
          name: 'web_search',
          allowed_domains: this.allowedDomains,
          max_uses: 3,
        },
      ],
    });

    const hits: WebSearchHit[] = [];
    const seen = new Set<string>();

    for (const block of res.content) {
      if (block.type !== 'web_search_tool_result') continue;
      const content = block.content;
      if (!Array.isArray(content)) {
        // Bloc d'erreur (ex: max_uses_exceeded) — pas un tableau de résultats.
        this.logger.warn(`web_search en erreur: ${content.error_code}`);
        continue;
      }
      for (const r of content) {
        if (r.type !== 'web_search_result') continue;
        // Défense en profondeur : on re-valide l'hôte côté allowlist.
        if (!this.isAllowed(r.url) || seen.has(r.url)) continue;
        seen.add(r.url);
        hits.push({
          url: r.url,
          organisme: this.organismeFor(r.url),
          titre: r.title || r.url,
        });
        if (hits.length >= limit) return hits;
      }
    }
    return hits;
  }

  private catalogSearch(query: string, limit: number): WebSearchHit[] {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);

    const scored = this.catalog
      .map((s) => ({
        source: s,
        score: s.keywords.reduce(
          (acc, kw) =>
            acc + (tokens.some((t) => kw.includes(t) || t.includes(kw)) ? 1 : 0),
          0,
        ),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored.map(({ source }) => ({
      url: source.url,
      organisme: source.organisme,
      titre: source.titre,
    }));
  }

  /** Déduit l'organisme officiel à partir de l'hôte de l'URL. */
  private organismeFor(url: string): string {
    try {
      const host = new URL(url).hostname.toLowerCase();
      // Le domaine le plus spécifique d'abord (ex: dgi.gouv.ci avant gouv.ci).
      const match = Object.keys(this.organismeByDomain)
        .sort((a, b) => b.length - a.length)
        .find((d) => host === d || host.endsWith(`.${d}`));
      return match ? this.organismeByDomain[match] : host;
    } catch {
      return url;
    }
  }

  async fetchPage(url: string): Promise<WebPageContent> {
    if (!this.isAllowed(url)) {
      throw new Error(`URL hors allowlist officielle, refusée: ${url}`);
    }
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CiviBot/2.0 (+research; sources officielles)' },
    });
    if (!res.ok) {
      throw new Error(`Échec récupération ${url}: HTTP ${res.status}`);
    }
    const html = await res.text();
    const known = this.catalog.find((s) => s.url === url);

    return {
      url,
      organisme: known?.organisme ?? new URL(url).hostname,
      titre: known?.titre ?? this.extractTitle(html) ?? url,
      html,
      text: this.htmlToText(html),
      fetchedAt: new Date().toISOString(),
    };
  }

  private extractTitle(html: string): string | undefined {
    const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return m?.[1]?.trim();
  }

  /**
   * Conversion HTML -> texte volontairement minimaliste (pas de dépendance).
   * Le nettoyage fin (boilerplate, dédup) est la responsabilité du pipeline
   * d'ingestion du Web Research Agent (étape ultérieure).
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WebSearchAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSearchAdapter = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
let WebSearchAdapter = WebSearchAdapter_1 = class WebSearchAdapter {
    logger = new common_1.Logger(WebSearchAdapter_1.name);
    claude = new sdk_1.default({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });
    searchModel = process.env.ANTHROPIC_SEARCH_MODEL || 'claude-sonnet-4-6';
    allowedDomains = [
        'cepici.ci',
        'gouv.ci',
        'service-public.ci',
        'interieur.gouv.ci',
        'justice.gouv.ci',
        'finances.gouv.ci',
        'dgi.gouv.ci',
    ];
    organismeByDomain = {
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
    catalog = [
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
    isAllowed(url) {
        try {
            const host = new URL(url).hostname.toLowerCase();
            return this.allowedDomains.some((d) => host === d || host.endsWith(`.${d}`));
        }
        catch {
            return false;
        }
    }
    async search(query, limit = 5) {
        try {
            const hits = await this.claudeWebSearch(query, limit);
            if (hits.length > 0)
                return hits;
            this.logger.debug('web_search sans résultat → repli catalogue');
        }
        catch (err) {
            this.logger.warn(`Recherche web Claude indisponible (${err.message}) → repli catalogue`);
        }
        return this.catalogSearch(query, limit);
    }
    async claudeWebSearch(query, limit) {
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
        const hits = [];
        const seen = new Set();
        for (const block of res.content) {
            if (block.type !== 'web_search_tool_result')
                continue;
            const content = block.content;
            if (!Array.isArray(content)) {
                this.logger.warn(`web_search en erreur: ${content.error_code}`);
                continue;
            }
            for (const r of content) {
                if (r.type !== 'web_search_result')
                    continue;
                if (!this.isAllowed(r.url) || seen.has(r.url))
                    continue;
                seen.add(r.url);
                hits.push({
                    url: r.url,
                    organisme: this.organismeFor(r.url),
                    titre: r.title || r.url,
                });
                if (hits.length >= limit)
                    return hits;
            }
        }
        return hits;
    }
    catalogSearch(query, limit) {
        const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
        const scored = this.catalog
            .map((s) => ({
            source: s,
            score: s.keywords.reduce((acc, kw) => acc + (tokens.some((t) => kw.includes(t) || t.includes(kw)) ? 1 : 0), 0),
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
    organismeFor(url) {
        try {
            const host = new URL(url).hostname.toLowerCase();
            const match = Object.keys(this.organismeByDomain)
                .sort((a, b) => b.length - a.length)
                .find((d) => host === d || host.endsWith(`.${d}`));
            return match ? this.organismeByDomain[match] : host;
        }
        catch {
            return url;
        }
    }
    async fetchPage(url) {
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
    extractTitle(html) {
        const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        return m?.[1]?.trim();
    }
    htmlToText(html) {
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
};
exports.WebSearchAdapter = WebSearchAdapter;
exports.WebSearchAdapter = WebSearchAdapter = WebSearchAdapter_1 = __decorate([
    (0, common_1.Injectable)()
], WebSearchAdapter);
//# sourceMappingURL=web-search.adapter.js.map
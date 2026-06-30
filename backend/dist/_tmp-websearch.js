"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const web_search_adapter_1 = require("./src/infrastructure/web/web-search.adapter");
(async () => {
    const a = new web_search_adapter_1.WebSearchAdapter();
    const q = "Comment créer une SARL au CEPICI en Côte d'Ivoire ?";
    const t0 = Date.now();
    const hits = await a.search(q, 4);
    console.log(`\n[${q}] → ${hits.length} hits en ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    for (const h of hits)
        console.log(`  - ${h.organisme} | ${h.titre}\n    ${h.url}  (allowlist=${a.isAllowed(h.url)})`);
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
//# sourceMappingURL=_tmp-websearch.js.map
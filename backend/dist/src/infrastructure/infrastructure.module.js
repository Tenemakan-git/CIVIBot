"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfrastructureModule = void 0;
const common_1 = require("@nestjs/common");
const llm_port_1 = require("../core/ports/llm.port");
const embedding_port_1 = require("../core/ports/embedding.port");
const web_search_port_1 = require("../core/ports/web-search.port");
const anthropic_adapter_1 = require("./llm/anthropic.adapter");
const voyage_adapter_1 = require("./embedding/voyage.adapter");
const web_search_adapter_1 = require("./web/web-search.adapter");
const pdf_text_extractor_1 = require("./pdf/pdf-text-extractor");
const pdf_renderer_1 = require("./pdf/pdf-renderer");
const official_doc_renderer_1 = require("./pdf/official-doc-renderer");
let InfrastructureModule = class InfrastructureModule {
};
exports.InfrastructureModule = InfrastructureModule;
exports.InfrastructureModule = InfrastructureModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            { provide: llm_port_1.LLM_PROVIDER, useClass: anthropic_adapter_1.AnthropicAdapter },
            { provide: embedding_port_1.EMBEDDING_PROVIDER, useClass: voyage_adapter_1.VoyageAdapter },
            { provide: web_search_port_1.WEB_SEARCH_PROVIDER, useClass: web_search_adapter_1.WebSearchAdapter },
            pdf_text_extractor_1.PdfTextExtractor,
            pdf_renderer_1.PdfRenderer,
            official_doc_renderer_1.OfficialDocRenderer,
        ],
        exports: [
            llm_port_1.LLM_PROVIDER,
            embedding_port_1.EMBEDDING_PROVIDER,
            web_search_port_1.WEB_SEARCH_PROVIDER,
            pdf_text_extractor_1.PdfTextExtractor,
            pdf_renderer_1.PdfRenderer,
            official_doc_renderer_1.OfficialDocRenderer,
        ],
    })
], InfrastructureModule);
//# sourceMappingURL=infrastructure.module.js.map
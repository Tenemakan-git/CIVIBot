"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeAgent = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const base_agent_abstract_1 = require("../../core/agent/base-agent.abstract");
const event_names_1 = require("../../core/events/event-names");
const prisma_service_1 = require("../../prisma/prisma.service");
const knowledge_search_service_1 = require("./knowledge-search.service");
const DEFAULT_TOP_K = 5;
const DEFAULT_THRESHOLD = 0.45;
let KnowledgeAgent = class KnowledgeAgent extends base_agent_abstract_1.BaseAgent {
    search;
    prisma;
    events;
    name = agent_name_enum_1.AgentName.Knowledge;
    constructor(search, prisma, events) {
        super();
        this.search = search;
        this.prisma = prisma;
        this.events = events;
    }
    async run(ctx) {
        const { topK, threshold } = await this.tuning();
        const chunks = await this.search.search(ctx.userMessage, topK);
        const best = chunks[0]?.score ?? 0;
        const sufficient = chunks.length > 0 && best >= threshold;
        const data = {
            context: this.buildContext(chunks),
            chunks,
            sufficient,
        };
        const alreadyEnriched = ctx.metadata['webResearchDone'] === true;
        if (!sufficient && !alreadyEnriched) {
            this.events.emit(event_names_1.Events.Knowledge.InsufficientLocal, {
                folderId: ctx.folderId,
                query: ctx.userMessage,
                bestScore: best,
            });
            return {
                data,
                status: 'needs_followup',
                confidence: best,
                followups: [agent_name_enum_1.AgentName.WebResearch],
                sources: this.toSources(chunks),
            };
        }
        return {
            data,
            confidence: best,
            sources: this.toSources(chunks),
        };
    }
    async tuning() {
        const settings = await this.prisma.aiSettings.findFirst();
        return {
            topK: settings?.topK ?? DEFAULT_TOP_K,
            threshold: settings?.seuilSimilarite ?? DEFAULT_THRESHOLD,
        };
    }
    buildContext(chunks) {
        if (chunks.length === 0)
            return '';
        return chunks
            .map((c, i) => `[Source ${i + 1} — ${c.titre}]\n${c.texte}`)
            .join('\n\n---\n\n');
    }
    toSources(chunks) {
        const seen = new Set();
        const sources = [];
        for (const c of chunks) {
            if (seen.has(c.titre))
                continue;
            seen.add(c.titre);
            sources.push({ organisme: c.titre, titre: c.titre });
        }
        return sources;
    }
};
exports.KnowledgeAgent = KnowledgeAgent;
exports.KnowledgeAgent = KnowledgeAgent = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [knowledge_search_service_1.KnowledgeSearchService,
        prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], KnowledgeAgent);
//# sourceMappingURL=knowledge.agent.js.map
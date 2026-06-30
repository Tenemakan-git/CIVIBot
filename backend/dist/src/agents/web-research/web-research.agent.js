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
exports.WebResearchAgent = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const base_agent_abstract_1 = require("../../core/agent/base-agent.abstract");
const event_names_1 = require("../../core/events/event-names");
const ingestion_pipeline_1 = require("./pipeline/ingestion-pipeline");
let WebResearchAgent = class WebResearchAgent extends base_agent_abstract_1.BaseAgent {
    pipeline;
    events;
    name = agent_name_enum_1.AgentName.WebResearch;
    constructor(pipeline, events) {
        super();
        this.pipeline = pipeline;
        this.events = events;
    }
    async run(ctx) {
        ctx.metadata['webResearchDone'] = true;
        const candidates = await this.pipeline.run(ctx.userMessage);
        if (candidates.length > 0) {
            this.events.emit(event_names_1.Events.Knowledge.CandidatesReady, {
                folderId: ctx.folderId,
                count: candidates.length,
            });
        }
        const sources = candidates.map((c) => ({
            organisme: c.organisme,
            url: c.sourceUrl,
            titre: c.titre,
        }));
        return {
            data: { candidates },
            confidence: candidates.length > 0 ? 0.7 : 0.2,
            status: candidates.length > 0 ? 'success' : 'partial',
            followups: candidates.length > 0 ? [agent_name_enum_1.AgentName.KnowledgeValidation] : [],
            sources,
        };
    }
};
exports.WebResearchAgent = WebResearchAgent;
exports.WebResearchAgent = WebResearchAgent = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ingestion_pipeline_1.IngestionPipeline,
        event_emitter_1.EventEmitter2])
], WebResearchAgent);
//# sourceMappingURL=web-research.agent.js.map
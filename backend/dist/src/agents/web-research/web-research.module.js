"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebResearchAgentModule = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const web_research_agent_1 = require("./web-research.agent");
const ingestion_pipeline_1 = require("./pipeline/ingestion-pipeline");
const search_stage_1 = require("./pipeline/search.stage");
const extract_stage_1 = require("./pipeline/extract.stage");
const clean_stage_1 = require("./pipeline/clean.stage");
const dedup_stage_1 = require("./pipeline/dedup.stage");
let WebResearchAgentModule = class WebResearchAgentModule {
};
exports.WebResearchAgentModule = WebResearchAgentModule;
exports.WebResearchAgentModule = WebResearchAgentModule = __decorate([
    (0, common_1.Module)({
        providers: [
            search_stage_1.SearchStage,
            extract_stage_1.ExtractStage,
            clean_stage_1.CleanStage,
            dedup_stage_1.DedupStage,
            ingestion_pipeline_1.IngestionPipeline,
            web_research_agent_1.WebResearchAgent,
            { provide: (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.WebResearch), useExisting: web_research_agent_1.WebResearchAgent },
        ],
        exports: [web_research_agent_1.WebResearchAgent, (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.WebResearch)],
    })
], WebResearchAgentModule);
//# sourceMappingURL=web-research.module.js.map
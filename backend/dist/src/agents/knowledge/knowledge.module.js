"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeAgentModule = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const knowledge_agent_1 = require("./knowledge.agent");
const knowledge_search_service_1 = require("./knowledge-search.service");
let KnowledgeAgentModule = class KnowledgeAgentModule {
};
exports.KnowledgeAgentModule = KnowledgeAgentModule;
exports.KnowledgeAgentModule = KnowledgeAgentModule = __decorate([
    (0, common_1.Module)({
        providers: [
            knowledge_search_service_1.KnowledgeSearchService,
            knowledge_agent_1.KnowledgeAgent,
            { provide: (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.Knowledge), useExisting: knowledge_agent_1.KnowledgeAgent },
        ],
        exports: [knowledge_agent_1.KnowledgeAgent, (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.Knowledge)],
    })
], KnowledgeAgentModule);
//# sourceMappingURL=knowledge.module.js.map
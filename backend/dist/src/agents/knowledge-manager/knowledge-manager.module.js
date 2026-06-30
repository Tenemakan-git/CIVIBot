"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeManagerAgentModule = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const knowledge_manager_agent_1 = require("./knowledge-manager.agent");
let KnowledgeManagerAgentModule = class KnowledgeManagerAgentModule {
};
exports.KnowledgeManagerAgentModule = KnowledgeManagerAgentModule;
exports.KnowledgeManagerAgentModule = KnowledgeManagerAgentModule = __decorate([
    (0, common_1.Module)({
        providers: [
            knowledge_manager_agent_1.KnowledgeManagerAgent,
            {
                provide: (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.KnowledgeManager),
                useExisting: knowledge_manager_agent_1.KnowledgeManagerAgent,
            },
        ],
        exports: [knowledge_manager_agent_1.KnowledgeManagerAgent, (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.KnowledgeManager)],
    })
], KnowledgeManagerAgentModule);
//# sourceMappingURL=knowledge-manager.module.js.map
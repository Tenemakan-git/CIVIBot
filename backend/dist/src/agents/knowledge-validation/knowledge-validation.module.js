"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeValidationAgentModule = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const knowledge_validation_agent_1 = require("./knowledge-validation.agent");
let KnowledgeValidationAgentModule = class KnowledgeValidationAgentModule {
};
exports.KnowledgeValidationAgentModule = KnowledgeValidationAgentModule;
exports.KnowledgeValidationAgentModule = KnowledgeValidationAgentModule = __decorate([
    (0, common_1.Module)({
        providers: [
            knowledge_validation_agent_1.KnowledgeValidationAgent,
            {
                provide: (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.KnowledgeValidation),
                useExisting: knowledge_validation_agent_1.KnowledgeValidationAgent,
            },
        ],
        exports: [knowledge_validation_agent_1.KnowledgeValidationAgent, (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.KnowledgeValidation)],
    })
], KnowledgeValidationAgentModule);
//# sourceMappingURL=knowledge-validation.module.js.map
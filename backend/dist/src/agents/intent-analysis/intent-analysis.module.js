"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentAnalysisAgentModule = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const intent_analysis_agent_1 = require("./intent-analysis.agent");
let IntentAnalysisAgentModule = class IntentAnalysisAgentModule {
};
exports.IntentAnalysisAgentModule = IntentAnalysisAgentModule;
exports.IntentAnalysisAgentModule = IntentAnalysisAgentModule = __decorate([
    (0, common_1.Module)({
        providers: [
            intent_analysis_agent_1.IntentAnalysisAgent,
            { provide: (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.IntentAnalysis), useExisting: intent_analysis_agent_1.IntentAnalysisAgent },
        ],
        exports: [intent_analysis_agent_1.IntentAnalysisAgent, (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.IntentAnalysis)],
    })
], IntentAnalysisAgentModule);
//# sourceMappingURL=intent-analysis.module.js.map
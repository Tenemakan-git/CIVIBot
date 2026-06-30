"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityAgentModule = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const quality_agent_1 = require("./quality.agent");
let QualityAgentModule = class QualityAgentModule {
};
exports.QualityAgentModule = QualityAgentModule;
exports.QualityAgentModule = QualityAgentModule = __decorate([
    (0, common_1.Module)({
        providers: [
            quality_agent_1.QualityAgent,
            { provide: (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.Quality), useExisting: quality_agent_1.QualityAgent },
        ],
        exports: [quality_agent_1.QualityAgent, (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.Quality)],
    })
], QualityAgentModule);
//# sourceMappingURL=quality.module.js.map
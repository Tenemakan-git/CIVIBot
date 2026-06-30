"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistAgentModule = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const checklist_agent_1 = require("./checklist.agent");
let ChecklistAgentModule = class ChecklistAgentModule {
};
exports.ChecklistAgentModule = ChecklistAgentModule;
exports.ChecklistAgentModule = ChecklistAgentModule = __decorate([
    (0, common_1.Module)({
        providers: [
            checklist_agent_1.ChecklistAgent,
            { provide: (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.Checklist), useExisting: checklist_agent_1.ChecklistAgent },
        ],
        exports: [checklist_agent_1.ChecklistAgent, (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.Checklist)],
    })
], ChecklistAgentModule);
//# sourceMappingURL=checklist.module.js.map
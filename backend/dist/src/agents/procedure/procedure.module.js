"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcedureAgentModule = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const procedure_agent_1 = require("./procedure.agent");
let ProcedureAgentModule = class ProcedureAgentModule {
};
exports.ProcedureAgentModule = ProcedureAgentModule;
exports.ProcedureAgentModule = ProcedureAgentModule = __decorate([
    (0, common_1.Module)({
        providers: [
            procedure_agent_1.ProcedureAgent,
            { provide: (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.Procedure), useExisting: procedure_agent_1.ProcedureAgent },
        ],
        exports: [procedure_agent_1.ProcedureAgent, (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.Procedure)],
    })
], ProcedureAgentModule);
//# sourceMappingURL=procedure.module.js.map
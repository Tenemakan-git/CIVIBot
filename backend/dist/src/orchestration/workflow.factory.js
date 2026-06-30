"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowFactory = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../core/agent/agent-name.enum");
const execution_plan_1 = require("./execution-plan");
let WorkflowFactory = class WorkflowFactory {
    basePipeline = [
        agent_name_enum_1.AgentName.Knowledge,
        agent_name_enum_1.AgentName.Planning,
        agent_name_enum_1.AgentName.Procedure,
        agent_name_enum_1.AgentName.Checklist,
        agent_name_enum_1.AgentName.Document,
        agent_name_enum_1.AgentName.OfficialDocument,
        agent_name_enum_1.AgentName.Orientation,
        agent_name_enum_1.AgentName.Folder,
        agent_name_enum_1.AgentName.Verification,
        agent_name_enum_1.AgentName.Quality,
    ];
    build(intent) {
        void intent;
        return new execution_plan_1.ExecutionPlan([...this.basePipeline]);
    }
};
exports.WorkflowFactory = WorkflowFactory;
exports.WorkflowFactory = WorkflowFactory = __decorate([
    (0, common_1.Injectable)()
], WorkflowFactory);
//# sourceMappingURL=workflow.factory.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestrationModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const folder_module_1 = require("../folders/folder.module");
const agent_registry_1 = require("./agent-registry");
const workflow_factory_1 = require("./workflow.factory");
const orchestrator_service_1 = require("./orchestrator.service");
let OrchestrationModule = class OrchestrationModule {
};
exports.OrchestrationModule = OrchestrationModule;
exports.OrchestrationModule = OrchestrationModule = __decorate([
    (0, common_1.Module)({
        imports: [core_1.DiscoveryModule, folder_module_1.FolderModule],
        providers: [agent_registry_1.AgentRegistry, workflow_factory_1.WorkflowFactory, orchestrator_service_1.OrchestratorService],
        exports: [orchestrator_service_1.OrchestratorService],
    })
], OrchestrationModule);
//# sourceMappingURL=orchestration.module.js.map
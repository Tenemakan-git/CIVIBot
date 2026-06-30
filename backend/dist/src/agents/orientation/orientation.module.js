"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrientationAgentModule = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const service_directory_module_1 = require("../../services-directory/service-directory.module");
const orientation_agent_1 = require("./orientation.agent");
let OrientationAgentModule = class OrientationAgentModule {
};
exports.OrientationAgentModule = OrientationAgentModule;
exports.OrientationAgentModule = OrientationAgentModule = __decorate([
    (0, common_1.Module)({
        imports: [service_directory_module_1.ServiceDirectoryModule],
        providers: [
            orientation_agent_1.OrientationAgent,
            { provide: (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.Orientation), useExisting: orientation_agent_1.OrientationAgent },
        ],
        exports: [orientation_agent_1.OrientationAgent, (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.Orientation)],
    })
], OrientationAgentModule);
//# sourceMappingURL=orientation.module.js.map
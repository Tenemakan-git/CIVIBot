"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderAgentModule = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const folder_module_1 = require("../../folders/folder.module");
const folder_agent_1 = require("./folder.agent");
let FolderAgentModule = class FolderAgentModule {
};
exports.FolderAgentModule = FolderAgentModule;
exports.FolderAgentModule = FolderAgentModule = __decorate([
    (0, common_1.Module)({
        imports: [folder_module_1.FolderModule],
        providers: [
            folder_agent_1.FolderAgent,
            { provide: (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.Folder), useExisting: folder_agent_1.FolderAgent },
        ],
        exports: [folder_agent_1.FolderAgent, (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.Folder)],
    })
], FolderAgentModule);
//# sourceMappingURL=folder.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfAgentModule = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const folder_module_1 = require("../../folders/folder.module");
const pdf_service_1 = require("./pdf.service");
const pdf_agent_1 = require("./pdf.agent");
const pdf_controller_1 = require("./pdf.controller");
let PdfAgentModule = class PdfAgentModule {
};
exports.PdfAgentModule = PdfAgentModule;
exports.PdfAgentModule = PdfAgentModule = __decorate([
    (0, common_1.Module)({
        imports: [folder_module_1.FolderModule],
        controllers: [pdf_controller_1.PdfController],
        providers: [
            pdf_service_1.PdfService,
            pdf_agent_1.PdfAgent,
            { provide: (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.Pdf), useExisting: pdf_agent_1.PdfAgent },
        ],
        exports: [pdf_agent_1.PdfAgent, pdf_service_1.PdfService, (0, agent_name_enum_1.agentToken)(agent_name_enum_1.AgentName.Pdf)],
    })
], PdfAgentModule);
//# sourceMappingURL=pdf.module.js.map
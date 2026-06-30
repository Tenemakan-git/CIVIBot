"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfAgent = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const agent_context_1 = require("../../core/agent/agent-context");
const base_agent_abstract_1 = require("../../core/agent/base-agent.abstract");
const pdf_service_1 = require("./pdf.service");
let PdfAgent = class PdfAgent extends base_agent_abstract_1.BaseAgent {
    pdf;
    name = agent_name_enum_1.AgentName.Pdf;
    constructor(pdf) {
        super();
        this.pdf = pdf;
    }
    async run(ctx) {
        const proc = (0, agent_context_1.readOutput)(ctx, agent_name_enum_1.AgentName.Procedure);
        const tips = Array.isArray(proc?.data?.tips) ? proc.data.tips : [];
        const rendered = await this.pdf.generate(ctx.folderId, ctx.userId, tips);
        return {
            data: {
                storageKey: rendered.storageKey,
                filename: rendered.filename,
                bytes: rendered.bytes,
            },
            confidence: 1,
        };
    }
};
exports.PdfAgent = PdfAgent;
exports.PdfAgent = PdfAgent = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pdf_service_1.PdfService])
], PdfAgent);
//# sourceMappingURL=pdf.agent.js.map
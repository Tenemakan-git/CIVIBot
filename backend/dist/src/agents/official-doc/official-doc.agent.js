"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfficialDocAgent = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const base_agent_abstract_1 = require("../../core/agent/base-agent.abstract");
const document_templates_1 = require("./templates/document-templates");
let OfficialDocAgent = class OfficialDocAgent extends base_agent_abstract_1.BaseAgent {
    name = agent_name_enum_1.AgentName.OfficialDocument;
    run(ctx) {
        const domaine = ctx.intent?.domain;
        const templates = domaine
            ? (0, document_templates_1.templatesForDomaine)(domaine, ctx.intent?.procedure)
            : [];
        return Promise.resolve({
            data: {
                availableTemplates: templates.map((t) => ({
                    key: t.key,
                    titre: t.titre,
                    description: t.description,
                })),
            },
            confidence: 1,
            status: 'success',
        });
    }
};
exports.OfficialDocAgent = OfficialDocAgent;
exports.OfficialDocAgent = OfficialDocAgent = __decorate([
    (0, common_1.Injectable)()
], OfficialDocAgent);
//# sourceMappingURL=official-doc.agent.js.map
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcedureAgent = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const base_agent_abstract_1 = require("../../core/agent/base-agent.abstract");
const context_helpers_1 = require("../../core/agent/context-helpers");
const llm_port_1 = require("../../core/ports/llm.port");
let ProcedureAgent = class ProcedureAgent extends base_agent_abstract_1.BaseAgent {
    llm;
    name = agent_name_enum_1.AgentName.Procedure;
    system = [
        "Tu es l'agent de procédure de CiviBot (Côte d'Ivoire).",
        'Construis la procédure personnalisée. Renvoie UNIQUEMENT un JSON:',
        '{',
        '  "titre": string,',
        '  "steps": [{ "ordre": number, "titre": string, "description": string }],',
        '  "requiredDocuments": [{ "nom": string, "obligatoire": boolean, "remarque": string }],',
        '  "constraints": string[],',
        '  "tips": string[]',
        '}',
        "Appuie-toi sur le contexte officiel fourni. N'invente pas de documents.",
    ].join('\n');
    constructor(llm) {
        super();
        this.llm = llm;
    }
    async run(ctx) {
        const raw = await this.llm.completeJson({
            tier: 'generation',
            system: this.system,
            messages: [
                {
                    role: 'user',
                    content: `${(0, context_helpers_1.intentSummary)(ctx)}\n\nContexte:\n${(0, context_helpers_1.knowledgeContext)(ctx) || '(aucun)'}`,
                },
            ],
        });
        const steps = Array.isArray(raw.steps)
            ? raw.steps.map((s, i) => ({
                ordre: typeof s?.ordre === 'number' ? s.ordre : i + 1,
                titre: String(s?.titre ?? `Étape ${i + 1}`),
                description: String(s?.description ?? ''),
            }))
            : [];
        const requiredDocuments = Array.isArray(raw.requiredDocuments)
            ? raw.requiredDocuments
                .filter((d) => d && typeof d.nom === 'string')
                .map((d) => ({
                nom: d.nom,
                obligatoire: d.obligatoire !== false,
                remarque: typeof d.remarque === 'string' ? d.remarque : undefined,
            }))
            : [];
        return {
            data: {
                titre: typeof raw.titre === 'string' ? raw.titre : ctx.intent?.intent ?? 'Procédure',
                steps,
                requiredDocuments,
                constraints: this.strings(raw.constraints),
                tips: this.strings(raw.tips),
            },
            confidence: steps.length > 0 ? 0.85 : 0.4,
            status: steps.length > 0 ? 'success' : 'partial',
        };
    }
    strings(v) {
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }
};
exports.ProcedureAgent = ProcedureAgent;
exports.ProcedureAgent = ProcedureAgent = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(llm_port_1.LLM_PROVIDER)),
    __metadata("design:paramtypes", [Object])
], ProcedureAgent);
//# sourceMappingURL=procedure.agent.js.map
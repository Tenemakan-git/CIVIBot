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
exports.DocumentAgent = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const agent_context_1 = require("../../core/agent/agent-context");
const base_agent_abstract_1 = require("../../core/agent/base-agent.abstract");
const context_helpers_1 = require("../../core/agent/context-helpers");
const llm_port_1 = require("../../core/ports/llm.port");
let DocumentAgent = class DocumentAgent extends base_agent_abstract_1.BaseAgent {
    llm;
    name = agent_name_enum_1.AgentName.Document;
    system = [
        "Tu es l'agent documentaire de CiviBot (Côte d'Ivoire).",
        'Construis le dossier documentaire de la démarche. Renvoie UNIQUEMENT un JSON:',
        '{',
        '  "resume": string,',
        '  "documents": [{ "nom": string, "statut": "manquant" }],',
        '  "piecesNecessaires": string[]',
        '}',
        'Pas de texte hors JSON.',
    ].join('\n');
    constructor(llm) {
        super();
        this.llm = llm;
    }
    async run(ctx) {
        const proc = (0, agent_context_1.readOutput)(ctx, agent_name_enum_1.AgentName.Procedure);
        const knownDocs = (proc?.data?.requiredDocuments ?? [])
            .map((d) => d.nom)
            .filter(Boolean);
        const raw = await this.llm.completeJson({
            tier: 'generation',
            system: this.system,
            messages: [
                {
                    role: 'user',
                    content: [
                        (0, context_helpers_1.intentSummary)(ctx),
                        knownDocs.length
                            ? `Documents déjà identifiés: ${knownDocs.join(', ')}`
                            : null,
                        `Contexte:\n${(0, context_helpers_1.knowledgeContext)(ctx) || '(aucun)'}`,
                    ]
                        .filter(Boolean)
                        .join('\n\n'),
                },
            ],
        });
        let documents = Array.isArray(raw.documents)
            ? raw.documents
                .filter((d) => d && typeof d.nom === 'string')
                .map((d) => ({
                nom: d.nom,
                statut: d.statut === 'fourni' ? 'fourni' : 'manquant',
            }))
            : [];
        if (documents.length === 0 && knownDocs.length > 0) {
            documents = knownDocs.map((nom) => ({ nom, statut: 'manquant' }));
        }
        return {
            data: {
                resume: typeof raw.resume === 'string' ? raw.resume : '',
                documents,
                piecesNecessaires: Array.isArray(raw.piecesNecessaires)
                    ? raw.piecesNecessaires.filter((p) => typeof p === 'string')
                    : [],
            },
            confidence: documents.length > 0 ? 0.85 : 0.5,
        };
    }
};
exports.DocumentAgent = DocumentAgent;
exports.DocumentAgent = DocumentAgent = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(llm_port_1.LLM_PROVIDER)),
    __metadata("design:paramtypes", [Object])
], DocumentAgent);
//# sourceMappingURL=document.agent.js.map
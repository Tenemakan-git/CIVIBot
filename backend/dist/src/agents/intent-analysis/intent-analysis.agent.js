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
exports.IntentAnalysisAgent = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const base_agent_abstract_1 = require("../../core/agent/base-agent.abstract");
const domain_enum_1 = require("../../core/agent/domain.enum");
const llm_port_1 = require("../../core/ports/llm.port");
let IntentAnalysisAgent = class IntentAnalysisAgent extends base_agent_abstract_1.BaseAgent {
    llm;
    name = agent_name_enum_1.AgentName.IntentAnalysis;
    system = [
        "Tu es l'agent d'analyse d'intention de CiviBot (assistance administrative, Côte d'Ivoire).",
        'Domaines possibles: "etat_civil" ou "creation_entreprise".',
        'Analyse le message utilisateur et renvoie UNIQUEMENT un objet JSON avec EXACTEMENT ces clés:',
        '{',
        '  "intent": string,            // identifiant court, ex: "obtenir_acte_naissance"',
        '  "domain": "etat_civil" | "creation_entreprise",',
        '  "procedure": string | null,  // slug de procédure si identifiable, sinon null',
        '  "confidence": number,        // 0..1',
        '  "priority": "low" | "normal" | "high",',
        '  "detectedNeeds": string[],   // besoins concrets détectés',
        '  "actions": string[]          // sous-ensemble de: ' +
            Object.values(agent_name_enum_1.AgentName).join(', '),
        '}',
        'Pas de texte hors du JSON, pas de markdown.',
    ].join('\n');
    constructor(llm) {
        super();
        this.llm = llm;
    }
    async run(ctx) {
        const raw = await this.llm.completeJson({
            tier: 'reasoning',
            system: this.system,
            messages: [{ role: 'user', content: ctx.userMessage }],
        });
        const data = this.normalize(raw);
        return {
            data,
            confidence: data.confidence,
            status: data.confidence < 0.4 ? 'partial' : 'success',
        };
    }
    normalize(raw) {
        const domain = Object.values(domain_enum_1.Domain).includes(raw.domain)
            ? raw.domain
            : domain_enum_1.Domain.EtatCivil;
        const allowedActions = new Set(Object.values(agent_name_enum_1.AgentName));
        const actions = Array.isArray(raw.actions)
            ? raw.actions.filter((a) => allowedActions.has(a))
            : [];
        const priority = raw.priority === 'low' || raw.priority === 'high'
            ? raw.priority
            : 'normal';
        return {
            intent: typeof raw.intent === 'string' ? raw.intent : 'inconnu',
            domain,
            procedure: typeof raw.procedure === 'string' ? raw.procedure : null,
            confidence: typeof raw.confidence === 'number'
                ? Math.max(0, Math.min(1, raw.confidence))
                : 0.5,
            priority,
            detectedNeeds: Array.isArray(raw.detectedNeeds)
                ? raw.detectedNeeds.filter((n) => typeof n === 'string')
                : [],
            actions,
        };
    }
};
exports.IntentAnalysisAgent = IntentAnalysisAgent;
exports.IntentAnalysisAgent = IntentAnalysisAgent = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(llm_port_1.LLM_PROVIDER)),
    __metadata("design:paramtypes", [Object])
], IntentAnalysisAgent);
//# sourceMappingURL=intent-analysis.agent.js.map
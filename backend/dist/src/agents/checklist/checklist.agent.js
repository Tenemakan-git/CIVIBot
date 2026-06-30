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
exports.ChecklistAgent = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const agent_context_1 = require("../../core/agent/agent-context");
const base_agent_abstract_1 = require("../../core/agent/base-agent.abstract");
const context_helpers_1 = require("../../core/agent/context-helpers");
const llm_port_1 = require("../../core/ports/llm.port");
const prisma_service_1 = require("../../prisma/prisma.service");
let ChecklistAgent = class ChecklistAgent extends base_agent_abstract_1.BaseAgent {
    llm;
    prisma;
    name = agent_name_enum_1.AgentName.Checklist;
    system = [
        "Tu es l'agent de checklist de CiviBot (Côte d'Ivoire).",
        'Génère une checklist actionnable pour la démarche. Renvoie UNIQUEMENT un JSON:',
        '{',
        '  "titre": string,',
        '  "items": [{ "libelle": string, "obligatoire": boolean, "termine": false, "ordre": number }]',
        '}',
        "NE LISTE PAS les pièces/documents à fournir : ils sont suivis séparément.",
        "Concentre-toi sur les ACTIONS (prise de rendez-vous, paiements, déplacements,",
        'vérifications, dépôt du dossier). Items concrets et ordonnés. Pas de texte hors JSON.',
    ].join('\n');
    constructor(llm, prisma) {
        super();
        this.llm = llm;
        this.prisma = prisma;
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
        const rawItems = Array.isArray(raw.items)
            ? raw.items.map((it, i) => ({
                libelle: String(it?.libelle ?? `Élément ${i + 1}`),
                obligatoire: it?.obligatoire !== false,
                termine: it?.termine === true,
                ordre: typeof it?.ordre === 'number' ? it.ordre : i + 1,
            }))
            : [];
        const docNames = this.requiredDocNames(ctx);
        const items = rawItems
            .filter((it) => !this.matchesDocument(it.libelle, docNames))
            .map((it, i) => ({ ...it, ordre: i + 1 }));
        const titre = typeof raw.titre === 'string' ? raw.titre : 'Checklist de la démarche';
        if (items.length > 0 && ctx.folderId) {
            await this.persist(ctx, titre, items);
        }
        return {
            data: { titre, items },
            confidence: items.length > 0 ? 0.85 : 0.4,
            status: items.length > 0 ? 'success' : 'partial',
        };
    }
    requiredDocNames(ctx) {
        const proc = (0, agent_context_1.readOutput)(ctx, agent_name_enum_1.AgentName.Procedure);
        return (proc?.data?.requiredDocuments ?? [])
            .map((d) => d?.nom)
            .filter((n) => typeof n === 'string' && n.trim().length > 0);
    }
    matchesDocument(libelle, docNames) {
        const norm = (s) => s
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        const item = norm(libelle);
        if (!item)
            return false;
        return docNames.some((d) => {
            const dn = norm(d);
            if (dn.length < 3)
                return false;
            return item.includes(dn) || dn.includes(item);
        });
    }
    async persist(ctx, titre, items) {
        await this.prisma.checklist.create({
            data: {
                userId: ctx.userId,
                folderId: ctx.folderId,
                titre,
                items: {
                    create: items.map((it) => ({
                        texte: it.libelle,
                        coche: it.termine,
                        ordre: it.ordre,
                    })),
                },
            },
        });
    }
};
exports.ChecklistAgent = ChecklistAgent;
exports.ChecklistAgent = ChecklistAgent = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(llm_port_1.LLM_PROVIDER)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], ChecklistAgent);
//# sourceMappingURL=checklist.agent.js.map
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
exports.KnowledgeValidationAgent = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const agent_context_1 = require("../../core/agent/agent-context");
const base_agent_abstract_1 = require("../../core/agent/base-agent.abstract");
const prisma_service_1 = require("../../prisma/prisma.service");
const QUALITY_MIN = 0.4;
const COHERENCE_MIN = 0.12;
let KnowledgeValidationAgent = class KnowledgeValidationAgent extends base_agent_abstract_1.BaseAgent {
    prisma;
    name = agent_name_enum_1.AgentName.KnowledgeValidation;
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async run(ctx) {
        const web = (0, agent_context_1.readOutput)(ctx, agent_name_enum_1.AgentName.WebResearch);
        const ids = (web?.data?.candidates ?? []).map((c) => c.id);
        const acceptedIds = [];
        const rejected = [];
        const scoresMap = {};
        const tokens = this.tokenize(ctx.userMessage);
        for (const id of ids) {
            const candidate = await this.prisma.knowledgeCandidate.findUnique({
                where: { id },
            });
            if (!candidate)
                continue;
            const scores = this.score(candidate.cleanedText, candidate.createdAt, tokens);
            scoresMap[id] = scores;
            const accepted = scores.quality >= QUALITY_MIN && scores.coherence >= COHERENCE_MIN;
            const reason = !accepted
                ? scores.quality < QUALITY_MIN
                    ? 'qualité insuffisante'
                    : 'cohérence insuffisante avec la demande'
                : null;
            await this.prisma.knowledgeCandidate.update({
                where: { id },
                data: {
                    statut: accepted ? 'valide' : 'rejete',
                    scores: scores,
                    rejectReason: reason,
                },
            });
            if (accepted)
                acceptedIds.push(id);
            else
                rejected.push({ id, reason: reason ?? 'rejeté' });
        }
        return {
            data: { acceptedIds, rejected, scores: scoresMap },
            confidence: ids.length ? acceptedIds.length / ids.length : 0,
            status: acceptedIds.length > 0 ? 'success' : 'partial',
            followups: acceptedIds.length > 0 ? [agent_name_enum_1.AgentName.KnowledgeManager] : [],
        };
    }
    score(text, createdAt, queryTokens) {
        const quality = Math.max(0, Math.min(1, text.length / 1500));
        const lower = text.toLowerCase();
        const hits = queryTokens.filter((t) => lower.includes(t)).length;
        const coherence = queryTokens.length ? hits / queryTokens.length : 0;
        const ageHours = (Date.now() - createdAt.getTime()) / 3_600_000;
        const freshness = ageHours < 24 ? 1 : Math.max(0, 1 - ageHours / (24 * 30));
        const duplicate = 0;
        return { duplicate, quality, coherence, freshness };
    }
    tokenize(q) {
        return q
            .toLowerCase()
            .split(/[^a-zàâäéèêëîïôöùûüç0-9]+/i)
            .filter((t) => t.length >= 4);
    }
};
exports.KnowledgeValidationAgent = KnowledgeValidationAgent;
exports.KnowledgeValidationAgent = KnowledgeValidationAgent = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KnowledgeValidationAgent);
//# sourceMappingURL=knowledge-validation.agent.js.map
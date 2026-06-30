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
var ConversationAgent_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationAgent = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const agent_context_1 = require("../../core/agent/agent-context");
const llm_port_1 = require("../../core/ports/llm.port");
const prisma_service_1 = require("../../prisma/prisma.service");
const orchestrator_service_1 = require("../../orchestration/orchestrator.service");
let ConversationAgent = ConversationAgent_1 = class ConversationAgent {
    orchestrator;
    prisma;
    llm;
    logger = new common_1.Logger(ConversationAgent_1.name);
    constructor(orchestrator, prisma, llm) {
        this.orchestrator = orchestrator;
        this.prisma = prisma;
        this.llm = llm;
    }
    async handle(params, res) {
        const start = Date.now();
        const conversationId = await this.ensureConversation(params.userId, params.conversationId, params.message);
        await this.prisma.message.create({
            data: { conversationId, sender: 'USER', contenu: params.message },
        });
        this.openSse(res);
        this.send(res, { type: 'status', state: 'started', conversationId });
        const ctx = {
            runId: crypto.randomUUID(),
            folderId: params.folderId ?? '',
            userId: params.userId,
            conversationId,
            locale: 'fr',
            userMessage: params.message,
            outputs: {},
            metadata: {},
        };
        if (typeof params.lat === 'number' && typeof params.lng === 'number') {
            ctx.metadata.userLocation = { lat: params.lat, lng: params.lng };
        }
        try {
            await this.orchestrator.run(ctx, {
                onAgentStep: (agent, status) => this.send(res, { type: 'agent_step', agent, status }),
            });
        }
        catch (err) {
            this.logger.error(`Orchestration échouée: ${err.message}`);
        }
        const knowledge = (0, agent_context_1.readOutput)(ctx, agent_name_enum_1.AgentName.Knowledge);
        this.send(res, {
            type: 'sources',
            sources: (knowledge?.data?.chunks ?? []).map((c) => ({
                id: c.id,
                titre: c.titre,
                extrait: c.extrait,
            })),
            folderId: ctx.folderId || null,
        });
        const orientation = (0, agent_context_1.readOutput)(ctx, agent_name_enum_1.AgentName.Orientation);
        const servicePoints = orientation?.data?.servicePoints ?? [];
        const located = !!ctx.metadata.userLocation;
        if (servicePoints.length > 0) {
            this.send(res, { type: 'services', services: servicePoints, located });
        }
        const quality = (0, agent_context_1.readOutput)(ctx, agent_name_enum_1.AgentName.Quality);
        this.send(res, {
            type: 'quality',
            passed: quality?.data?.passed ?? true,
            confidence: quality?.data?.confidence ?? null,
            hallucinationRisk: quality?.data?.hallucinationRisk ?? null,
        });
        await this.streamAnswer(ctx, conversationId, knowledge?.data?.context ?? '', quality?.data?.passed === false, this.orientationContext(servicePoints, located), res, start);
    }
    orientationContext(points, located) {
        if (points.length === 0)
            return '';
        const lines = points.slice(0, 3).map((p, i) => {
            const dist = located && typeof p.distanceKm === 'number'
                ? ` — à ~${p.distanceKm} km`
                : '';
            const h = p.horaires ? ` (${p.horaires})` : '';
            return `${i + 1}. ${p.nom}, ${p.adresse}, ${p.ville}${dist}${h}`;
        });
        const intro = located
            ? "Services administratifs compétents les plus proches de l'utilisateur (le plus proche en premier) :"
            : 'Services administratifs compétents pour cette démarche :';
        return (`${intro}\n${lines.join('\n')}\n` +
            "Si l'utilisateur demande où se rendre, recommande en priorité le premier de cette liste " +
            '(avec son adresse), sans inventer d\'autres adresses.');
    }
    async streamAnswer(ctx, conversationId, context, cautious, orientation, res, start) {
        const settings = await this.prisma.aiSettings.findFirst();
        const basePrompt = settings?.promptSysteme ??
            "Tu es CiviBot, assistant administratif pour la Côte d'Ivoire. Réponds en français, clairement.";
        const cautionGuard = cautious
            ? "\n\nIMPORTANT (contrôle qualité): l'ancrage documentaire est faible. Si le contexte ne contient pas l'information, dis-le explicitement, N'INVENTE RIEN, et invite l'utilisateur à vérifier auprès de l'organisme officiel compétent."
            : '';
        const orientationGuard = orientation ? `\n\n${orientation}` : '';
        const system = (context
            ? `${basePrompt}\n\nContexte documentaire pertinent :\n${context}`
            : basePrompt) +
            cautionGuard +
            orientationGuard;
        const messages = await this.buildHistory(conversationId);
        let full = '';
        try {
            const result = await this.llm.stream({ tier: 'generation', system, messages }, {
                onText: (text) => {
                    full += text;
                    this.send(res, { type: 'chunk', content: text });
                },
            });
            await this.prisma.message.create({
                data: {
                    conversationId,
                    sender: 'AI',
                    contenu: full,
                    tokens: result.outputTokens || null,
                    modeleUtilise: result.model,
                },
            });
            await this.prisma.aiLog.create({
                data: {
                    conversationId,
                    prompt: ctx.userMessage,
                    reponse: full,
                    modele: result.model,
                    tokensInput: result.inputTokens,
                    tokensOutput: result.outputTokens,
                    dureeMs: Date.now() - start,
                    cout: result.inputTokens * 0.000003 + result.outputTokens * 0.000015,
                },
            });
            this.send(res, { type: 'done', model: result.model });
            res.end();
        }
        catch (err) {
            this.send(res, {
                type: 'error',
                message: "Aucune IA disponible pour le moment. Réessayez plus tard ou vérifiez la configuration.",
            });
            this.logger.error(`Streaming échoué: ${err.message}`);
            res.end();
        }
    }
    async buildHistory(conversationId) {
        const history = await this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: 10,
        });
        return history.map((m) => ({
            role: m.sender === 'USER' ? 'user' : 'assistant',
            content: m.contenu,
        }));
    }
    async ensureConversation(userId, conversationId, message) {
        if (conversationId) {
            const conv = await this.prisma.conversation.findFirst({
                where: { id: conversationId, userId },
            });
            if (conv)
                return conv.id;
        }
        const created = await this.prisma.conversation.create({
            data: { userId, titre: message.slice(0, 60) },
        });
        return created.id;
    }
    openSse(res) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
    }
    send(res, payload) {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
};
exports.ConversationAgent = ConversationAgent;
exports.ConversationAgent = ConversationAgent = ConversationAgent_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(llm_port_1.LLM_PROVIDER)),
    __metadata("design:paramtypes", [orchestrator_service_1.OrchestratorService,
        prisma_service_1.PrismaService, Object])
], ConversationAgent);
//# sourceMappingURL=conversation.agent.js.map
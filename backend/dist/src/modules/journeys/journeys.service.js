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
exports.JourneysService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const orchestrator_service_1 = require("../../orchestration/orchestrator.service");
const questionnaire_1 = require("./questionnaire");
let JourneysService = class JourneysService {
    prisma;
    orchestrator;
    constructor(prisma, orchestrator) {
        this.prisma = prisma;
        this.orchestrator = orchestrator;
    }
    questionnaire() {
        return (0, questionnaire_1.getQuestionnaire)();
    }
    findAll(userId) {
        return this.prisma.guidedSession.findMany({
            where: { userId },
            include: { answers: { orderBy: { ordre: 'asc' } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    findOne(id, userId) {
        return this.prisma.guidedSession.findFirst({
            where: { id, userId },
            include: { answers: { orderBy: { ordre: 'asc' } } },
        });
    }
    create(userId) {
        return this.prisma.guidedSession.create({ data: { userId } });
    }
    async addAnswer(sessionId, userId, dto) {
        await this.prisma.guidedSession.findFirstOrThrow({ where: { id: sessionId, userId } });
        return this.prisma.guidedAnswer.create({
            data: { sessionId, ...dto },
        });
    }
    async complete(sessionId, userId) {
        const session = await this.prisma.guidedSession.findFirstOrThrow({
            where: { id: sessionId, userId },
            include: { answers: { orderBy: { ordre: 'asc' } } },
        });
        if (session.statut === 'termine' && session.folderId) {
            return {
                sessionId,
                folderId: session.folderId,
                conversationId: session.conversationId,
            };
        }
        const userMessage = this.synthesize(session.answers);
        const conversation = await this.prisma.conversation.create({
            data: { userId, titre: 'Parcours guidé' },
        });
        const ctx = {
            runId: crypto.randomUUID(),
            folderId: '',
            userId,
            conversationId: conversation.id,
            locale: 'fr',
            userMessage,
            outputs: {},
            metadata: { source: 'guided-journey' },
        };
        try {
            await this.orchestrator.run(ctx);
        }
        catch {
        }
        const folderId = ctx.folderId || null;
        await this.prisma.guidedSession.update({
            where: { id: sessionId },
            data: { statut: 'termine', folderId, conversationId: conversation.id },
        });
        return { sessionId, folderId, conversationId: conversation.id };
    }
    synthesize(answers) {
        if (answers.length === 0) {
            return 'Aide-moi à identifier la démarche administrative adaptée à ma situation.';
        }
        return [
            'Voici les informations de mon parcours guidé :',
            ...answers.map((a) => `- ${a.question} ${a.reponse}`),
            'Établis ma démarche administrative adaptée (étapes, documents, coûts, délais).',
        ].join('\n');
    }
};
exports.JourneysService = JourneysService;
exports.JourneysService = JourneysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orchestrator_service_1.OrchestratorService])
], JourneysService);
//# sourceMappingURL=journeys.service.js.map
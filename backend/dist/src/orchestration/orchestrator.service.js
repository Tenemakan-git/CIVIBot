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
var OrchestratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../core/agent/agent-name.enum");
const domain_enum_1 = require("../core/agent/domain.enum");
const prisma_service_1 = require("../prisma/prisma.service");
const folder_service_1 = require("../folders/application/folder.service");
const agent_registry_1 = require("./agent-registry");
const workflow_factory_1 = require("./workflow.factory");
const MAX_DISPATCHES = 64;
let OrchestratorService = OrchestratorService_1 = class OrchestratorService {
    registry;
    workflow;
    folders;
    prisma;
    logger = new common_1.Logger(OrchestratorService_1.name);
    constructor(registry, workflow, folders, prisma) {
        this.registry = registry;
        this.workflow = workflow;
        this.folders = folders;
        this.prisma = prisma;
    }
    async run(ctx, hooks) {
        ctx.intent = await this.resolveIntent(ctx, hooks);
        ctx.folderId = await this.ensureFolder(ctx);
        const plan = this.workflow.build(ctx.intent);
        let name;
        let guard = 0;
        while ((name = plan.next())) {
            if (++guard > MAX_DISPATCHES) {
                this.logger.warn(`Limite de dispatch atteinte (${MAX_DISPATCHES}) — arrêt de la boucle`);
                break;
            }
            if (!this.registry.has(name)) {
                this.logger.debug(`Agent "${name}" non disponible — ignoré`);
                continue;
            }
            const result = await this.dispatch(name, ctx, hooks);
            ctx.outputs[name] = result;
            plan.markDone(name);
            if (result.followups?.length) {
                plan.enqueue(result.followups, { front: true, allowRerun: true });
            }
        }
    }
    async resolveIntent(ctx, hooks) {
        if (!this.registry.has(agent_name_enum_1.AgentName.IntentAnalysis)) {
            return this.fallbackIntent();
        }
        const res = await this.dispatch(agent_name_enum_1.AgentName.IntentAnalysis, ctx);
        ctx.outputs[agent_name_enum_1.AgentName.IntentAnalysis] = res;
        if (res.status === 'failed') {
            hooks?.onAgentStep?.(agent_name_enum_1.AgentName.IntentAnalysis, 'partial', {
                ...res,
                status: 'partial',
            });
            return this.fallbackIntent();
        }
        hooks?.onAgentStep?.(agent_name_enum_1.AgentName.IntentAnalysis, res.status, res);
        return res.data;
    }
    fallbackIntent() {
        return {
            intent: 'inconnu',
            domain: domain_enum_1.Domain.EtatCivil,
            procedure: null,
            confidence: 0,
            priority: 'normal',
            detectedNeeds: [],
            actions: [],
        };
    }
    async ensureFolder(ctx) {
        if (ctx.folderId)
            return ctx.folderId;
        const existing = await this.folders.findByConversation(ctx.conversationId);
        if (existing)
            return existing.id;
        const intent = ctx.intent;
        const titre = this.buildFolderTitle(intent);
        const folder = await this.folders.createFolder({
            userId: ctx.userId,
            domaine: intent.domain,
            titre,
            procedureSlug: intent.procedure,
            conversationId: ctx.conversationId,
        });
        return folder.id;
    }
    buildFolderTitle(intent) {
        if (intent.procedure?.trim())
            return this.humanize(intent.procedure);
        const generic = new Set(['inconnu', 'unknown', 'autre', '']);
        if (intent.intent && !generic.has(intent.intent.trim().toLowerCase())) {
            return this.humanize(intent.intent);
        }
        return `Démarche ${this.humanize(intent.domain)}`;
    }
    humanize(slug) {
        const s = slug.replace(/[-_]/g, ' ').trim();
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
    async dispatch(name, ctx, hooks) {
        const agent = this.registry.get(name);
        const result = await agent.execute(ctx);
        await this.logRun(ctx, result);
        hooks?.onAgentStep?.(name, result.status, result);
        return result;
    }
    async logRun(ctx, result) {
        try {
            await this.prisma.agentRun.create({
                data: {
                    runId: ctx.runId,
                    folderId: ctx.folderId || null,
                    agent: result.agent,
                    status: result.status,
                    confidence: result.confidence ?? null,
                    durationMs: result.durationMs ?? null,
                    output: this.truncate(result.data),
                },
            });
        }
        catch (err) {
            this.logger.warn(`AgentRun non journalisé: ${err.message}`);
        }
    }
    truncate(data) {
        try {
            const json = JSON.stringify(data ?? null);
            return json.length > 8000 ? { _truncated: json.slice(0, 8000) } : JSON.parse(json);
        }
        catch {
            return null;
        }
    }
};
exports.OrchestratorService = OrchestratorService;
exports.OrchestratorService = OrchestratorService = OrchestratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agent_registry_1.AgentRegistry,
        workflow_factory_1.WorkflowFactory,
        folder_service_1.FolderService,
        prisma_service_1.PrismaService])
], OrchestratorService);
//# sourceMappingURL=orchestrator.service.js.map
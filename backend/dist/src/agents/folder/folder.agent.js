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
exports.FolderAgent = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const agent_context_1 = require("../../core/agent/agent-context");
const base_agent_abstract_1 = require("../../core/agent/base-agent.abstract");
const folder_service_1 = require("../../folders/application/folder.service");
const required_docs_checklist_service_1 = require("../../folders/application/required-docs-checklist.service");
let FolderAgent = class FolderAgent extends base_agent_abstract_1.BaseAgent {
    folders;
    requiredDocs;
    name = agent_name_enum_1.AgentName.Folder;
    constructor(folders, requiredDocs) {
        super();
        this.folders = folders;
        this.requiredDocs = requiredDocs;
    }
    async run(ctx) {
        const folderId = ctx.folderId;
        const planning = (0, agent_context_1.readOutput)(ctx, agent_name_enum_1.AgentName.Planning);
        if (planning?.status === 'success' && planning.data?.steps) {
            await this.folders.recordPlan(folderId, {
                steps: planning.data.steps,
                cout: planning.data.estimatedCost ?? null,
                delai: planning.data.estimatedDurationDays
                    ? `${planning.data.estimatedDurationDays} jours`
                    : null,
            });
        }
        const docs = this.collectDocuments(ctx);
        if (docs.length > 0) {
            await this.folders.recordDocuments(folderId, docs);
            await this.requiredDocs.sync(folderId);
        }
        const sources = this.collectSources(ctx);
        if (sources.length > 0)
            await this.folders.recordSources(folderId, sources);
        await this.folders.recordTimeline(folderId, {
            type: 'agent_step',
            label: 'Dossier assemblé par le Folder Agent',
        });
        await this.folders.recordHistory(folderId, {
            action: 'dossier_assemble',
            acteur: this.name,
            payload: { documents: docs.length, plan: !!planning },
        });
        const folder = await this.folders.recomputeProgress(folderId);
        return {
            data: {
                folderId: folder.id,
                titre: folder.titre,
                domaine: folder.domaine,
                statut: folder.statut,
                progression: folder.progression,
                documentsCount: docs.length,
                hasPlan: !!planning?.data?.steps,
            },
            confidence: 1,
        };
    }
    collectDocuments(ctx) {
        const out = [];
        const seen = new Set();
        const push = (nom, obligatoire = true, statut = 'manquant') => {
            const key = nom.trim().toLowerCase();
            if (!key || seen.has(key))
                return;
            seen.add(key);
            out.push({ nom: nom.trim(), obligatoire, statut });
        };
        const procedure = (0, agent_context_1.readOutput)(ctx, agent_name_enum_1.AgentName.Procedure);
        procedure?.data?.requiredDocuments?.forEach((d) => push(d.nom, d.obligatoire ?? true));
        const document = (0, agent_context_1.readOutput)(ctx, agent_name_enum_1.AgentName.Document);
        document?.data?.documents?.forEach((d) => push(d.nom, true, d.statut ?? 'manquant'));
        return out;
    }
    collectSources(ctx) {
        const sources = [];
        const seen = new Set();
        for (const result of Object.values(ctx.outputs)) {
            result?.sources?.forEach((s) => {
                const key = `${s.organisme}|${s.url ?? ''}`;
                if (seen.has(key))
                    return;
                seen.add(key);
                sources.push({ organisme: s.organisme, url: s.url ?? null, titre: s.titre ?? null });
            });
        }
        return sources;
    }
};
exports.FolderAgent = FolderAgent;
exports.FolderAgent = FolderAgent = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [folder_service_1.FolderService,
        required_docs_checklist_service_1.RequiredDocsChecklistService])
], FolderAgent);
//# sourceMappingURL=folder.agent.js.map
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
exports.VerificationAgent = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const base_agent_abstract_1 = require("../../core/agent/base-agent.abstract");
const event_names_1 = require("../../core/events/event-names");
const folder_service_1 = require("../../folders/application/folder.service");
let VerificationAgent = class VerificationAgent extends base_agent_abstract_1.BaseAgent {
    folders;
    events;
    name = agent_name_enum_1.AgentName.Verification;
    constructor(folders, events) {
        super();
        this.folders = folders;
        this.events = events;
    }
    async run(ctx) {
        const view = await this.folders.getView(ctx.folderId, ctx.userId);
        const missing = view.documents
            .filter((d) => d.obligatoire !== false && d.statut !== 'fourni')
            .map((d) => d.nom);
        const hasDocs = view.documents.length > 0;
        const status = hasDocs && missing.length === 0 ? 'complet' : 'incomplet';
        const recommendations = [];
        if (!hasDocs) {
            recommendations.push('Aucun document listé : précisez la démarche pour générer la liste des pièces.');
        }
        for (const nom of missing) {
            recommendations.push(`Fournir la pièce obligatoire manquante : ${nom}.`);
        }
        if (status === 'complet') {
            recommendations.push('Dossier complet : vous pouvez déposer votre demande.');
        }
        const report = { status, missing, recommendations };
        this.events.emit(event_names_1.Events.Verification.Completed, {
            folderId: ctx.folderId,
            userId: ctx.userId,
            domaine: ctx.intent?.domain ?? null,
            status,
            missing,
            missingCount: missing.length,
        });
        return {
            data: report,
            confidence: 1,
            status: status === 'incomplet' ? 'partial' : 'success',
        };
    }
};
exports.VerificationAgent = VerificationAgent;
exports.VerificationAgent = VerificationAgent = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [folder_service_1.FolderService,
        event_emitter_1.EventEmitter2])
], VerificationAgent);
//# sourceMappingURL=verification.agent.js.map
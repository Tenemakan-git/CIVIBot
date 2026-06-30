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
exports.FolderService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const administrative_folder_entity_1 = require("../domain/administrative-folder.entity");
const folder_repository_port_1 = require("../domain/folder.repository.port");
const folder_events_1 = require("../domain/events/folder.events");
const folder_status_vo_1 = require("../domain/folder-status.vo");
let FolderService = class FolderService {
    repo;
    events;
    constructor(repo, events) {
        this.repo = repo;
        this.events = events;
    }
    async createFolder(input) {
        const folder = administrative_folder_entity_1.AdministrativeFolder.create(input);
        const saved = await this.repo.create(folder);
        await this.repo.addHistory(saved.id, {
            action: 'dossier_cree',
            acteur: 'system',
            payload: { domaine: saved.domaine },
        });
        await this.repo.addTimeline(saved.id, {
            type: 'status_change',
            label: 'Dossier créé',
        });
        this.events.emit(new folder_events_1.FolderCreatedEvent(this.payload(saved)).name, new folder_events_1.FolderCreatedEvent(this.payload(saved)));
        return saved;
    }
    async getView(id, userId) {
        const view = await this.repo.getView(id);
        if (!view)
            throw new common_1.NotFoundException('Dossier introuvable');
        if (view.userId !== userId)
            throw new common_1.ForbiddenException();
        return view;
    }
    async listForUser(userId) {
        return this.repo.findByUser(userId);
    }
    findByConversation(conversationId) {
        return this.repo.findByConversation(conversationId);
    }
    listNotifications(userId) {
        return this.repo.listNotificationsForUser(userId);
    }
    markNotificationRead(id, userId) {
        return this.repo.markNotificationRead(id, userId);
    }
    markAllNotificationsRead(userId) {
        return this.repo.markAllNotificationsRead(userId);
    }
    async requireOwned(id, userId) {
        const folder = await this.repo.findById(id);
        if (!folder)
            throw new common_1.NotFoundException('Dossier introuvable');
        if (folder.userId !== userId)
            throw new common_1.ForbiddenException();
        return folder;
    }
    async rename(id, userId, titre) {
        const folder = await this.requireOwned(id, userId);
        folder.rename(titre);
        await this.repo.save(folder);
        await this.emitUpdated(folder);
    }
    async setProgress(id, userId, value) {
        const folder = userId
            ? await this.requireOwned(id, userId)
            : await this.mustFind(id);
        folder.updateProgress(value);
        const saved = await this.repo.save(folder);
        await this.emitUpdated(saved);
        if (saved.statut === folder_status_vo_1.FolderStatus.Complet) {
            this.events.emit(new folder_events_1.FolderCompletedEvent(this.payload(saved)).name, new folder_events_1.FolderCompletedEvent(this.payload(saved)));
        }
        return saved;
    }
    async terminate(id, userId) {
        const folder = await this.requireOwned(id, userId);
        folder.terminate();
        await this.repo.save(folder);
        await this.emitUpdated(folder);
    }
    async attachConversation(id, conversationId) {
        const folder = await this.mustFind(id);
        folder.attachConversation(conversationId);
        await this.repo.save(folder);
    }
    async setProcedure(id, slug) {
        const folder = await this.mustFind(id);
        folder.setProcedure(slug);
        await this.repo.save(folder);
    }
    recordPlan(id, plan) {
        return this.repo.upsertPlan(id, plan);
    }
    recordDocuments(id, docs) {
        return this.repo.addDocuments(id, docs);
    }
    recordSources(id, sources) {
        return this.repo.addSources(id, sources);
    }
    recordTimeline(id, entry) {
        return this.repo.addTimeline(id, entry);
    }
    recordHistory(id, h) {
        return this.repo.addHistory(id, h);
    }
    recordNotification(id, n) {
        return this.repo.addNotification(id, n);
    }
    recordPdf(id, pdf) {
        return this.repo.addPdf(id, pdf);
    }
    async recomputeProgress(id) {
        const view = await this.repo.getView(id);
        if (!view)
            throw new common_1.NotFoundException('Dossier introuvable');
        const total = view.documents.length;
        const done = view.documents.filter((d) => d.statut === 'fourni').length;
        const value = total > 0 ? (done / total) * 100 : 0;
        return this.setProgress(id, null, value);
    }
    async mustFind(id) {
        const folder = await this.repo.findById(id);
        if (!folder)
            throw new common_1.NotFoundException('Dossier introuvable');
        return folder;
    }
    async emitUpdated(folder) {
        await this.repo.addTimeline(folder.id, {
            type: 'status_change',
            label: `Statut: ${folder.statut} — ${folder.progression}%`,
        });
        const evt = new folder_events_1.FolderUpdatedEvent(this.payload(folder));
        this.events.emit(evt.name, evt);
    }
    payload(folder) {
        return {
            folderId: folder.id,
            userId: folder.userId,
            domaine: folder.domaine,
            statut: folder.statut,
            progression: folder.progression,
            procedureSlug: folder.procedureSlug,
            titre: folder.titre,
            createdAt: folder.createdAt,
        };
    }
};
exports.FolderService = FolderService;
exports.FolderService = FolderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(folder_repository_port_1.FOLDER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, event_emitter_1.EventEmitter2])
], FolderService);
//# sourceMappingURL=folder.service.js.map
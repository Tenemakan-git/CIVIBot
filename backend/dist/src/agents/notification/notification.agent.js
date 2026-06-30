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
var NotificationAgent_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationAgent = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const event_names_1 = require("../../core/events/event-names");
const folder_service_1 = require("../../folders/application/folder.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const progress_report_dto_1 = require("../monitoring/dto/progress-report.dto");
let NotificationAgent = NotificationAgent_1 = class NotificationAgent {
    folders;
    prisma;
    logger = new common_1.Logger(NotificationAgent_1.name);
    constructor(folders, prisma) {
        this.folders = folders;
        this.prisma = prisma;
    }
    async onProgress(report) {
        if (report.late) {
            await this.notifyOnce(report.folderId, 'retard', `Votre dossier est en attente depuis ${report.ageDays} jours (${report.progress}%). Pensez à le compléter.`);
        }
    }
    async onCompleted(payload) {
        await this.notifyOnce(payload.folderId, 'termine', 'Félicitations, votre dossier est complet. Vous pouvez déposer votre demande.');
    }
    async onVerification(payload) {
        if (payload.status === 'incomplet' && payload.missing?.length) {
            await this.notifyOnce(payload.folderId, 'rappel', `Pièces manquantes : ${payload.missing.join(', ')}.`);
        }
    }
    async onKnowledgeCommitted(payload) {
        if (!payload.folderId)
            return;
        await this.send(payload.folderId, 'nouvelle_info', `De nouvelles informations officielles ont été ajoutées (${payload.documents} document(s)).`);
    }
    async notifyOnce(folderId, type, message) {
        const existing = await this.prisma.folderNotification.findFirst({
            where: { folderId, type, lu: false },
        });
        if (existing)
            return;
        await this.send(folderId, type, message);
    }
    async send(folderId, type, message) {
        try {
            await this.folders.recordNotification(folderId, { type, message });
        }
        catch (err) {
            this.logger.warn(`Notification non enregistrée (${type}): ${err.message}`);
        }
    }
};
exports.NotificationAgent = NotificationAgent;
__decorate([
    (0, event_emitter_1.OnEvent)(event_names_1.Events.Monitoring.ProgressComputed),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [progress_report_dto_1.ProgressReportDto]),
    __metadata("design:returntype", Promise)
], NotificationAgent.prototype, "onProgress", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_names_1.Events.Folder.Completed),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationAgent.prototype, "onCompleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_names_1.Events.Verification.Completed),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationAgent.prototype, "onVerification", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_names_1.Events.Knowledge.Committed),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationAgent.prototype, "onKnowledgeCommitted", null);
exports.NotificationAgent = NotificationAgent = NotificationAgent_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [folder_service_1.FolderService,
        prisma_service_1.PrismaService])
], NotificationAgent);
//# sourceMappingURL=notification.agent.js.map
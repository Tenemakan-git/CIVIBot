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
var MonitoringAgent_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringAgent = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const event_names_1 = require("../../core/events/event-names");
const folder_service_1 = require("../../folders/application/folder.service");
const LATE_AFTER_DAYS = 14;
let MonitoringAgent = MonitoringAgent_1 = class MonitoringAgent {
    folders;
    events;
    logger = new common_1.Logger(MonitoringAgent_1.name);
    constructor(folders, events) {
        this.folders = folders;
        this.events = events;
    }
    async onFolderChanged(payload) {
        const ageDays = payload.createdAt
            ? (Date.now() - new Date(payload.createdAt).getTime()) / 86_400_000
            : 0;
        const late = payload.progression < 100 && ageDays > LATE_AFTER_DAYS;
        if (late) {
            await this.folders
                .recordTimeline(payload.folderId, {
                type: 'monitoring',
                label: `Retard détecté (${Math.round(ageDays)} jours, ${payload.progression}%)`,
            })
                .catch((e) => this.logger.warn(e.message));
        }
        const report = {
            folderId: payload.folderId,
            userId: payload.userId,
            progress: payload.progression,
            late,
            ageDays: Math.round(ageDays),
        };
        this.events.emit(event_names_1.Events.Monitoring.ProgressComputed, report);
    }
};
exports.MonitoringAgent = MonitoringAgent;
__decorate([
    (0, event_emitter_1.OnEvent)(event_names_1.Events.Folder.Created),
    (0, event_emitter_1.OnEvent)(event_names_1.Events.Folder.Updated),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringAgent.prototype, "onFolderChanged", null);
exports.MonitoringAgent = MonitoringAgent = MonitoringAgent_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [folder_service_1.FolderService,
        event_emitter_1.EventEmitter2])
], MonitoringAgent);
//# sourceMappingURL=monitoring.agent.js.map
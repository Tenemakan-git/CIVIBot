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
exports.FolderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../../modules/auth/guards/jwt.guard");
const current_user_decorator_1 = require("../../modules/auth/decorators/current-user.decorator");
const folder_service_1 = require("../application/folder.service");
const required_docs_checklist_service_1 = require("../application/required-docs-checklist.service");
const create_folder_dto_1 = require("./dto/create-folder.dto");
const update_folder_dto_1 = require("./dto/update-folder.dto");
let FolderController = class FolderController {
    service;
    requiredDocs;
    constructor(service, requiredDocs) {
        this.service = service;
        this.requiredDocs = requiredDocs;
    }
    async list(user) {
        const folders = await this.service.listForUser(user.id);
        return folders.map((f) => f.toSnapshot());
    }
    notifications(user) {
        return this.service.listNotifications(user.id);
    }
    readAllNotifications(user) {
        return this.service.markAllNotificationsRead(user.id);
    }
    readNotification(id, user) {
        return this.service.markNotificationRead(id, user.id);
    }
    async create(user, dto) {
        const folder = await this.service.createFolder({
            userId: user.id,
            domaine: dto.domaine,
            titre: dto.titre,
            procedureSlug: dto.procedureSlug ?? null,
            conversationId: dto.conversationId ?? null,
        });
        return folder.toSnapshot();
    }
    view(id, user) {
        return this.service.getView(id, user.id);
    }
    rename(id, user, dto) {
        return this.service.rename(id, user.id, dto.titre);
    }
    async progress(id, user, dto) {
        const folder = await this.service.setProgress(id, user.id, dto.progression);
        return folder.toSnapshot();
    }
    terminate(id, user) {
        return this.service.terminate(id, user.id);
    }
    async setDocument(id, docId, user, body) {
        const view = await this.service.getView(id, user.id);
        if (!view.documents.some((d) => d.id === docId)) {
            throw new common_1.NotFoundException('Document introuvable dans ce dossier');
        }
        await this.requiredDocs.setDocProvided(docId, !!body.fourni);
        return this.service.getView(id, user.id);
    }
};
exports.FolderController = FolderController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FolderController.prototype, "notifications", null);
__decorate([
    (0, common_1.Patch)('notifications/read-all'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FolderController.prototype, "readAllNotifications", null);
__decorate([
    (0, common_1.Patch)('notifications/:id/read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FolderController.prototype, "readNotification", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_folder_dto_1.CreateFolderDto]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FolderController.prototype, "view", null);
__decorate([
    (0, common_1.Patch)(':id/rename'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_folder_dto_1.RenameFolderDto]),
    __metadata("design:returntype", void 0)
], FolderController.prototype, "rename", null);
__decorate([
    (0, common_1.Patch)(':id/progress'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_folder_dto_1.SetProgressDto]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "progress", null);
__decorate([
    (0, common_1.Patch)(':id/terminate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FolderController.prototype, "terminate", null);
__decorate([
    (0, common_1.Patch)(':id/documents/:docId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('docId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "setDocument", null);
exports.FolderController = FolderController = __decorate([
    (0, swagger_1.ApiTags)('Dossiers administratifs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('folders'),
    __metadata("design:paramtypes", [folder_service_1.FolderService,
        required_docs_checklist_service_1.RequiredDocsChecklistService])
], FolderController);
//# sourceMappingURL=folder.controller.js.map
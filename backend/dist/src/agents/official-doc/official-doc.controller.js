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
exports.OfficialDocController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../../modules/auth/guards/jwt.guard");
const current_user_decorator_1 = require("../../modules/auth/decorators/current-user.decorator");
const official_doc_service_1 = require("./official-doc.service");
let OfficialDocController = class OfficialDocController {
    docs;
    constructor(docs) {
        this.docs = docs;
    }
    templates(id, user) {
        return this.docs.listTemplates(id, user.id);
    }
    list(id, user) {
        return this.docs.listGenerated(id, user.id);
    }
    async generate(id, user, body) {
        const doc = await this.docs.generate(id, user.id, body.templateKey, body.fields ?? {});
        return {
            id: doc.id,
            templateKey: doc.templateKey,
            titre: doc.titre,
            filename: doc.filename,
            bytes: doc.bytes,
            createdAt: doc.createdAt,
        };
    }
    async download(id, docId, user, res) {
        const { buffer, filename } = await this.docs.getFile(id, docId, user.id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    }
};
exports.OfficialDocController = OfficialDocController;
__decorate([
    (0, common_1.Get)(':id/documents/templates'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OfficialDocController.prototype, "templates", null);
__decorate([
    (0, common_1.Get)(':id/documents'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OfficialDocController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':id/documents/generate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OfficialDocController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)(':id/documents/:docId/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('docId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], OfficialDocController.prototype, "download", null);
exports.OfficialDocController = OfficialDocController = __decorate([
    (0, swagger_1.ApiTags)('Dossiers administratifs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('folders'),
    __metadata("design:paramtypes", [official_doc_service_1.OfficialDocService])
], OfficialDocController);
//# sourceMappingURL=official-doc.controller.js.map
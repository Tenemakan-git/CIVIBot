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
exports.AiSettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const prisma_service_1 = require("../../prisma/prisma.service");
let AiSettingsController = class AiSettingsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSettings() {
        let settings = await this.prisma.aiSettings.findFirst();
        if (!settings)
            settings = await this.prisma.aiSettings.create({ data: {} });
        return settings;
    }
    async updateSettings(body) {
        const existing = await this.prisma.aiSettings.findFirst();
        if (!existing) {
            return this.prisma.aiSettings.create({ data: body });
        }
        return this.prisma.aiSettings.update({ where: { id: existing.id }, data: body });
    }
};
exports.AiSettingsController = AiSettingsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiSettingsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiSettingsController.prototype, "updateSettings", null);
exports.AiSettingsController = AiSettingsController = __decorate([
    (0, swagger_1.ApiTags)('Admin - AI Settings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super-admin'),
    (0, common_1.Controller)('admin/ai-settings'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiSettingsController);
//# sourceMappingURL=ai-settings.controller.js.map
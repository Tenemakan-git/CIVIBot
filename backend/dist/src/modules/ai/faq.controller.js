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
exports.SourcesController = exports.FaqController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const prisma_service_1 = require("../../prisma/prisma.service");
let FaqController = class FaqController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(procedureId) {
        return this.prisma.faq.findMany({
            where: procedureId ? { procedureId } : undefined,
            include: { procedure: true },
        });
    }
    create(body) {
        return this.prisma.faq.create({ data: body });
    }
    update(id, body) {
        return this.prisma.faq.update({ where: { id }, data: body });
    }
    remove(id) { return this.prisma.faq.delete({ where: { id } }); }
};
exports.FaqController = FaqController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('procedureId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FaqController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FaqController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FaqController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FaqController.prototype, "remove", null);
exports.FaqController = FaqController = __decorate([
    (0, swagger_1.ApiTags)('Admin - FAQ'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super-admin'),
    (0, common_1.Controller)('admin/faq'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FaqController);
let SourcesController = class SourcesController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(procedureId) {
        return this.prisma.source.findMany({
            where: procedureId ? { procedureId } : undefined,
            include: { procedure: true },
        });
    }
    create(body) {
        return this.prisma.source.create({ data: body });
    }
    update(id, body) {
        return this.prisma.source.update({ where: { id }, data: body });
    }
    remove(id) { return this.prisma.source.delete({ where: { id } }); }
};
exports.SourcesController = SourcesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('procedureId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SourcesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SourcesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SourcesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SourcesController.prototype, "remove", null);
exports.SourcesController = SourcesController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Sources'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super-admin'),
    (0, common_1.Controller)('admin/sources'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SourcesController);
//# sourceMappingURL=faq.controller.js.map
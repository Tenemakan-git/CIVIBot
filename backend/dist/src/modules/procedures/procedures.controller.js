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
exports.AdminProceduresController = exports.ProceduresController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const procedures_service_1 = require("./procedures.service");
const create_procedure_dto_1 = require("./dto/create-procedure.dto");
const update_procedure_dto_1 = require("./dto/update-procedure.dto");
let ProceduresController = class ProceduresController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(categorieId) {
        return this.service.findPublished(categorieId);
    }
    findOne(id) { return this.service.findOne(id); }
};
exports.ProceduresController = ProceduresController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('categorieId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProceduresController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProceduresController.prototype, "findOne", null);
exports.ProceduresController = ProceduresController = __decorate([
    (0, swagger_1.ApiTags)('Procedures'),
    (0, common_1.Controller)('procedures'),
    __metadata("design:paramtypes", [procedures_service_1.ProceduresService])
], ProceduresController);
let AdminProceduresController = class AdminProceduresController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(categorieId) { return this.service.findAll(categorieId); }
    findOne(id) { return this.service.findOne(id); }
    create(dto) { return this.service.create(dto); }
    update(id, dto) { return this.service.update(id, dto); }
    publish(id) { return this.service.publish(id); }
    remove(id) { return this.service.remove(id); }
};
exports.AdminProceduresController = AdminProceduresController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('categorieId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminProceduresController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminProceduresController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_procedure_dto_1.CreateProcedureDto]),
    __metadata("design:returntype", void 0)
], AdminProceduresController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_procedure_dto_1.UpdateProcedureDto]),
    __metadata("design:returntype", void 0)
], AdminProceduresController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminProceduresController.prototype, "publish", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminProceduresController.prototype, "remove", null);
exports.AdminProceduresController = AdminProceduresController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Procedures'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin', 'super-admin'),
    (0, common_1.Controller)('admin/procedures'),
    __metadata("design:paramtypes", [procedures_service_1.ProceduresService])
], AdminProceduresController);
//# sourceMappingURL=procedures.controller.js.map
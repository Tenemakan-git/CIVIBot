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
exports.ServiceDirectoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../modules/auth/guards/jwt.guard");
const service_directory_service_1 = require("./service-directory.service");
let ServiceDirectoryController = class ServiceDirectoryController {
    directory;
    constructor(directory) {
        this.directory = directory;
    }
    find(domaine, type, lat, lng, limit) {
        return this.directory.find({
            domaine: domaine || undefined,
            type: type || undefined,
            lat: lat !== undefined ? Number(lat) : undefined,
            lng: lng !== undefined ? Number(lng) : undefined,
            limit: limit !== undefined ? Number(limit) : undefined,
        });
    }
};
exports.ServiceDirectoryController = ServiceDirectoryController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('domaine')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('lat')),
    __param(3, (0, common_1.Query)('lng')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ServiceDirectoryController.prototype, "find", null);
exports.ServiceDirectoryController = ServiceDirectoryController = __decorate([
    (0, swagger_1.ApiTags)('Services'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('services'),
    __metadata("design:paramtypes", [service_directory_service_1.ServiceDirectoryService])
], ServiceDirectoryController);
//# sourceMappingURL=service-directory.controller.js.map
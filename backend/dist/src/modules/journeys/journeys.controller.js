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
exports.JourneysController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const journeys_service_1 = require("./journeys.service");
const answer_question_dto_1 = require("./dto/answer-question.dto");
let JourneysController = class JourneysController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll(user) { return this.service.findAll(user.id); }
    questionnaire() { return this.service.questionnaire(); }
    create(user) { return this.service.create(user.id); }
    findOne(id, user) { return this.service.findOne(id, user.id); }
    addAnswer(id, user, dto) {
        return this.service.addAnswer(id, user.id, dto);
    }
    complete(id, user) {
        return this.service.complete(id, user.id);
    }
};
exports.JourneysController = JourneysController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JourneysController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('questionnaire'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], JourneysController.prototype, "questionnaire", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JourneysController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JourneysController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/answers'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, answer_question_dto_1.AnswerQuestionDto]),
    __metadata("design:returntype", void 0)
], JourneysController.prototype, "addAnswer", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JourneysController.prototype, "complete", null);
exports.JourneysController = JourneysController = __decorate([
    (0, swagger_1.ApiTags)('Journeys'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('journeys'),
    __metadata("design:paramtypes", [journeys_service_1.JourneysService])
], JourneysController);
//# sourceMappingURL=journeys.controller.js.map
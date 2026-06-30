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
exports.ConversationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../../modules/auth/guards/jwt.guard");
const current_user_decorator_1 = require("../../modules/auth/decorators/current-user.decorator");
const handle_message_dto_1 = require("../../orchestration/dto/handle-message.dto");
const conversation_agent_1 = require("./conversation.agent");
let ConversationController = class ConversationController {
    agent;
    constructor(agent) {
        this.agent = agent;
    }
    async message(user, dto, res) {
        await this.agent.handle({
            userId: user.id,
            message: dto.message,
            conversationId: dto.conversationId,
            folderId: dto.folderId,
            lat: dto.lat,
            lng: dto.lng,
        }, res);
    }
};
exports.ConversationController = ConversationController;
__decorate([
    (0, common_1.Post)('messages'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, handle_message_dto_1.HandleMessageDto, Object]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "message", null);
exports.ConversationController = ConversationController = __decorate([
    (0, swagger_1.ApiTags)('Agent'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('agent'),
    __metadata("design:paramtypes", [conversation_agent_1.ConversationAgent])
], ConversationController);
//# sourceMappingURL=conversation.controller.js.map
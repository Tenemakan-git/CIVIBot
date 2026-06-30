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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MessagesService = class MessagesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(conversationId, userId) {
        const conv = await this.prisma.conversation.findFirst({ where: { id: conversationId, userId } });
        if (!conv)
            throw new common_1.ForbiddenException();
        return this.prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' } });
    }
    async saveUserMessage(conversationId, contenu, userId) {
        const conv = await this.prisma.conversation.findFirst({ where: { id: conversationId, userId } });
        if (!conv)
            throw new common_1.ForbiddenException();
        return this.prisma.message.create({
            data: { conversationId, sender: 'USER', contenu },
        });
    }
    async getLastUserMessage(conversationId, userId) {
        const conv = await this.prisma.conversation.findFirst({ where: { id: conversationId, userId } });
        if (!conv)
            throw new common_1.ForbiddenException();
        const msg = await this.prisma.message.findFirst({
            where: { conversationId, sender: 'USER' },
            orderBy: { createdAt: 'desc' },
        });
        if (!msg)
            throw new common_1.NotFoundException('Aucun message utilisateur');
        return msg;
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map
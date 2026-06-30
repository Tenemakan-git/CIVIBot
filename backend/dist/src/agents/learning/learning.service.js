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
exports.LearningService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let LearningService = class LearningService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async record(input) {
        const cle = input.cle.slice(0, 200);
        await this.prisma.learningInsight.upsert({
            where: { type_cle: { type: input.type, cle } },
            create: {
                type: input.type,
                cle,
                domaine: input.domaine ?? null,
                recommandation: input.recommandation ?? null,
            },
            update: {
                count: { increment: 1 },
                recommandation: input.recommandation ?? undefined,
            },
        });
    }
    async topInsights(limit = 50) {
        return this.prisma.learningInsight.findMany({
            orderBy: [{ count: 'desc' }, { lastSeen: 'desc' }],
            take: limit,
            select: {
                type: true,
                cle: true,
                domaine: true,
                count: true,
                recommandation: true,
                lastSeen: true,
            },
        });
    }
};
exports.LearningService = LearningService;
exports.LearningService = LearningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LearningService);
//# sourceMappingURL=learning.service.js.map
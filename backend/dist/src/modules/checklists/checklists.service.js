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
exports.ChecklistsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const required_docs_checklist_service_1 = require("../../folders/application/required-docs-checklist.service");
let ChecklistsService = class ChecklistsService {
    prisma;
    requiredDocs;
    constructor(prisma, requiredDocs) {
        this.prisma = prisma;
        this.requiredDocs = requiredDocs;
    }
    findAll(userId) {
        return this.prisma.checklist.findMany({
            where: { userId },
            include: { items: { orderBy: { ordre: 'asc' } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    findOne(id, userId) {
        return this.prisma.checklist.findFirst({
            where: { id, userId },
            include: { items: { orderBy: { ordre: 'asc' } } },
        });
    }
    async create(userId, titre, items) {
        return this.prisma.checklist.create({
            data: {
                userId,
                titre,
                items: {
                    create: items.map((texte, ordre) => ({ texte, ordre })),
                },
            },
            include: { items: true },
        });
    }
    async toggleItem(checklistId, itemId, userId, coche) {
        const checklist = await this.prisma.checklist.findFirst({ where: { id: checklistId, userId } });
        if (!checklist)
            throw new common_1.NotFoundException();
        const item = await this.prisma.checklistItem.findFirst({ where: { id: itemId, checklistId } });
        if (!item)
            throw new common_1.NotFoundException();
        if (item.folderDocumentId) {
            await this.requiredDocs.setDocProvided(item.folderDocumentId, coche);
            return { ...item, coche };
        }
        return this.prisma.checklistItem.update({ where: { id: itemId }, data: { coche } });
    }
    async remove(id, userId) {
        await this.prisma.checklist.findFirstOrThrow({ where: { id, userId } });
        return this.prisma.checklist.delete({ where: { id } });
    }
};
exports.ChecklistsService = ChecklistsService;
exports.ChecklistsService = ChecklistsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        required_docs_checklist_service_1.RequiredDocsChecklistService])
], ChecklistsService);
//# sourceMappingURL=checklists.service.js.map
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
exports.ProceduresService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ProceduresService = class ProceduresService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(categorieId) {
        return this.prisma.procedure.findMany({
            where: categorieId ? { categorieId } : undefined,
            include: {
                categorie: { include: { domaine: true } },
                steps: { orderBy: { ordre: 'asc' } },
                documents: true,
                faqs: true,
                sources: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    findPublished(categorieId) {
        return this.prisma.procedure.findMany({
            where: { actif: true, ...(categorieId ? { categorieId } : {}) },
            include: {
                categorie: { include: { domaine: true } },
                steps: { orderBy: { ordre: 'asc' } },
                documents: true,
                faqs: true,
                sources: true,
            },
        });
    }
    async findOne(id) {
        const proc = await this.prisma.procedure.findUnique({
            where: { id },
            include: {
                categorie: { include: { domaine: true } },
                steps: { orderBy: { ordre: 'asc' } },
                documents: true,
                faqs: true,
                sources: true,
            },
        });
        if (!proc)
            throw new common_1.NotFoundException('Procédure non trouvée');
        return proc;
    }
    create(dto) {
        return this.prisma.procedure.create({ data: dto });
    }
    update(id, dto) {
        return this.prisma.procedure.update({ where: { id }, data: dto });
    }
    publish(id) {
        return this.prisma.procedure.update({ where: { id }, data: { actif: true } });
    }
    remove(id) {
        return this.prisma.procedure.delete({ where: { id } });
    }
};
exports.ProceduresService = ProceduresService;
exports.ProceduresService = ProceduresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProceduresService);
//# sourceMappingURL=procedures.service.js.map
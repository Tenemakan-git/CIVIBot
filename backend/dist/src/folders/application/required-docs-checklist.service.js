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
var RequiredDocsChecklistService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequiredDocsChecklistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const folder_service_1 = require("./folder.service");
let RequiredDocsChecklistService = class RequiredDocsChecklistService {
    static { RequiredDocsChecklistService_1 = this; }
    prisma;
    folders;
    static TITLE = 'Documents à fournir';
    constructor(prisma, folders) {
        this.prisma = prisma;
        this.folders = folders;
    }
    async sync(folderId) {
        const folder = await this.prisma.administrativeFolder.findUnique({
            where: { id: folderId },
            select: { userId: true },
        });
        if (!folder)
            return;
        const docs = await this.prisma.folderDocument.findMany({
            where: { folderId },
            orderBy: { createdAt: 'asc' },
        });
        if (docs.length === 0)
            return;
        let checklist = await this.prisma.checklist.findFirst({
            where: { folderId, titre: RequiredDocsChecklistService_1.TITLE },
        });
        if (!checklist) {
            checklist = await this.prisma.checklist.create({
                data: {
                    userId: folder.userId,
                    folderId,
                    titre: RequiredDocsChecklistService_1.TITLE,
                },
            });
        }
        await this.prisma.checklistItem.deleteMany({
            where: { checklistId: checklist.id },
        });
        await this.prisma.checklistItem.createMany({
            data: docs.map((d, i) => ({
                checklistId: checklist.id,
                texte: d.obligatoire ? d.nom : `${d.nom} (optionnel)`,
                coche: d.statut === 'fourni',
                ordre: i,
                folderDocumentId: d.id,
            })),
        });
    }
    async setDocProvided(folderDocumentId, fourni) {
        const doc = await this.prisma.folderDocument.findUnique({
            where: { id: folderDocumentId },
        });
        if (!doc)
            return;
        await this.prisma.folderDocument.update({
            where: { id: folderDocumentId },
            data: { statut: fourni ? 'fourni' : 'manquant' },
        });
        await this.prisma.checklistItem.updateMany({
            where: { folderDocumentId },
            data: { coche: fourni },
        });
        await this.folders.recomputeProgress(doc.folderId);
    }
};
exports.RequiredDocsChecklistService = RequiredDocsChecklistService;
exports.RequiredDocsChecklistService = RequiredDocsChecklistService = RequiredDocsChecklistService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        folder_service_1.FolderService])
], RequiredDocsChecklistService);
//# sourceMappingURL=required-docs-checklist.service.js.map
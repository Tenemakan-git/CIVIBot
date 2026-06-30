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
exports.PrismaFolderRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const administrative_folder_entity_1 = require("../domain/administrative-folder.entity");
let PrismaFolderRepository = class PrismaFolderRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(folder) {
        const s = folder.toSnapshot();
        const row = await this.prisma.administrativeFolder.create({
            data: {
                id: s.id,
                userId: s.userId,
                domaine: s.domaine,
                procedureSlug: s.procedureSlug,
                titre: s.titre,
                statut: s.statut,
                progression: s.progression,
                conversationId: s.conversationId,
            },
        });
        return administrative_folder_entity_1.AdministrativeFolder.fromSnapshot(this.toSnapshot(row));
    }
    async save(folder) {
        const s = folder.toSnapshot();
        const row = await this.prisma.administrativeFolder.update({
            where: { id: s.id },
            data: {
                domaine: s.domaine,
                procedureSlug: s.procedureSlug,
                titre: s.titre,
                statut: s.statut,
                progression: s.progression,
                conversationId: s.conversationId,
            },
        });
        return administrative_folder_entity_1.AdministrativeFolder.fromSnapshot(this.toSnapshot(row));
    }
    async findById(id) {
        const row = await this.prisma.administrativeFolder.findUnique({
            where: { id },
        });
        return row ? administrative_folder_entity_1.AdministrativeFolder.fromSnapshot(this.toSnapshot(row)) : null;
    }
    async findByUser(userId) {
        const rows = await this.prisma.administrativeFolder.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
        return rows.map((r) => administrative_folder_entity_1.AdministrativeFolder.fromSnapshot(this.toSnapshot(r)));
    }
    async findByConversation(conversationId) {
        const row = await this.prisma.administrativeFolder.findFirst({
            where: { conversationId },
            orderBy: { updatedAt: 'desc' },
        });
        return row ? administrative_folder_entity_1.AdministrativeFolder.fromSnapshot(this.toSnapshot(row)) : null;
    }
    async getView(id) {
        const row = await this.prisma.administrativeFolder.findUnique({
            where: { id },
            include: {
                plan: true,
                documents: true,
                timeline: { orderBy: { createdAt: 'asc' } },
                notifications: { orderBy: { createdAt: 'desc' } },
                sources: true,
                history: { orderBy: { createdAt: 'asc' } },
                pdfs: true,
                checklists: { select: { id: true, titre: true } },
            },
        });
        if (!row)
            return null;
        return {
            ...this.toSnapshot(row),
            plan: row.plan
                ? { steps: row.plan.steps, cout: row.plan.cout, delai: row.plan.delai }
                : null,
            documents: row.documents.map((d) => ({
                id: d.id,
                nom: d.nom,
                statut: d.statut,
                obligatoire: d.obligatoire,
                userDocumentId: d.userDocumentId,
            })),
            timeline: row.timeline.map((t) => ({
                type: t.type,
                label: t.label,
                payload: t.payload,
            })),
            notifications: row.notifications.map((n) => ({
                type: n.type,
                message: n.message,
                lu: n.lu,
                createdAt: n.createdAt,
            })),
            sources: row.sources.map((s) => ({
                organisme: s.organisme,
                url: s.url,
                titre: s.titre,
            })),
            history: row.history.map((h) => ({
                action: h.action,
                acteur: h.acteur,
                payload: h.payload,
            })),
            pdfs: row.pdfs.map((p) => ({
                storageKey: p.storageKey,
                filename: p.filename,
                bytes: p.bytes,
            })),
            checklists: row.checklists,
        };
    }
    async upsertPlan(folderId, plan) {
        const steps = plan.steps;
        await this.prisma.folderPlan.upsert({
            where: { folderId },
            create: {
                folderId,
                steps,
                cout: plan.cout ?? null,
                delai: plan.delai ?? null,
            },
            update: { steps, cout: plan.cout ?? null, delai: plan.delai ?? null },
        });
    }
    async addDocuments(folderId, docs) {
        if (docs.length === 0)
            return;
        await this.prisma.folderDocument.createMany({
            data: docs.map((d) => ({
                folderId,
                nom: d.nom,
                statut: d.statut ?? 'manquant',
                obligatoire: d.obligatoire ?? true,
                userDocumentId: d.userDocumentId ?? null,
            })),
        });
    }
    async addTimeline(folderId, entry) {
        await this.prisma.timelineEvent.create({
            data: {
                folderId,
                type: entry.type,
                label: entry.label,
                payload: (entry.payload ?? null),
            },
        });
    }
    async addNotification(folderId, n) {
        await this.prisma.folderNotification.create({
            data: { folderId, type: n.type, message: n.message },
        });
    }
    async addSources(folderId, sources) {
        if (sources.length === 0)
            return;
        await this.prisma.folderSource.createMany({
            data: sources.map((s) => ({
                folderId,
                organisme: s.organisme,
                url: s.url ?? null,
                titre: s.titre ?? null,
            })),
        });
    }
    async addHistory(folderId, h) {
        await this.prisma.folderHistory.create({
            data: {
                folderId,
                action: h.action,
                acteur: h.acteur,
                payload: (h.payload ?? null),
            },
        });
    }
    async addPdf(folderId, pdf) {
        await this.prisma.folderPdf.create({
            data: {
                folderId,
                storageKey: pdf.storageKey,
                filename: pdf.filename,
                bytes: pdf.bytes,
            },
        });
    }
    async listNotificationsForUser(userId) {
        const rows = await this.prisma.folderNotification.findMany({
            where: { folder: { userId } },
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: { folder: { select: { titre: true } } },
        });
        return rows.map((n) => ({
            id: n.id,
            folderId: n.folderId,
            folderTitre: n.folder.titre,
            type: n.type,
            message: n.message,
            lu: n.lu,
            createdAt: n.createdAt,
        }));
    }
    async markNotificationRead(id, userId) {
        await this.prisma.folderNotification.updateMany({
            where: { id, folder: { userId } },
            data: { lu: true },
        });
    }
    async markAllNotificationsRead(userId) {
        await this.prisma.folderNotification.updateMany({
            where: { folder: { userId }, lu: false },
            data: { lu: true },
        });
    }
    toSnapshot(row) {
        return {
            id: row.id,
            userId: row.userId,
            domaine: row.domaine,
            procedureSlug: row.procedureSlug,
            titre: row.titre,
            statut: row.statut,
            progression: row.progression,
            conversationId: row.conversationId,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }
};
exports.PrismaFolderRepository = PrismaFolderRepository;
exports.PrismaFolderRepository = PrismaFolderRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaFolderRepository);
//# sourceMappingURL=prisma-folder.repository.js.map
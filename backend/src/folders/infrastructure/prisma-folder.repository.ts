import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AdministrativeFolder,
  FolderSnapshot,
} from '../domain/administrative-folder.entity';
import {
  FolderDocumentInput,
  FolderView,
  HistoryInput,
  IFolderRepository,
  NotificationInput,
  PdfInput,
  PlanInput,
  SourceInput,
  TimelineInput,
  UserNotificationView,
} from '../domain/folder.repository.port';
import { Prisma } from '@prisma/client';

/** Adapter Prisma du port IFolderRepository. */
@Injectable()
export class PrismaFolderRepository implements IFolderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(folder: AdministrativeFolder): Promise<AdministrativeFolder> {
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
    return AdministrativeFolder.fromSnapshot(this.toSnapshot(row));
  }

  async save(folder: AdministrativeFolder): Promise<AdministrativeFolder> {
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
    return AdministrativeFolder.fromSnapshot(this.toSnapshot(row));
  }

  async findById(id: string): Promise<AdministrativeFolder | null> {
    const row = await this.prisma.administrativeFolder.findUnique({
      where: { id },
    });
    return row ? AdministrativeFolder.fromSnapshot(this.toSnapshot(row)) : null;
  }

  async findByUser(userId: string): Promise<AdministrativeFolder[]> {
    const rows = await this.prisma.administrativeFolder.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((r) => AdministrativeFolder.fromSnapshot(this.toSnapshot(r)));
  }

  async findByConversation(
    conversationId: string,
  ): Promise<AdministrativeFolder | null> {
    const row = await this.prisma.administrativeFolder.findFirst({
      where: { conversationId },
      orderBy: { updatedAt: 'desc' },
    });
    return row ? AdministrativeFolder.fromSnapshot(this.toSnapshot(row)) : null;
  }

  async getView(id: string): Promise<FolderView | null> {
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
    if (!row) return null;

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

  // ── Collections ──
  async upsertPlan(folderId: string, plan: PlanInput): Promise<void> {
    const steps = plan.steps as Prisma.InputJsonValue;
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

  async addDocuments(
    folderId: string,
    docs: FolderDocumentInput[],
  ): Promise<void> {
    if (docs.length === 0) return;
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

  async addTimeline(folderId: string, entry: TimelineInput): Promise<void> {
    await this.prisma.timelineEvent.create({
      data: {
        folderId,
        type: entry.type,
        label: entry.label,
        payload: (entry.payload ?? null) as Prisma.InputJsonValue,
      },
    });
  }

  async addNotification(
    folderId: string,
    n: NotificationInput,
  ): Promise<void> {
    await this.prisma.folderNotification.create({
      data: { folderId, type: n.type, message: n.message },
    });
  }

  async addSources(folderId: string, sources: SourceInput[]): Promise<void> {
    if (sources.length === 0) return;
    await this.prisma.folderSource.createMany({
      data: sources.map((s) => ({
        folderId,
        organisme: s.organisme,
        url: s.url ?? null,
        titre: s.titre ?? null,
      })),
    });
  }

  async addHistory(folderId: string, h: HistoryInput): Promise<void> {
    await this.prisma.folderHistory.create({
      data: {
        folderId,
        action: h.action,
        acteur: h.acteur,
        payload: (h.payload ?? null) as Prisma.InputJsonValue,
      },
    });
  }

  async addPdf(folderId: string, pdf: PdfInput): Promise<void> {
    await this.prisma.folderPdf.create({
      data: {
        folderId,
        storageKey: pdf.storageKey,
        filename: pdf.filename,
        bytes: pdf.bytes,
      },
    });
  }

  // ── Notifications agrégées ──
  async listNotificationsForUser(
    userId: string,
  ): Promise<UserNotificationView[]> {
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

  async markNotificationRead(id: string, userId: string): Promise<void> {
    // updateMany + filtre sur l'owner : ne touche rien si le dossier n'est pas à l'utilisateur.
    await this.prisma.folderNotification.updateMany({
      where: { id, folder: { userId } },
      data: { lu: true },
    });
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await this.prisma.folderNotification.updateMany({
      where: { folder: { userId }, lu: false },
      data: { lu: true },
    });
  }

  // ── Mapping ──
  private toSnapshot(row: {
    id: string;
    userId: string;
    domaine: string;
    procedureSlug: string | null;
    titre: string;
    statut: string;
    progression: number;
    conversationId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): FolderSnapshot {
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
}

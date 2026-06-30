import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Domain } from '../../core/agent/domain.enum';
import { AdministrativeFolder } from '../domain/administrative-folder.entity';
import { FOLDER_REPOSITORY } from '../domain/folder.repository.port';
import type {
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
import {
  FolderCompletedEvent,
  FolderCreatedEvent,
  FolderEventPayload,
  FolderUpdatedEvent,
} from '../domain/events/folder.events';
import { FolderStatus } from '../domain/folder-status.vo';

export interface CreateFolderInput {
  userId: string;
  domaine: Domain;
  titre: string;
  procedureSlug?: string | null;
  conversationId?: string | null;
}

/**
 * Use-cases du bounded context "AdministrativeFolder".
 * Seul point d'accès au dossier — aucune logique métier dans le controller.
 */
@Injectable()
export class FolderService {
  constructor(
    @Inject(FOLDER_REPOSITORY) private readonly repo: IFolderRepository,
    private readonly events: EventEmitter2,
  ) {}

  async createFolder(input: CreateFolderInput): Promise<AdministrativeFolder> {
    const folder = AdministrativeFolder.create(input);
    const saved = await this.repo.create(folder);
    await this.repo.addHistory(saved.id, {
      action: 'dossier_cree',
      acteur: 'system',
      payload: { domaine: saved.domaine },
    });
    await this.repo.addTimeline(saved.id, {
      type: 'status_change',
      label: 'Dossier créé',
    });
    this.events.emit(
      new FolderCreatedEvent(this.payload(saved)).name,
      new FolderCreatedEvent(this.payload(saved)),
    );
    return saved;
  }

  async getView(id: string, userId: string): Promise<FolderView> {
    const view = await this.repo.getView(id);
    if (!view) throw new NotFoundException('Dossier introuvable');
    if (view.userId !== userId) throw new ForbiddenException();
    return view;
  }

  async listForUser(userId: string): Promise<AdministrativeFolder[]> {
    return this.repo.findByUser(userId);
  }

  findByConversation(conversationId: string): Promise<AdministrativeFolder | null> {
    return this.repo.findByConversation(conversationId);
  }

  // ── Notifications (centre de notifications, agrégé tous dossiers) ──
  listNotifications(userId: string): Promise<UserNotificationView[]> {
    return this.repo.listNotificationsForUser(userId);
  }

  markNotificationRead(id: string, userId: string): Promise<void> {
    return this.repo.markNotificationRead(id, userId);
  }

  markAllNotificationsRead(userId: string): Promise<void> {
    return this.repo.markAllNotificationsRead(userId);
  }

  private async requireOwned(
    id: string,
    userId: string,
  ): Promise<AdministrativeFolder> {
    const folder = await this.repo.findById(id);
    if (!folder) throw new NotFoundException('Dossier introuvable');
    if (folder.userId !== userId) throw new ForbiddenException();
    return folder;
  }

  // ── Mutations exposées (API) ──
  async rename(id: string, userId: string, titre: string): Promise<void> {
    const folder = await this.requireOwned(id, userId);
    folder.rename(titre);
    await this.repo.save(folder);
    await this.emitUpdated(folder);
  }

  async setProgress(
    id: string,
    userId: string | null,
    value: number,
  ): Promise<AdministrativeFolder> {
    const folder = userId
      ? await this.requireOwned(id, userId)
      : await this.mustFind(id);
    folder.updateProgress(value);
    const saved = await this.repo.save(folder);
    await this.emitUpdated(saved);
    if (saved.statut === FolderStatus.Complet) {
      this.events.emit(
        new FolderCompletedEvent(this.payload(saved)).name,
        new FolderCompletedEvent(this.payload(saved)),
      );
    }
    return saved;
  }

  async terminate(id: string, userId: string): Promise<void> {
    const folder = await this.requireOwned(id, userId);
    folder.terminate();
    await this.repo.save(folder);
    await this.emitUpdated(folder);
  }

  // ── Opérations internes (utilisées par le FolderAgent) ──
  async attachConversation(id: string, conversationId: string): Promise<void> {
    const folder = await this.mustFind(id);
    folder.attachConversation(conversationId);
    await this.repo.save(folder);
  }

  async setProcedure(id: string, slug: string): Promise<void> {
    const folder = await this.mustFind(id);
    folder.setProcedure(slug);
    await this.repo.save(folder);
  }

  recordPlan(id: string, plan: PlanInput): Promise<void> {
    return this.repo.upsertPlan(id, plan);
  }
  recordDocuments(id: string, docs: FolderDocumentInput[]): Promise<void> {
    return this.repo.addDocuments(id, docs);
  }
  recordSources(id: string, sources: SourceInput[]): Promise<void> {
    return this.repo.addSources(id, sources);
  }
  recordTimeline(id: string, entry: TimelineInput): Promise<void> {
    return this.repo.addTimeline(id, entry);
  }
  recordHistory(id: string, h: HistoryInput): Promise<void> {
    return this.repo.addHistory(id, h);
  }
  recordNotification(id: string, n: NotificationInput): Promise<void> {
    return this.repo.addNotification(id, n);
  }
  recordPdf(id: string, pdf: PdfInput): Promise<void> {
    return this.repo.addPdf(id, pdf);
  }

  /** Recalcule la progression à partir des documents fournis (heuristique v1). */
  async recomputeProgress(id: string): Promise<AdministrativeFolder> {
    const view = await this.repo.getView(id);
    if (!view) throw new NotFoundException('Dossier introuvable');
    const total = view.documents.length;
    const done = view.documents.filter((d) => d.statut === 'fourni').length;
    const value = total > 0 ? (done / total) * 100 : 0;
    return this.setProgress(id, null, value);
  }

  // ── Helpers ──
  private async mustFind(id: string): Promise<AdministrativeFolder> {
    const folder = await this.repo.findById(id);
    if (!folder) throw new NotFoundException('Dossier introuvable');
    return folder;
  }

  private async emitUpdated(folder: AdministrativeFolder): Promise<void> {
    await this.repo.addTimeline(folder.id, {
      type: 'status_change',
      label: `Statut: ${folder.statut} — ${folder.progression}%`,
    });
    const evt = new FolderUpdatedEvent(this.payload(folder));
    this.events.emit(evt.name, evt);
  }

  private payload(folder: AdministrativeFolder): FolderEventPayload {
    return {
      folderId: folder.id,
      userId: folder.userId,
      domaine: folder.domaine,
      statut: folder.statut,
      progression: folder.progression,
      procedureSlug: folder.procedureSlug,
      titre: folder.titre,
      createdAt: folder.createdAt,
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from '../../core/events/event-names';
import { FolderService } from '../../folders/application/folder.service';
import type { FolderEventPayload } from '../../folders/domain/events/folder.events';
import { PrismaService } from '../../prisma/prisma.service';
import { ProgressReportDto } from '../monitoring/dto/progress-report.dto';

/**
 * Notification Agent (réactif) — produit les notifications IN-APP en réaction
 * aux événements du système. Déduplique les notifications « persistantes »
 * (retard, rappel, terminé) pour éviter le spam.
 */
@Injectable()
export class NotificationAgent {
  private readonly logger = new Logger(NotificationAgent.name);

  constructor(
    private readonly folders: FolderService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(Events.Monitoring.ProgressComputed)
  async onProgress(report: ProgressReportDto): Promise<void> {
    if (report.late) {
      await this.notifyOnce(
        report.folderId,
        'retard',
        `Votre dossier est en attente depuis ${report.ageDays} jours (${report.progress}%). Pensez à le compléter.`,
      );
    }
  }

  @OnEvent(Events.Folder.Completed)
  async onCompleted(payload: FolderEventPayload): Promise<void> {
    await this.notifyOnce(
      payload.folderId,
      'termine',
      'Félicitations, votre dossier est complet. Vous pouvez déposer votre demande.',
    );
  }

  @OnEvent(Events.Verification.Completed)
  async onVerification(payload: {
    folderId: string;
    status: string;
    missing: string[];
  }): Promise<void> {
    if (payload.status === 'incomplet' && payload.missing?.length) {
      await this.notifyOnce(
        payload.folderId,
        'rappel',
        `Pièces manquantes : ${payload.missing.join(', ')}.`,
      );
    }
  }

  @OnEvent(Events.Knowledge.Committed)
  async onKnowledgeCommitted(payload: {
    folderId: string;
    documents: number;
  }): Promise<void> {
    // Nouvelle information : notification systématique (événement ponctuel).
    if (!payload.folderId) return;
    await this.send(
      payload.folderId,
      'nouvelle_info',
      `De nouvelles informations officielles ont été ajoutées (${payload.documents} document(s)).`,
    );
  }

  // ── Helpers ──
  private async notifyOnce(
    folderId: string,
    type: string,
    message: string,
  ): Promise<void> {
    const existing = await this.prisma.folderNotification.findFirst({
      where: { folderId, type, lu: false },
    });
    if (existing) return;
    await this.send(folderId, type, message);
  }

  private async send(
    folderId: string,
    type: string,
    message: string,
  ): Promise<void> {
    try {
      await this.folders.recordNotification(folderId, { type, message });
    } catch (err) {
      this.logger.warn(
        `Notification non enregistrée (${type}): ${(err as Error).message}`,
      );
    }
  }
}

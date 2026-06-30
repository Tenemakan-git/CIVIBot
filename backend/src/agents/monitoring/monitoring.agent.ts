import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Events } from '../../core/events/event-names';
import { FolderService } from '../../folders/application/folder.service';
import type { FolderEventPayload } from '../../folders/domain/events/folder.events';
import { IMonitoringAgent } from './contracts/monitoring.contract';
import { ProgressReportDto } from './dto/progress-report.dto';

/** Seuil (jours) au-delà duquel un dossier non terminé est jugé en retard. */
const LATE_AFTER_DAYS = 14;

/**
 * Monitoring Agent (réactif) — suit l'avancement, détecte les retards et
 * diffuse `monitoring.progress` (consommé par le Notification Agent). Ne mute
 * jamais la progression (évite toute boucle d'événements).
 */
@Injectable()
export class MonitoringAgent implements IMonitoringAgent {
  private readonly logger = new Logger(MonitoringAgent.name);

  constructor(
    private readonly folders: FolderService,
    private readonly events: EventEmitter2,
  ) {}

  @OnEvent(Events.Folder.Created)
  @OnEvent(Events.Folder.Updated)
  async onFolderChanged(payload: FolderEventPayload): Promise<void> {
    const ageDays = payload.createdAt
      ? (Date.now() - new Date(payload.createdAt).getTime()) / 86_400_000
      : 0;
    const late = payload.progression < 100 && ageDays > LATE_AFTER_DAYS;

    if (late) {
      await this.folders
        .recordTimeline(payload.folderId, {
          type: 'monitoring',
          label: `Retard détecté (${Math.round(ageDays)} jours, ${payload.progression}%)`,
        })
        .catch((e) => this.logger.warn(e.message));
    }

    const report: ProgressReportDto = {
      folderId: payload.folderId,
      userId: payload.userId,
      progress: payload.progression,
      late,
      ageDays: Math.round(ageDays),
    };
    this.events.emit(Events.Monitoring.ProgressComputed, report);
  }
}

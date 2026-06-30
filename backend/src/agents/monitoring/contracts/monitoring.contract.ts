import { FolderEventPayload } from '../../../folders/domain/events/folder.events';

/**
 * Contrat du Monitoring Agent. Agent RÉACTIF : il n'est pas orchestré (pas de
 * `execute(ctx)`) mais réagit aux événements du dossier pour calculer la
 * progression, détecter les retards et déclencher les notifications.
 */
export interface IMonitoringAgent {
  onFolderChanged(payload: FolderEventPayload): Promise<void>;
}

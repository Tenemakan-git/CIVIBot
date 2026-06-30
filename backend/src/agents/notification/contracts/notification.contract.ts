/**
 * Contrat du Notification Agent. Agent RÉACTIF : envoie les notifications
 * in-app (rappels, retard, dossier terminé, nouvelles informations) en réaction
 * aux événements. L'interface `INotificationChannel` permettra d'ajouter
 * email/SMS sans refonte.
 */
export interface INotificationChannel {
  send(folderId: string, type: string, message: string): Promise<void>;
}

export interface INotificationChannel {
    send(folderId: string, type: string, message: string): Promise<void>;
}

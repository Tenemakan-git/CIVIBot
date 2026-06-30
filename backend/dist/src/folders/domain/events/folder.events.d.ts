import { DomainEvent } from '../../../core/events/domain-event';
export interface FolderEventPayload {
    folderId: string;
    userId: string;
    domaine: string;
    statut: string;
    progression: number;
    procedureSlug?: string | null;
    titre?: string;
    createdAt?: Date;
}
export declare class FolderCreatedEvent extends DomainEvent<FolderEventPayload> {
    readonly name: "folder.created";
}
export declare class FolderUpdatedEvent extends DomainEvent<FolderEventPayload> {
    readonly name: "folder.updated";
}
export declare class FolderCompletedEvent extends DomainEvent<FolderEventPayload> {
    readonly name: "folder.completed";
}

import { DomainEvent } from '../../../core/events/domain-event';
import { Events } from '../../../core/events/event-names';

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

export class FolderCreatedEvent extends DomainEvent<FolderEventPayload> {
  readonly name = Events.Folder.Created;
}

export class FolderUpdatedEvent extends DomainEvent<FolderEventPayload> {
  readonly name = Events.Folder.Updated;
}

export class FolderCompletedEvent extends DomainEvent<FolderEventPayload> {
  readonly name = Events.Folder.Completed;
}

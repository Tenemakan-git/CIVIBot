import { api } from './api';

export interface FolderSummary {
  id: string;
  userId: string;
  domaine: string;
  procedureSlug: string | null;
  titre: string;
  statut: string;
  progression: number;
  conversationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderDocument {
  id: string;
  nom: string;
  statut: string;
  obligatoire: boolean;
  userDocumentId: string | null;
}
export interface FolderTimelineEntry {
  type: string;
  label: string;
  payload: unknown;
}
export interface FolderSourceRef {
  organisme: string;
  url: string | null;
  titre: string | null;
}
export interface FolderInlineNotification {
  type: string;
  message: string;
  lu: boolean;
  createdAt: string;
}

export interface FolderDetail extends FolderSummary {
  plan: { steps: unknown; cout: string | null; delai: string | null } | null;
  documents: FolderDocument[];
  timeline: FolderTimelineEntry[];
  notifications: FolderInlineNotification[];
  sources: FolderSourceRef[];
  history: { action: string; acteur: string; payload: unknown }[];
  pdfs: { storageKey: string; filename: string; bytes: number }[];
  checklists: { id: string; titre: string }[];
}

export interface UserNotification {
  id: string;
  folderId: string;
  folderTitre: string;
  type: string;
  message: string;
  lu: boolean;
  createdAt: string;
}

export const folderService = {
  list: (): Promise<FolderSummary[]> => api.get('/folders').then((r) => r.data),
  get: (id: string): Promise<FolderDetail> =>
    api.get(`/folders/${id}`).then((r) => r.data),
  rename: (id: string, titre: string) =>
    api.patch(`/folders/${id}/rename`, { titre }).then((r) => r.data),
  setProgress: (id: string, progression: number) =>
    api.patch(`/folders/${id}/progress`, { progression }).then((r) => r.data),
  setDocument: (id: string, docId: string, fourni: boolean): Promise<FolderDetail> =>
    api.patch(`/folders/${id}/documents/${docId}`, { fourni }).then((r) => r.data),
  terminate: (id: string) =>
    api.patch(`/folders/${id}/terminate`).then((r) => r.data),

  // Centre de notifications (agrégé tous dossiers)
  notifications: (): Promise<UserNotification[]> =>
    api.get('/folders/notifications').then((r) => r.data),
  markRead: (id: string) =>
    api.patch(`/folders/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () =>
    api.patch('/folders/notifications/read-all').then((r) => r.data),
};

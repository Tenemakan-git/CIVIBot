import { AdministrativeFolder, FolderSnapshot } from './administrative-folder.entity';

/** Token DI du repository (implémenté en infrastructure par Prisma). */
export const FOLDER_REPOSITORY = Symbol('FOLDER_REPOSITORY');

// ── Entrées d'écriture des collections de l'agrégat ──
export interface PlanInput {
  steps: unknown; // PlanDto.steps (Json)
  cout?: string | null;
  delai?: string | null;
}
export interface FolderDocumentInput {
  id?: string;
  nom: string;
  statut?: string;
  obligatoire?: boolean;
  userDocumentId?: string | null;
}
export interface TimelineInput {
  type: string;
  label: string;
  payload?: unknown;
}
export interface NotificationInput {
  type: string;
  message: string;
}
export interface SourceInput {
  organisme: string;
  url?: string | null;
  titre?: string | null;
}
export interface HistoryInput {
  action: string;
  acteur: string;
  payload?: unknown;
}
export interface PdfInput {
  storageKey: string;
  filename: string;
  bytes: number;
}

/** Read model agrégé pour la vue "Dossier" (controller GET, FolderAgent). */
export interface FolderView extends FolderSnapshot {
  plan: { steps: unknown; cout: string | null; delai: string | null } | null;
  documents: FolderDocumentInput[];
  timeline: TimelineInput[];
  notifications: (NotificationInput & { lu: boolean; createdAt: Date })[];
  sources: SourceInput[];
  history: HistoryInput[];
  pdfs: PdfInput[];
  checklists: { id: string; titre: string }[];
}

/** Read model d'une notification, agrégée tous dossiers d'un utilisateur. */
export interface UserNotificationView {
  id: string;
  folderId: string;
  folderTitre: string;
  type: string;
  message: string;
  lu: boolean;
  createdAt: Date;
}

/**
 * Port de persistance de l'agrégat AdministrativeFolder.
 * La couche application ne connaît que cette interface (DIP).
 */
export interface IFolderRepository {
  create(folder: AdministrativeFolder): Promise<AdministrativeFolder>;
  save(folder: AdministrativeFolder): Promise<AdministrativeFolder>;
  findById(id: string): Promise<AdministrativeFolder | null>;
  findByUser(userId: string): Promise<AdministrativeFolder[]>;
  findByConversation(conversationId: string): Promise<AdministrativeFolder | null>;
  getView(id: string): Promise<FolderView | null>;

  // Collections de l'agrégat
  upsertPlan(folderId: string, plan: PlanInput): Promise<void>;
  addDocuments(folderId: string, docs: FolderDocumentInput[]): Promise<void>;
  addTimeline(folderId: string, entry: TimelineInput): Promise<void>;
  addNotification(folderId: string, n: NotificationInput): Promise<void>;
  addSources(folderId: string, sources: SourceInput[]): Promise<void>;
  addHistory(folderId: string, h: HistoryInput): Promise<void>;
  addPdf(folderId: string, pdf: PdfInput): Promise<void>;

  // Notifications (vue agrégée multi-dossiers)
  listNotificationsForUser(userId: string): Promise<UserNotificationView[]>;
  markNotificationRead(id: string, userId: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
}

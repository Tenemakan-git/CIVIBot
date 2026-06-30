/** Sortie du FolderAgent : instantané synthétique du dossier assemblé. */
export class FolderSnapshotDto {
  folderId!: string;
  titre!: string;
  domaine!: string;
  statut!: string;
  progression!: number;
  documentsCount!: number;
  hasPlan!: boolean;
}

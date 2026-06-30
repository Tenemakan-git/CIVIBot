/** Sortie du Monitoring Agent (diffusée via `monitoring.progress`). */
export class ProgressReportDto {
  folderId!: string;
  userId!: string;
  progress!: number;
  late!: boolean;
  ageDays!: number;
}

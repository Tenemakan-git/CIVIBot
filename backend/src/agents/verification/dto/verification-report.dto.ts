/** Sortie du Verification Agent. */
export class VerificationReportDto {
  status!: 'complet' | 'incomplet';
  missing!: string[];
  recommendations!: string[];
}

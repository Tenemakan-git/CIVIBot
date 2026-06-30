/** Sortie du Quality Agent. */
export class QualityVerdictDto {
  passed!: boolean;
  hallucinationRisk!: number; // 0..1
  confidence!: number; // 0..1
  coherence!: number; // 0..1
  sourceQuality!: number; // 0..1
  notes!: string[];
}

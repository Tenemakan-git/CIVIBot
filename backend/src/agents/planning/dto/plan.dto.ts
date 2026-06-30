export interface PlanStepDto {
  ordre: number;
  titre: string;
  description: string;
  dependsOn: number[];
}

/** Sortie du Planning Agent. */
export class PlanDto {
  steps!: PlanStepDto[];
  estimatedDurationDays!: number | null;
  estimatedCost!: string | null;
  dependencies!: string[];
}

export interface PlanStepDto {
    ordre: number;
    titre: string;
    description: string;
    dependsOn: number[];
}
export declare class PlanDto {
    steps: PlanStepDto[];
    estimatedDurationDays: number | null;
    estimatedCost: string | null;
    dependencies: string[];
}

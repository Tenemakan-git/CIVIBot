export interface ValidationScores {
  duplicate: number;
  quality: number;
  coherence: number;
  freshness: number;
}

export interface RejectedCandidate {
  id: string;
  reason: string;
}

/** Sortie du Knowledge Validation Agent. */
export class ValidationVerdictDto {
  acceptedIds!: string[];
  rejected!: RejectedCandidate[];
  scores!: Record<string, ValidationScores>;
}

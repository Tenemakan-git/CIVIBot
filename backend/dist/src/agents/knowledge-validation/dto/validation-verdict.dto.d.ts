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
export declare class ValidationVerdictDto {
    acceptedIds: string[];
    rejected: RejectedCandidate[];
    scores: Record<string, ValidationScores>;
}

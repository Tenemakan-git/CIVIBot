export interface CandidateRef {
    id: string;
    organisme: string;
    sourceUrl: string;
    titre: string;
    contentHash: string;
}
export declare class WebResearchResultDto {
    candidates: CandidateRef[];
}

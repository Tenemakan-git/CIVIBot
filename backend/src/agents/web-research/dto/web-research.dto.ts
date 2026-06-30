export interface CandidateRef {
  id: string;
  organisme: string;
  sourceUrl: string;
  titre: string;
  contentHash: string;
}

/** Sortie du Web Research Agent : candidats mis en staging (jamais insérés). */
export class WebResearchResultDto {
  candidates!: CandidateRef[];
}

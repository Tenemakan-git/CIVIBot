/** Un extrait pertinent récupéré dans la base documentaire. */
export interface KnowledgeChunkDto {
  id: string;
  titre: string;
  texte: string;
  extrait: string;
  score: number;
}

/** Sortie du Knowledge Agent. */
export class KnowledgeAnswerDto {
  /** Contexte assemblé (concaténation des extraits) pour la synthèse finale. */
  context!: string;
  chunks!: KnowledgeChunkDto[];
  /** false => l'Orchestrator déclenchera le sous-pipeline Web Research. */
  sufficient!: boolean;
}

export interface CommittedDocument {
  documentId: string;
  titre: string;
  version: string;
  chunksInserted: number;
}

/** Sortie du Knowledge Manager Agent. */
export class KnowledgeCommitDto {
  documents!: CommittedDocument[];
  totalChunks!: number;
}

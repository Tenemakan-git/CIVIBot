export interface CommittedDocument {
    documentId: string;
    titre: string;
    version: string;
    chunksInserted: number;
}
export declare class KnowledgeCommitDto {
    documents: CommittedDocument[];
    totalChunks: number;
}

export interface KnowledgeChunkDto {
    id: string;
    titre: string;
    texte: string;
    extrait: string;
    score: number;
}
export declare class KnowledgeAnswerDto {
    context: string;
    chunks: KnowledgeChunkDto[];
    sufficient: boolean;
}

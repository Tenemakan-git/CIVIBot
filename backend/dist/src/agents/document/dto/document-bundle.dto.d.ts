export interface BundleDocumentDto {
    nom: string;
    statut: 'fourni' | 'manquant';
}
export declare class DocumentBundleDto {
    resume: string;
    documents: BundleDocumentDto[];
    piecesNecessaires: string[];
}

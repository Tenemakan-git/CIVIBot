export interface PdfStep {
    ordre: number;
    titre: string;
    description: string;
}
export interface PdfDocumentItem {
    nom: string;
    statut: string;
    obligatoire: boolean;
}
export interface PdfChecklist {
    titre: string;
    items: {
        texte: string;
        coche: boolean;
        ordre: number;
    }[];
}
export interface PdfSource {
    organisme: string;
    url?: string | null;
}
export interface PdfFolderModel {
    titre: string;
    domaine: string;
    statut: string;
    progression: number;
    cout?: string | null;
    delai?: string | null;
    steps: PdfStep[];
    documents: PdfDocumentItem[];
    checklists: PdfChecklist[];
    sources: PdfSource[];
    tips: string[];
}
export declare class PdfRenderer {
    render(model: PdfFolderModel): Promise<Buffer>;
    private header;
    private section;
    private steps;
    private documents;
    private checklists;
    private tips;
    private sources;
    private footer;
}

export interface OfficialDocModel {
    titre: string;
    expediteur: {
        nom: string;
        telephone?: string | null;
    };
    destinataire: string;
    lieuDate: string;
    objet: string;
    corps: string;
    signatureLabel: string;
}
export declare class OfficialDocRenderer {
    render(model: OfficialDocModel): Promise<Buffer>;
    private expediteur;
    private destinataire;
    private lieuDate;
    private objet;
    private corps;
    private signature;
    private footer;
}

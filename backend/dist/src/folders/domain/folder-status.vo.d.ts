export declare enum FolderStatus {
    Ouvert = "ouvert",
    EnCours = "en_cours",
    Complet = "complet",
    Termine = "termine"
}
export declare function canTransition(from: FolderStatus, to: FolderStatus): boolean;
export declare function assertValidStatus(value: string): FolderStatus;

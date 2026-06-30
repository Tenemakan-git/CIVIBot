export interface ChecklistItemDto {
    libelle: string;
    obligatoire: boolean;
    termine: boolean;
    ordre: number;
}
export declare class ChecklistDto {
    titre: string;
    items: ChecklistItemDto[];
}

export interface ChecklistItemDto {
  libelle: string;
  obligatoire: boolean;
  termine: boolean;
  ordre: number;
}

/** Sortie du Checklist Agent. */
export class ChecklistDto {
  titre!: string;
  items!: ChecklistItemDto[];
}

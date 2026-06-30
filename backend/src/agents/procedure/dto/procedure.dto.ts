export interface ProcedureStepDto {
  ordre: number;
  titre: string;
  description: string;
}

export interface ProcedureRequiredDocumentDto {
  nom: string;
  obligatoire: boolean;
  remarque?: string;
}

/** Sortie du Procedure Agent (procédure personnalisée). */
export class ProcedureDto {
  titre!: string;
  steps!: ProcedureStepDto[];
  requiredDocuments!: ProcedureRequiredDocumentDto[];
  constraints!: string[];
  tips!: string[];
}

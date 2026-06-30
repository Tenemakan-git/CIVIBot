export interface BundleDocumentDto {
  nom: string;
  statut: 'fourni' | 'manquant';
}

/** Sortie du Document Agent (dossier documentaire). */
export class DocumentBundleDto {
  resume!: string;
  documents!: BundleDocumentDto[];
  piecesNecessaires!: string[];
}

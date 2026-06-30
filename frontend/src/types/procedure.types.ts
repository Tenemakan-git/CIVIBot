export interface Domaine {
  id: string;
  nom: string;
  slug: string;
}

export interface Categorie {
  id: string;
  nom: string;
  slug: string;
  domaineId: string;
  domaine: Domaine;
}

export interface ProcedureStep {
  id: string;
  ordre: number;
  titre: string;
  description: string;
}

export interface RequiredDocument {
  id: string;
  nom: string;
  obligatoire: boolean;
  remarque?: string;
}

export interface Faq {
  id: string;
  question: string;
  reponse: string;
}

export interface Source {
  id: string;
  organisme: string;
  url?: string;
  dateMiseAJour?: string;
}

export interface Procedure {
  id: string;
  titre: string;
  description: string;
  cout?: string;
  delai?: string;
  eligibilite?: string;
  resume?: string;
  actif: boolean;
  categorie: Categorie;
  steps: ProcedureStep[];
  documents: RequiredDocument[];
  faqs: Faq[];
  sources: Source[];
  createdAt: string;
  updatedAt: string;
}

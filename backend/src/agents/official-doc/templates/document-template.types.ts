/**
 * Définitions des modèles de documents officiels pré-remplis.
 * Le registre vit en code (rapide à maintenir) ; il pourra migrer en base
 * pour édition par un admin en phase 2.
 */

/** Provenance d'un champ de template. */
export type FieldSource = 'user' | 'folder' | 'ask';

export interface TemplateField {
  key: string;
  label: string;
  required: boolean;
  /** user/folder = rempli automatiquement ; ask = saisi par l'utilisateur. */
  source: FieldSource;
  example?: string;
}

export interface DocumentTemplate {
  key: string;
  titre: string;
  description: string;
  /** Domaines où le template s'applique (etat_civil | creation_entreprise). */
  domaines: string[];
  /** Restreint à certaines procédures (vide/absent = tout le domaine). */
  procedureSlugs?: string[];
  /** Destinataire par défaut (ex: "Monsieur l'Officier de l'état civil"). */
  destinataire: string;
  /** Objet du courrier (peut contenir des {{placeholders}}). */
  objet: string;
  fields: TemplateField[];
  /** Corps statique avec {{placeholders}} (utilisé si pas d'instruction LLM). */
  staticBody?: string;
  /**
   * Si présent, le corps est rédigé par le LLM à partir de cette consigne
   * (elle-même interpolée avec les valeurs de champs avant l'appel).
   */
  bodyInstruction?: string;
}

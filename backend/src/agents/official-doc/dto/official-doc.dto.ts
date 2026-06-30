import { FieldSource } from '../templates/document-template.types';

/** Champ d'un template, exposé au front (les `ask` sont à saisir). */
export interface TemplateFieldView {
  key: string;
  label: string;
  required: boolean;
  source: FieldSource;
  example?: string;
}

/** Résumé d'un template applicable à un dossier. */
export interface TemplateSummary {
  key: string;
  titre: string;
  description: string;
  fields: TemplateFieldView[];
}

/** Métadonnées d'un document généré (artefact). */
export interface GeneratedDocMeta {
  id: string;
  templateKey: string;
  titre: string;
  filename: string;
  bytes: number;
  createdAt: Date;
}

export type FieldSource = 'user' | 'folder' | 'ask';
export interface TemplateField {
    key: string;
    label: string;
    required: boolean;
    source: FieldSource;
    example?: string;
}
export interface DocumentTemplate {
    key: string;
    titre: string;
    description: string;
    domaines: string[];
    procedureSlugs?: string[];
    destinataire: string;
    objet: string;
    fields: TemplateField[];
    staticBody?: string;
    bodyInstruction?: string;
}

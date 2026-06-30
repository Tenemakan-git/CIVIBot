import { FieldSource } from '../templates/document-template.types';
export interface TemplateFieldView {
    key: string;
    label: string;
    required: boolean;
    source: FieldSource;
    example?: string;
}
export interface TemplateSummary {
    key: string;
    titre: string;
    description: string;
    fields: TemplateFieldView[];
}
export interface GeneratedDocMeta {
    id: string;
    templateKey: string;
    titre: string;
    filename: string;
    bytes: number;
    createdAt: Date;
}

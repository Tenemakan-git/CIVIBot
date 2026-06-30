import { DocumentTemplate } from './document-template.types';
export declare const DOCUMENT_TEMPLATES: DocumentTemplate[];
export declare function getTemplate(key: string): DocumentTemplate | undefined;
export declare function templatesForDomaine(domaine: string, procedureSlug?: string | null): DocumentTemplate[];

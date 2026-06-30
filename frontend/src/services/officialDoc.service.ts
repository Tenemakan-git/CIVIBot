import { api } from './api';
import { API_URL } from '../lib/constants';

export type FieldSource = 'user' | 'folder' | 'ask';

export interface TemplateField {
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
  fields: TemplateField[];
}

export interface GeneratedDocMeta {
  id: string;
  templateKey: string;
  titre: string;
  filename: string;
  bytes: number;
  createdAt: string;
}

export const officialDocService = {
  templates: (folderId: string): Promise<TemplateSummary[]> =>
    api.get(`/folders/${folderId}/documents/templates`).then((r) => r.data),

  generated: (folderId: string): Promise<GeneratedDocMeta[]> =>
    api.get(`/folders/${folderId}/documents`).then((r) => r.data),

  generate: (
    folderId: string,
    templateKey: string,
    fields: Record<string, string>,
  ): Promise<GeneratedDocMeta> =>
    api
      .post(`/folders/${folderId}/documents/generate`, { templateKey, fields })
      .then((r) => r.data),

  /** Télécharge le PDF d'un document généré (blob + Bearer). */
  download: async (
    folderId: string,
    docId: string,
    filename: string,
  ): Promise<void> => {
    const token = localStorage.getItem('civibot_token');
    const res = await fetch(
      `${API_URL}/folders/${folderId}/documents/${docId}/pdf`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};

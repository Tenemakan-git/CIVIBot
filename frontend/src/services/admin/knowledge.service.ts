import { api } from '../api';

export const knowledgeAdminService = {
  list: () => api.get('/admin/knowledge').then(r => r.data),
  get: (id: string) => api.get(`/admin/knowledge/${id}`).then(r => r.data),
  import: (file: File, titre?: string, categorie?: string, organisme?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (titre) formData.append('titre', titre);
    if (categorie) formData.append('categorie', categorie);
    if (organisme) formData.append('organisme', organisme);
    return api.post('/admin/knowledge', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  reindex: (id: string) => api.post(`/admin/knowledge/${id}/reindex`).then(r => r.data),
  remove: (id: string) => api.delete(`/admin/knowledge/${id}`).then(r => r.data),
};

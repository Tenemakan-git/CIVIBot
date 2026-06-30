import { api } from './api';

export const documentService = {
  list: () => api.get('/documents').then(r => r.data),
  get: (id: string) => api.get(`/documents/${id}`).then(r => r.data),
  upload: (file: File, nom?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (nom) formData.append('nom', nom);
    return api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  remove: (id: string) => api.delete(`/documents/${id}`).then(r => r.data),
};

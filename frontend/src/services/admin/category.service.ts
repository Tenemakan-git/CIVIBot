import { api } from '../api';

export const categoryAdminService = {
  list: () => api.get('/admin/categories').then(r => r.data),
  create: (data: { nom: string; slug: string; domaineId: string }) => api.post('/admin/categories', data).then(r => r.data),
  update: (id: string, data: any) => api.patch(`/admin/categories/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/admin/categories/${id}`).then(r => r.data),
  getDomaines: () => api.get('/categories/domaines').then(r => r.data),
};

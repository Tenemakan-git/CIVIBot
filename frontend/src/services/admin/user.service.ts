import { api } from '../api';

export const userAdminService = {
  list: () => api.get('/admin/users').then(r => r.data),
  get: (id: string) => api.get(`/admin/users/${id}`).then(r => r.data),
  update: (id: string, data: any) => api.patch(`/admin/users/${id}`, data).then(r => r.data),
  suspend: (id: string) => api.patch(`/admin/users/${id}/suspend`).then(r => r.data),
  activate: (id: string) => api.patch(`/admin/users/${id}/activate`).then(r => r.data),
};

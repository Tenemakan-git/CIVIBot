import { api } from './api';

export const checklistService = {
  list: () => api.get('/checklists').then(r => r.data),
  get: (id: string) => api.get(`/checklists/${id}`).then(r => r.data),
  create: (titre: string, items: string[]) => api.post('/checklists', { titre, items }).then(r => r.data),
  toggleItem: (checklistId: string, itemId: string, coche: boolean) =>
    api.patch(`/checklists/${checklistId}/items/${itemId}`, { coche }).then(r => r.data),
  remove: (id: string) => api.delete(`/checklists/${id}`).then(r => r.data),
};

import { api } from './client.js';

export const announcementsApi = {
  list:   ()       => api.get('/announcements'),
  create: (text)   => api.post('/announcements', { text }),
  delete: (id)     => api.delete(`/announcements/${id}`),
};

import { api } from './client.js';

export const customersApi = {
  list:  ()       => api.get('/customers'),
  get:   (id)      => api.get(`/customers/${id}`),
  stats: ()       => api.get('/customers/stats'),
};

export const notificationsApi = {
  list:     ()           => api.get('/notifications'),
  markRead: (id)         => api.patch(`/notifications/${id}/read`),
  markAllRead: ()        => api.patch('/notifications/read-all'),
};

export const messagesApi = {
  list: (customerId) => api.get(customerId ? `/messages?customerId=${customerId}` : '/messages'),
  send: (data)      => api.post('/messages', data),
};

export const landingApi = {
  get: () => api.get('/landing'),
  update: (key, data) => api.put(`/landing/${key}`, data),
};

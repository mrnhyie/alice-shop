import { api } from './client.js';

export const ordersApi = {
  list:         ()             => api.get('/orders'),
  get:          (id)           => api.get(`/orders/${id}`),
  create:       (data)         => api.post('/orders', data),
  updateStatus: (id, status)   => api.patch(`/orders/${id}/status`, { status }),
  stats:        ()             => api.get('/orders/stats'),
};

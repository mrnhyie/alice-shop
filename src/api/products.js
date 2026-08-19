import { api } from './client.js';

export const productsApi = {
  list(params = {}) {
    const q = new URLSearchParams(params).toString();
    return api.get(`/products${q ? `?${q}` : ''}`);
  },
  get:        (id)      => api.get(`/products/${id}`),
  create:     (data)    => api.post('/products', data),
  update:     (id, data) => api.put(`/products/${id}`, data),
  delete:     (id)      => api.delete(`/products/${id}`),
  bulkDelete: (ids)     => api.delete('/products/bulk', { ids }),
};

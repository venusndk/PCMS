// api/networkService.js
import api from './axios';
export const networkService = {
  list:   (params) => api.get('/api/network-devices/', { params }),
  get:    (id)     => api.get(`/api/network-devices/${id}/`),
  create: (data)   => api.post('/api/network-devices/', data),
  update: (id, d)  => api.put(`/api/network-devices/${id}/`, d),
  delete: (id)     => api.delete(`/api/network-devices/${id}/`),
};

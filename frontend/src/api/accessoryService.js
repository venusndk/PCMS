// api/accessoryService.js
import api from './axios';
export const accessoryService = {
  list:   (params) => api.get('/api/accessories/', { params }),
  get:    (id)     => api.get(`/api/accessories/${id}/`),
  create: (data)   => api.post('/api/accessories/', data),
  update: (id, d)  => api.put(`/api/accessories/${id}/`, d),
  delete: (id)     => api.delete(`/api/accessories/${id}/`),
};

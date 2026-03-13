// api/reportService.js
import api from './axios';
export const reportService = {
  list:   (params) => api.get('/api/reports/', { params }),
  get:    (id)     => api.get(`/api/reports/${id}/`),
  create: (data)   => api.post('/api/reports/', data),
  delete: (id)     => api.delete(`/api/reports/${id}/`),
};

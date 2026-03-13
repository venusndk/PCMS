// api/technicianService.js
import api from './axios';
export const technicianService = {
  list:   ()       => api.get('/api/technicians/'),
  get:    (id)     => api.get(`/api/technicians/${id}/`),
  update: (id, d)  => api.put(`/api/technicians/${id}/`, d),
  delete: (id)     => api.delete(`/api/technicians/${id}/`),
};

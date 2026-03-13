// api/requestService.js
import api from './axios';
export const requestService = {
  list:           (params) => api.get('/api/requests/', { params }),
  get:            (id)     => api.get(`/api/requests/${id}/`),
  create:         (data)   => api.post('/api/requests/', data),
  delete:         (id)     => api.delete(`/api/requests/${id}/`),
  assignTechnician:(id, d) => api.post(`/api/assign-technician/${id}/`, d),
  updateStatus:   (id, d)  => api.post(`/api/requests/${id}/update-status/`, d),
};

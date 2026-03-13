// api/pcService.js
import api from './axios';
export const pcService = {
  list:   (params) => api.get('/api/pcs/', { params }),
  get:    (id)     => api.get(`/api/pcs/${id}/`),
  create: (data)   => api.post('/api/pcs/', data),
  update: (id, d)  => api.put(`/api/pcs/${id}/`, d),
  delete: (id)     => api.delete(`/api/pcs/${id}/`),
  myEquipment: ()  => api.get('/api/my-equipment/'),
};

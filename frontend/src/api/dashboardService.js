// api/dashboardService.js
import api from './axios';
export const dashboardService = {
  overview:     () => api.get('/api/dashboard/'),
  devices:      () => api.get('/api/dashboard/devices/'),
  requests:     () => api.get('/api/dashboard/requests/'),
  technicians:  () => api.get('/api/dashboard/technicians/'),
};

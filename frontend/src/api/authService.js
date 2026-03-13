// api/authService.js
import api from './axios';

export const authService = {
  login:          (data)     => api.post('/api/login/', data),
  register:       (data)     => api.post('/api/register/', data),
  logout:         (refresh)  => api.post('/api/logout/', { refresh }),
  getMe:          ()         => api.get('/api/me/'),
  updateMe:       (data)     => api.put('/api/me/', data),
  changePassword: (data)     => api.post('/api/change-password/', data),
  refreshToken:   (refresh)  => api.post('/api/token/refresh/', { refresh }),
};

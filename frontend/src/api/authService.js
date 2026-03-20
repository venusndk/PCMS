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
  requestPasswordReset: (email)              => api.post('/api/password-reset/request/', { email }),
  verifyOTP:            (email, otp)         => api.post('/api/password-reset/verify/',  { email, otp }),
  confirmPasswordReset: (data)               => api.post('/api/password-reset/confirm/', data),
};

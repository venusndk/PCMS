// api/axios.js
// Central Axios instance — attaches JWT token to every request
// and automatically refreshes expired tokens.

import axios from 'axios';
import { tokenManager } from '../utils/tokenManager';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ──────────────────
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccess();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: refresh token on 401 ───────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token));
  failedQueue = [];
};

const MAX_RETRIES = 2;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ── Automatic Retries for Indempotent Requests ───────────
    if (
      (error.code === 'ECONNABORTED' || error.response?.status >= 500) &&
      !originalRequest._retryCount &&
      ['get', 'head', 'options'].includes(originalRequest.method)
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      if (originalRequest._retryCount <= MAX_RETRIES) {
        // Backoff: 1s, 2s
        const backoff = originalRequest._retryCount * 1000;
        await new Promise(resolve => setTimeout(resolve, backoff));
        return api(originalRequest);
      }
    }

    // ── Response interceptor: refresh token on 401 ───────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh = tokenManager.getRefresh();
      if (!refresh) {
        tokenManager.clearTokens();
        // Avoid infinite reload loops if we're already on /login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post('http://127.0.0.1:8000/api/token/refresh/', { refresh });
        tokenManager.setTokens(data.access, data.refresh || refresh);
        processQueue(null, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        tokenManager.clearTokens();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

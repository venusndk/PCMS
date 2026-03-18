// api/axios.js
// Central Axios instance — attaches JWT token to every request
// and automatically refreshes expired tokens.

import axios from 'axios';
import { tokenManager } from '../utils/tokenManager';

// Read base URL from the environment variable set in frontend/.env
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE_URL,
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

    // Automatic Retries for idempotent requests (GET/HEAD/OPTIONS) on 5xx or timeout
    if (
      (error.code === 'ECONNABORTED' || error.response?.status >= 500) &&
      (originalRequest._retryCount || 0) < MAX_RETRIES &&
      ['get', 'head', 'options'].includes(originalRequest.method)
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      // Exponential backoff: 1s, 2s
      const backoff = originalRequest._retryCount * 1000;
      await new Promise(resolve => setTimeout(resolve, backoff));
      return api(originalRequest);
    }

    // ── Token Refresh on 401 ──────────────────────────────────
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
        const { data } = await axios.post(`${BASE_URL}/api/token/refresh/`, { refresh });
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

// Debug logging in development — logs every request and response to the console
if (import.meta.env.DEV) {
  api.interceptors.request.use((config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params
    });
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      console.log(`[API] Response ${response.status} from ${response.config.url}`, response.data);
      return response;
    },
    (error) => {
      console.error(`[API] Error ${error.response?.status || 'NETWORK'} on ${error.config?.url}`, {
        error: error.message,
        data: error.response?.data
      });
      return Promise.reject(error);
    }
  );
}

export default api;

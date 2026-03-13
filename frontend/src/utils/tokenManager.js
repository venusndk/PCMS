// utils/tokenManager.js
// Handles storing and reading JWT tokens from localStorage

const ACCESS_KEY  = 'pcm_access';
const REFRESH_KEY = 'pcm_refresh';
const USER_KEY    = 'pcm_user';

export const tokenManager = {
  setTokens(access, refresh) {
    localStorage.setItem(ACCESS_KEY,  access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  getAccess()  { return localStorage.getItem(ACCESS_KEY);  },
  getRefresh() { return localStorage.getItem(REFRESH_KEY); },
  clearTokens() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
  setUser(user) { localStorage.setItem(USER_KEY, JSON.stringify(user)); },
  getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch { return null; }
  },
};

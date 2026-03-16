// context/AuthContext.jsx
// Global authentication state — wraps the entire app.
// Any component can call useAuth() to get user info and auth functions.

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/authService';
import { tokenManager } from '../utils/tokenManager';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(tokenManager.getUser());
  const [loading, setLoading] = useState(true);

  // On app start, verify token is still valid
  useEffect(() => {
    const token = tokenManager.getAccess();
    if (token) {
      authService.getMe()
        .then(res => { setUser(res.data); tokenManager.setUser(res.data); })
        .catch(() => { tokenManager.clearTokens(); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authService.login({ email, password });
    tokenManager.setTokens(data.tokens.access, data.tokens.refresh);
    tokenManager.setUser(data.user);
    setUser(data.user);
    setLoading(false);
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authService.register(formData);
    tokenManager.setTokens(data.tokens.access, data.tokens.refresh);
    tokenManager.setUser(data.user);
    setUser(data.user);
    setLoading(false);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(tokenManager.getRefresh()); } catch {}
    tokenManager.clearTokens();
    setUser(null);
  }, []);

  const updateUser = useCallback((updated) => {
    setUser(updated);
    tokenManager.setUser(updated);
  }, []);

  const isAdmin      = user?.role === 'Administrator';
  const isTechnician = user?.role === 'Technician';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin, isTechnician }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

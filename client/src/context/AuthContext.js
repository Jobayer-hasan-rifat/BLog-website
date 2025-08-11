import React, { createContext, useEffect, useState, useCallback } from 'react';
import { getMe, login as loginApi, logout as logoutApi, register as registerApi } from '../services/auth';

export const AuthContext = createContext({ user: null, loading: true });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const res = await getMe();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (payload) => {
    const res = await loginApi(payload);
    setUser(res.user);
    return res.user;
  };

  const register = async (payload) => {
    const res = await registerApi(payload);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};



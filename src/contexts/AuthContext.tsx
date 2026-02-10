import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, clearCsrfToken } from '../services/api';

export type AuthUser = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: any;
} | null;

type AuthContextType = {
  user: AuthUser;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage and verify session
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem('wecare_user');
        const storedToken = localStorage.getItem('wecare_token');
        if (storedUser && storedToken) {
          try {
            const profile = await authAPI.getProfile();
            setUser(profile?.user || JSON.parse(storedUser));
          } catch (e) {
            // Token invalid/expired
            localStorage.removeItem('wecare_token');
            localStorage.removeItem('wecare_user');
            clearCsrfToken();
            setUser(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      const { token, user: loggedInUser } = res || {};
      if (!token || !loggedInUser) throw new Error('Invalid login response');
      localStorage.setItem('wecare_token', token);
      localStorage.setItem('wecare_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } catch (e: any) {
      setError(e?.message || 'Login failed');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('wecare_token');
    localStorage.removeItem('wecare_user');
    clearCsrfToken();
    setUser(null);
    // Optionally reload to reset app state (commented to avoid disrupting dev flow)
    // window.location.reload();
  };

  const refreshProfile = async () => {
    try {
      const profile = await authAPI.getProfile();
      const newUser = profile?.user || null;
      if (newUser) {
        localStorage.setItem('wecare_user', JSON.stringify(newUser));
      }
      setUser(newUser);
    } catch (e) {
      // If unauthorized, clear session
      localStorage.removeItem('wecare_token');
      localStorage.removeItem('wecare_user');
      clearCsrfToken();
      setUser(null);
      throw e;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
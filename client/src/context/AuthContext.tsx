import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('studio_admin_token');
      try {
        const res = await api.get('/auth/me');
        setAdmin(res.data.data);
        setToken(savedToken || 'cookie');
      } catch {
        localStorage.removeItem('studio_admin_token');
        localStorage.removeItem('studio_admin_user');
        setAdmin(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, admin: adminData } = res.data.data;
      if (receivedToken) {
        localStorage.setItem('studio_admin_token', receivedToken);
      }
      if (adminData) {
        localStorage.setItem('studio_admin_user', JSON.stringify(adminData));
      }
      setToken(receivedToken || 'cookie');
      setAdmin(adminData);
      return { success: true };
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('studio_admin_token');
    localStorage.removeItem('studio_admin_user');
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setAdmin(res.data.data);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token && !!admin,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

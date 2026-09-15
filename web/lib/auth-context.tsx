'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from './api-client';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (fullName: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('sathya_token');
    const savedUser = localStorage.getItem('sathya_user');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsLoading(false);
      } catch {
        // ignore JSON parse error
      }
    }

    if (savedToken) {
      setToken(savedToken);
      fetchCurrentUser(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const resp = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(resp.data);
      localStorage.setItem('sathya_user', JSON.stringify(resp.data));
    } catch {
      localStorage.removeItem('sathya_token');
      localStorage.removeItem('sathya_user');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    const resp = await apiClient.post('/auth/login', { email, password });
    const { access_token, user_id, full_name, role } = resp.data;
    localStorage.setItem('sathya_token', access_token);
    localStorage.setItem('sathyamithra_token', access_token);
    setToken(access_token);
    const u: User = { id: user_id, email, full_name, role };
    setUser(u);
    localStorage.setItem('sathya_user', JSON.stringify(u));
    return u;
  };

  const register = async (full_name: string, email: string, password: string): Promise<User> => {
    const resp = await apiClient.post('/auth/register', { full_name, email, password });
    const { access_token, user_id, role } = resp.data;
    localStorage.setItem('sathya_token', access_token);
    localStorage.setItem('sathyamithra_token', access_token);
    setToken(access_token);
    const u: User = { id: user_id, email, full_name, role };
    setUser(u);
    localStorage.setItem('sathya_user', JSON.stringify(u));
    return u;
  };

  const logout = () => {
    localStorage.removeItem('sathya_token');
    localStorage.removeItem('sathyamithra_token');
    localStorage.removeItem('sathya_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

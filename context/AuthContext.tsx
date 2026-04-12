import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import apiClient, { setUnauthorizedHandler } from '../api/client';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  sessionId: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // We define logout first so it can be used in useEffect
  async function logout() {
    try {
      await apiClient.get('/auth/logout');
    } catch (e) {
      console.warn('Logout API call failed', e);
    }
    await SecureStore.deleteItemAsync('sessionId');
    setSessionId(null);
    setUser(null);
  }

  useEffect(() => {
    setUnauthorizedHandler(logout);
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const storedSessionId = await SecureStore.getItemAsync('sessionId');
      if (storedSessionId) {
        setSessionId(storedSessionId);
        await fetchCurrentUser(storedSessionId);
      }
    } catch (e) {
      console.error('Failed to load session', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCurrentUser(sid: string) {
    try {
      const response = await apiClient.get<any>('/auth/me');
      if (response.data) {
        // Backend returns { userId, email, fullName, role }
        const { userId, ...rest } = response.data;
        setUser({ id: userId || rest.id, ...rest });
      }
    } catch (e: any) {
      console.error('Failed to fetch user', e);
      if (e.response?.status === 401 || e.response?.status === 403) {
        await logout();
      }
    }
  }

  async function login(email: string, password: string) {
    const response = await apiClient.post<any>('/auth/login', { email, password });
    const { user: userData, sessionId: sid } = response.data;
    
    await SecureStore.setItemAsync('sessionId', sid);
    setSessionId(sid);
    setUser(userData);
  }

  async function register(data: any) {
    const response = await apiClient.post<any>('/auth/register', data);
    const { sessionId: sid } = response.data;
    
    await SecureStore.setItemAsync('sessionId', sid);
    setSessionId(sid);
    await fetchCurrentUser(sid);
  }

  async function refreshUser() {
    if (sessionId) {
      await fetchCurrentUser(sessionId);
    }
  }

  return (
    <AuthContext.Provider value={{ user, sessionId, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

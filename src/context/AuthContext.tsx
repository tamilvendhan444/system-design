import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/apiClient.ts';
import type { User, Role, Company } from '../types/index.ts';

interface AuthContextType {
  user: (User & { company?: Company }) | null;
  role: Role;
  isLoading: boolean;
  demoUsers: Array<User & { company?: Company }>;
  unreadNotifsCount: number;
  login: (email: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchUser: (userId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshNotifs: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(User & { company?: Company }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState<Array<User & { company?: Company }>>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch (e) {
      console.warn('Could not fetch user', e);
    }
  };

  const fetchDemoUsers = async () => {
    try {
      const res = await api.getDemoUsers();
      if (res.success && res.data) {
        setDemoUsers(res.data);
      }
    } catch (e) {
      console.warn('Could not fetch demo users', e);
    }
  };

  const refreshNotifs = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success && res.data) {
        setUnreadNotifsCount(res.data.unreadCount);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchDemoUsers();
      await fetchCurrentUser();
      await refreshNotifs();
      setIsLoading(false);
    };
    init();

    // Poll notifications count every 15 seconds
    const interval = setInterval(refreshNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email: string) => {
    const res = await api.login(email);
    if (res.success && res.data) {
      api.setAuth(res.data.token, res.data.user.id);
      await fetchCurrentUser();
      await refreshNotifs();
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (payload: any) => {
    const res = await api.register(payload);
    if (res.success && res.data) {
      api.setAuth(res.data.token, res.data.user.id);
      await fetchCurrentUser();
      await refreshNotifs();
      return { success: true };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = () => {
    api.clearAuth();
    // Default to seeker for demo convenience
    switchUser('user-seeker-1');
  };

  const switchUser = async (userId: string) => {
    setIsLoading(true);
    api.setAuth(`demo-token-${userId}`, userId);
    await fetchCurrentUser();
    await refreshNotifs();
    setIsLoading(false);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'JOB_SEEKER',
        isLoading,
        demoUsers,
        unreadNotifsCount,
        login,
        register,
        logout,
        switchUser,
        refreshUser,
        refreshNotifs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

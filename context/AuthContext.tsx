"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginService, logout as logoutService, type AuthResponse } from '@/services/authService';
import { roleMenuConfig, rolePermissions, type User, type UserRole } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  hasPermission: (module: string, action: 'view' | 'create' | 'edit' | 'delete') => boolean;
  allowedMenuItems: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await loginService({ username, password });
      
      if (response.success && response.user && response.token) {
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        setUser(response.user);
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutService();
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasPermission = useCallback((module: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    if (!user) return false;
    const permissions = rolePermissions[user.role as UserRole];
    return permissions?.[module]?.[action] ?? false;
  }, [user]);

  const allowedMenuItems = user ? roleMenuConfig[user.role as UserRole] || [] : [];

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        allowedMenuItems,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

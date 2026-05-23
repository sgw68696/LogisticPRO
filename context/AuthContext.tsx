"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginService, logout as logoutService, type AuthResponse } from '@/services/authService';
import { roleMenuConfig, rolePermissions, type User, type UserRole, type PermissionAction } from '@/data/mockData';
import { ROLE_DASHBOARD_MAP } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, router?: NavigationRouter) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  hasPermission: (module: string, action: PermissionAction) => boolean;
  allowedMenuItems: string[];
  isSuperAdmin: boolean;
  isOrganizationAdmin: boolean;
  isCompanyAdmin: boolean;
  isStaff: boolean;
  canManageUsers: boolean;
  canManageAgents: boolean;
  getDashboardRoute: () => string;
  getCurrentCompanyId: () => string | null;
  getCurrentOrganizationId: () => string | null;
}

interface NavigationRouter {
  push: (href: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user') ?? localStorage.getItem('loggedInUser');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string, router?: NavigationRouter): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await loginService({ username, password }, router);
      
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
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('token');
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const hasPermission = useCallback((module: string, action: PermissionAction): boolean => {
    if (!user) return false;
    const permissions = rolePermissions[user.role as UserRole];
    return permissions?.[module]?.[action] ?? false;
  }, [user]);

  const allowedMenuItems = user ? roleMenuConfig[user.role as UserRole] || [] : [];
  
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const isOrganizationAdmin = user?.role === 'OrganizationAdmin';
  const isCompanyAdmin = user?.role === 'CompanyAdmin';
  const isStaff = user?.role === 'Staff';
  const canManageUsers = isSuperAdmin || isOrganizationAdmin || isCompanyAdmin;
  const canManageAgents = isCompanyAdmin || user?.role === 'Manager';
  
  const getCurrentCompanyId = useCallback(() => user?.companyId || null, [user]);
  const getCurrentOrganizationId = useCallback(() => user?.organizationId || null, [user]);
  const getDashboardRoute = useCallback(() => {
    if (!user) return '/login';
    return ROLE_DASHBOARD_MAP[user.role as UserRole] || '/dashboard';
  }, [user]);

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
        isSuperAdmin,
        isOrganizationAdmin,
        isCompanyAdmin,
        isStaff,
        canManageUsers,
        canManageAgents,
        getDashboardRoute,
        getCurrentCompanyId,
        getCurrentOrganizationId,
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

"use client";

import React, { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Spinner } from '@/components/ui/spinner';

interface RoleBasedLayoutProps {
  children: React.ReactNode;
}

/**
 * RoleBasedLayout - Wraps dashboard with role-specific layout enhancements
 * Provides consistent structure for all authenticated routes with role-aware features
 */
export function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { user, isLoading, isSuperAdmin, isCompanyAdmin } = useAuth();

  // Memoize role-based styling and behavior
  const layoutConfig = useMemo(() => {
    if (!user) return { sidebarBg: 'bg-[#050d1a]', headerBg: 'bg-background/80' };

    // Different color schemes for different roles
    const configs: Record<string, any> = {
      SuperAdmin: {
        sidebarBg: 'bg-gradient-to-b from-[#050d1a] to-[#0a1428]',
        headerBg: 'bg-gradient-to-r from-background/80 to-purple-900/20',
        accentColor: 'text-purple-400',
        borderColor: 'border-purple-500/30',
      },
      CompanyAdmin: {
        sidebarBg: 'bg-gradient-to-b from-[#050d1a] to-[#0a1428]',
        headerBg: 'bg-gradient-to-r from-background/80 to-blue-900/20',
        accentColor: 'text-blue-400',
        borderColor: 'border-blue-500/30',
      },
      Manager: {
        sidebarBg: 'bg-[#050d1a]',
        headerBg: 'bg-background/80',
        accentColor: 'text-cyan-400',
        borderColor: 'border-cyan-500/30',
      },
      Agent: {
        sidebarBg: 'bg-[#050d1a]',
        headerBg: 'bg-background/80',
        accentColor: 'text-sky-400',
        borderColor: 'border-sky-500/30',
      },
      Operator: {
        sidebarBg: 'bg-[#050d1a]',
        headerBg: 'bg-background/80',
        accentColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/30',
      },
      Staff: {
        sidebarBg: 'bg-[#050d1a]',
        headerBg: 'bg-background/80',
        accentColor: 'text-slate-400',
        borderColor: 'border-slate-500/30',
      },
    };

    return configs[user.role] || configs.Staff;
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="w-8 h-8" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

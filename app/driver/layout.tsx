"use client";

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Spinner } from '@/components/ui/spinner';
import { AppSidebar } from '@/components/layout/Sidebar/AppSidebar';
import { driverRoleConfig } from '@/data/menu/sidebar-roles';
import { driverMenu } from '@/data/menu/driver-menu';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.push('/login'); return; }
    if (!isLoading && isAuthenticated && user?.role !== 'Driver') {
      const stored = localStorage.getItem('loggedInUser');
      const route = stored ? JSON.parse(stored).dashboardRoute : '/login';
      router.push(route || '/login');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background dark">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="w-8 h-8" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'Driver') return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar role={driverRoleConfig} menuItems={driverMenu} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

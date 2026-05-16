"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Spinner } from '@/components/ui/spinner';
import { AppSidebar } from '@/components/layout/Sidebar/AppSidebar';
import { dispatcherRoleConfig, operatorRoleConfig } from '@/data/menu/sidebar-roles';
import { opsMenu } from '@/data/menu/ops-menu';

export default function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!isLoading && isAuthenticated && user) {
      if (user.role !== 'Dispatcher' && user.role !== 'Operator') {
        const dashboardRoute = localStorage.getItem('loggedInUser') 
          ? JSON.parse(localStorage.getItem('loggedInUser') || '{}').dashboardRoute 
          : '/login';
        router.push(dashboardRoute || '/login');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const roleConfig = useMemo(() => 
    user?.role === 'Operator' ? operatorRoleConfig : dispatcherRoleConfig,
  [user?.role]);

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

  if (!isAuthenticated || !user || (user.role !== 'Dispatcher' && user.role !== 'Operator')) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar role={roleConfig} menuItems={opsMenu} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

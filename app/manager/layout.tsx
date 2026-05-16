"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Spinner } from '@/components/ui/spinner';
import { AppSidebar } from '@/components/layout/Sidebar/AppSidebar';
import { managerRoleConfig } from '@/data/menu/sidebar-roles';
import { managerMenu } from '@/data/menu/manager-menu';

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (!isLoading && isAuthenticated && user?.role !== 'Manager') {
      const dashboardRoute = user?.dashboardRoute || '/login';
      router.push(dashboardRoute);
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

  if (!isAuthenticated || user?.role !== 'Manager') {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar role={managerRoleConfig} menuItems={managerMenu} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

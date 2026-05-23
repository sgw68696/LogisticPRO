"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Spinner } from '@/components/ui/spinner';
import { AppSidebar } from '@/components/layout/Sidebar/AppSidebar';
import { companyAdminRoleConfig } from '@/data/menu/sidebar-roles';
import { useAccessibleMenus } from '@/hooks/use-accessible-menus';
import { getCompanyRouteRedirect } from '@/services/authService';

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const accessibleMenus = useAccessibleMenus();
  const router = useRouter();
  const isCompanyAdmin = user?.role === 'CompanyAdmin';

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!isCompanyAdmin) {
      router.replace(getCompanyRouteRedirect() ?? user?.dashboardRoute ?? '/login');
    }
  }, [isAuthenticated, isCompanyAdmin, isLoading, router, user?.dashboardRoute]);

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

  if (!isAuthenticated || !isCompanyAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar role={companyAdminRoleConfig} menuItems={accessibleMenus} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

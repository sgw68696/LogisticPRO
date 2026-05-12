"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { StaffSidebar } from '@/components/layout/StaffSidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Spinner } from '@/components/ui/spinner';

export default function StaffLayout({
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
    if (!isLoading && isAuthenticated && user?.role !== 'Staff') {
      // Redirect non-staff users to their appropriate dashboard
      const roleDashboardMap: Record<string, string> = {
        'SuperAdmin': '/admin/dashboard',
        'CompanyAdmin': '/company/dashboard',
        'Manager': '/manager/dashboard',
        'Dispatcher': '/ops/dashboard',
        'Operator': '/ops/dashboard',
        'Agent': '/agent/dashboard',
      };
      
      const redirectPath = roleDashboardMap[user?.role || ''] || '/dashboard';
      router.push(redirectPath);
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

  if (!isAuthenticated || user?.role !== 'Staff') {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <StaffSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

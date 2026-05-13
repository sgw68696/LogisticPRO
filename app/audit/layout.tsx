"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuditorSidebar } from '@/components/layout/Sidebar/AuditorSidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Spinner } from '@/components/ui/spinner';

export default function AuditLayout({
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
    if (!isLoading && isAuthenticated && user?.role !== 'AuditorReadOnly') {
      const stored = localStorage.getItem('loggedInUser');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          router.push(parsed.dashboardRoute || '/dashboard');
        } catch {
          router.push('/dashboard');
        }
      } else {
        router.push('/dashboard');
      }
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

  if (!isAuthenticated || user?.role !== 'AuditorReadOnly') {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AuditorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CustomsSidebar } from '@/components/layout/CustomsSidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Spinner } from '@/components/ui/spinner';

export default function CustomsLayout({
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
    
    // Allow only CustomsAgent role
    if (!isLoading && isAuthenticated && user) {
      if (user.role !== 'CustomsAgent') {
        // Redirect to their own dashboard
        const dashboardRoute = localStorage.getItem('loggedInUser') 
          ? JSON.parse(localStorage.getItem('loggedInUser') || '{}').dashboardRoute 
          : '/login';
        router.push(dashboardRoute || '/login');
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

  if (!isAuthenticated || !user || user.role !== 'CustomsAgent') {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <CustomsSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

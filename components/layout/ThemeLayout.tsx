"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ThemeSidebar } from './ThemeSidebar';
import { ThemeNavbar } from './ThemeNavbar';
import { ThemeBackground } from '@/components/ui/theme-background';
import { Spinner } from '@/components/ui/spinner';

export function ThemeLayout({
  children,
  showBackground = false,
}: {
  children: React.ReactNode;
  showBackground?: boolean;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="theme-bg-primary min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="w-8 h-8" />
          <p className="theme-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const content = (
    <div className="flex h-screen theme-bg-primary overflow-hidden">
      <ThemeSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ThemeNavbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );

  if (showBackground) {
    return (
      <ThemeBackground showOrbs={false} showGrid={false} showParticles={false}>
        {content}
      </ThemeBackground>
    );
  }

  return content;
}

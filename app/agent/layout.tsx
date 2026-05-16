"use client";

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Spinner } from '@/components/ui/spinner';
import { AppSidebar } from '@/components/layout/Sidebar/AppSidebar';
import { agentRoleConfig } from '@/data/menu/sidebar-roles';
import { agentMenu, type AgentMenuItem } from '@/data/menu/agent-menu';

function filterMenuByAgentType(items: AgentMenuItem[], agentType: string): any[] {
  return items
    .filter(item => !item.visibleFor || item.visibleFor.includes(agentType as any))
    .map(item => ({
      ...item,
      children: item.children ? filterMenuByAgentType(item.children, agentType) : undefined,
    }));
}

export default function AgentLayout({
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
      if (user.role !== 'Agent') {
        const dashboardRoute = localStorage.getItem('loggedInUser') 
          ? JSON.parse(localStorage.getItem('loggedInUser') || '{}').dashboardRoute 
          : '/login';
        router.push(dashboardRoute || '/login');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const agentType = useMemo(() => {
    if (typeof window === 'undefined') return 'warehouse';
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      return (parsed.agentType as string) || 'warehouse';
    }
    return 'warehouse';
  }, []);

  const filteredMenu = useMemo(() => filterMenuByAgentType(agentMenu, agentType), [agentType]);

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

  if (!isAuthenticated || !user || user.role !== 'Agent') {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar role={agentRoleConfig} menuItems={filteredMenu} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

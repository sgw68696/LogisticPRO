'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { MessageSquare } from 'lucide-react';

export default function PortalMyQueriesPage() {
  return (
    <PageWrapper title="My Queries">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <MessageSquare className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Track the status of your open and resolved support queries and complaints.</p>
      </div>
    </PageWrapper>
  );
}

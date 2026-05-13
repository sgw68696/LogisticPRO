'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { LogIn } from 'lucide-react';

export default function AuditAccessLogsPage() {
  return (
    <PageWrapper title="Access Logs">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <LogIn className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">User access history including login attempts, session activity, and IP tracking.</p>
      </div>
    </PageWrapper>
  );
}

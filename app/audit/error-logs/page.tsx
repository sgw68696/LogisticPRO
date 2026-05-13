'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { AlertTriangle } from 'lucide-react';

export default function AuditErrorLogsPage() {
  return (
    <PageWrapper title="Error Logs">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">System error records with stack traces, frequency analysis, and resolution status.</p>
      </div>
    </PageWrapper>
  );
}

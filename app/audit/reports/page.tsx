'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { BarChart3 } from 'lucide-react';

export default function AuditReportsPage() {
  return (
    <PageWrapper title="Audit Reports">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <BarChart3 className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Compliance and audit reports including findings summaries and trend analysis.</p>
      </div>
    </PageWrapper>
  );
}

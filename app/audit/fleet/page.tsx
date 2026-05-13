'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Truck } from 'lucide-react';

export default function AuditFleetPage() {
  return (
    <PageWrapper title="Fleet Records">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <Truck className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Read-only fleet data including vehicles, maintenance logs, and utilisation reports.</p>
      </div>
    </PageWrapper>
  );
}

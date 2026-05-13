'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Warehouse } from 'lucide-react';

export default function AuditWarehousePage() {
  return (
    <PageWrapper title="Warehouse Records">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <Warehouse className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Read-only warehouse records including stock positions, inbound and outbound logs.</p>
      </div>
    </PageWrapper>
  );
}

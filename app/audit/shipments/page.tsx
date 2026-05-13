'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Package } from 'lucide-react';

export default function AuditShipmentsPage() {
  return (
    <PageWrapper title="All Shipments">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <Package className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Read-only view of all cross-company shipment records for audit review.</p>
      </div>
    </PageWrapper>
  );
}

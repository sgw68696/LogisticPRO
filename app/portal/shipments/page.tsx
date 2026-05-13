'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Package } from 'lucide-react';

export default function PortalShipmentsPage() {
  return (
    <PageWrapper title="My Shipments">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <Package className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Track all your shipments with real-time status updates and delivery timelines.</p>
      </div>
    </PageWrapper>
  );
}

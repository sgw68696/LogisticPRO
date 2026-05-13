'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { PlusCircle } from 'lucide-react';

export default function PortalRaiseQueryPage() {
  return (
    <PageWrapper title="Raise a Query">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <PlusCircle className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Submit a new support query or complaint regarding your shipments or billing.</p>
      </div>
    </PageWrapper>
  );
}

'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { PlusCircle } from 'lucide-react';

export default function PortalNewBookingPage() {
  return (
    <PageWrapper title="New Booking">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <PlusCircle className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Submit a new shipment booking request with pickup and delivery details.</p>
      </div>
    </PageWrapper>
  );
}

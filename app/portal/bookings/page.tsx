'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { ClipboardList } from 'lucide-react';

export default function PortalMyBookingsPage() {
  return (
    <PageWrapper title="My Bookings">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <ClipboardList className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">View and manage all your past and upcoming shipment bookings in one place.</p>
      </div>
    </PageWrapper>
  );
}

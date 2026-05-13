'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Bell } from 'lucide-react';

export default function PortalNotificationsPage() {
  return (
    <PageWrapper title="Notifications">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <Bell className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">View shipment updates, invoice alerts, and other important notifications.</p>
      </div>
    </PageWrapper>
  );
}

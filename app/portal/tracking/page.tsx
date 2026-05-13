'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { MapPin } from 'lucide-react';

export default function PortalTrackingPage() {
  return (
    <PageWrapper title="Live Tracking">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <MapPin className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">View real-time location and route progress of your active shipments on a live map.</p>
      </div>
    </PageWrapper>
  );
}

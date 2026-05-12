'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Page() {
  return (
    <PageWrapper title="Revenue" description="Manage revenue">
      <div className="space-y-6">
        <Button className="gap-2"><Plus className="w-4 h-4" />New Item</Button>

        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg p-8 text-center">
          <p className="text-[rgba(148,163,184,0.8)]">
            Revenue management interface coming soon...
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}

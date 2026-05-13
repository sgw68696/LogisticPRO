'use client';

import { Folder } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function DocumentsPage() {
  return (
    <PageWrapper title="Documents">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <Folder className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">
          Coming Soon
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Access and manage your documents
        </p>
      </div>
    </PageWrapper>
  );
}

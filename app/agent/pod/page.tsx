'use client';

import { FileCheck } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function PODPage() {
  return (
    <PageWrapper title="POD Upload">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <FileCheck className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">
          Coming Soon
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Upload proof of delivery documents
        </p>
      </div>
    </PageWrapper>
  );
}

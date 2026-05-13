'use client';

import { FileText } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function InvoicesPage() {
  return (
    <PageWrapper title="Invoices">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <FileText className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">
          Coming Soon
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          View and manage your invoices
        </p>
      </div>
    </PageWrapper>
  );
}

'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Receipt } from 'lucide-react';

export default function AuditExpensesPage() {
  return (
    <PageWrapper title="Expenses">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <Receipt className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Read-only expense records for audit review across all companies and departments.</p>
      </div>
    </PageWrapper>
  );
}

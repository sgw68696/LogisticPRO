'use client';

import { LayoutGrid } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function StockPage() {
  return (
    <PageWrapper title="Stock Positions">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <LayoutGrid className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">
          Coming Soon
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          View real-time stock levels and inventory positions
        </p>
      </div>
    </PageWrapper>
  );
}

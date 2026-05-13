import { PageWrapper } from '@/components/layout/PageWrapper';
import { AlertCircle } from 'lucide-react';

export default function HoldsQueriesPage() {
  return (
    <PageWrapper title="Holds & Queries">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Track customs holds and pending queries</p>
      </div>
    </PageWrapper>
  );
}

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Globe } from 'lucide-react';

export default function CountryRestrictionsPage() {
  return (
    <PageWrapper title="Country Restrictions">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <Globe className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Review country import/export restrictions</p>
      </div>
    </PageWrapper>
  );
}

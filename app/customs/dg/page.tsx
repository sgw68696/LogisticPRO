import { PageWrapper } from '@/components/layout/PageWrapper';
import { AlertTriangle } from 'lucide-react';

export default function DangerousGoodsPage() {
  return (
    <PageWrapper title="Dangerous Goods">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Manage dangerous goods compliance</p>
      </div>
    </PageWrapper>
  );
}

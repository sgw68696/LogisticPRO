import { PageWrapper } from '@/components/layout/PageWrapper';
import { Folder } from 'lucide-react';

export default function CustomsDocumentsPage() {
  return (
    <PageWrapper title="Customs Documents">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <Folder className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Access customs documentation</p>
      </div>
    </PageWrapper>
  );
}

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Award } from 'lucide-react';

export default function CertificatesOfOriginPage() {
  return (
    <PageWrapper title="Certificates of Origin">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <Award className="w-12 h-12 text-muted-foreground opacity-40" />
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">Manage certificates of origin</p>
      </div>
    </PageWrapper>
  );
}

'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { COMPANY_OPERATIONAL_TYPES } from '@/types/company-operational-types';

export default function OrgAdminCompanyTypesPage() {
  const columns: Column<typeof COMPANY_OPERATIONAL_TYPES[0]>[] = [
    { key: 'label', header: 'Type', render: (i) => <span className="font-semibold capitalize">{i.label}</span> },
    { key: 'slug', header: 'Slug', render: (i) => <code className="text-[0.78rem] bg-muted/40 px-1.5 py-0.5 rounded">{i.slug}</code> },
    { key: 'description', header: 'Description' },
  ];

  return (
    <PageWrapper title="Company Types" description="Operational company types available for assignment">
      <div className="bg-card border border-border/60 rounded-xl shadow-soft">
        <DataTable data={COMPANY_OPERATIONAL_TYPES} columns={columns} pageSize={20} />
      </div>
    </PageWrapper>
  );
}

'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { FileSpreadsheet, FileCheck2, Clock, Archive } from 'lucide-react';
import { mockOperationalDocs, type OperationalDocument } from '@/data/mockCompanyTypeData';

const statusBadge = (s: OperationalDocument['status']) => {
  const map: Record<string, string> = {
    Draft: 'bg-muted/60 text-muted-foreground border border-border/50',
    'Pending Review': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Approved: 'bg-success/10 text-success border border-success/20',
    Filed: 'bg-primary/10 text-primary border border-primary/20',
  };
  return map[s] ?? map.Draft;
};

const typeIcon = (t: OperationalDocument['type']) => {
  const map: Record<string, string> = {
    'Shipping Instruction': 'SI',
    'Packing List': 'PL',
    'Commercial Invoice': 'CI',
    'Certificate of Origin': 'CO',
    'Insurance Cert': 'IC',
    'Bill of Lading': 'BL',
  };
  return map[t] ?? 'DO';
};

const columns: Column<OperationalDocument>[] = [
  { key: 'docRef', header: 'Document Ref', render: (i) => <span className="font-mono text-[0.80rem] text-primary font-semibold">{i.docRef}</span> },
  { key: 'title', header: 'Title', render: (i) => <span className="font-medium">{i.title}</span> },
  {
    key: 'type', header: 'Type', render: (i) => (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[0.70rem] font-bold bg-primary/5 text-primary border border-primary/10">
        {typeIcon(i.type)}
      </span>
    ),
  },
  { key: 'status', header: 'Status', render: (i) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold ${statusBadge(i.status)}`}>{i.status}</span> },
  { key: 'createdBy', header: 'Created By' },
  { key: 'createdAt', header: 'Created At' },
  { key: 'relatedShipment', header: 'Related Shipment' },
];

export default function OperationalDocumentsPage() {
  const [data] = useState(mockOperationalDocs);
  const approved = data.filter((d) => d.status === 'Approved' || d.status === 'Filed').length;
  const pending = data.filter((d) => d.status === 'Pending Review').length;
  const draft = data.filter((d) => d.status === 'Draft').length;

  return (
    <PageWrapper title="Operational Documents" description="Company type operational documents">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Documents" value={data.length} icon={<FileSpreadsheet size={18} />} iconColor="indigo" description="All operational docs" />
        <KPICard title="Approved/Filed" value={approved} icon={<FileCheck2 size={18} />} iconColor="green" description="Processed" />
        <KPICard title="Pending Review" value={pending} icon={<Clock size={18} />} iconColor="amber" description="Awaiting approval" />
        <KPICard title="Drafts" value={draft} icon={<Archive size={18} />} iconColor="cyan" description="Unsubmitted" />
      </div>
      <div className="bg-card border border-border/60 rounded-xl shadow-soft">
        <DataTable data={data} columns={columns} searchPlaceholder="Search documents..." searchKey="title" pageSize={10} />
      </div>
    </PageWrapper>
  );
}

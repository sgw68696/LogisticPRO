'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { ClipboardCheck, Boxes, Ship, Search } from 'lucide-react';
import { mockContainerReports, type ContainerReport } from '@/data/mockCompanyTypeData';

const statusBadge = (s: ContainerReport['status']) => {
  const map: Record<string, string> = {
    Loaded: 'bg-primary/10 text-primary border border-primary/20',
    Empty: 'bg-muted/60 text-muted-foreground border border-border/50',
    'In Transit': 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    'At Port': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    'Under Inspection': 'bg-destructive/10 text-destructive border border-destructive/20',
  };
  return map[s] ?? map.Empty;
};

const sizeBadge = (s: ContainerReport['size']) => {
  const map: Record<string, string> = {
    '20ft': 'bg-muted/60 text-muted-foreground border border-border/50',
    '40ft': 'bg-primary/10 text-primary border border-primary/20',
    '40ft HC': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  };
  return map[s] ?? map['20ft'];
};

const columns: Column<ContainerReport>[] = [
  { key: 'containerNo', header: 'Container No', render: (i) => <span className="font-mono text-[0.80rem] text-primary font-semibold">{i.containerNo}</span> },
  { key: 'size', header: 'Size', render: (i) => <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.70rem] font-bold ${sizeBadge(i.size)}`}>{i.size}</span> },
  { key: 'type', header: 'Type' },
  { key: 'location', header: 'Location' },
  { key: 'status', header: 'Status', render: (i) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold ${statusBadge(i.status)}`}>{i.status}</span> },
  { key: 'lastEvent', header: 'Last Event' },
  { key: 'lastEventDate', header: 'Last Event Date' },
  { key: 'shipmentRef', header: 'Shipment' },
];

export default function ContainerReportsPage() {
  const [data] = useState(mockContainerReports);
  const inTransit = data.filter((d) => d.status === 'In Transit').length;
  const atPort = data.filter((d) => d.status === 'At Port').length;
  const underInspection = data.filter((d) => d.status === 'Under Inspection').length;

  return (
    <PageWrapper title="Container Report" description="Container status and utilization reports">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Containers" value={data.length} icon={<ClipboardCheck size={18} />} iconColor="indigo" description="All containers" />
        <KPICard title="In Transit" value={inTransit} icon={<Ship size={18} />} iconColor="cyan" description="Active voyages" />
        <KPICard title="At Port" value={atPort} icon={<Boxes size={18} />} iconColor="amber" description="Awaiting at ports" />
        <KPICard title="Under Inspection" value={underInspection} icon={<Search size={18} />} iconColor="red" description="Customs/quality checks" />
      </div>
      <div className="bg-card border border-border/60 rounded-xl shadow-soft">
        <DataTable data={data} columns={columns} searchPlaceholder="Search containers..." searchKey="containerNo" pageSize={10} />
      </div>
    </PageWrapper>
  );
}

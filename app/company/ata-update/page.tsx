'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { mockAtaUpdates, type AtaUpdate } from '@/data/mockCompanyTypeData';

const statusBadge = (s: AtaUpdate['status']) => {
  const map: Record<string, string> = {
    'On Time': 'bg-success/10 text-success border border-success/20',
    Delayed: 'bg-destructive/10 text-destructive border border-destructive/20',
    Arrived: 'bg-primary/10 text-primary border border-primary/20',
  };
  return map[s] ?? map['On Time'];
};

const columns: Column<AtaUpdate>[] = [
  { key: 'shipmentRef', header: 'Shipment Ref', render: (i) => <span className="font-mono text-[0.80rem] text-primary font-semibold">{i.shipmentRef}</span> },
  { key: 'containerNo', header: 'Container', render: (i) => <span className="font-mono text-[0.78rem]">{i.containerNo}</span> },
  { key: 'vessel', header: 'Vessel' },
  { key: 'ata', header: 'ATA', render: (i) => <span className="font-medium">{i.ata}</span> },
  { key: 'currentEta', header: 'Current ETA' },
  { key: 'delay', header: 'Delay (days)', render: (i) => i.delay > 0 ? <span className="text-destructive font-semibold">+{i.delay}d</span> : <span className="text-success font-semibold">0</span> },
  { key: 'reason', header: 'Reason', render: (i) => <span className="text-[0.80rem] text-muted-foreground max-w-[200px] truncate block">{i.reason}</span> },
  { key: 'status', header: 'Status', render: (i) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold ${statusBadge(i.status)}`}>{i.status}</span> },
];

export default function AtaUpdatePage() {
  const [data] = useState(mockAtaUpdates);
  const onTime = data.filter((d) => d.status === 'On Time').length;
  const delayed = data.filter((d) => d.status === 'Delayed').length;
  const arrived = data.filter((d) => d.status === 'Arrived').length;
  const avgDelay = data.reduce((s, d) => s + d.delay, 0);

  return (
    <PageWrapper title="Update ATA" description="Actual Time of Arrival tracking and delay management">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Updates" value={data.length} icon={<Calendar size={18} />} iconColor="indigo" description="All ATA records" />
        <KPICard title="On Time" value={onTime} icon={<CheckCircle size={18} />} iconColor="green" description="On schedule" trend={{ value: 3, isPositive: true }} />
        <KPICard title="Delayed" value={delayed} icon={<AlertTriangle size={18} />} iconColor="red" description="Behind schedule" />
        <KPICard title="Total Delay" value={`${avgDelay}d`} icon={<Clock size={18} />} iconColor="amber" description="Cumulative delay" />
      </div>
      <div className="bg-card border border-border/60 rounded-xl shadow-soft">
        <DataTable data={data} columns={columns} searchPlaceholder="Search by shipment ref..." searchKey="shipmentRef" pageSize={10} />
      </div>
    </PageWrapper>
  );
}

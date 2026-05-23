'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { Truck, MapPin, Clock, XCircle } from 'lucide-react';
import { mockDeliveryLines, type DeliveryLine } from '@/data/mockCompanyTypeData';

const statusBadge = (s: DeliveryLine['status']) => {
  const map: Record<string, string> = {
    Scheduled: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    Dispatched: 'bg-primary/10 text-primary border border-primary/20',
    'In Transit': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Delivered: 'bg-success/10 text-success border border-success/20',
    Failed: 'bg-destructive/10 text-destructive border border-destructive/20',
  };
  return map[s] ?? map.Scheduled;
};

const columns: Column<DeliveryLine>[] = [
  { key: 'deliveryRef', header: 'Delivery Ref', render: (i) => <span className="font-mono text-[0.80rem] text-primary font-semibold">{i.deliveryRef}</span> },
  { key: 'orderRef', header: 'Order Ref' },
  { key: 'customer', header: 'Customer', render: (i) => <span className="font-medium">{i.customer}</span> },
  { key: 'scheduledDate', header: 'Scheduled Date' },
  { key: 'status', header: 'Status', render: (i) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold ${statusBadge(i.status)}`}>{i.status}</span> },
  { key: 'driver', header: 'Driver' },
  { key: 'vehicleNo', header: 'Vehicle' },
];

export default function DeliveryLinesPage() {
  const [data] = useState(mockDeliveryLines);
  const delivered = data.filter((d) => d.status === 'Delivered').length;
  const inTransit = data.filter((d) => d.status === 'In Transit' || d.status === 'Dispatched').length;
  const failed = data.filter((d) => d.status === 'Failed').length;

  return (
    <PageWrapper title="Delivery Line List" description="Delivery line management">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Deliveries" value={data.length} icon={<Truck size={18} />} iconColor="indigo" description="All delivery lines" />
        <KPICard title="In Transit" value={inTransit} icon={<MapPin size={18} />} iconColor="cyan" description="Active deliveries" trend={{ value: 3, isPositive: true }} />
        <KPICard title="Delivered" value={delivered} icon={<Clock size={18} />} iconColor="green" description="Completed" />
        <KPICard title="Failed" value={failed} icon={<XCircle size={18} />} iconColor="red" description="Delivery failures" />
      </div>
      <div className="bg-card border border-border/60 rounded-xl shadow-soft">
        <DataTable data={data} columns={columns} searchPlaceholder="Search deliveries..." searchKey="deliveryRef" pageSize={10} />
      </div>
    </PageWrapper>
  );
}

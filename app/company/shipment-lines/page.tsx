'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { Container, Ship, Clock, PackageCheck } from 'lucide-react';
import { mockShipmentLines, type ShipmentLine } from '@/data/mockCompanyTypeData';

const statusBadge = (s: ShipmentLine['status']) => {
  const map: Record<string, string> = {
    Booked: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    'In Transit': 'bg-primary/10 text-primary border border-primary/20',
    'Customs Hold': 'bg-destructive/10 text-destructive border border-destructive/20',
    Delivered: 'bg-success/10 text-success border border-success/20',
  };
  return map[s] ?? map.Booked;
};

const columns: Column<ShipmentLine>[] = [
  { key: 'shipmentRef', header: 'Shipment Ref', render: (i) => <span className="font-mono text-[0.80rem] text-primary font-semibold">{i.shipmentRef}</span> },
  { key: 'containerNo', header: 'Container', render: (i) => <span className="font-mono text-[0.78rem]">{i.containerNo}</span> },
  { key: 'origin', header: 'Origin' },
  { key: 'destination', header: 'Destination' },
  { key: 'vessel', header: 'Vessel' },
  { key: 'etd', header: 'ETD' },
  { key: 'eta', header: 'ETA' },
  { key: 'status', header: 'Status', render: (i) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold ${statusBadge(i.status)}`}>{i.status}</span> },
  { key: 'cargoWeight', header: 'Weight' },
];

export default function ShipmentLinesPage() {
  const [data] = useState(mockShipmentLines);
  const inTransit = data.filter((d) => d.status === 'In Transit').length;
  const delivered = data.filter((d) => d.status === 'Delivered').length;
  const onHold = data.filter((d) => d.status === 'Customs Hold').length;

  return (
    <PageWrapper title="Shipment Line List" description="Shipment line tracking and management">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Shipments" value={data.length} icon={<Container size={18} />} iconColor="indigo" description="All shipment lines" />
        <KPICard title="In Transit" value={inTransit} icon={<Ship size={18} />} iconColor="cyan" description="Active voyages" trend={{ value: 2, isPositive: true }} />
        <KPICard title="Delivered" value={delivered} icon={<PackageCheck size={18} />} iconColor="green" description="Completed" trend={{ value: 1, isPositive: true }} />
        <KPICard title="Customs Hold" value={onHold} icon={<Clock size={18} />} iconColor="red" description="Awaiting clearance" />
      </div>
      <div className="bg-card border border-border/60 rounded-xl shadow-soft">
        <DataTable data={data} columns={columns} searchPlaceholder="Search by ref or container..." searchKey="shipmentRef" pageSize={10} />
      </div>
    </PageWrapper>
  );
}

'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { Map, Ship, Plane, Truck } from 'lucide-react';
import { mockCarrierTrackings, type CarrierTracking } from '@/data/mockCompanyTypeData';

const statusBadge = (s: CarrierTracking['status']) => {
  const map: Record<string, string> = {
    'On Time': 'bg-success/10 text-success border border-success/20',
    Delayed: 'bg-destructive/10 text-destructive border border-destructive/20',
    'At Origin': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    'In Transit': 'bg-primary/10 text-primary border border-primary/20',
    Arrived: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  };
  return map[s] ?? map['On Time'];
};

const modeIcon = (m: CarrierTracking['mode']) => {
  const icons: Record<string, React.ReactNode> = {
    Ocean: <Ship size={14} />,
    Air: <Plane size={14} />,
    Land: <Truck size={14} />,
  };
  return icons[m] ?? null;
};

const columns: Column<CarrierTracking>[] = [
  {
    key: 'carrier', header: 'Carrier', render: (i) => (
      <div className="flex items-center gap-2">
        <span className="font-semibold">{i.carrier}</span>
        <span className="text-[0.68rem] text-muted-foreground font-mono">{i.carrierRef}</span>
      </div>
    ),
  },
  { key: 'mode', header: 'Mode', render: (i) => <span className="inline-flex items-center gap-1 text-[0.78rem] text-muted-foreground">{modeIcon(i.mode)} {i.mode}</span> },
  { key: 'origin', header: 'Origin' },
  { key: 'destination', header: 'Destination' },
  { key: 'currentLocation', header: 'Current Location', render: (i) => <span className="font-medium text-[0.80rem]">{i.currentLocation}</span> },
  { key: 'lastUpdate', header: 'Last Update' },
  { key: 'status', header: 'Status', render: (i) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold ${statusBadge(i.status)}`}>{i.status}</span> },
  { key: 'eta', header: 'ETA' },
];

export default function CarrierTrackingPage() {
  const [data] = useState(mockCarrierTrackings);
  const onTime = data.filter((d) => d.status === 'On Time' || d.status === 'Arrived').length;
  const delayed = data.filter((d) => d.status === 'Delayed').length;
  const inTransit = data.filter((d) => d.status === 'In Transit').length;

  return (
    <PageWrapper title="Carrier Tracking" description="Real-time carrier tracking across all modes">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Carriers" value={data.length} icon={<Map size={18} />} iconColor="indigo" description="All tracked carriers" />
        <KPICard title="On Time / Arrived" value={onTime} icon={<Ship size={18} />} iconColor="green" description="On schedule" trend={{ value: 4, isPositive: true }} />
        <KPICard title="In Transit" value={inTransit} icon={<Truck size={18} />} iconColor="cyan" description="Active routes" />
        <KPICard title="Delayed" value={delayed} icon={<Plane size={18} />} iconColor="red" description="Behind schedule" />
      </div>
      <div className="bg-card border border-border/60 rounded-xl shadow-soft">
        <DataTable data={data} columns={columns} searchPlaceholder="Search carriers..." searchKey="carrier" pageSize={10} />
      </div>
    </PageWrapper>
  );
}

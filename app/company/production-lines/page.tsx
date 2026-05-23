'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { LayoutPanelTop, Wrench, Zap, PauseCircle } from 'lucide-react';
import { mockProductionLines, type ProductionLine } from '@/data/mockCompanyTypeData';

const statusBadge = (s: ProductionLine['status']) => {
  const map: Record<string, string> = {
    Operational: 'bg-success/10 text-success border border-success/20',
    Idle: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Maintenance: 'bg-destructive/10 text-destructive border border-destructive/20',
    Shutdown: 'bg-muted/60 text-muted-foreground border border-border/50',
  };
  return map[s] ?? map.Shutdown;
};

const columns: Column<ProductionLine>[] = [
  { key: 'lineName', header: 'Line Name', render: (i) => <span className="font-semibold">{i.lineName}</span> },
  { key: 'productType', header: 'Product Type' },
  { key: 'status', header: 'Status', render: (i) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold ${statusBadge(i.status)}`}>{i.status}</span> },
  { key: 'throughput', header: 'Throughput', render: (i) => <span className="font-mono font-semibold">{i.throughput.toLocaleString()}</span> },
  {
    key: 'utilization', header: 'Utilization', render: (i) => (
      <div className="flex items-center gap-2 min-w-[90px]">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${i.utilization >= 80 ? 'bg-success' : i.utilization >= 50 ? 'bg-primary' : 'bg-amber-400'}`} style={{ width: `${i.utilization}%` }} />
        </div>
        <span className="text-[0.72rem] font-mono text-muted-foreground">{i.utilization}%</span>
      </div>
    ),
  },
  { key: 'supervisor', header: 'Supervisor' },
  { key: 'lastRun', header: 'Last Run' },
];

export default function ProductionLinesPage() {
  const [data] = useState(mockProductionLines);
  const operational = data.filter((d) => d.status === 'Operational').length;
  const avgUtil = Math.round(data.reduce((s, d) => s + d.utilization, 0) / data.length);

  return (
    <PageWrapper title="Production Line List" description="Production line management">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Lines" value={data.length} icon={<LayoutPanelTop size={18} />} iconColor="indigo" description="All production lines" />
        <KPICard title="Operational" value={operational} icon={<Zap size={18} />} iconColor="green" description="Active lines" trend={{ value: 2, isPositive: true }} />
        <KPICard title="In Maintenance" value={data.filter((d) => d.status === 'Maintenance').length} icon={<Wrench size={18} />} iconColor="red" description="Under service" />
        <KPICard title="Avg Utilization" value={`${avgUtil}%`} icon={<PauseCircle size={18} />} iconColor="cyan" description="Across all lines" />
      </div>
      <div className="bg-card border border-border/60 rounded-xl shadow-soft">
        <DataTable data={data} columns={columns} searchPlaceholder="Search lines..." searchKey="lineName" pageSize={10} />
      </div>
    </PageWrapper>
  );
}

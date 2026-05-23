'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { ClipboardList, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { mockPlanningData, type PlanningItem } from '@/data/mockCompanyTypeData';

const statusBadge = (status: PlanningItem['status']) => {
  const map: Record<string, string> = {
    'In Progress': 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    Planned: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Completed: 'bg-success/10 text-success border border-success/20',
    'On Hold': 'bg-muted/60 text-muted-foreground border border-border/50',
  };
  return map[status] ?? map['On Hold'];
};

const priorityBadge = (p: PlanningItem['priority']) => {
  const map: Record<string, string> = {
    High: 'bg-destructive/10 text-destructive border border-destructive/20',
    Medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Low: 'bg-muted/60 text-muted-foreground border border-border/50',
  };
  return map[p] ?? map.Low;
};

const progressColor = (v: number) => v >= 100 ? 'bg-success' : v >= 50 ? 'bg-primary' : v >= 20 ? 'bg-amber-400' : 'bg-muted-foreground';

const columns: Column<PlanningItem>[] = [
  { key: 'reference', header: 'Reference', render: (i) => <span className="font-mono text-[0.80rem] text-primary font-semibold">{i.reference}</span> },
  { key: 'title', header: 'Title', render: (i) => <span className="font-medium">{i.title}</span> },
  { key: 'assignedTo', header: 'Assigned To' },
  { key: 'priority', header: 'Priority', render: (i) => <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.70rem] font-bold ${priorityBadge(i.priority)}`}>{i.priority}</span> },
  { key: 'status', header: 'Status', render: (i) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold ${statusBadge(i.status)}`}>{i.status}</span> },
  { key: 'startDate', header: 'Start Date', render: (i) => <span className="text-[0.80rem] text-muted-foreground">{i.startDate}</span> },
  {
    key: 'progress', header: 'Progress', render: (i) => (
      <div className="flex items-center gap-2 min-w-[100px]">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${progressColor(i.progress)}`} style={{ width: `${i.progress}%` }} />
        </div>
        <span className="text-[0.72rem] font-mono text-muted-foreground w-8 text-right">{i.progress}%</span>
      </div>
    ),
  },
];

export default function PlanningPage() {
  const [data] = useState(mockPlanningData);
  const stats = {
    total: data.length,
    inProgress: data.filter((d) => d.status === 'In Progress').length,
    completed: data.filter((d) => d.status === 'Completed').length,
    highPriority: data.filter((d) => d.priority === 'High' && d.status !== 'Completed').length,
  };

  return (
    <PageWrapper title="Planning List" description="Operational planning and schedules">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Plans" value={stats.total} icon={<ClipboardList size={18} />} iconColor="indigo" description="All planning items" />
        <KPICard title="In Progress" value={stats.inProgress} icon={<Clock size={18} />} iconColor="cyan" description="Active items" trend={{ value: 12, isPositive: true }} />
        <KPICard title="Completed" value={stats.completed} icon={<Calendar size={18} />} iconColor="green" description="Finished" trend={{ value: 8, isPositive: true }} />
        <KPICard title="High Priority" value={stats.highPriority} icon={<ArrowUpRight size={18} />} iconColor="amber" description="Requires attention" />
      </div>
      <div className="bg-card border border-border/60 rounded-xl shadow-soft">
        <DataTable data={data} columns={columns} searchPlaceholder="Search plans..." searchKey="title" pageSize={10} />
      </div>
    </PageWrapper>
  );
}

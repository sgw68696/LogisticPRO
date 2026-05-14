'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeftRight, Search, Package, CheckCircle2, AlertTriangle, Clock,
  Eye, Edit, Trash2, X, Ship, Download, Loader2, Dock, Anchor,
  ArrowDownLeft, ArrowUpRight, Timer, User, Wrench, BarChart3,
} from 'lucide-react';

type OperationType = 'Offload' | 'Load' | 'Transfer' | 'Inspection';
type OpsStatus = 'Completed' | 'In Progress' | 'Scheduled' | 'Delayed';

interface CargoOp {
  id: string;
  operation: string;
  type: OperationType;
  vessel: string;
  berth: string;
  cargo: string;
  containerCount: number;
  status: OpsStatus;
  started: string;
  completed: string | null;
  duration: string;
  operator: string;
  supervisor: string;
  equipment: string;
  notes: string;
  progress: number;
}

const STATUS_META: Record<OpsStatus, { pill: string; dot: string }> = {
  Completed: { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  'In Progress': { pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' },
  Scheduled: { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  Delayed: { pill: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
};

const operations: CargoOp[] = [
  { id: 'OP-001', operation: 'OPS-2026-0513-01', type: 'Offload', vessel: 'CMA CGM ALTAMIRA', berth: 'B-12', cargo: 'Mixed Containers', containerCount: 34, status: 'Completed', started: '13 May 08:30', completed: '13 May 11:45', duration: '3h 15m', operator: 'DP World', supervisor: 'Ahmed Khan', equipment: 'STS Crane #3, RTG #7', notes: 'All containers offloaded. 2 hazmat units flagged.', progress: 100 },
  { id: 'OP-002', operation: 'OPS-2026-0513-02', type: 'Offload', vessel: 'MSC ZOE', berth: 'A-07', cargo: 'Mixed Containers', containerCount: 18, status: 'In Progress', started: '13 May 22:45', completed: null, duration: '4h 30m est.', operator: 'PSA International', supervisor: 'Maria Santos', equipment: 'STS Crane #1, RTG #3', notes: 'Night shift operation. 8/18 completed.', progress: 44 },
  { id: 'OP-003', operation: 'OPS-2026-0513-03', type: 'Load', vessel: 'MAERSK GUJARAT', berth: 'C-03', cargo: 'Export Containers', containerCount: 52, status: 'Scheduled', started: '14 May 06:00', completed: null, duration: '8h 00m est.', operator: 'Adani Ports', supervisor: 'Rajesh Patel', equipment: 'STS Crane #2, RTG #5, RTG #6', notes: 'Pre-staging complete. 52 containers in yard.', progress: 0 },
  { id: 'OP-004', operation: 'OPS-2026-0512-04', type: 'Transfer', vessel: 'COSCO PRIDE', berth: 'B-08', cargo: 'Empty Containers', containerCount: 22, status: 'Completed', started: '12 May 07:00', completed: '12 May 14:30', duration: '7h 30m', operator: 'COSCO Terminal', supervisor: 'Liu Wang', equipment: 'RTG #2, Reach Stacker #1', notes: 'Transfer to empty container yard E-03.', progress: 100 },
  { id: 'OP-005', operation: 'OPS-2026-0512-05', type: 'Inspection', vessel: 'MSC AURORA', berth: 'F-05', cargo: 'DG Containers', containerCount: 4, status: 'In Progress', started: '12 May 09:00', completed: null, duration: '6h 00m est.', operator: 'Bureau Veritas', supervisor: 'James Wilson', equipment: 'Inspection Bay #2', notes: 'DG class 3 inspection. 2/4 completed.', progress: 50 },
  { id: 'OP-006', operation: 'OPS-2026-0511-06', type: 'Offload', vessel: 'EVERGREEN LOTUS', berth: 'E-01', cargo: 'Mixed Containers', containerCount: 45, status: 'Completed', started: '11 May 14:00', completed: '12 May 02:00', duration: '12h 00m', operator: 'ECT Terminal', supervisor: 'Pieter van den Berg', equipment: 'STS Crane #4, RTG #1, RTG #8', notes: 'Overnight operation. All completed on schedule.', progress: 100 },
  { id: 'OP-007', operation: 'OPS-2026-0514-07', type: 'Load', vessel: 'OOCL HONG KONG', berth: 'D-04', cargo: 'Export Containers', containerCount: 28, status: 'Scheduled', started: '15 May 04:00', completed: null, duration: '6h 00m est.', operator: 'DP World', supervisor: 'Sanjay Mehta', equipment: 'STS Crane #1, RTG #4', notes: 'Yard check completed. Awaiting vessel.', progress: 0 },
  { id: 'OP-008', operation: 'OPS-2026-0513-08', type: 'Transfer', vessel: 'ONE APUS', berth: 'C-11', cargo: 'Reefer Containers', containerCount: 8, status: 'Delayed', started: '13 May 06:00', completed: null, duration: '4h 00m est.', operator: 'Yusen Terminals', supervisor: 'Taro Yamada', equipment: 'Reefer Rack #2, RTG #9', notes: 'DELAYED: Reefer power supply fault. Electrician en route.', progress: 25 },
];

export default function CargoLogPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let result = [...operations];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o => o.operation.toLowerCase().includes(q) || o.vessel.toLowerCase().includes(q) || o.operator.toLowerCase().includes(q) || o.supervisor.toLowerCase().includes(q));
    }
    if (statusFilter !== 'All') result = result.filter(o => o.status === statusFilter);
    if (typeFilter !== 'All') result = result.filter(o => o.type === typeFilter);
    return result;
  }, [search, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: operations.length,
    completed: operations.filter(o => o.status === 'Completed').length,
    inProgress: operations.filter(o => o.status === 'In Progress').length,
    scheduled: operations.filter(o => o.status === 'Scheduled').length,
    delayed: operations.filter(o => o.status === 'Delayed').length,
    totalContainers: operations.reduce((s, o) => s + o.containerCount, 0),
  }), []);

  const typeIcon = (t: OperationType) => {
    if (t === 'Offload') return <ArrowDownLeft className="w-3.5 h-3.5" />;
    if (t === 'Load') return <ArrowUpRight className="w-3.5 h-3.5" />;
    if (t === 'Transfer') return <ArrowLeftRight className="w-3.5 h-3.5" />;
    return <Wrench className="w-3.5 h-3.5" />;
  };

  const typeColor = (t: OperationType) => {
    if (t === 'Offload') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (t === 'Load') return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    if (t === 'Transfer') return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  const statusPills = [
    { label: 'All', count: operations.length },
    { label: 'In Progress', count: stats.inProgress },
    { label: 'Completed', count: stats.completed },
    { label: 'Scheduled', count: stats.scheduled },
    { label: 'Delayed', count: stats.delayed },
  ];

  return (
    <PageWrapper
      title="Cargo Operations Log"
      description="Track all cargo loading, offloading, transfers, and inspections across all berths"
      actions={
        <Button className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:from-sky-600 hover:to-indigo-600 rounded-[10px] gap-2">
          <ArrowLeftRight className="w-4 h-4" />New Operation
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <KPICard title="Total Ops" value={stats.total} icon={<ArrowLeftRight className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="In Progress" value={stats.inProgress} icon={<Loader2 className="w-5 h-5" />} iconColor="blue" />
        <KPICard title="Completed" value={stats.completed} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Scheduled" value={stats.scheduled} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Containers Handled" value={stats.totalContainers} icon={<Package className="w-5 h-5" />} iconColor="indigo" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => { setSearch(e.target.value); setLoading(true); setTimeout(() => setLoading(false), 300); }} placeholder="Search operation ID, vessel, operator..." className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)] transition-all duration-200" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <Select value={typeFilter} onValueChange={t => setTypeFilter(t)}>
            <SelectTrigger className="w-[160px] h-9 bg-muted/40 border-border rounded-[9px] text-[0.84rem]"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Offload">Offload</SelectItem>
              <SelectItem value="Load">Load</SelectItem>
              <SelectItem value="Transfer">Transfer</SelectItem>
              <SelectItem value="Inspection">Inspection</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusPills.map(pill => {
            const isActive = statusFilter === pill.label;
            const meta = pill.label !== 'All' ? STATUS_META[pill.label as OpsStatus] : null;
            return (
              <button key={pill.label} onClick={() => setStatusFilter(pill.label)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.70rem] font-bold border transition-all ${isActive ? meta ? `${meta.pill} shadow-sm` : 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:border-border'}`}>
                {meta && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
                {pill.label} <span className="text-[0.65rem] opacity-60">{pill.count}</span>
              </button>
            );
          })}
        </div>
        {(search || statusFilter !== 'All' || typeFilter !== 'All') && <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">{filtered.length} operation(s) found</p>}
      </div>

      {loading ? <SkeletonLoader variant="card" count={4} /> : filtered.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center"><ArrowLeftRight className="w-7 h-7 text-muted-foreground/30" /></div>
          <p className="text-[0.88rem] font-semibold text-foreground">No operations found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 px-4 py-2 mb-4 bg-card border border-border/60 rounded-lg shadow-soft text-[0.78rem] text-muted-foreground">
            <span className="flex items-center gap-1.5"><ArrowLeftRight className="w-3.5 h-3.5" />{filtered.length} operations</span>
            <span className="w-px h-3 bg-border/50" />
            <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" />{filtered.reduce((s, o) => s + o.containerCount, 0)} containers</span>
          </div>
          <div className="space-y-3">
            {filtered.map(op => {
              const meta = STATUS_META[op.status];
              return (
                <div key={op.id} className="group bg-card border border-border/60 rounded-xl shadow-soft p-4 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColor(op.type)}`}>
                            {typeIcon(op.type)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-[0.88rem] font-semibold text-foreground">{op.operation}</h3>
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.65rem] font-bold border ${meta.pill}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{op.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-[0.72rem] text-muted-foreground">
                              <span>{op.vessel}</span>
                              <span className="w-px h-3 bg-border/40" />
                              <span>Berth {op.berth}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[0.65rem] font-bold px-2 py-0.5 ${typeColor(op.type)}`}>{op.type}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Cargo</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5">{op.cargo}</p>
                          <p className="text-[0.70rem] text-muted-foreground">{op.containerCount} containers</p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Duration</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5">{op.duration}</p>
                          <p className="text-[0.70rem] text-muted-foreground">{op.started}</p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Operator</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5">{op.operator}</p>
                          <p className="text-[0.70rem] text-muted-foreground">Sup: {op.supervisor}</p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Equipment</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5 text-[0.72rem]">{op.equipment}</p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[0.60rem] text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{op.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${op.progress === 100 ? 'bg-emerald-400' : op.status === 'Delayed' ? 'bg-destructive' : 'bg-blue-400'}`} style={{ width: `${op.progress}%` }} />
                        </div>
                      </div>
                      {op.notes && <p className="text-[0.72rem] text-muted-foreground mt-2 italic">{op.notes}</p>}
                    </div>
                    <div className="flex lg:flex-col items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400"><Edit className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </PageWrapper>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Container, Search, Package, CheckCircle2, AlertTriangle, Clock,
  Eye, Edit, Trash2, X, Dock, Sailboat, MapPin, Timer, Loader2,
  ArrowUpRight, ArrowDownLeft, ArrowRight, FileText, Wrench, ShieldAlert,
  BarChart3, Layers,
} from 'lucide-react';

type ContainerStatus = 'Loaded' | 'Unloading' | 'Stuffed' | 'Empty' | 'On Hold' | 'Released' | 'Damaged';
type ContainerSize = '20ft' | '20ft HC' | '40ft' | '40ft HC' | '45ft';

interface ContainerItem {
  id: string;
  container: string;
  size: ContainerSize;
  type: string;
  status: ContainerStatus;
  vessel: string;
  voyage: string;
  origin: string;
  destination: string;
  weight: string;
  yard: string;
  gateIn: string;
  gateOut: string | null;
  seal: string;
  customsHold: boolean;
  damage: boolean;
  lastMoved: string;
  operator: string;
}

const STATUS_META: Record<ContainerStatus, { pill: string; dot: string }> = {
  Loaded: { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  Unloading: { pill: 'bg-violet-500/10 text-violet-400 border-violet-500/20', dot: 'bg-violet-400' },
  Stuffed: { pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' },
  Empty: { pill: 'bg-muted/50 text-muted-foreground border-border/40', dot: 'bg-muted-foreground' },
  'On Hold': { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  Released: { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  Damaged: { pill: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
};

const containers: ContainerItem[] = [
  { id: 'CN-001', container: 'MAEU123456', size: '40ft HC', type: 'Dry Van', status: 'Loaded', vessel: 'CMA CGM ALTAMIRA', voyage: 'CNYTN-ALT-2026', origin: 'Yantian, CN', destination: 'Le Havre, FR', weight: '26,400 kg', yard: 'Yard-A-01', gateIn: '13 May 06:30', gateOut: null, seal: 'SL-0012345', customsHold: false, damage: false, lastMoved: '13 May 08:15', operator: 'DP World' },
  { id: 'CN-002', container: 'OOLU789012', size: '20ft', type: 'Reefer', status: 'Unloading', vessel: 'MSC ZOE', voyage: 'LKCMB-JPTYO-2026', origin: 'Colombo, LK', destination: 'Tokyo, JP', weight: '14,200 kg', yard: 'Yard-B-02', gateIn: '13 May 07:15', gateOut: null, seal: 'SL-0098765', customsHold: true, damage: false, lastMoved: '13 May 07:45', operator: 'PSA International' },
  { id: 'CN-003', container: 'COSCO345678', size: '40ft', type: 'Open Top', status: 'Loaded', vessel: 'MAERSK GUJARAT', voyage: 'INMUM-SGSIN-2026', origin: 'Mumbai, IN', destination: 'Singapore, SG', weight: '22,800 kg', yard: 'Yard-C-03', gateIn: '12 May 22:00', gateOut: null, seal: 'SL-0054321', customsHold: false, damage: false, lastMoved: '13 May 06:00', operator: 'Adani Ports' },
  { id: 'CN-004', container: 'APL901234', size: '20ft HC', type: 'Dry Van', status: 'On Hold', vessel: 'OOCL HONG KONG', voyage: 'SGSIN-INNSA-2026', origin: 'Singapore, SG', destination: 'Mumbai, IN', weight: '18,500 kg', yard: 'Yard-D-01', gateIn: '—', gateOut: null, seal: '—', customsHold: true, damage: false, lastMoved: '12 May 14:30', operator: 'DP World' },
  { id: 'CN-005', container: 'MSC567890', size: '40ft', type: 'Flat Rack', status: 'Loaded', vessel: 'MSC ZOE', voyage: 'LKCMB-JPTYO-2026', origin: 'Colombo, LK', destination: 'Yokohama, JP', weight: '31,200 kg', yard: 'Yard-A-04', gateIn: '12 May 18:45', gateOut: null, seal: 'SL-0076543', customsHold: false, damage: false, lastMoved: '13 May 05:30', operator: 'PSA International' },
  { id: 'CN-006', container: 'HLCU112233', size: '40ft HC', type: 'Dry Van', status: 'Empty', vessel: 'EVERGREEN LOTUS', voyage: 'NLRTM-CNSHA-2026', origin: 'Rotterdam, NL', destination: 'Shanghai, CN', weight: '—', yard: 'Yard-E-01', gateIn: '11 May 10:00', gateOut: '12 May 16:00', seal: '—', customsHold: false, damage: false, lastMoved: '12 May 16:00', operator: 'ECT Terminal' },
  { id: 'CN-007', container: 'ONE445566', size: '45ft', type: 'Pallet Wide', status: 'Stuffed', vessel: 'ONE APUS', voyage: 'USLAX-JPTYO-2026', origin: 'Los Angeles, US', destination: 'Tokyo, JP', weight: '28,900 kg', yard: 'Yard-F-02', gateIn: '11 May 14:20', gateOut: null, seal: 'SL-0032187', customsHold: false, damage: false, lastMoved: '12 May 20:10', operator: 'Yusen Terminals' },
  { id: 'CN-008', container: 'MSC998877', size: '20ft', type: 'Tank', status: 'Damaged', vessel: 'MSC AURORA', voyage: 'DEHAM-CNSHA-2026', origin: 'Hamburg, DE', destination: 'Shanghai, CN', weight: '16,700 kg', yard: 'Yard-G-03', gateIn: '10 May 09:30', gateOut: null, seal: 'SL-0065432', customsHold: false, damage: true, lastMoved: '12 May 11:00', operator: 'HHLA' },
  { id: 'CN-009', container: 'MAEU554433', size: '40ft', type: 'Reefer', status: 'Released', vessel: 'COSCO PRIDE', voyage: 'CNSHA-USLAX-2026', origin: 'Shanghai, CN', destination: 'Los Angeles, US', weight: '24,100 kg', yard: 'Yard-H-01', gateIn: '09 May 16:45', gateOut: '12 May 08:30', seal: 'SL-0023456', customsHold: false, damage: false, lastMoved: '12 May 08:30', operator: 'COSCO Terminal' },
  { id: 'CN-010', container: 'OOLU332211', size: '40ft HC', type: 'Dry Van', status: 'Loaded', vessel: 'OOCL HONG KONG', voyage: 'SGSIN-INNSA-2026', origin: 'Singapore, SG', destination: 'Mumbai, IN', weight: '27,600 kg', yard: 'Yard-D-04', gateIn: '11 May 12:10', gateOut: null, seal: 'SL-0087654', customsHold: false, damage: false, lastMoved: '13 May 04:00', operator: 'DP World' },
];

export default function ContainersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const sizes = useMemo(() => [...new Set(containers.map(c => c.size))], []);

  const filtered = useMemo(() => {
    let result = [...containers];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.container.toLowerCase().includes(q) ||
        c.vessel.toLowerCase().includes(q) ||
        c.yard.toLowerCase().includes(q) ||
        c.origin.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') result = result.filter(c => c.status === statusFilter);
    if (sizeFilter !== 'All') result = result.filter(c => c.size === sizeFilter);
    return result;
  }, [search, statusFilter, sizeFilter]);

  const stats = useMemo(() => ({
    total: containers.length,
    loaded: containers.filter(c => c.status === 'Loaded').length,
    unloading: containers.filter(c => c.status === 'Unloading').length,
    onHold: containers.filter(c => c.customsHold).length,
    damaged: containers.filter(c => c.damage).length,
    empty: containers.filter(c => c.status === 'Empty').length,
  }), []);

  const statusPills = [
    { label: 'All', count: containers.length },
    { label: 'Loaded', count: stats.loaded },
    { label: 'Unloading', count: stats.unloading },
    { label: 'On Hold', count: stats.onHold },
    { label: 'Empty', count: stats.empty },
    { label: 'Damaged', count: stats.damaged },
  ];

  return (
    <PageWrapper
      title="Container List"
      description="Track all containers in port, yard locations, customs holds, and movement history"
      actions={
        <Link href="/port/containers/register">
          <Button className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:from-sky-600 hover:to-indigo-600 rounded-[10px] gap-2">
            <Container className="w-4 h-4" />
            Register Container
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <KPICard title="Total Containers" value={stats.total} icon={<Container className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Loaded" value={stats.loaded} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Unloading" value={stats.unloading} icon={<Loader2 className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="On Hold" value={stats.onHold} icon={<ShieldAlert className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Damaged" value={stats.damaged} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => { setSearch(e.target.value); setLoading(true); setTimeout(() => setLoading(false), 300); }} placeholder="Search container, vessel, yard, or origin..." className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)] transition-all duration-200" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <Select value={sizeFilter} onValueChange={setSizeFilter}>
            <SelectTrigger className="w-[150px] h-9 bg-muted/40 border-border rounded-[9px] text-[0.84rem]"><SelectValue placeholder="All Sizes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Sizes</SelectItem>
              {sizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusPills.map(pill => {
            const isActive = statusFilter === pill.label;
            const meta = pill.label !== 'All' ? STATUS_META[pill.label as ContainerStatus] : null;
            return (
              <button key={pill.label} onClick={() => setStatusFilter(pill.label)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.70rem] font-bold border transition-all ${isActive ? meta ? `${meta.pill} shadow-sm` : 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:border-border'}`}>
                {meta && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
                {pill.label} <span className="text-[0.65rem] opacity-60">{pill.count}</span>
              </button>
            );
          })}
        </div>
        {(search || statusFilter !== 'All' || sizeFilter !== 'All') && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">{filtered.length} container(s) found</p>
        )}
      </div>

      {loading ? (
        <SkeletonLoader variant="card" count={4} />
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center">
            <Container className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No containers found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 px-4 py-2 mb-4 bg-card border border-border/60 rounded-lg shadow-soft text-[0.78rem] text-muted-foreground">
            <span className="flex items-center gap-1.5"><Container className="w-3.5 h-3.5" />{filtered.length} containers</span>
            <span className="w-px h-3 bg-border/50" />
            <span className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-amber-400" />{filtered.filter(c => c.customsHold).length} on hold</span>
          </div>
          <div className="space-y-3">
            {filtered.map(container => {
              const meta = STATUS_META[container.status];
              return (
                <div key={container.id} className="group bg-card border border-border/60 rounded-xl shadow-soft p-4 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                            <Container className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-[0.88rem] font-semibold text-foreground font-mono">{container.container}</h3>
                              {container.customsHold && <Badge variant="outline" className="text-[0.60rem] px-1.5 py-0 bg-amber-500/10 text-amber-400 border-amber-500/20">CUSTOMS HOLD</Badge>}
                              {container.damage && <Badge variant="outline" className="text-[0.60rem] px-1.5 py-0 bg-destructive/10 text-destructive border-destructive/20">DAMAGED</Badge>}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-[0.72rem] text-muted-foreground">
                              <span>{container.size}</span>
                              <span className="w-px h-3 bg-border/40" />
                              <span>{container.type}</span>
                              <span className="w-px h-3 bg-border/40" />
                              <span>Seal: {container.seal}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold border shrink-0 ${meta.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{container.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Vessel / Voyage</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5">{container.vessel}</p>
                          <p className="text-[0.70rem] font-mono text-muted-foreground">{container.voyage}</p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Route</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {container.origin.split(',')[0]}
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            {container.destination.split(',')[0]}
                          </p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Yard / Operator</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5">{container.yard}</p>
                          <p className="text-[0.70rem] text-muted-foreground">{container.operator}</p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Weight</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5">{container.weight}</p>
                          <p className="text-[0.70rem] text-muted-foreground">Gate in: {container.gateIn}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex lg:flex-col items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-150"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors duration-150"><Edit className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-150"><Trash2 className="w-3.5 h-3.5" /></button>
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

'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Ship,
  Anchor,
  Search,
  CalendarDays,
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Dock,
  Eye,
  Edit,
  Trash2,
  X,
  Sailboat,
  Container,
  TrendingUp,
  ArrowUpRight,
  MapPin,
  Navigation,
  Timer,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────
type VesselStatus = 'Arrived' | 'Berthing' | 'Sailing' | 'Expected' | 'Departed' | 'Delayed';

interface Vessel {
  id: string;
  vessel: string;
  imo: string;
  voyage: string;
  port: string;
  portCode: string;
  berth: string;
  eta: string;
  etd: string;
  cargo: string;
  containerCount: number;
  carrier: string;
  status: VesselStatus;
  flag: string;
}

interface TimelineEvent {
  label: string;
  time: string;
  completed: boolean;
  active: boolean;
}

// ─── Status Meta ────────────────────────────────────────────────────────
const STATUS_META: Record<VesselStatus, { pill: string; dot: string }> = {
  Arrived: {
    pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  Berthing: {
    pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
  },
  Sailing: {
    pill: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    dot: 'bg-indigo-400',
  },
  Expected: {
    pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  Departed: {
    pill: 'bg-muted/50 text-muted-foreground border-border/40',
    dot: 'bg-muted-foreground',
  },
  Delayed: {
    pill: 'bg-destructive/10 text-destructive border-destructive/20',
    dot: 'bg-destructive',
  },
};

// ─── Mock Data ──────────────────────────────────────────────────────────
const vessels: Vessel[] = [
  { id: 'VES-001', vessel: 'CMA CGM ALTAMIRA', imo: '9961350', voyage: 'CNYTN-ALT-2026-04', port: 'Yantian', portCode: 'CNYTN', berth: 'B-12', eta: '2026-05-13 08:15', etd: '2026-05-13 18:30', cargo: '34 Containers', containerCount: 34, carrier: 'CMA CGM', status: 'Arrived', flag: '🇫🇷' },
  { id: 'VES-002', vessel: 'MAERSK GUJARAT', imo: '9345821', voyage: 'INMUM-SGSIN-2026-11', port: 'Singapore', portCode: 'SGSIN', berth: 'C-03', eta: '2026-05-14 14:00', etd: '2026-05-15 02:00', cargo: '52 Containers', containerCount: 52, carrier: 'Maersk', status: 'Sailing', flag: '🇩🇰' },
  { id: 'VES-003', vessel: 'MSC ZOE', imo: '9212345', voyage: 'LKCMB-JPTYO-2026-05', port: 'Colombo', portCode: 'LKCMB', berth: 'A-07', eta: '2026-05-13 22:45', etd: '2026-05-14 10:30', cargo: '18 Containers', containerCount: 18, carrier: 'MSC', status: 'Berthing', flag: '🇨🇭' },
  { id: 'VES-004', vessel: 'OOCL HONG KONG', imo: '9705123', voyage: 'SGSIN-INNSA-2026-08', port: 'Mumbai', portCode: 'INNSA', berth: 'D-04', eta: '2026-05-15 06:10', etd: '2026-05-15 20:00', cargo: '28 Containers', containerCount: 28, carrier: 'OOCL', status: 'Expected', flag: '🇭🇰' },
  { id: 'VES-005', vessel: 'EVERGREEN LOTUS', imo: '9851234', voyage: 'NLRTM-CNSHA-2026-03', port: 'Rotterdam', portCode: 'NLRTM', berth: 'E-01', eta: '2026-05-15 14:30', etd: '2026-05-16 06:00', cargo: '45 Containers', containerCount: 45, carrier: 'Evergreen', status: 'Sailing', flag: '🇹🇼' },
  { id: 'VES-006', vessel: 'COSCO PRIDE', imo: '9567890', voyage: 'CNSHA-USLAX-2026-07', port: 'Shanghai', portCode: 'CNSHA', berth: 'B-08', eta: '2026-05-12 09:00', etd: '2026-05-12 21:00', cargo: '67 Containers', containerCount: 67, carrier: 'COSCO', status: 'Departed', flag: '🇨🇳' },
  { id: 'VES-007', vessel: 'MSC AURORA', imo: '9724567', voyage: 'DEHAM-CNSHA-2026-02', port: 'Hamburg', portCode: 'DEHAM', berth: 'F-05', eta: '2026-05-16 11:20', etd: '2026-05-17 02:00', cargo: '31 Containers', containerCount: 31, carrier: 'MSC', status: 'Delayed', flag: '🇨🇭' },
  { id: 'VES-008', vessel: 'ONE APUS', imo: '9654321', voyage: 'USLAX-JPTYO-2026-09', port: 'Los Angeles', portCode: 'USLAX', berth: 'C-11', eta: '2026-05-14 07:45', etd: '2026-05-14 19:30', cargo: '22 Containers', containerCount: 22, carrier: 'ONE', status: 'Berthing', flag: '🇯🇵' },
];

// ─── Timeline component ─────────────────────────────────────────────────
function VesselTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-2">
      {events.map((event, i) => (
        <div key={event.label} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`w-2.5 h-2.5 rounded-full border-2 ${
                event.active
                  ? 'border-primary bg-primary'
                  : event.completed
                  ? 'border-emerald-400 bg-emerald-400'
                  : 'border-border/40 bg-card'
              }`}
            />
            {i < events.length - 1 && (
              <div className={`w-px h-6 ${event.completed ? 'bg-emerald-400/30' : 'bg-border/20'}`} />
            )}
          </div>
          <div className="flex-1 pb-2">
            <p className={`text-[0.78rem] font-medium ${
              event.active ? 'text-foreground' : event.completed ? 'text-emerald-400' : 'text-muted-foreground'
            }`}>
              {event.label}
            </p>
            <p className="text-[0.70rem] text-muted-foreground">{event.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────
export default function PortVesselsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [portFilter, setPortFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'eta' | 'vessel' | 'status'>('eta');
  const [loading, setLoading] = useState(false);

  const ports = useMemo(() => [...new Set(vessels.map(v => v.port))], []);

  const filtered = useMemo(() => {
    let result = [...vessels];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(v =>
        v.vessel.toLowerCase().includes(q) ||
        v.imo.includes(q) ||
        v.port.toLowerCase().includes(q) ||
        v.voyage.toLowerCase().includes(q) ||
        v.carrier.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') {
      result = result.filter(v => v.status === statusFilter);
    }
    if (portFilter !== 'All') {
      result = result.filter(v => v.port === portFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'vessel') return a.vessel.localeCompare(b.vessel);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return a.eta.localeCompare(b.eta);
    });

    return result;
  }, [search, statusFilter, portFilter, sortBy]);

  const stats = useMemo(() => ({
    arrived: vessels.filter(v => v.status === 'Arrived').length,
    sailing: vessels.filter(v => v.status === 'Sailing').length,
    berthing: vessels.filter(v => v.status === 'Berthing').length,
    expected: vessels.filter(v => v.status === 'Expected').length,
    delayed: vessels.filter(v => v.status === 'Delayed').length,
    totalContainers: vessels.reduce((sum, v) => sum + v.containerCount, 0),
  }), []);

  const statusPills: { label: VesselStatus | 'All'; count: number }[] = [
    { label: 'All', count: vessels.length },
    { label: 'Arrived', count: stats.arrived },
    { label: 'Berthing', count: stats.berthing },
    { label: 'Sailing', count: stats.sailing },
    { label: 'Expected', count: stats.expected },
    { label: 'Departed', count: vessels.filter(v => v.status === 'Departed').length },
    { label: 'Delayed', count: stats.delayed },
  ];

  const generateTimeline = (vessel: Vessel): TimelineEvent[] => {
    const base = [
      { label: 'ETA at Port', time: vessel.eta, completed: vessel.status !== 'Expected', active: vessel.status === 'Expected' },
      { label: 'Berthing', time: vessel.berth, completed: ['Arrived', 'Departed'].includes(vessel.status), active: vessel.status === 'Berthing' },
      { label: 'Cargo Operations', time: `${vessel.containerCount} containers`, completed: vessel.status === 'Departed', active: vessel.status === 'Berthing' || vessel.status === 'Arrived' },
      { label: 'Departure', time: vessel.etd, completed: vessel.status === 'Departed', active: false },
    ];
    return base as TimelineEvent[];
  };

  return (
    <PageWrapper
      title="Vessel Schedule"
      description="Track arrivals, departures, and real-time status of all vessels at port"
      actions={
        <Button className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:from-sky-600 hover:to-indigo-600 rounded-[10px] gap-2">
          <Sailboat className="w-4 h-4" />
          Register Vessel
        </Button>
      }
    >
      {/* ── KPI Strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <KPICard title="Arrived" value={stats.arrived} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Berthing" value={stats.berthing} icon={<Anchor className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Sailing" value={stats.sailing} icon={<Ship className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Expected" value={stats.expected} icon={<Clock className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Containers" value={stats.totalContainers} icon={<Container className="w-5 h-5" />} iconColor="teal" trend={{ value: 12, isPositive: true }} />
      </div>

      {/* ── Filter Bar ────────────────────────────────────────── */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setLoading(true); setTimeout(() => setLoading(false), 300); }}
              placeholder="Search vessel, IMO, voyage, or port..."
              className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)] transition-all duration-200"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Select value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[140px] h-9 bg-muted/40 border-border rounded-[9px] text-[0.84rem]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eta">ETA</SelectItem>
              <SelectItem value="vessel">Vessel</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>

          <Select value={portFilter} onValueChange={setPortFilter}>
            <SelectTrigger className="w-[160px] h-9 bg-muted/40 border-border rounded-[9px] text-[0.84rem]">
              <SelectValue placeholder="All Ports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Ports</SelectItem>
              {ports.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusPills.map(pill => {
            const isActive = statusFilter === pill.label;
            const meta = pill.label !== 'All' ? STATUS_META[pill.label as VesselStatus] : null;
            return (
              <button
                key={pill.label}
                onClick={() => setStatusFilter(pill.label)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.70rem] font-bold border transition-all ${
                  isActive
                    ? meta
                      ? `${meta.pill} shadow-sm`
                      : 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                    : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:border-border'
                }`}
              >
                {meta && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
                {pill.label}
                <span className={`text-[0.65rem] ${isActive ? 'opacity-80' : 'text-muted-foreground/60'}`}>
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>

        {(search || statusFilter !== 'All' || portFilter !== 'All') && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">
            {filtered.length} vessel(s) found
          </p>
        )}
      </div>

      {/* ── Vessel Cards ──────────────────────────────────────── */}
      {loading ? (
        <SkeletonLoader variant="card" count={4} />
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center">
            <Ship className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No vessels found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="flex items-center gap-4 px-4 py-2 mb-4 bg-card border border-border/60 rounded-lg shadow-soft text-[0.78rem] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Ship className="w-3.5 h-3.5" />
              {filtered.length} vessels
            </span>
            <span className="w-px h-3 bg-border/50" />
            <span className="flex items-center gap-1.5">
              <Container className="w-3.5 h-3.5" />
              {filtered.reduce((s, v) => s + v.containerCount, 0)} containers
            </span>
          </div>

          <div className="space-y-4">
            {filtered.map(vessel => {
              const meta = STATUS_META[vessel.status];
              const timeline = generateTimeline(vessel);
              return (
                <div
                  key={vessel.id}
                  className="group bg-card border border-border/60 rounded-xl shadow-soft p-5 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                    {/* Left: Vessel info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/20 flex items-center justify-center shrink-0">
                            <Ship className="w-5 h-5 text-sky-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{vessel.flag}</span>
                              <h3 className="text-[0.88rem] font-semibold text-foreground truncate">{vessel.vessel}</h3>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[0.72rem] font-mono text-muted-foreground">IMO {vessel.imo}</span>
                              <span className="w-px h-3 bg-border/40" />
                              <span className="text-[0.72rem] font-mono text-muted-foreground">{vessel.voyage}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status pill */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold border shrink-0 ${meta.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          {vessel.status}
                        </span>
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Port</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                            {vessel.port}
                            <span className="text-[0.70rem] font-mono text-muted-foreground">({vessel.portCode})</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Berth</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5 flex items-center gap-1.5">
                            <Dock className="w-3.5 h-3.5 text-muted-foreground" />
                            {vessel.berth}
                          </p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">ETA</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5 flex items-center gap-1.5">
                            <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                            {vessel.eta}
                          </p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Cargo</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5 flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-muted-foreground" />
                            {vessel.cargo}
                          </p>
                        </div>
                      </div>

                      {/* Carrier + ETD */}
                      <div className="flex items-center gap-4 mt-3 text-[0.72rem] text-muted-foreground">
                        <span>{vessel.carrier}</span>
                        <span className="w-px h-3 bg-border/40" />
                        <span>ETD: {vessel.etd}</span>
                      </div>
                    </div>

                    {/* Center: Timeline */}
                    <div className="w-full lg:w-48 shrink-0 border-t lg:border-t-0 lg:border-l border-border/30 pt-4 lg:pt-0 lg:pl-5">
                      <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground mb-3">Voyage Timeline</p>
                      <VesselTimeline events={timeline} />
                    </div>

                    {/* Right: Actions */}
                    <div className="flex lg:flex-col items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-150">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors duration-150">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-150">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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

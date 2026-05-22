'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dock,
  Search,
  Anchor,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Edit,
  Trash2,
  X,
  MapPin,
  Timer,
  Sailboat,
  Container,
  Ship,
  Wrench,
  GanttChartSquare,
  ArrowRight,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────
type BerthStatus = 'Occupied' | 'Available' | 'Maintenance' | 'Reserved' | 'Departing';
type BerthType = 'Container' | 'Bulk' | 'Liquid' | 'Passenger' | 'Repair';
type VesselClass = 'Feeder' | 'Panamax' | 'Post-Panamax' | 'Ultra-Large' | 'VLCC';

interface Berth {
  id: string;
  berth: string;
  type: BerthType;
  status: BerthStatus;
  vessel: string | null;
  vesselClass: VesselClass | null;
  imo: string | null;
  operator: string | null;
  eta: string | null;
  etd: string | null;
  cargoDescription: string | null;
  containerCount: number | null;
  depth: number;
  length: number;
  maxDraft: number;
  occupancyRate: number;
  lastMaintenance: string;
}

// ─── Status Meta ────────────────────────────────────────────────────────
const STATUS_META: Record<BerthStatus, { pill: string; dot: string }> = {
  Occupied: {
    pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
  },
  Available: {
    pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  Maintenance: {
    pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  Reserved: {
    pill: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    dot: 'bg-indigo-400',
  },
  Departing: {
    pill: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    dot: 'bg-violet-400',
  },
};

const TYPE_META: Record<BerthType, { icon: typeof Dock; color: string; bg: string }> = {
  Container: { icon: Container, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  Bulk: { icon: Anchor, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  Liquid: { icon: Ship, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  Passenger: { icon: Sailboat, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  Repair: { icon: Wrench, color: 'text-rose-400', bg: 'bg-rose-500/10' },
};

// ─── Mock Data ──────────────────────────────────────────────────────────
const berths: Berth[] = [
  { id: 'BTH-001', berth: 'A-01', type: 'Container', status: 'Occupied', vessel: 'CMA CGM ALTAMIRA', vesselClass: 'Post-Panamax', imo: '9961350', operator: 'DP World', eta: '2026-05-13 08:15', etd: '2026-05-13 18:30', cargoDescription: 'Mixed Container Cargo', containerCount: 34, depth: 15, length: 350, maxDraft: 14, occupancyRate: 85, lastMaintenance: '2026-04-01' },
  { id: 'BTH-002', berth: 'A-02', type: 'Container', status: 'Available', vessel: null, vesselClass: null, imo: null, operator: null, eta: null, etd: null, cargoDescription: null, containerCount: null, depth: 15, length: 350, maxDraft: 14, occupancyRate: 0, lastMaintenance: '2026-04-15' },
  { id: 'BTH-003', berth: 'B-01', type: 'Bulk', status: 'Occupied', vessel: 'SHANDONG HONOR', vesselClass: 'Ultra-Large', imo: '9786543', operator: 'Adani Ports', eta: '2026-05-12 22:00', etd: '2026-05-14 06:00', cargoDescription: 'Iron Ore', containerCount: null, depth: 18, length: 330, maxDraft: 16, occupancyRate: 72, lastMaintenance: '2026-03-20' },
  { id: 'BTH-004', berth: 'B-02', type: 'Bulk', status: 'Maintenance', vessel: null, vesselClass: null, imo: null, operator: null, eta: null, etd: null, cargoDescription: null, containerCount: null, depth: 18, length: 330, maxDraft: 16, occupancyRate: 0, lastMaintenance: '2026-05-10' },
  { id: 'BTH-005', berth: 'C-01', type: 'Liquid', status: 'Reserved', vessel: 'MT CHEMSTAR', vesselClass: 'VLCC', imo: '9214567', operator: 'Shell Terminal', eta: '2026-05-15 06:00', etd: '2026-05-15 18:00', cargoDescription: 'Crude Oil (150k tons)', containerCount: null, depth: 20, length: 370, maxDraft: 18, occupancyRate: 0, lastMaintenance: '2026-04-28' },
  { id: 'BTH-006', berth: 'C-02', type: 'Liquid', status: 'Occupied', vessel: 'EXXON VALDEZ II', vesselClass: 'VLCC', imo: '9567890', operator: 'BP Terminal', eta: '2026-05-11 14:00', etd: '2026-05-14 12:00', cargoDescription: 'LNG (200k tons)', containerCount: null, depth: 20, length: 370, maxDraft: 18, occupancyRate: 65, lastMaintenance: '2026-03-10' },
  { id: 'BTH-007', berth: 'D-01', type: 'Container', status: 'Occupied', vessel: 'MSC ZOE', vesselClass: 'Ultra-Large', imo: '9212345', operator: 'PSA International', eta: '2026-05-13 22:45', etd: '2026-05-14 10:30', cargoDescription: 'Mixed Container Cargo', containerCount: 18, depth: 16, length: 400, maxDraft: 15, occupancyRate: 45, lastMaintenance: '2026-04-20' },
  { id: 'BTH-008', berth: 'D-02', type: 'Container', status: 'Departing', vessel: 'OOCL HONG KONG', vesselClass: 'Post-Panamax', imo: '9705123', operator: 'DP World', eta: '2026-05-14 06:10', etd: '2026-05-14 20:00', cargoDescription: 'Electronics & Apparel', containerCount: 28, depth: 16, length: 350, maxDraft: 15, occupancyRate: 30, lastMaintenance: '2026-05-05' },
  { id: 'BTH-009', berth: 'E-01', type: 'Passenger', status: 'Available', vessel: null, vesselClass: null, imo: null, operator: null, eta: null, etd: null, cargoDescription: null, containerCount: null, depth: 12, length: 300, maxDraft: 10, occupancyRate: 0, lastMaintenance: '2026-05-08' },
  { id: 'BTH-010', berth: 'E-02', type: 'Repair', status: 'Occupied', vessel: 'COSCO PRIDE', vesselClass: 'Ultra-Large', imo: '9567890', operator: 'DryDock Corp', eta: '2026-05-10 09:00', etd: '2026-05-20 21:00', cargoDescription: 'Scheduled Dry Dock Maintenance', containerCount: null, depth: 14, length: 360, maxDraft: 12, occupancyRate: 100, lastMaintenance: '2026-05-10' },
];

// ─── Occupancy Bar ──────────────────────────────────────────────────────
function OccupancyBar({ rate }: { rate: number }) {
  const color = rate > 85 ? 'bg-destructive' : rate > 65 ? 'bg-amber-400' : 'bg-emerald-400';
  return (
    <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${rate}%` }}
      />
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────
export default function PortBerthsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const berthTypes = useMemo(() => [...new Set(berths.map(b => b.type))], []);

  const filtered = useMemo(() => {
    let result = [...berths];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.berth.toLowerCase().includes(q) ||
        (b.vessel && b.vessel.toLowerCase().includes(q)) ||
        b.type.toLowerCase().includes(q) ||
        (b.operator && b.operator.toLowerCase().includes(q)) ||
        (b.cargoDescription && b.cargoDescription.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== 'All') {
      result = result.filter(b => b.status === statusFilter);
    }
    if (typeFilter !== 'All') {
      result = result.filter(b => b.type === typeFilter);
    }

    return result;
  }, [search, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = berths.length;
    const occupied = berths.filter(b => b.status === 'Occupied').length;
    const available = berths.filter(b => b.status === 'Available').length;
    const maintenance = berths.filter(b => b.status === 'Maintenance').length;
    const reserved = berths.filter(b => b.status === 'Reserved').length;
    const avgOccupancy = Math.round(berths.reduce((s, b) => s + b.occupancyRate, 0) / total);
    return { total, occupied, available, maintenance, reserved, avgOccupancy };
  }, []);

  const statusPills: { label: BerthStatus | 'All'; count: number }[] = [
    { label: 'All', count: berths.length },
    { label: 'Occupied', count: stats.occupied },
    { label: 'Available', count: stats.available },
    { label: 'Reserved', count: stats.reserved },
    { label: 'Departing', count: berths.filter(b => b.status === 'Departing').length },
    { label: 'Maintenance', count: stats.maintenance },
  ];

  return (
    <PageWrapper
      title="Berth Management"
      description="Monitor berth occupancy, schedules, and real-time status across all terminals"
      actions={
        <Button className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:from-sky-600 hover:to-indigo-600 rounded-[10px] gap-2">
          <Dock className="w-4 h-4" />
          Assign Berth
        </Button>
      }
    >
      {/* ── KPI Strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <KPICard title="Total Berths" value={stats.total} icon={<Dock className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Occupied" value={stats.occupied} icon={<Sailboat className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Available" value={stats.available} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Maintenance" value={stats.maintenance} icon={<Wrench className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Avg Occupancy" value={`${stats.avgOccupancy}%`} icon={<GanttChartSquare className="w-5 h-5" />} iconColor="teal" trend={stats.avgOccupancy > 70 ? { value: stats.avgOccupancy, isPositive: false } : { value: 100 - stats.avgOccupancy, isPositive: true }} />
      </div>

      {/* ── Filter Bar ────────────────────────────────────────── */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setLoading(true); setTimeout(() => setLoading(false), 300); }}
              placeholder="Search berth, vessel, operator, or cargo..."
              className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)] transition-all duration-200"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] h-9 bg-muted/40 border-border rounded-[9px] text-[0.84rem]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              {berthTypes.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusPills.map(pill => {
            const isActive = statusFilter === pill.label;
            const meta = pill.label !== 'All' ? STATUS_META[pill.label as BerthStatus] : null;
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

        {(search || statusFilter !== 'All' || typeFilter !== 'All') && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">
            {filtered.length} berth(s) found
          </p>
        )}
      </div>

      {/* ── Berth Cards ────────────────────────────────────────── */}
      {loading ? (
        <SkeletonLoader variant="card" count={4} />
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center">
            <Dock className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No berths found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          {/* Occupancy overview bar */}
          <div className="flex items-center gap-4 px-4 py-2 mb-4 bg-card border border-border/60 rounded-lg shadow-soft text-[0.78rem] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Dock className="w-3.5 h-3.5" />
              {filtered.length} berths
            </span>
            <span className="w-px h-3 bg-border/50" />
            <span className="flex items-center gap-1.5">
              <Sailboat className="w-3.5 h-3.5" />
              {stats.occupied} occupied
            </span>
            <span className="w-px h-3 bg-border/50" />
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {stats.available} available
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(berth => {
              const meta = STATUS_META[berth.status];
              const typeMeta = TYPE_META[berth.type];
              const TypeIcon = typeMeta.icon;
              return (
                <div
                  key={berth.id}
                  className="group bg-card border border-border/60 rounded-xl shadow-soft p-4 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl ${typeMeta.bg} border border-current/20 flex items-center justify-center shrink-0 ${typeMeta.color}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[0.88rem] font-bold text-foreground font-mono">{berth.berth}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.65rem] font-bold border ${meta.pill}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                            {berth.status}
                          </span>
                        </div>
                        <p className="text-[0.72rem] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[0.60rem] font-bold border ${typeMeta.bg} ${typeMeta.color} border-current/20`}>
                            {berth.type}
                          </span>
                          {berth.operator && <span>· {berth.operator}</span>}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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

                  {/* Occupancy bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[0.65rem] text-muted-foreground mb-1">
                      <span>Occupancy</span>
                      <span>{berth.occupancyRate}%</span>
                    </div>
                    <OccupancyBar rate={berth.occupancyRate} />
                  </div>

                  {/* Vessel info (if occupied) */}
                  {berth.vessel ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[0.82rem] font-medium text-foreground">
                        <Sailboat className="w-4 h-4 text-muted-foreground" />
                        {berth.vessel}
                        {berth.vesselClass && (
                          <span className="text-[0.60rem] font-bold uppercase tracking-wider text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded border border-border/30">
                            {berth.vesselClass}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[0.72rem]">
                        {berth.imo && (
                          <div>
                            <p className="text-muted-foreground">IMO</p>
                            <p className="text-foreground font-mono">{berth.imo}</p>
                          </div>
                        )}
                        {berth.eta && (
                          <div>
                            <p className="text-muted-foreground">ETA</p>
                            <p className="text-foreground">{berth.eta}</p>
                          </div>
                        )}
                        {berth.etd && (
                          <div>
                            <p className="text-muted-foreground">ETD</p>
                            <p className="text-foreground">{berth.etd}</p>
                          </div>
                        )}
                        {berth.containerCount && (
                          <div>
                            <p className="text-muted-foreground">Containers</p>
                            <p className="text-foreground font-medium">{berth.containerCount}</p>
                          </div>
                        )}
                      </div>
                      {berth.cargoDescription && (
                        <p className="text-[0.72rem] text-muted-foreground flex items-center gap-1.5">
                          <Container className="w-3.5 h-3.5" />
                          {berth.cargoDescription}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 py-2 text-[0.78rem] text-muted-foreground">
                      {berth.status === 'Available' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Ready for vessel assignment
                        </>
                      ) : berth.status === 'Maintenance' ? (
                        <>
                          <Wrench className="w-4 h-4 text-amber-400" />
                          Under maintenance — last service: {berth.lastMaintenance}
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-indigo-400" />
                          Next vessel arriving {berth.eta}
                        </>
                      )}
                    </div>
                  )}

                  {/* Specs footer */}
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30 text-[0.65rem] text-muted-foreground">
                    <span>Depth: {berth.depth}m</span>
                    <span className="w-px h-3 bg-border/40" />
                    <span>Length: {berth.length}m</span>
                    <span className="w-px h-3 bg-border/40" />
                    <span>Max Draft: {berth.maxDraft}m</span>
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

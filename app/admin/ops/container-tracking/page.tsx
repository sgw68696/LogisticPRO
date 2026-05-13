'use client';

import { useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockCargo } from '@/data/mockData';
import type { Cargo } from '@/data/mockData';
import {
  Search, Eye, X, RotateCcw,
  SlidersHorizontal, Package,
  Truck, Plane, Ship,
  MapPin, Clock, Thermometer,
  AlertTriangle, CheckCircle, Circle,
  ChevronDown, ChevronUp, Navigation,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

// ── Config maps ──
const CARGO_STATUS_META: Record<string, { pill: string; dot: string; icon: typeof Circle }> = {
  'Pending':    { pill: 'bg-muted/50 text-muted-foreground border-border/40',       dot: 'bg-muted-foreground', icon: Circle        },
  'Loaded':     { pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20',             dot: 'bg-sky-400',          icon: Package       },
  'In Transit': { pill: 'bg-primary/10 text-primary border-primary/20',             dot: 'bg-primary',          icon: Navigation    },
  'Delivered':  { pill: 'bg-success/10 text-success border-success/20',             dot: 'bg-success',          icon: CheckCircle   },
  'Damaged':    { pill: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive',      icon: AlertTriangle },
  'Lost':       { pill: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive',      icon: AlertTriangle },
};

const LEG_STATUS_META: Record<string, { color: string; bg: string; dot: string }> = {
  'Scheduled':  { color: 'text-muted-foreground', bg: 'bg-muted/30',          dot: 'bg-muted-foreground' },
  'In Transit': { color: 'text-primary',           bg: 'bg-primary/10',        dot: 'bg-primary'          },
  'Completed':  { color: 'text-success',           bg: 'bg-success/10',        dot: 'bg-success'          },
  'Delayed':    { color: 'text-warning',           bg: 'bg-warning/10',        dot: 'bg-warning'          },
  'Cancelled':  { color: 'text-destructive',       bg: 'bg-destructive/10',    dot: 'bg-destructive'      },
};

const TRANSPORT_ICON: Record<string, typeof Truck> = {
  Land:  Truck,
  Air:   Plane,
  Water: Ship,
};

const TRANSPORT_COLOR: Record<string, string> = {
  Land:  'text-amber-400',
  Air:   'text-sky-400',
  Water: 'text-primary',
};

const CARGO_TYPES = ['General', 'Hazmat', 'Perishable', 'Fragile', 'Temperature Controlled'];
const TRANSPORT_MODES = ['Land', 'Air', 'Water'];

const TYPE_META: Record<string, string> = {
  'General':              'bg-muted/40 text-muted-foreground border-border/40',
  'Hazmat':               'bg-destructive/10 text-destructive border-destructive/20',
  'Perishable':           'bg-success/10 text-success border-success/20',
  'Fragile':              'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Temperature Controlled': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
};

export default function ContainerTrackingPage() {
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<string>('all');
  const [modeFilter, setMode]       = useState<string>('all');
  const [typeFilter, setType]       = useState<string>('all');
  const [expanded, setExpanded]     = useState<string | null>(null);

  const kpi = useMemo(() => ({
    total:      mockCargo.length,
    inTransit:  mockCargo.filter((c) => c.status === 'In Transit').length,
    delivered:  mockCargo.filter((c) => c.status === 'Delivered').length,
    hazmat:     mockCargo.filter((c) => c.type === 'Hazmat').length,
    tempCtrl:   mockCargo.filter((c) => c.type === 'Temperature Controlled').length,
  }), []);

  const filtered = useMemo(() => mockCargo.filter((c) => {
    const q = search.toLowerCase();
    const matchQ =
      c.cargoNumber.toLowerCase().includes(q)   ||
      c.description.toLowerCase().includes(q)   ||
      c.shipper.name.toLowerCase().includes(q)  ||
      c.consignee.name.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchMode   = modeFilter   === 'all' || c.transportMode === modeFilter;
    const matchType   = typeFilter   === 'all' || c.type === typeFilter;
    return matchQ && matchStatus && matchMode && matchType;
  }), [search, statusFilter, modeFilter, typeFilter]);

  const hasFilters = search || statusFilter !== 'all' || modeFilter !== 'all' || typeFilter !== 'all';

  const clearFilters = () => {
    setSearch(''); setStatus('all'); setMode('all'); setType('all');
  };

  const toggleExpand = (id: string) =>
    setExpanded((prev) => (prev === id ? null : id));

  return (
    <PageWrapper
      title="Container Tracking"
      description="Real-time cargo tracking across all transport modes"
    >

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total Cargo',    value: kpi.total,     icon: Package,       pill: 'bg-primary/10 text-primary border-primary/20'             },
          { label: 'In Transit',     value: kpi.inTransit, icon: Navigation,    pill: 'bg-primary/10 text-primary border-primary/20'             },
          { label: 'Delivered',      value: kpi.delivered, icon: CheckCircle,   pill: 'bg-success/10 text-success border-success/20'             },
          { label: 'Hazmat',         value: kpi.hazmat,    icon: AlertTriangle, pill: 'bg-destructive/10 text-destructive border-destructive/20' },
          { label: 'Temp Controlled',value: kpi.tempCtrl,  icon: Thermometer,   pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20'             },
        ].map(({ label, value, icon: Icon, pill }) => (
          <div key={label} className="
            bg-card border border-border/60 rounded-xl
            px-4 py-3.5 shadow-soft flex items-center gap-3
          ">
            <div className={`w-9 h-9 rounded-lg flex-shrink-0 border flex items-center justify-center ${pill}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
              <p className="text-[1.3rem] font-black font-display text-foreground leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search cargo #, description, shipper or consignee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                nb-search w-full h-9 pl-9 pr-3
                bg-muted/40 border border-border rounded-[9px]
                text-[0.84rem] text-foreground outline-none
                placeholder:text-muted-foreground
                focus:border-primary/50 focus:bg-primary/5
                focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]
              "
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={13} className="text-muted-foreground shrink-0" />

            <Select value={statusFilter} onValueChange={setStatus}>
              <SelectTrigger className="w-[145px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all" className="text-[0.82rem]">All Statuses</SelectItem>
                {Object.keys(CARGO_STATUS_META).map((s) => (
                  <SelectItem key={s} value={s} className="text-[0.82rem]">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={modeFilter} onValueChange={setMode}>
              <SelectTrigger className="w-[130px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0">
                <SelectValue placeholder="All Modes" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all" className="text-[0.82rem]">All Modes</SelectItem>
                {TRANSPORT_MODES.map((m) => (
                  <SelectItem key={m} value={m} className="text-[0.82rem]">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setType}>
              <SelectTrigger className="w-[175px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0">
                <SelectValue placeholder="All Cargo Types" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all" className="text-[0.82rem]">All Cargo Types</SelectItem>
                {CARGO_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="text-[0.82rem]">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="
                  flex items-center gap-1.5 px-2.5 h-9
                  bg-destructive/10 border border-destructive/20
                  rounded-[9px] text-[0.78rem] font-semibold text-destructive
                  hover:bg-destructive/20 transition-colors duration-150
                "
              >
                <RotateCcw size={12} />
                Clear
              </button>
            )}
          </div>
        </div>

        {hasFilters && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">
            {filtered.length} of {mockCargo.length} cargo unit{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ── Cargo Cards ── */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((cargo: Cargo) => {
            const statusMeta  = CARGO_STATUS_META[cargo.status] ?? CARGO_STATUS_META['Pending'];
            const StatusIcon  = statusMeta.icon;
            const ModeIcon    = TRANSPORT_ICON[cargo.transportMode] ?? Package;
            const isOpen      = expanded === cargo.id;
            const completedLegs = cargo.shipmentRoute.filter((l) => l.status === 'Completed').length;
            const totalLegs     = cargo.shipmentRoute.length;
            const progressPct   = totalLegs > 0
              ? Math.round((completedLegs / totalLegs) * 100)
              : 0;

            return (
              <div
                key={cargo.id}
                className={`
                  bg-card border rounded-xl shadow-soft overflow-hidden
                  transition-all duration-300
                  ${isOpen
                    ? 'border-primary/30 shadow-[0_4px_24px_oklch(var(--primary)/0.08)]'
                    : 'border-border/60 hover:border-primary/20'}
                `}
              >
                {/* ── Card Header ── */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
                  onClick={() => toggleExpand(cargo.id)}
                >
                  {/* Mode icon box */}
                  <div className={`
                    w-10 h-10 rounded-xl flex-shrink-0 border
                    flex items-center justify-center
                    ${cargo.transportMode === 'Land'  ? 'bg-amber-500/10 border-amber-500/20' :
                      cargo.transportMode === 'Air'   ? 'bg-sky-500/10 border-sky-500/20' :
                                                        'bg-primary/10 border-primary/20'}
                  `}>
                    <ModeIcon className={`w-5 h-5 ${TRANSPORT_COLOR[cargo.transportMode]}`} />
                  </div>

                  {/* Cargo info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-0.5">
                      <span className="text-[0.84rem] font-bold font-mono text-foreground">
                        {cargo.cargoNumber}
                      </span>
                      <span className={`
                        px-2 py-0.5 rounded-md text-[0.68rem] font-bold border
                        ${TYPE_META[cargo.type] ?? TYPE_META['General']}
                      `}>
                        {cargo.type}
                        {cargo.type === 'Temperature Controlled' && (
                          <Thermometer className="inline w-2.5 h-2.5 ml-1" />
                        )}
                      </span>
                      {cargo.type === 'Hazmat' && (
                        <span className="
                          inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                          bg-destructive/10 text-destructive border border-destructive/20
                          text-[0.65rem] font-bold
                        ">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Hazmat
                        </span>
                      )}
                    </div>
                    <p className="text-[0.75rem] text-muted-foreground truncate max-w-xs">
                      {cargo.description}
                    </p>
                  </div>

                  {/* Shipper → Consignee */}
                  <div className="hidden md:flex items-center gap-2 text-[0.78rem] text-muted-foreground min-w-0 max-w-xs">
                    <span className="truncate font-medium text-foreground/80">
                      {cargo.shipper.name}
                    </span>
                    <span className="text-muted-foreground/40 flex-shrink-0">→</span>
                    <span className="truncate font-medium text-foreground/80">
                      {cargo.consignee.name}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="hidden lg:block w-28 flex-shrink-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[0.65rem] text-muted-foreground">Route</span>
                      <span className="text-[0.65rem] font-bold text-foreground">
                        {completedLegs}/{totalLegs} legs
                      </span>
                    </div>
                    <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPct}%`,
                          background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="hidden xl:block text-right flex-shrink-0">
                    <p className="text-[0.82rem] font-bold font-mono text-foreground">
                      {cargo.weight.toLocaleString()} {cargo.weightUnit}
                    </p>
                    <p className="text-[0.68rem] text-muted-foreground/60">
                      {cargo.packageCount} pkg{cargo.packageCount !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Status pill */}
                  <span className={`
                    flex-shrink-0 inline-flex items-center gap-1.5
                    px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold border
                    ${statusMeta.pill}
                  `}>
                    <StatusIcon className="w-3 h-3" />
                    {cargo.status}
                  </span>

                  {/* Expand button */}
                  <button className="
                    w-7 h-7 flex items-center justify-center rounded-lg
                    bg-muted/30 border border-border/40
                    text-muted-foreground flex-shrink-0
                    hover:bg-primary/10 hover:text-primary hover:border-primary/20
                    transition-colors duration-150
                  ">
                    {isOpen
                      ? <ChevronUp className="w-4 h-4" />
                      : <ChevronDown className="w-4 h-4" />
                    }
                  </button>
                </div>

                {/* ── Expanded: Route Timeline + Details ── */}
                {isOpen && (
                  <div className="border-t border-border/40 px-5 pb-5 pt-4 bg-muted/[0.03]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                      {/* ── Route Timeline ── */}
                      <div className="lg:col-span-2">
                        <p className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                          Shipment Route ({totalLegs} Leg{totalLegs !== 1 ? 's' : ''})
                        </p>

                        <div className="space-y-0">
                          {cargo.shipmentRoute.map((leg, idx) => {
                            const legMeta  = LEG_STATUS_META[leg.status] ?? LEG_STATUS_META['Scheduled'];
                            const LegIcon  = TRANSPORT_ICON[leg.transportType] ?? Truck;
                            const isActive = leg.status === 'In Transit';

                            return (
                              <div key={leg.id} className="flex gap-3">
                                {/* Timeline spine */}
                                <div className="flex flex-col items-center flex-shrink-0">
                                  <div className={`
                                    w-8 h-8 rounded-full border-2 flex items-center justify-center
                                    ${isActive
                                      ? 'bg-primary border-primary shadow-[0_0_12px_oklch(var(--primary)/0.4)]'
                                      : leg.status === 'Completed'
                                        ? 'bg-success/20 border-success'
                                        : 'bg-muted/30 border-border/60'}
                                  `}>
                                    <LegIcon className={`w-3.5 h-3.5 ${
                                      isActive ? 'text-white' :
                                      leg.status === 'Completed' ? 'text-success' :
                                      'text-muted-foreground/50'
                                    }`} />
                                  </div>
                                  {idx < totalLegs - 1 && (
                                    <div className={`
                                      w-0.5 h-8 mt-0.5
                                      ${leg.status === 'Completed' ? 'bg-success/30' : 'bg-border/40'}
                                    `} />
                                  )}
                                </div>

                                {/* Leg content */}
                                <div className={`
                                  flex-1 pb-4
                                  ${idx === totalLegs - 1 ? 'pb-0' : ''}
                                `}>
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[0.80rem] font-semibold text-foreground">
                                          Leg {leg.legNumber}
                                        </span>
                                        <span className={`
                                          px-1.5 py-0.5 rounded text-[0.65rem] font-bold
                                          ${legMeta.bg} ${legMeta.color}
                                        `}>
                                          {leg.status}
                                        </span>
                                        {isActive && (
                                          <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                            <span className="text-[0.65rem] text-primary font-bold">Live</span>
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <MapPin className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                                        <span className="text-[0.72rem] text-muted-foreground">
                                          {leg.origin}
                                        </span>
                                        <span className="text-muted-foreground/40">→</span>
                                        <span className="text-[0.72rem] text-muted-foreground">
                                          {leg.destination}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <div className="flex items-center gap-1 justify-end">
                                        <Clock className="w-3 h-3 text-muted-foreground/40" />
                                        <span className="text-[0.68rem] text-muted-foreground">
                                          {formatDate(leg.departureDate)}
                                        </span>
                                      </div>
                                      <span className="text-[0.65rem] text-muted-foreground/60">
                                        ETA: {formatDate(leg.estimatedArrival)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* ── Right: Details panel ── */}
                      <div className="space-y-3">

                        {/* Current location */}
                        {cargo.currentLocation && (
                          <div className="
                            bg-primary/5 border border-primary/20
                            rounded-xl p-3.5
                          ">
                            <p className="text-[0.65rem] font-bold text-primary/70 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                              <Navigation className="w-3 h-3" />
                              Current Position
                            </p>
                            <p className="text-[0.78rem] font-semibold text-foreground mb-1">
                              {cargo.currentLocation.port ?? 'En Route'}
                            </p>
                            <p className="text-[0.70rem] text-muted-foreground font-mono">
                              {cargo.currentLocation.latitude.toFixed(4)}°,{' '}
                              {cargo.currentLocation.longitude.toFixed(4)}°
                            </p>
                            {cargo.currentLocation.lastUpdate && (
                              <p className="text-[0.65rem] text-muted-foreground/60 mt-1">
                                Updated: {formatDate(cargo.currentLocation.lastUpdate)}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Shipper / Consignee */}
                        <div className="bg-muted/20 border border-border/40 rounded-xl p-3.5 space-y-2.5">
                          <div>
                            <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-0.5">
                              Shipper
                            </p>
                            <p className="text-[0.78rem] font-semibold text-foreground">{cargo.shipper.name}</p>
                            <p className="text-[0.70rem] text-muted-foreground">{cargo.shipper.address}</p>
                            <p className="text-[0.70rem] text-muted-foreground">{cargo.shipper.contact}</p>
                          </div>
                          <div className="border-t border-border/30 pt-2.5">
                            <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-0.5">
                              Consignee
                            </p>
                            <p className="text-[0.78rem] font-semibold text-foreground">{cargo.consignee.name}</p>
                            <p className="text-[0.70rem] text-muted-foreground">{cargo.consignee.address}</p>
                            <p className="text-[0.70rem] text-muted-foreground">{cargo.consignee.contact}</p>
                          </div>
                        </div>

                        {/* Insurance + Inspection */}
                        <div className="bg-muted/20 border border-border/40 rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[0.70rem] text-muted-foreground/60">Insurance</span>
                            <span className="text-[0.75rem] font-bold font-mono text-foreground">
                              ₹{cargo.insuranceAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[0.70rem] text-muted-foreground/60">Provider</span>
                            <span className="text-[0.72rem] text-muted-foreground truncate max-w-[140px]">
                              {cargo.insuranceProvider}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[0.70rem] text-muted-foreground/60">Inspections</span>
                            <span className={`
                              text-[0.72rem] font-bold px-1.5 py-0.5 rounded
                              ${cargo.inspectionRecords.every((r) => r.passed)
                                ? 'text-success bg-success/10'
                                : 'text-destructive bg-destructive/10'}
                            `}>
                              {cargo.inspectionRecords.length} × {cargo.inspectionRecords.every((r) => r.passed) ? '✓ All Passed' : '⚠ Issues'}
                            </span>
                          </div>
                        </div>

                        {/* View full detail button */}
                        <button className="
                          w-full flex items-center justify-center gap-2
                          h-9 rounded-lg border
                          border-primary/20 bg-primary/5 text-primary
                          text-[0.78rem] font-semibold
                          hover:bg-primary/10 transition-colors duration-150
                        ">
                          <Eye className="w-3.5 h-3.5" />
                          View Full Detail
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="
          bg-card border border-border/60 rounded-xl shadow-soft
          py-20 flex flex-col items-center gap-3
        ">
          <div className="
            w-14 h-14 rounded-full bg-muted/40 border border-border/50
            flex items-center justify-center
          ">
            <Package className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No cargo found</p>
          <p className="text-[0.78rem] text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}

    </PageWrapper>
  );
}
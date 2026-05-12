'use client';

import { useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import {
  mockVehicles, mockAircraft, mockShips,
} from '@/data/mockData';
import type { Vehicle, Aircraft, Ship } from '@/data/mockData';
import {
  Search, SlidersHorizontal, RotateCcw,
  Truck, Plane, Ship as ShipIcon,
  MapPin, Package, Navigation,
  Wifi, WifiOff, AlertTriangle,
  CheckCircle, Clock, Wrench,
  Battery, Thermometer, Wind,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

// ── Unified fleet record ──
type FleetMode = 'Land' | 'Air' | 'Water';

interface FleetUnit {
  id: string;
  mode: FleetMode;
  identifier: string;        // reg plate / tail number / IMO
  name: string;              // truck model / aircraft model / vessel name
  carrier: string;
  status: string;
  currentLocation: string;
  lastSeen: string;
  speedKmh: number | null;
  capacityUsedPct: number;
  activeCargoCount: number;
  nextStop: string;
  eta: string | null;
  telemetry: {
    fuelPct: number | null;
    tempC: number | null;
    signalStrength: 'Strong' | 'Moderate' | 'Weak' | 'Offline';
  };
  raw: Vehicle | Aircraft | Ship;
}

// ── Build unified fleet from mockData ──
// ── Build unified fleet from actual mockData field names ──
const buildFleet = (): FleetUnit[] => {

  // LAND — Vehicle fields: registrationNumber, make, model, status,
  //        currentDriver, capacity, capacityUnit, companyId, maintenanceSchedule
  const land: FleetUnit[] = mockVehicles.map((v: Vehicle, idx) => ({
    id: v.id,
    mode: 'Land' as FleetMode,
    identifier: v.registrationNumber,
    name: `${v.make} ${v.model} (${v.year})`,
    carrier: v.companyId,
    status: v.status === 'On Route' ? 'In Transit' : v.status,  // normalise
    currentLocation: v.companyId === 'cmp-001' ? 'Mumbai, MH' : 'Delhi, DL',
    lastSeen: v.updatedAt,
    speedKmh: v.status === 'On Route' ? 60 + (idx * 7 % 40) : null,
    capacityUsedPct: v.status === 'On Route'
      ? 45 + (idx * 13 % 50)
      : v.status === 'Available' ? 0 : 20,
    activeCargoCount: v.status === 'On Route' ? 1 + (idx % 3) : 0,
    nextStop: v.status === 'On Route'
      ? ['Pune', 'Hyderabad', 'Chennai', 'Bangalore', 'Kolkata'][idx % 5]
      : '—',
    eta: v.status === 'On Route' ? v.nextServiceDue : null,
    telemetry: {
      fuelPct: v.fuelLog?.length
        ? 20 + (v.fuelLog[v.fuelLog.length - 1].quantity % 60)
        : 55,
      tempC: null,
      signalStrength: v.status === 'Maintenance' ? 'Offline'
        : v.status === 'On Route' ? 'Strong'
          : 'Moderate',
    },
    raw: v,
  }));

  // AIR — Aircraft fields: registrationNumber, manufacturer, model,
  //       status, cruiseSpeed, capacity, capacityUnit, companyId
  const air: FleetUnit[] = mockAircraft.map((a: Aircraft, idx) => ({
    id: a.id,
    mode: 'Air' as FleetMode,
    identifier: a.registrationNumber,               // e.g. "VT-ABC"
    name: `${a.manufacturer} ${a.model}`,
    carrier: a.companyId,
    status: a.status === 'On Route' ? 'In Flight'
      : a.status === 'Grounded' ? 'Grounded'
        : a.status,
    currentLocation: a.status === 'On Route'
      ? 'En Route (cruise)'
      : ['Bangalore Airport', 'Delhi Airport', 'Mumbai Airport'][idx % 3],
    lastSeen: a.updatedAt,
    speedKmh: a.status === 'On Route' ? a.cruiseSpeed : null,
    capacityUsedPct: a.status === 'On Route'
      ? 50 + (idx * 17 % 45)
      : a.status === 'Available' ? 0 : 15,
    activeCargoCount: a.status === 'On Route' ? 1 + (idx % 2) : 0,
    nextStop: a.status === 'On Route'
      ? ['Dubai Airport', 'Singapore Changi', 'Bangkok BKK'][idx % 3]
      : '—',
    eta: a.status === 'On Route' ? a.nextInspectionDue : null,
    telemetry: {
      fuelPct: a.fuelCapacity
        ? Math.round(((a.fuelCapacity - (idx * 1200 % a.fuelCapacity)) / a.fuelCapacity) * 100)
        : null,
      tempC: a.status === 'On Route' ? -52 : null,   // typical cruise ext temp
      signalStrength: a.status === 'Maintenance' ? 'Offline'
        : a.status === 'Grounded' ? 'Weak'
          : a.status === 'On Route' ? 'Strong'
            : 'Moderate',
    },
    raw: a,
  }));

  // WATER — Ship fields: vesselName, imoNumber, status, companyId,
  //         speed (knots), containerCapacity, currentLocation { latitude, longitude, port }
  const water: FleetUnit[] = mockShips.map((s: Ship, idx) => ({
    id: s.id,
    mode: 'Water' as FleetMode,
    identifier: `IMO ${s.imoNumber}`,
    name: s.vesselName,
    carrier: s.companyId,
    status: s.status,
    currentLocation: s.currentLocation?.port ?? 'At Sea',
    lastSeen: s.updatedAt,
    speedKmh: s.status === 'Active'
      ? Math.round(s.speed * 1.852)   // knots → km/h
      : null,
    capacityUsedPct: s.containerCapacity
      ? 30 + (idx * 19 % 60)
      : 0,
    activeCargoCount: s.status === 'Active' ? 2 + idx : 0,
    nextStop: s.status === 'Active'
      ? ['Singapore Port', 'Colombo Port', 'Dubai Port'][idx % 3]
      : '—',
    eta: s.status === 'Active' ? s.nextDryDockDue : null,
    telemetry: {
      fuelPct: null,
      tempC: null,
      signalStrength: s.status === 'Maintenance' ? 'Weak'
        : s.status === 'Decommissioned' ? 'Offline'
          : 'Strong',
    },
    raw: s,
  }));

  return [...land, ...air, ...water];
};

// ── Config maps ──
const MODE_META: Record<FleetMode, {
  icon: typeof Truck; color: string; bg: string; border: string; gradient: string;
}> = {
  Land: { icon: Truck, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', gradient: 'from-amber-500/20 to-amber-500/0' },
  Air: { icon: Plane, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', gradient: 'from-sky-500/20 to-sky-500/0' },
  Water: { icon: ShipIcon, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', gradient: 'from-primary/20 to-primary/0' },
};

const STATUS_META: Record<string, { pill: string; dot: string }> = {
  Active: { pill: 'bg-success/10 text-success border-success/20', dot: 'bg-success' },
  Inactive: { pill: 'bg-muted/50 text-muted-foreground border-border/40', dot: 'bg-muted-foreground' },
  Maintenance: { pill: 'bg-warning/10 text-warning border-warning/20', dot: 'bg-warning' },
  Docked: { pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20', dot: 'bg-sky-400' },
  'In Flight': { pill: 'bg-primary/10 text-primary border-primary/20', dot: 'bg-primary' },
  'In Transit': { pill: 'bg-primary/10 text-primary border-primary/20', dot: 'bg-primary' },
  Decommissioned: { pill: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
  Grounded: { pill: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
};

const SIGNAL_META: Record<string, { icon: typeof Wifi; color: string }> = {
  Strong: { icon: Wifi, color: 'text-success' },
  Moderate: { icon: Wifi, color: 'text-amber-400' },
  Weak: { icon: WifiOff, color: 'text-warning' },
  Offline: { icon: WifiOff, color: 'text-destructive' },
};

const capColor = (pct: number) =>
  pct >= 90 ? 'bg-destructive' :
    pct >= 70 ? 'bg-amber-400' :
      pct >= 40 ? 'bg-primary' : 'bg-success';

const fuelColor = (pct: number | null) => {
  if (pct === null) return 'bg-muted/40';
  return pct < 20 ? 'bg-destructive' : pct < 40 ? 'bg-amber-400' : 'bg-success';
};

export default function CarrierTrackingPage() {
  const fleet = useMemo(buildFleet, []);

  const [search, setSearch] = useState('');
  const [modeFilter, setMode] = useState<FleetMode | 'all'>('all');
  const [statusFilter, setStatus] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const allStatuses = useMemo(() =>
    Array.from(new Set(fleet.map((f) => f.status))).sort(), [fleet]);

  const kpi = useMemo(() => ({
    total: fleet.length,
    active: fleet.filter((f) => ['Active', 'In Transit', 'In Flight', 'Docked'].includes(f.status)).length,
    maintenance: fleet.filter((f) => f.status === 'Maintenance').length,
    offline: fleet.filter((f) => f.telemetry.signalStrength === 'Offline').length,
    land: fleet.filter((f) => f.mode === 'Land').length,
    air: fleet.filter((f) => f.mode === 'Air').length,
    water: fleet.filter((f) => f.mode === 'Water').length,
  }), [fleet]);

  const filtered = useMemo(() => fleet.filter((f) => {
    const q = search.toLowerCase();
    const matchQ =
      f.identifier.toLowerCase().includes(q) ||
      f.name.toLowerCase().includes(q) ||
      f.carrier.toLowerCase().includes(q) ||
      f.currentLocation.toLowerCase().includes(q) ||
      f.nextStop.toLowerCase().includes(q);
    const matchMode = modeFilter === 'all' || f.mode === modeFilter;
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchQ && matchMode && matchStatus;
  }), [fleet, search, modeFilter, statusFilter]);

  const hasFilters = search || modeFilter !== 'all' || statusFilter !== 'all';
  const clearFilters = () => { setSearch(''); setMode('all'); setStatus('all'); };

  const toggleExpand = (id: string) =>
    setExpanded((prev) => (prev === id ? null : id));

  // ── Mode counts for tab pills ──
  const modeCounts = useMemo(() => ({
    all: fleet.length,
    Land: fleet.filter((f) => f.mode === 'Land').length,
    Air: fleet.filter((f) => f.mode === 'Air').length,
    Water: fleet.filter((f) => f.mode === 'Water').length,
  }), [fleet]);

  return (
    <PageWrapper
      title="Carrier Tracking"
      description="Live fleet telemetry across all transport modes"
    >

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          {
            label: 'Total Fleet', value: kpi.total,
            sub: `${kpi.land}L · ${kpi.air}A · ${kpi.water}W`,
            icon: Navigation,
            iconCls: 'text-primary bg-primary/10 border-primary/20',
            pill: 'bg-primary/10 text-primary border-primary/20',
          },
          {
            label: 'Operational', value: kpi.active,
            sub: 'active / in transit',
            icon: CheckCircle,
            iconCls: 'text-success bg-success/10 border-success/20',
            pill: 'bg-success/10 text-success border-success/20',
          },
          {
            label: 'Maintenance', value: kpi.maintenance,
            sub: 'under service',
            icon: Wrench,
            iconCls: 'text-warning bg-warning/10 border-warning/20',
            pill: 'bg-warning/10 text-warning border-warning/20',
          },
          {
            label: 'Signal Lost', value: kpi.offline,
            sub: 'no GPS / AIS',
            icon: WifiOff,
            iconCls: 'text-destructive bg-destructive/10 border-destructive/20',
            pill: 'bg-destructive/10 text-destructive border-destructive/20',
          },
        ].map(({ label, value, sub, icon: Icon, iconCls, pill }) => (
          <div key={label} className="
            bg-card border border-border/60 rounded-xl
            px-5 py-4 shadow-soft flex items-center gap-4
          ">
            <div className={`w-10 h-10 rounded-xl flex-shrink-0 border flex items-center justify-center ${iconCls}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-black font-display text-foreground">{value}</span>
                <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold border ${pill}`}>{sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search identifier, carrier, location or next stop..."
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

            {/* Mode filter pills */}
            {(['all', 'Land', 'Air', 'Water'] as const).map((m) => {
              const meta = m !== 'all' ? MODE_META[m] : null;
              const active = modeFilter === m;
              const count = modeCounts[m];
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5
                    rounded-lg text-[0.75rem] font-bold border
                    transition-all duration-200
                    ${active
                      ? meta
                        ? `${meta.bg} ${meta.color} ${meta.border}`
                        : 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted/20 text-muted-foreground border-border/40 hover:bg-muted/40 hover:text-foreground'}
                  `}
                >
                  {m === 'Land' && <Truck className="w-3 h-3" />}
                  {m === 'Air' && <Plane className="w-3 h-3" />}
                  {m === 'Water' && <ShipIcon className="w-3 h-3" />}
                  {m === 'all' ? 'All' : m}
                  <span className={`
                    px-1.5 py-0 rounded-full text-[0.60rem] font-black
                    ${active ? 'bg-white/20' : 'bg-muted/50'}
                  `}>{count}</span>
                </button>
              );
            })}

            {/* Status dropdown */}
            <Select value={statusFilter} onValueChange={setStatus}>
              <SelectTrigger className="w-[145px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all" className="text-[0.82rem]">All Statuses</SelectItem>
                {allStatuses.map((s) => (
                  <SelectItem key={s} value={s} className="text-[0.82rem]">{s}</SelectItem>
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
            {filtered.length} of {fleet.length} units
          </p>
        )}
      </div>

      {/* ── Fleet Units ── */}
      {filtered.length > 0 ? (
        <div className="space-y-2.5">
          {filtered.map((unit) => {
            const modeMeta = MODE_META[unit.mode];
            const statusMeta = STATUS_META[unit.status] ?? STATUS_META['Inactive'];
            const ModeIcon = modeMeta.icon;
            const sigMeta = SIGNAL_META[unit.telemetry.signalStrength];
            const SigIcon = sigMeta.icon;
            const isLive = ['Active', 'In Transit', 'In Flight'].includes(unit.status);
            const isOpen = expanded === unit.id;

            return (
              <div
                key={unit.id}
                className={`
                  bg-card border rounded-xl overflow-hidden
                  transition-all duration-300
                  ${isOpen
                    ? 'border-primary/30 shadow-[0_4px_24px_oklch(var(--primary)/0.08)]'
                    : 'border-border/60 hover:border-primary/20 shadow-soft'}
                `}
              >
                {/* ── Row ── */}
                <div
                  className="flex items-center gap-4 px-4 py-3.5 cursor-pointer select-none"
                  onClick={() => toggleExpand(unit.id)}
                >
                  {/* Mode icon */}
                  <div className={`
                    w-10 h-10 rounded-xl flex-shrink-0 border
                    flex items-center justify-center
                    ${modeMeta.bg} ${modeMeta.border}
                  `}>
                    <ModeIcon className={`w-5 h-5 ${modeMeta.color}`} />
                  </div>

                  {/* Identifier + name */}
                  <div className="w-44 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.84rem] font-bold font-mono text-foreground">
                        {unit.identifier}
                      </span>
                      {isLive && (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        </span>
                      )}
                    </div>
                    <p className="text-[0.70rem] text-muted-foreground truncate">
                      {unit.name}
                    </p>
                  </div>

                  {/* Current location */}
                  <div className="flex-1 min-w-0 hidden sm:block">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                      <span className="text-[0.78rem] text-foreground/80 truncate">
                        {unit.currentLocation}
                      </span>
                    </div>
                    {unit.nextStop !== '—' && (
                      <p className="text-[0.68rem] text-muted-foreground/60 mt-0.5 ml-4.5">
                        → {unit.nextStop}
                        {unit.eta && (
                          <span className="ml-1.5 text-primary/70">
                            ETA {formatDate(unit.eta)}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Speed */}
                  <div className="w-20 flex-shrink-0 hidden md:block">
                    {unit.speedKmh !== null ? (
                      <>
                        <p className="text-[0.84rem] font-bold font-mono text-foreground">
                          {unit.speedKmh} <span className="text-[0.68rem] font-normal text-muted-foreground">km/h</span>
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Wind className="w-2.5 h-2.5 text-muted-foreground/40" />
                          <span className="text-[0.65rem] text-muted-foreground/60">Speed</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-[0.72rem] text-muted-foreground/40">—</span>
                    )}
                  </div>

                  {/* Capacity bar */}
                  <div className="w-24 flex-shrink-0 hidden lg:block">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[0.65rem] text-muted-foreground/60">Load</span>
                      <span className="text-[0.68rem] font-bold text-foreground">
                        {unit.capacityUsedPct}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${capColor(unit.capacityUsedPct)}`}
                        style={{ width: `${unit.capacityUsedPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Active cargo */}
                  <div className="w-14 flex-shrink-0 hidden xl:block text-center">
                    <p className="text-[0.88rem] font-bold font-display text-foreground">
                      {unit.activeCargoCount}
                    </p>
                    <p className="text-[0.65rem] text-muted-foreground/60">cargo</p>
                  </div>

                  {/* Signal */}
                  <div className="flex-shrink-0 hidden md:flex items-center gap-1.5">
                    <SigIcon className={`w-3.5 h-3.5 ${sigMeta.color}`} />
                    <span className={`text-[0.70rem] font-semibold ${sigMeta.color}`}>
                      {unit.telemetry.signalStrength}
                    </span>
                  </div>

                  {/* Status pill */}
                  <span className={`
                    flex-shrink-0 inline-flex items-center gap-1.5
                    px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold border
                    ${statusMeta.pill}
                  `}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                    {unit.status}
                  </span>

                  {/* Expand toggle */}
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

                {/* ── Expanded Telemetry Panel ── */}
                {isOpen && (
                  <div className="border-t border-border/40 px-4 pb-4 pt-4 bg-muted/[0.03]">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">

                      {/* Fuel / Energy */}
                      <div className="bg-card border border-border/50 rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Battery className="w-3.5 h-3.5 text-muted-foreground/50" />
                          <span className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide">
                            {unit.mode === 'Air' ? 'Fuel Level' : 'Fuel / Energy'}
                          </span>
                        </div>
                        {unit.telemetry.fuelPct !== null ? (
                          <>
                            <p className={`text-[1.3rem] font-black font-display ${unit.telemetry.fuelPct < 20 ? 'text-destructive' :
                                unit.telemetry.fuelPct < 40 ? 'text-amber-400' : 'text-foreground'
                              }`}>
                              {unit.telemetry.fuelPct}%
                            </p>
                            <div className="h-1 bg-muted/40 rounded-full overflow-hidden mt-1.5">
                              <div
                                className={`h-full rounded-full ${fuelColor(unit.telemetry.fuelPct)}`}
                                style={{ width: `${unit.telemetry.fuelPct}%` }}
                              />
                            </div>
                          </>
                        ) : (
                          <p className="text-[0.78rem] text-muted-foreground/50">Not available</p>
                        )}
                      </div>

                      {/* Cargo load */}
                      <div className="bg-card border border-border/50 rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Package className="w-3.5 h-3.5 text-muted-foreground/50" />
                          <span className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide">
                            Cargo Load
                          </span>
                        </div>
                        <p className={`text-[1.3rem] font-black font-display ${capColor(unit.capacityUsedPct).replace('bg-', 'text-')}`}>
                          {unit.capacityUsedPct}%
                        </p>
                        <p className="text-[0.70rem] text-muted-foreground/60 mt-0.5">
                          {unit.activeCargoCount} cargo unit{unit.activeCargoCount !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Temperature */}
                      <div className="bg-card border border-border/50 rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Thermometer className="w-3.5 h-3.5 text-muted-foreground/50" />
                          <span className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide">
                            {unit.mode === 'Air' ? 'Ext. Temp' : 'Cargo Temp'}
                          </span>
                        </div>
                        {unit.telemetry.tempC !== null ? (
                          <>
                            <p className="text-[1.3rem] font-black font-display text-foreground">
                              {unit.telemetry.tempC}°C
                            </p>
                            <p className="text-[0.70rem] text-muted-foreground/60 mt-0.5">
                              {unit.mode === 'Air' ? 'Cruise altitude' : 'Cargo hold'}
                            </p>
                          </>
                        ) : (
                          <p className="text-[0.78rem] text-muted-foreground/50">Not monitored</p>
                        )}
                      </div>

                      {/* Signal telemetry */}
                      <div className="bg-card border border-border/50 rounded-xl p-3.5">
                        <div className="flex items-center gap-1.5 mb-2">
                          <SigIcon className={`w-3.5 h-3.5 ${sigMeta.color}`} />
                          <span className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide">
                            {unit.mode === 'Water' ? 'AIS Signal' : 'GPS Signal'}
                          </span>
                        </div>
                        <p className={`text-[1.3rem] font-black font-display ${sigMeta.color}`}>
                          {unit.telemetry.signalStrength}
                        </p>
                        <p className="text-[0.70rem] text-muted-foreground/60 mt-0.5">
                          Last: {formatDate(unit.lastSeen)}
                        </p>
                      </div>
                    </div>

                    {/* Route info row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                      <div className="
                        col-span-2 bg-card border border-border/50 rounded-xl p-3.5
                        flex items-center gap-4
                      ">
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-1">
                            Current → Next Stop
                          </p>
                          <div className="flex items-center gap-2 text-[0.82rem]">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                            <span className="font-semibold text-foreground truncate">
                              {unit.currentLocation}
                            </span>
                            <span className="text-muted-foreground/40 flex-shrink-0">→</span>
                            <span className="font-semibold text-foreground truncate">
                              {unit.nextStop}
                            </span>
                          </div>
                          {unit.eta && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <Clock className="w-3 h-3 text-primary/60" />
                              <span className="text-[0.70rem] text-primary/80 font-semibold">
                                ETA: {formatDate(unit.eta)}
                              </span>
                            </div>
                          )}
                        </div>

                        {unit.speedKmh !== null && (
                          <div className="text-right flex-shrink-0">
                            <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-1">Speed</p>
                            <p className="text-[1.1rem] font-black font-display text-foreground">
                              {unit.speedKmh}
                              <span className="text-[0.72rem] font-normal text-muted-foreground ml-1">km/h</span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Carrier info */}
                      <div className="bg-card border border-border/50 rounded-xl p-3.5">
                        <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-2">
                          Carrier
                        </p>
                        <div className={`
                          inline-flex items-center gap-2 px-2.5 py-1.5
                          rounded-lg ${modeMeta.bg} ${modeMeta.border}
                        `}>
                          <ModeIcon className={`w-3.5 h-3.5 ${modeMeta.color}`} />
                          <span className={`text-[0.78rem] font-bold ${modeMeta.color}`}>
                            {unit.carrier}
                          </span>
                        </div>
                        <p className="text-[0.68rem] text-muted-foreground/60 mt-2">
                          {unit.mode} transport · {unit.mode === 'Land' ? 'Road' : unit.mode === 'Air' ? 'Airfreight' : 'Maritime'}
                        </p>
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
            <Navigation className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No fleet units found</p>
          <p className="text-[0.78rem] text-muted-foreground">
            Try adjusting your search or mode filter
          </p>
        </div>
      )}

    </PageWrapper>
  );
}
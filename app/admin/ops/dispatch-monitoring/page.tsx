'use client';

import { useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import {
  mockDrivers, mockVehicles, mockShipments,
} from '@/data/mockData';
import type { Driver, Vehicle, Shipment } from '@/data/mockData';
import {
  Search, SlidersHorizontal, RotateCcw,
  Truck, User, Package, MapPin,
  Clock, CheckCircle, AlertTriangle,
  Circle, XCircle, ChevronDown, ChevronUp,
  Phone, Star, Route, Calendar,
  Navigation, Wrench,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

// ── Dispatch record: joins Driver + Vehicle + active Shipments ──
interface DispatchRecord {
  driver: Driver;
  vehicle: Vehicle | null;
  activeShipments: Shipment[];
  totalTrips: number;
  lastTripDate: string | null;
}

const DRIVER_STATUS_META: Record<string, { pill: string; dot: string }> = {
  'Active':   { pill: 'bg-success/10 text-success border-success/20',           dot: 'bg-success'          },
  'On Duty':  { pill: 'bg-primary/10 text-primary border-primary/20',           dot: 'bg-primary'          },
  'Off Duty': { pill: 'bg-muted/50 text-muted-foreground border-border/40',     dot: 'bg-muted-foreground' },
  'Suspended':{ pill: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive'    },
};

const VEHICLE_STATUS_META: Record<string, { color: string; icon: typeof Truck }> = {
  'Available':   { color: 'text-success',          icon: Truck   },
  'On Route':    { color: 'text-primary',           icon: Navigation },
  'Maintenance': { color: 'text-warning',           icon: Wrench  },
  'Inactive':    { color: 'text-muted-foreground',  icon: XCircle },
};

const SHIPMENT_STATUS_META: Record<string, string> = {
  'Pending':          'bg-muted/50 text-muted-foreground border-border/40',
  'Picked Up':        'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'In Transit':       'bg-primary/10 text-primary border-primary/20',
  'Out for Delivery': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Delivered':        'bg-success/10 text-success border-success/20',
  'Cancelled':        'bg-destructive/10 text-destructive border-destructive/20',
  'Failed':           'bg-destructive/10 text-destructive border-destructive/20',
};

const DRIVER_STATUSES = ['Active', 'On Duty', 'Off Duty', 'Suspended'];

const ratingColor = (r: number) =>
  r >= 4.5 ? 'text-success' : r >= 3.5 ? 'text-amber-400' : 'text-destructive';

export default function DispatchMonitoringPage() {
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<string>('all');
  const [expanded, setExpanded]     = useState<string | null>(null);

  // ── Build dispatch records ──
  const records = useMemo((): DispatchRecord[] =>
    mockDrivers.map((driver) => {
      const vehicle = driver.vehicleAssigned
        ? mockVehicles.find((v) => v.id === driver.vehicleAssigned) ?? null
        : null;

      const activeShipments = mockShipments.filter((s) =>
        s.assignedDriver === driver.id &&
        !['Delivered', 'Cancelled', 'Failed'].includes(s.status)
      );

      const lastTrip = driver.tripHistory?.[driver.tripHistory.length - 1];

      return {
        driver,
        vehicle,
        activeShipments,
        totalTrips: driver.totalTrips,
        lastTripDate: lastTrip?.date ?? null,
      };
    }), []);

  const kpi = useMemo(() => ({
    total:     records.length,
    onDuty:    records.filter((r) => r.driver.status === 'On Duty').length,
    active:    records.filter((r) => r.driver.status === 'Active').length,
    offDuty:   records.filter((r) => r.driver.status === 'Off Duty').length,
    suspended: records.filter((r) => r.driver.status === 'Suspended').length,
    withShipments: records.filter((r) => r.activeShipments.length > 0).length,
  }), [records]);

  const filtered = useMemo(() => records.filter((r) => {
    const q = search.toLowerCase();
    const matchQ =
      r.driver.name.toLowerCase().includes(q)           ||
      r.driver.driverId.toLowerCase().includes(q)       ||
      r.driver.phone.includes(q)                        ||
      (r.vehicle?.registrationNumber ?? '').toLowerCase().includes(q) ||
      (r.vehicle?.make ?? '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || r.driver.status === statusFilter;
    return matchQ && matchStatus;
  }), [records, search, statusFilter]);

  const hasFilters = search || statusFilter !== 'all';
  const clearFilters = () => { setSearch(''); setStatus('all'); };

  const toggleExpand = (id: string) =>
    setExpanded((prev) => (prev === id ? null : id));

  return (
    <PageWrapper
      title="Dispatch Monitoring"
      description="Real-time driver and vehicle dispatch operations"
    >

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total Drivers',  value: kpi.total,         pill: 'bg-primary/10 text-primary border-primary/20'             },
          { label: 'On Duty',        value: kpi.onDuty,        pill: 'bg-primary/10 text-primary border-primary/20'             },
          { label: 'Active',         value: kpi.active,        pill: 'bg-success/10 text-success border-success/20'             },
          { label: 'Off Duty',       value: kpi.offDuty,       pill: 'bg-muted/50 text-muted-foreground border-border/40'       },
          { label: 'Suspended',      value: kpi.suspended,     pill: 'bg-destructive/10 text-destructive border-destructive/20' },
          { label: 'Carrying Load',  value: kpi.withShipments, pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20'       },
        ].map(({ label, value, pill }) => (
          <div key={label} className="
            bg-card border border-border/60 rounded-xl
            px-4 py-3 shadow-soft text-center
          ">
            <p className="text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className="text-[1.5rem] font-black font-display text-foreground leading-tight">
              {value}
            </p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[0.62rem] font-bold border ${pill}`}>
              {value === 1 ? 'driver' : 'drivers'}
            </span>
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
              placeholder="Search driver name, ID, phone or vehicle..."
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

            {/* Status filter pills */}
            {(['all', ...DRIVER_STATUSES] as const).map((s) => {
              const meta   = s !== 'all' ? DRIVER_STATUS_META[s] : null;
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`
                    px-3 py-1.5 rounded-lg text-[0.75rem] font-bold border
                    transition-all duration-200
                    ${active
                      ? meta
                        ? `${meta.pill}`
                        : 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted/20 text-muted-foreground border-border/40 hover:bg-muted/40 hover:text-foreground'}
                  `}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              );
            })}

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
            {filtered.length} of {records.length} driver{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ── Dispatch Cards ── */}
      {filtered.length > 0 ? (
        <div className="space-y-2.5">
          {filtered.map((record) => {
            const { driver, vehicle, activeShipments } = record;
            const statusMeta  = DRIVER_STATUS_META[driver.status] ?? DRIVER_STATUS_META['Off Duty'];
            const isOnDuty    = driver.status === 'On Duty' || driver.status === 'Active';
            const isOpen      = expanded === driver.id;
            const VehicleIcon = vehicle
              ? (VEHICLE_STATUS_META[vehicle.status]?.icon ?? Truck)
              : Truck;
            const vehicleColor = vehicle
              ? (VEHICLE_STATUS_META[vehicle.status]?.color ?? 'text-muted-foreground')
              : 'text-muted-foreground/30';

            return (
              <div
                key={driver.id}
                className={`
                  bg-card border rounded-xl overflow-hidden
                  transition-all duration-300
                  ${isOpen
                    ? 'border-primary/30 shadow-[0_4px_24px_oklch(var(--primary)/0.08)]'
                    : 'border-border/60 hover:border-primary/20 shadow-soft'}
                `}
              >
                {/* ── Collapsed Row ── */}
                <div
                  className="flex items-center gap-4 px-4 py-3.5 cursor-pointer select-none"
                  onClick={() => toggleExpand(driver.id)}
                >
                  {/* Avatar */}
                  <div className={`
                    w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center
                    text-[0.82rem] font-black font-display
                    ${isOnDuty
                      ? 'bg-primary/10 border border-primary/20 text-primary'
                      : 'bg-muted/40 border border-border/40 text-muted-foreground'}
                  `}>
                    {driver.avatar}
                  </div>

                  {/* Name + ID */}
                  <div className="w-40 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[0.84rem] font-bold text-foreground truncate">
                        {driver.name}
                      </span>
                      {isOnDuty && (
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-[0.68rem] text-muted-foreground/60 font-mono">
                      {driver.driverId}
                    </span>
                  </div>

                  {/* Vehicle */}
                  <div className="w-44 flex-shrink-0 hidden sm:block">
                    {vehicle ? (
                      <div className="flex items-center gap-2">
                        <VehicleIcon className={`w-4 h-4 flex-shrink-0 ${vehicleColor}`} />
                        <div className="min-w-0">
                          <p className="text-[0.78rem] font-semibold text-foreground truncate">
                            {vehicle.registrationNumber}
                          </p>
                          <p className="text-[0.68rem] text-muted-foreground/60 truncate">
                            {vehicle.make} {vehicle.model} · {vehicle.capacityUnit === 'kg'
                              ? `${vehicle.capacity} kg`
                              : `${vehicle.capacity} ${vehicle.capacityUnit}`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[0.75rem] text-muted-foreground/40 italic">
                        No vehicle assigned
                      </span>
                    )}
                  </div>

                  {/* Location (from last trip) */}
                  <div className="flex-1 min-w-0 hidden md:block">
                    {driver.tripHistory?.length ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                          <span className="text-[0.78rem] text-foreground/80 truncate">
                            {driver.tripHistory[driver.tripHistory.length - 1].to}
                          </span>
                        </div>
                        <p className="text-[0.68rem] text-muted-foreground/60 ml-4.5">
                          Last trip: {formatDate(driver.tripHistory[driver.tripHistory.length - 1].date)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[0.72rem] text-muted-foreground/40">No trip history</span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="w-16 flex-shrink-0 hidden lg:block text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className={`w-3.5 h-3.5 ${ratingColor(driver.rating)}`} />
                      <span className={`text-[0.84rem] font-bold ${ratingColor(driver.rating)}`}>
                        {driver.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-[0.65rem] text-muted-foreground/60 mt-0.5">
                      {driver.totalTrips} trips
                    </p>
                  </div>

                  {/* Active shipments badge */}
                  <div className="w-16 flex-shrink-0 hidden xl:block text-center">
                    <p className={`text-[0.88rem] font-bold font-display ${
                      activeShipments.length > 0 ? 'text-amber-400' : 'text-muted-foreground/40'
                    }`}>
                      {activeShipments.length}
                    </p>
                    <p className="text-[0.65rem] text-muted-foreground/60">active</p>
                  </div>

                  {/* Status pill */}
                  <span className={`
                    flex-shrink-0 inline-flex items-center gap-1.5
                    px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold border
                    ${statusMeta.pill}
                  `}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                    {driver.status}
                  </span>

                  {/* Expand */}
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

                {/* ── Expanded Panel ── */}
                {isOpen && (
                  <div className="border-t border-border/40 px-4 pb-4 pt-4 bg-muted/[0.03]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                      {/* ── Driver Profile ── */}
                      <div className="space-y-3">
                        <p className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">
                          Driver Profile
                        </p>

                        {/* Contact */}
                        <div className="bg-card border border-border/50 rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={`
                              w-11 h-11 rounded-xl flex items-center justify-center
                              text-[0.9rem] font-black font-display flex-shrink-0
                              ${isOnDuty
                                ? 'bg-primary/10 border border-primary/20 text-primary'
                                : 'bg-muted/40 border border-border/40 text-muted-foreground'}
                            `}>
                              {driver.avatar}
                            </div>
                            <div>
                              <p className="text-[0.84rem] font-bold text-foreground">{driver.name}</p>
                              <p className="text-[0.70rem] text-muted-foreground font-mono">{driver.driverId}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                            <Phone className="w-3 h-3 text-muted-foreground/50" />
                            <span className="text-[0.75rem] text-muted-foreground">{driver.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-muted-foreground/50" />
                            <span className="text-[0.75rem] text-muted-foreground font-mono">
                              Lic: {driver.licenseNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-muted-foreground/50" />
                            <span className="text-[0.75rem] text-muted-foreground">
                              Joined: {formatDate(driver.joinDate)}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
                            <div className="flex items-center justify-center gap-1 mb-0.5">
                              <Star className={`w-3.5 h-3.5 ${ratingColor(driver.rating)}`} />
                              <span className={`text-[1.2rem] font-black font-display ${ratingColor(driver.rating)}`}>
                                {driver.rating.toFixed(1)}
                              </span>
                            </div>
                            <p className="text-[0.65rem] text-muted-foreground/60 uppercase tracking-wide">Rating</p>
                          </div>
                          <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
                            <p className="text-[1.2rem] font-black font-display text-foreground">
                              {driver.totalTrips}
                            </p>
                            <p className="text-[0.65rem] text-muted-foreground/60 uppercase tracking-wide">Total Trips</p>
                          </div>
                        </div>

                        {/* Documents */}
                        <div className="bg-card border border-border/50 rounded-xl p-3.5">
                          <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-2">
                            Documents
                          </p>
                          <div className="space-y-1.5">
                            {driver.documents.map((doc, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <span className="text-[0.72rem] text-muted-foreground">{doc.type}</span>
                                <span className={`
                                  text-[0.65rem] font-bold px-1.5 py-0.5 rounded
                                  ${doc.verified
                                    ? 'bg-success/10 text-success'
                                    : 'bg-warning/10 text-warning'}
                                `}>
                                  {doc.verified ? '✓ Verified' : '⚠ Pending'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ── Vehicle Detail ── */}
                      <div className="space-y-3">
                        <p className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">
                          Assigned Vehicle
                        </p>

                        {vehicle ? (
                          <>
                            <div className="bg-card border border-border/50 rounded-xl p-3.5">
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`
                                  w-10 h-10 rounded-xl border flex items-center justify-center
                                  ${vehicle.status === 'On Route'
                                    ? 'bg-primary/10 border-primary/20'
                                    : vehicle.status === 'Maintenance'
                                      ? 'bg-warning/10 border-warning/20'
                                      : 'bg-muted/40 border-border/40'}
                                `}>
                                  <VehicleIcon className={`w-5 h-5 ${vehicleColor}`} />
                                </div>
                                <div>
                                  <p className="text-[0.84rem] font-bold font-mono text-foreground">
                                    {vehicle.registrationNumber}
                                  </p>
                                  <p className="text-[0.70rem] text-muted-foreground">
                                    {vehicle.make} {vehicle.model} · {vehicle.year}
                                  </p>
                                </div>
                              </div>

                              {[
                                { label: 'Fuel Type',  value: vehicle.fuelType                            },
                                { label: 'Capacity',   value: `${vehicle.capacity} ${vehicle.capacityUnit}` },
                                { label: 'Color',      value: vehicle.color                               },
                                { label: 'Owner',      value: vehicle.owner                               },
                              ].map(({ label, value }) => (
                                <div key={label} className="flex items-center justify-between py-1 border-b border-border/20 last:border-0">
                                  <span className="text-[0.70rem] text-muted-foreground/60">{label}</span>
                                  <span className="text-[0.75rem] font-semibold text-foreground">{value}</span>
                                </div>
                              ))}
                            </div>

                            {/* Insurance / service */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-card border border-border/50 rounded-xl p-3">
                                <p className="text-[0.65rem] text-muted-foreground/60 uppercase tracking-wide mb-1">
                                  Insurance Exp
                                </p>
                                <p className={`text-[0.78rem] font-bold ${
                                  new Date(vehicle.insuranceExpiry) < new Date()
                                    ? 'text-destructive' : 'text-foreground'
                                }`}>
                                  {formatDate(vehicle.insuranceExpiry)}
                                </p>
                              </div>
                              <div className="bg-card border border-border/50 rounded-xl p-3">
                                <p className="text-[0.65rem] text-muted-foreground/60 uppercase tracking-wide mb-1">
                                  Next Service
                                </p>
                                <p className={`text-[0.78rem] font-bold ${
                                  new Date(vehicle.nextServiceDue) < new Date()
                                    ? 'text-destructive' : 'text-foreground'
                                }`}>
                                  {formatDate(vehicle.nextServiceDue)}
                                </p>
                              </div>
                            </div>

                            {/* Latest fuel log */}
                            {vehicle.fuelLog?.length > 0 && (() => {
                              const latest = vehicle.fuelLog[vehicle.fuelLog.length - 1];
                              return (
                                <div className="bg-card border border-border/50 rounded-xl p-3.5">
                                  <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-2">
                                    Latest Fuel Log
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[0.72rem] text-muted-foreground">{formatDate(latest.date)}</span>
                                    <span className="text-[0.78rem] font-bold font-mono text-foreground">
                                      {latest.quantity}L · ₹{latest.cost.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-[0.68rem] text-muted-foreground/60">{latest.location}</span>
                                    <span className="text-[0.68rem] text-muted-foreground/60 font-mono">
                                      ODO: {latest.odometer.toLocaleString()} km
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                          </>
                        ) : (
                          <div className="
                            bg-card border border-border/50 rounded-xl p-6
                            flex flex-col items-center gap-2 text-center
                          ">
                            <Truck className="w-8 h-8 text-muted-foreground/20" />
                            <p className="text-[0.78rem] text-muted-foreground/50">No vehicle assigned</p>
                          </div>
                        )}
                      </div>

                      {/* ── Active Shipments + Trip History ── */}
                      <div className="space-y-3">
                        <p className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">
                          Active Shipments ({activeShipments.length})
                        </p>

                        {activeShipments.length > 0 ? (
                          <div className="space-y-2">
                            {activeShipments.map((s) => (
                              <div key={s.id} className="
                                bg-card border border-border/50 rounded-xl p-3.5
                              ">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="text-[0.78rem] font-bold font-mono text-primary">
                                      {s.trackingNumber}
                                    </p>
                                    <p className="text-[0.68rem] text-muted-foreground/60 mt-0.5">
                                      {s.serviceType} · {s.packageWeight} kg
                                    </p>
                                  </div>
                                  <span className={`
                                    inline-flex items-center px-2 py-0.5
                                    rounded-full text-[0.65rem] font-bold border
                                    ${SHIPMENT_STATUS_META[s.status] ?? SHIPMENT_STATUS_META['Pending']}
                                  `}>
                                    {s.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                                  <span className="text-[0.70rem] text-muted-foreground truncate">
                                    {s.pickupAddress} → {s.deliveryAddress}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <Clock className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                                  <span className="text-[0.68rem] text-muted-foreground/70">
                                    ETA: {formatDate(s.estimatedDelivery)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="
                            bg-card border border-border/50 rounded-xl p-5
                            flex flex-col items-center gap-2 text-center
                          ">
                            <Package className="w-6 h-6 text-muted-foreground/20" />
                            <p className="text-[0.75rem] text-muted-foreground/50">No active shipments</p>
                          </div>
                        )}

                        {/* Recent trip history */}
                        {driver.tripHistory?.length > 0 && (
                          <>
                            <p className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest pt-1">
                              Recent Trips
                            </p>
                            <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                              {driver.tripHistory.slice(-3).reverse().map((trip, i) => (
                                <div
                                  key={i}
                                  className={`
                                    flex items-center gap-3 px-3.5 py-2.5
                                    ${i < 2 ? 'border-b border-border/30' : ''}
                                  `}
                                >
                                  <Route className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 text-[0.72rem]">
                                      <span className="text-foreground/80 truncate">{trip.from}</span>
                                      <span className="text-muted-foreground/40">→</span>
                                      <span className="text-foreground/80 truncate">{trip.to}</span>
                                    </div>
                                    <p className="text-[0.65rem] text-muted-foreground/50 mt-0.5">
                                      {formatDate(trip.date)}
                                    </p>
                                  </div>
                                  <span className={`
                                    flex-shrink-0 text-[0.65rem] font-bold px-1.5 py-0.5 rounded
                                    ${trip.status === 'Completed'
                                      ? 'bg-success/10 text-success'
                                      : trip.status === 'In Progress'
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-destructive/10 text-destructive'}
                                  `}>
                                    {trip.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
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
            <User className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No drivers found</p>
          <p className="text-[0.78rem] text-muted-foreground">
            Try adjusting your search or status filter
          </p>
        </div>
      )}

    </PageWrapper>
  );
}
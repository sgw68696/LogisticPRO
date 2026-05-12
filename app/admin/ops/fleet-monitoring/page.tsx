'use client';

import { useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockVehicles, mockAircraft, mockShips } from '@/data/mockData';
import type { Vehicle, Aircraft, Ship } from '@/data/mockData';
import {
  Search, SlidersHorizontal, RotateCcw,
  Truck, Plane, Ship as ShipIcon,
  Wrench, CheckCircle, AlertTriangle,
  XCircle, ChevronDown, ChevronUp,
  Calendar, Fuel, Gauge, FileText,
  Clock, Shield, Anchor, Hash,
  Activity, Navigation,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

// ── Unified fleet asset ──
type FleetMode = 'Land' | 'Air' | 'Water';

interface FleetAsset {
  id: string;
  mode: FleetMode;
  identifier: string;
  name: string;
  year: number;
  status: string;
  companyId: string;
  // health signals
  insuranceExpiry: string | null;
  nextServiceDue: string | null;
  lastServiceDate: string | null;
  nextInspectionDue: string | null;
  certificationExpiry: string | null;
  // utilisation
  utilisationPct: number;      // flights hours used / max, or distance proxy
  utilisationLabel: string;
  // maintenance history count
  maintenanceCount: number;
  // health score 0–100
  healthScore: number;
  raw: Vehicle | Aircraft | Ship;
}

// ── Derive a simple health score from expiry dates ──
const daysUntil = (dateStr: string | null): number | null => {
  if (!dateStr) return null;
  return Math.round((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
};

const expiryHealth = (days: number | null): number => {
  if (days === null) return 80;
  if (days < 0)   return 0;
  if (days < 30)  return 20;
  if (days < 90)  return 50;
  if (days < 180) return 75;
  return 100;
};

const healthColor = (score: number) =>
  score >= 80 ? 'text-success'    :
  score >= 50 ? 'text-amber-400'  :
  score >= 20 ? 'text-warning'    : 'text-destructive';

const healthBg = (score: number) =>
  score >= 80 ? 'bg-success'    :
  score >= 50 ? 'bg-amber-400'  :
  score >= 20 ? 'bg-warning'    : 'bg-destructive';

const healthLabel = (score: number) =>
  score >= 80 ? 'Good'     :
  score >= 50 ? 'Fair'     :
  score >= 20 ? 'Warning'  : 'Critical';

// ── Build assets ──
const buildAssets = (): FleetAsset[] => {
  const land: FleetAsset[] = mockVehicles.map((v: Vehicle) => {
    const insH  = expiryHealth(daysUntil(v.insuranceExpiry));
    const svcH  = expiryHealth(daysUntil(v.nextServiceDue));
    const polH  = expiryHealth(daysUntil(v.pollutionExpiry));
    const score = Math.round((insH + svcH + polH) / 3);
    const dist  = v.totalDistance ?? 0;
    return {
      id: v.id, mode: 'Land',
      identifier: v.registrationNumber,
      name: `${v.make} ${v.model}`,
      year: v.year,
      status: v.status,
      companyId: v.companyId,
      insuranceExpiry:    v.insuranceExpiry,
      nextServiceDue:     v.nextServiceDue,
      lastServiceDate:    v.lastServiceDate,
      nextInspectionDue:  v.pollutionExpiry,     // pollution cert as proxy
      certificationExpiry: v.insuranceExpiry,
      utilisationPct: Math.min(100, Math.round(dist / 2000)),
      utilisationLabel: `${dist.toLocaleString()} km`,
      maintenanceCount: v.maintenanceSchedule?.length ?? 0,
      healthScore: score,
      raw: v,
    };
  });

  const air: FleetAsset[] = mockAircraft.map((a: Aircraft) => {
    const awH   = expiryHealth(daysUntil(a.airworthinessExpiry));
    const insH  = expiryHealth(daysUntil(a.lastInspection));   // recent = good
    const hoursUsedPct = a.maxFlightHours
      ? Math.round((a.currentFlightHours / a.maxFlightHours) * 100)
      : 0;
    const score = Math.round((awH + (100 - hoursUsedPct) + 80) / 3);
    return {
      id: a.id, mode: 'Air',
      identifier: a.registrationNumber,
      name: `${a.manufacturer} ${a.model}`,
      year: a.manufactureYear,
      status: a.status,
      companyId: a.companyId,
      insuranceExpiry:    a.airworthinessExpiry,
      nextServiceDue:     a.nextInspectionDue,
      lastServiceDate:    a.lastInspection,
      nextInspectionDue:  a.nextInspectionDue,
      certificationExpiry: a.airworthinessExpiry,
      utilisationPct: hoursUsedPct,
      utilisationLabel: `${a.currentFlightHours.toLocaleString()} / ${a.maxFlightHours.toLocaleString()} hrs`,
      maintenanceCount: a.maintenanceLog?.length ?? 0,
      healthScore: Math.min(100, score),
      raw: a,
    };
  });

  const water: FleetAsset[] = mockShips.map((s: Ship) => {
    const certH = expiryHealth(daysUntil(s.certificationExpiry));
    const ddH   = expiryHealth(daysUntil(s.nextDryDockDue));
    const score = Math.round((certH + ddH) / 2);
    const tonnage = s.deadWeightTonnage ?? 0;
    return {
      id: s.id, mode: 'Water',
      identifier: `IMO ${s.imoNumber}`,
      name: s.vesselName,
      year: s.yearBuilt,
      status: s.status,
      companyId: s.companyId,
      insuranceExpiry:    s.certificationExpiry,
      nextServiceDue:     s.nextDryDockDue,
      lastServiceDate:    s.lastDryDock,
      nextInspectionDue:  s.nextDryDockDue,
      certificationExpiry: s.certificationExpiry,
      utilisationPct: Math.min(100, Math.round(tonnage / 2000)),
      utilisationLabel: `${tonnage.toLocaleString()} DWT`,
      maintenanceCount: s.maintenanceRecords?.length ?? 0,
      healthScore: score,
      raw: s,
    };
  });

  return [...land, ...air, ...water];
};

// ── Config ──
const MODE_META: Record<FleetMode, {
  icon: typeof Truck; color: string; bg: string; border: string;
}> = {
  Land:  { icon: Truck,    color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  Air:   { icon: Plane,    color: 'text-sky-400',   bg: 'bg-sky-500/10',   border: 'border-sky-500/20'   },
  Water: { icon: ShipIcon, color: 'text-primary',   bg: 'bg-primary/10',   border: 'border-primary/20'   },
};

const ASSET_STATUS_META: Record<string, { pill: string; dot: string }> = {
  'Available':      { pill: 'bg-success/10 text-success border-success/20',             dot: 'bg-success'          },
  'On Route':       { pill: 'bg-primary/10 text-primary border-primary/20',             dot: 'bg-primary'          },
  'Maintenance':    { pill: 'bg-warning/10 text-warning border-warning/20',             dot: 'bg-warning'          },
  'Inactive':       { pill: 'bg-muted/50 text-muted-foreground border-border/40',       dot: 'bg-muted-foreground' },
  'Grounded':       { pill: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive'      },
  'Active':         { pill: 'bg-success/10 text-success border-success/20',             dot: 'bg-success'          },
  'Docked':         { pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20',             dot: 'bg-sky-400'          },
  'Decommissioned': { pill: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive'      },
};

const EXPIRY_COLOR = (days: number | null) =>
  days === null ? 'text-muted-foreground/50' :
  days < 0      ? 'text-destructive font-bold' :
  days < 30     ? 'text-destructive'           :
  days < 90     ? 'text-amber-400'             :
  days < 180    ? 'text-warning'               : 'text-foreground';

export default function FleetMonitoringPage() {
  const assets = useMemo(buildAssets, []);

  const [search, setSearch]       = useState('');
  const [modeFilter, setMode]     = useState<FleetMode | 'all'>('all');
  const [statusFilter, setStatus] = useState<string>('all');
  const [healthFilter, setHealth] = useState<string>('all');
  const [expanded, setExpanded]   = useState<string | null>(null);

  const allStatuses = useMemo(() =>
    Array.from(new Set(assets.map((a) => a.status))).sort(), [assets]);

  const kpi = useMemo(() => {
    const all = assets;
    return {
      total:       all.length,
      good:        all.filter((a) => a.healthScore >= 80).length,
      fair:        all.filter((a) => a.healthScore >= 50 && a.healthScore < 80).length,
      warning:     all.filter((a) => a.healthScore >= 20 && a.healthScore < 50).length,
      critical:    all.filter((a) => a.healthScore < 20).length,
      maintenance: all.filter((a) => a.status === 'Maintenance').length,
      // expiring soon (within 30 days)
      expiringSoon: all.filter((a) => {
        const d = daysUntil(a.nextServiceDue);
        return d !== null && d >= 0 && d <= 30;
      }).length,
    };
  }, [assets]);

  const filtered = useMemo(() => assets.filter((a) => {
    const q = search.toLowerCase();
    const matchQ =
      a.identifier.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q)       ||
      a.companyId.toLowerCase().includes(q);
    const matchMode   = modeFilter   === 'all' || a.mode   === modeFilter;
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchHealth =
      healthFilter === 'all'     ? true :
      healthFilter === 'good'    ? a.healthScore >= 80 :
      healthFilter === 'fair'    ? a.healthScore >= 50 && a.healthScore < 80 :
      healthFilter === 'warning' ? a.healthScore >= 20 && a.healthScore < 50 :
      /* critical */                a.healthScore < 20;
    return matchQ && matchMode && matchStatus && matchHealth;
  }), [assets, search, modeFilter, statusFilter, healthFilter]);

  const hasFilters = search || modeFilter !== 'all' || statusFilter !== 'all' || healthFilter !== 'all';
  const clearFilters = () => { setSearch(''); setMode('all'); setStatus('all'); setHealth('all'); };

  const toggle = (id: string) => setExpanded((p) => (p === id ? null : id));

  // ── Expanded detail renderers per mode ──
  const renderVehicleDetail = (v: Vehicle) => (
    <div className="grid grid-cols-2 gap-3">
      {/* Certificates */}
      <div className="bg-card border border-border/50 rounded-xl p-3.5 space-y-2">
        <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-1 flex items-center gap-1.5">
          <Shield className="w-3 h-3" /> Certificates
        </p>
        {[
          { label: 'Insurance',     date: v.insuranceExpiry     },
          { label: 'Pollution',     date: v.pollutionExpiry     },
          { label: 'Next Service',  date: v.nextServiceDue      },
        ].map(({ label, date }) => {
          const d = daysUntil(date);
          return (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[0.70rem] text-muted-foreground/70">{label}</span>
              <div className="text-right">
                <span className={`text-[0.72rem] ${EXPIRY_COLOR(d)}`}>{formatDate(date)}</span>
                {d !== null && (
                  <span className={`block text-[0.60rem] ${EXPIRY_COLOR(d)}`}>
                    {d < 0 ? `${Math.abs(d)}d overdue` : `${d}d left`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Specs */}
      <div className="bg-card border border-border/50 rounded-xl p-3.5 space-y-2">
        <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-1 flex items-center gap-1.5">
          <Gauge className="w-3 h-3" /> Specs
        </p>
        {[
          { label: 'Fuel Type',    value: v.fuelType                                    },
          { label: 'Capacity',     value: `${v.capacity} ${v.capacityUnit}`             },
          { label: 'Total Dist',   value: `${(v.totalDistance ?? 0).toLocaleString()} km` },
          { label: 'Color',        value: v.color                                       },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[0.70rem] text-muted-foreground/70">{label}</span>
            <span className="text-[0.72rem] font-semibold text-foreground">{value}</span>
          </div>
        ))}
      </div>

      {/* Maintenance history */}
      {v.maintenanceSchedule?.length > 0 && (
        <div className="col-span-2 bg-card border border-border/50 rounded-xl p-3.5">
          <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Wrench className="w-3 h-3" /> Maintenance History
          </p>
          <div className="space-y-1.5">
            {v.maintenanceSchedule.map((m) => (
              <div key={m.id} className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`
                    px-1.5 py-0.5 rounded text-[0.60rem] font-bold
                    ${m.type === 'Emergency' ? 'bg-destructive/10 text-destructive' :
                      m.type === 'Repair'    ? 'bg-warning/10 text-warning'         :
                                              'bg-success/10 text-success'}
                  `}>{m.type}</span>
                  <span className="text-[0.72rem] text-muted-foreground">{m.description}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[0.70rem] font-mono text-foreground">₹{m.cost.toLocaleString()}</span>
                  <p className="text-[0.60rem] text-muted-foreground/50">{formatDate(m.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Latest fuel log */}
      {v.fuelLog?.length > 0 && (() => {
        const f = v.fuelLog[v.fuelLog.length - 1];
        return (
          <div className="col-span-2 bg-card border border-border/50 rounded-xl p-3.5">
            <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Fuel className="w-3 h-3" /> Latest Fuel Log
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.78rem] font-semibold text-foreground">{f.location}</p>
                <p className="text-[0.68rem] text-muted-foreground/60">{formatDate(f.date)}</p>
              </div>
              <div className="text-right">
                <p className="text-[0.82rem] font-bold font-mono text-foreground">{f.quantity}L · ₹{f.cost.toLocaleString()}</p>
                <p className="text-[0.68rem] text-muted-foreground/60 font-mono">ODO {f.odometer.toLocaleString()} km</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );

  const renderAircraftDetail = (a: Aircraft) => (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-card border border-border/50 rounded-xl p-3.5 space-y-2">
        <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-1 flex items-center gap-1.5">
          <Shield className="w-3 h-3" /> Airworthiness
        </p>
        {[
          { label: 'Airworthiness Exp', date: a.airworthinessExpiry },
          { label: 'Last Inspection',   date: a.lastInspection      },
          { label: 'Next Inspection',   date: a.nextInspectionDue   },
        ].map(({ label, date }) => {
          const d = daysUntil(date);
          return (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[0.70rem] text-muted-foreground/70">{label}</span>
              <div className="text-right">
                <span className={`text-[0.72rem] ${EXPIRY_COLOR(d)}`}>{formatDate(date)}</span>
                {d !== null && (
                  <span className={`block text-[0.60rem] ${EXPIRY_COLOR(d)}`}>
                    {d < 0 ? `${Math.abs(d)}d overdue` : `${d}d left`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-3.5 space-y-2">
        <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-1 flex items-center gap-1.5">
          <Activity className="w-3 h-3" /> Flight Hours
        </p>
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[0.70rem] text-muted-foreground/70">Utilisation</span>
            <span className="text-[0.72rem] font-bold text-foreground">
              {a.currentFlightHours.toLocaleString()} / {a.maxFlightHours.toLocaleString()} hrs
            </span>
          </div>
          <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                a.currentFlightHours / a.maxFlightHours > 0.85 ? 'bg-destructive' :
                a.currentFlightHours / a.maxFlightHours > 0.65 ? 'bg-amber-400'  : 'bg-success'
              }`}
              style={{ width: `${Math.min(100, Math.round((a.currentFlightHours / a.maxFlightHours) * 100))}%` }}
            />
          </div>
        </div>
        {[
          { label: 'Cruise Speed', value: `${a.cruiseSpeed} km/h`          },
          { label: 'Range',        value: `${a.range.toLocaleString()} km` },
          { label: 'Max Altitude', value: `${a.maxAltitude.toLocaleString()} ft` },
          { label: 'Fuel Cap',     value: `${a.fuelCapacity.toLocaleString()} L` },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[0.70rem] text-muted-foreground/70">{label}</span>
            <span className="text-[0.72rem] font-semibold text-foreground">{value}</span>
          </div>
        ))}
      </div>

      {/* Crew */}
      <div className="bg-card border border-border/50 rounded-xl p-3.5">
        <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Hash className="w-3 h-3" /> Crew
        </p>
        {[
          { label: 'Pilot',    value: a.crew.pilotId   },
          { label: 'Co-Pilot', value: a.crew.copilotId },
          { label: 'Engineers', value: a.crew.engineerIds.join(', ') },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-0.5">
            <span className="text-[0.70rem] text-muted-foreground/70">{label}</span>
            <span className="text-[0.68rem] font-mono text-muted-foreground">{value}</span>
          </div>
        ))}
      </div>

      {/* Maintenance log */}
      {a.maintenanceLog?.length > 0 && (
        <div className="bg-card border border-border/50 rounded-xl p-3.5">
          <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Wrench className="w-3 h-3" /> Maintenance Log
          </p>
          {a.maintenanceLog.map((m) => (
            <div key={m.id} className="flex items-start justify-between gap-2 mb-1.5 last:mb-0">
              <div>
                <span className={`
                  text-[0.60rem] font-bold px-1.5 py-0.5 rounded mr-1.5
                  ${m.type === 'Emergency' ? 'bg-destructive/10 text-destructive' :
                    m.type === 'Major'     ? 'bg-warning/10 text-warning'         :
                                            'bg-success/10 text-success'}
                `}>{m.type}</span>
                <span className="text-[0.70rem] text-muted-foreground">{m.description}</span>
              </div>
              <span className="text-[0.68rem] font-mono text-foreground flex-shrink-0">
                ₹{m.cost.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderShipDetail = (s: Ship) => (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-card border border-border/50 rounded-xl p-3.5 space-y-2">
        <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-1 flex items-center gap-1.5">
          <Shield className="w-3 h-3" /> Certification
        </p>
        {[
          { label: 'Certification',  date: s.certificationExpiry },
          { label: 'Last Dry Dock',  date: s.lastDryDock         },
          { label: 'Next Dry Dock',  date: s.nextDryDockDue      },
        ].map(({ label, date }) => {
          const d = daysUntil(date);
          return (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[0.70rem] text-muted-foreground/70">{label}</span>
              <div className="text-right">
                <span className={`text-[0.72rem] ${EXPIRY_COLOR(d)}`}>{formatDate(date)}</span>
                {d !== null && (
                  <span className={`block text-[0.60rem] ${EXPIRY_COLOR(d)}`}>
                    {d < 0 ? `${Math.abs(d)}d overdue` : `${d}d left`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-3.5 space-y-2">
        <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-1 flex items-center gap-1.5">
          <Anchor className="w-3 h-3" /> Vessel Specs
        </p>
        {[
          { label: 'GRT',           value: `${s.grossTonnage.toLocaleString()} GT`  },
          { label: 'DWT',           value: `${s.deadWeightTonnage.toLocaleString()} T` },
          { label: 'Container Cap', value: `${s.containerCapacity.toLocaleString()} TEU` },
          { label: 'Speed',         value: `${s.speed} knots`                       },
          { label: 'Crew Size',     value: `${s.crewSize} crew`                     },
          { label: 'Class',         value: s.class                                  },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[0.70rem] text-muted-foreground/70">{label}</span>
            <span className="text-[0.72rem] font-semibold text-foreground">{value}</span>
          </div>
        ))}
      </div>

      {/* Current location */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5">
        <p className="text-[0.65rem] font-bold text-primary/70 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Navigation className="w-3 h-3" /> Current Location
        </p>
        <p className="text-[0.82rem] font-semibold text-foreground">
          {s.currentLocation?.port ?? 'At Sea'}
        </p>
        <p className="text-[0.70rem] font-mono text-muted-foreground mt-0.5">
          {s.currentLocation?.latitude.toFixed(4)}°, {s.currentLocation?.longitude.toFixed(4)}°
        </p>
      </div>

      {/* Certifications list */}
      {s.certifications?.length > 0 && (
        <div className="bg-card border border-border/50 rounded-xl p-3.5">
          <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <FileText className="w-3 h-3" /> Certifications
          </p>
          {s.certifications.map((c) => {
            const d = daysUntil(c.expiryDate);
            return (
              <div key={c.id} className="flex items-center justify-between mb-1.5 last:mb-0">
                <span className="text-[0.72rem] font-semibold text-foreground">{c.type}</span>
                <div className="text-right">
                  <span className={`text-[0.68rem] ${EXPIRY_COLOR(d)}`}>{formatDate(c.expiryDate)}</span>
                  {d !== null && (
                    <span className={`block text-[0.60rem] ${EXPIRY_COLOR(d)}`}>
                      {d < 0 ? `${Math.abs(d)}d overdue` : `${d}d left`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Maintenance records */}
      {s.maintenanceRecords?.length > 0 && (
        <div className="col-span-2 bg-card border border-border/50 rounded-xl p-3.5">
          <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Wrench className="w-3 h-3" /> Maintenance Records
          </p>
          {s.maintenanceRecords.map((m) => (
            <div key={m.id} className="flex items-start justify-between gap-2 mb-1.5 last:mb-0">
              <div>
                <span className={`
                  text-[0.60rem] font-bold px-1.5 py-0.5 rounded mr-1.5
                  ${m.type === 'Emergency' ? 'bg-destructive/10 text-destructive' :
                    m.type === 'Repair'    ? 'bg-warning/10 text-warning'         :
                                            'bg-success/10 text-success'}
                `}>{m.type}</span>
                <span className="text-[0.70rem] text-muted-foreground">{m.description}</span>
                <p className="text-[0.60rem] text-muted-foreground/50 mt-0.5">
                  {m.location} · {m.doneBy} · {m.duration}d
                </p>
              </div>
              <span className="text-[0.70rem] font-mono text-foreground flex-shrink-0">
                ₹{m.cost.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <PageWrapper
      title="Fleet Monitoring"
      description="Asset health, compliance and utilisation across all transport modes"
    >

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 mb-6">
        {[
          { label: 'Total Assets',   value: kpi.total,        cls: 'bg-primary/10 text-primary border-primary/20'             },
          { label: 'Good Health',    value: kpi.good,         cls: 'bg-success/10 text-success border-success/20'             },
          { label: 'Fair',           value: kpi.fair,         cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20'       },
          { label: 'Warning',        value: kpi.warning,      cls: 'bg-warning/10 text-warning border-warning/20'             },
          { label: 'Critical',       value: kpi.critical,     cls: 'bg-destructive/10 text-destructive border-destructive/20' },
          { label: 'In Maintenance', value: kpi.maintenance,  cls: 'bg-warning/10 text-warning border-warning/20'             },
          { label: 'Expiring Soon',  value: kpi.expiringSoon, cls: 'bg-destructive/10 text-destructive border-destructive/20' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-card border border-border/60 rounded-xl px-3 py-3 shadow-soft text-center">
            <p className="text-[0.62rem] font-bold text-muted-foreground uppercase tracking-wide mb-1 leading-tight">
              {label}
            </p>
            <p className="text-[1.4rem] font-black font-display text-foreground">{value}</p>
            <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded-full text-[0.58rem] font-bold border ${cls}`}>
              assets
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
              placeholder="Search identifier, name or company..."
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

            {/* Mode pills */}
            {(['all', 'Land', 'Air', 'Water'] as const).map((m) => {
              const meta   = m !== 'all' ? MODE_META[m] : null;
              const active = modeFilter === m;
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
                      : 'bg-muted/20 text-muted-foreground border-border/40 hover:bg-muted/40'}
                  `}
                >
                  {m === 'Land'  && <Truck    className="w-3 h-3" />}
                  {m === 'Air'   && <Plane    className="w-3 h-3" />}
                  {m === 'Water' && <ShipIcon className="w-3 h-3" />}
                  {m === 'all' ? 'All' : m}
                </button>
              );
            })}

            <Select value={statusFilter} onValueChange={setStatus}>
              <SelectTrigger className="w-[140px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all" className="text-[0.82rem]">All Statuses</SelectItem>
                {allStatuses.map((s) => (
                  <SelectItem key={s} value={s} className="text-[0.82rem]">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={healthFilter} onValueChange={setHealth}>
              <SelectTrigger className="w-[135px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0">
                <SelectValue placeholder="All Health" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all"     className="text-[0.82rem]">All Health</SelectItem>
                <SelectItem value="good"    className="text-[0.82rem]">Good (≥80)</SelectItem>
                <SelectItem value="fair"    className="text-[0.82rem]">Fair (50–79)</SelectItem>
                <SelectItem value="warning" className="text-[0.82rem]">Warning (20–49)</SelectItem>
                <SelectItem value="critical"className="text-[0.82rem]">Critical (&lt;20)</SelectItem>
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
                <RotateCcw size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {hasFilters && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">
            {filtered.length} of {assets.length} asset{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ── Asset Cards ── */}
      {filtered.length > 0 ? (
        <div className="space-y-2.5">
          {filtered.map((asset) => {
            const modeMeta   = MODE_META[asset.mode];
            const statusMeta = ASSET_STATUS_META[asset.status] ?? ASSET_STATUS_META['Inactive'];
            const ModeIcon   = modeMeta.icon;
            const isOpen     = expanded === asset.id;
            const serviceD   = daysUntil(asset.nextServiceDue);
            const certD      = daysUntil(asset.certificationExpiry);

            return (
              <div
                key={asset.id}
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
                  onClick={() => toggle(asset.id)}
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
                    <p className="text-[0.84rem] font-bold font-mono text-foreground truncate">
                      {asset.identifier}
                    </p>
                    <p className="text-[0.70rem] text-muted-foreground truncate">
                      {asset.name} · {asset.year}
                    </p>
                  </div>

                  {/* Health score bar */}
                  <div className="w-32 flex-shrink-0 hidden sm:block">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[0.65rem] text-muted-foreground/60">Health</span>
                      <span className={`text-[0.72rem] font-bold ${healthColor(asset.healthScore)}`}>
                        {healthLabel(asset.healthScore)}
                      </span>
                    </div>
                    <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${healthBg(asset.healthScore)}`}
                        style={{ width: `${asset.healthScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Next service */}
                  <div className="w-36 flex-shrink-0 hidden md:block">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                      <span className={`text-[0.75rem] font-semibold ${EXPIRY_COLOR(serviceD)}`}>
                        {asset.nextServiceDue ? formatDate(asset.nextServiceDue) : '—'}
                      </span>
                    </div>
                    {serviceD !== null && (
                      <p className={`text-[0.65rem] ml-4.5 ${EXPIRY_COLOR(serviceD)}`}>
                        {serviceD < 0 ? `${Math.abs(serviceD)}d overdue` : `in ${serviceD}d`}
                      </p>
                    )}
                  </div>

                  {/* Cert expiry */}
                  <div className="w-32 flex-shrink-0 hidden lg:block">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                      <span className={`text-[0.72rem] ${EXPIRY_COLOR(certD)}`}>
                        {asset.certificationExpiry ? formatDate(asset.certificationExpiry) : '—'}
                      </span>
                    </div>
                    <p className="text-[0.62rem] text-muted-foreground/50 ml-4.5">Cert expiry</p>
                  </div>

                  {/* Utilisation */}
                  <div className="hidden xl:block flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[0.65rem] text-muted-foreground/60">Utilisation</span>
                      <span className="text-[0.68rem] font-mono text-muted-foreground truncate ml-2">
                        {asset.utilisationLabel}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          asset.utilisationPct > 85 ? 'bg-destructive' :
                          asset.utilisationPct > 65 ? 'bg-amber-400'   : 'bg-primary'
                        }`}
                        style={{ width: `${asset.utilisationPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Maintenance count */}
                  <div className="w-12 flex-shrink-0 hidden xl:block text-center">
                    <p className="text-[0.88rem] font-bold font-display text-foreground">{asset.maintenanceCount}</p>
                    <p className="text-[0.60rem] text-muted-foreground/60">svc logs</p>
                  </div>

                  {/* Status pill */}
                  <span className={`
                    flex-shrink-0 inline-flex items-center gap-1.5
                    px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold border
                    ${statusMeta.pill}
                  `}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                    {asset.status}
                  </span>

                  <button className="
                    w-7 h-7 flex items-center justify-center rounded-lg
                    bg-muted/30 border border-border/40
                    text-muted-foreground flex-shrink-0
                    hover:bg-primary/10 hover:text-primary hover:border-primary/20
                    transition-colors duration-150
                  ">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* ── Expanded Detail ── */}
                {isOpen && (
                  <div className="border-t border-border/40 px-4 pb-4 pt-4 bg-muted/[0.03]">
                    {asset.mode === 'Land'  && renderVehicleDetail(asset.raw as Vehicle)}
                    {asset.mode === 'Air'   && renderAircraftDetail(asset.raw as Aircraft)}
                    {asset.mode === 'Water' && renderShipDetail(asset.raw as Ship)}
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
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center">
            <Truck className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No assets found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}

    </PageWrapper>
  );
}
'use client';

import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import {
  Plus, Pencil, Trash2,
  Truck, Plane, Ship, Globe,
  Package, Users, Route, Zap,
  CheckCircle, XCircle,
} from 'lucide-react';
import {
  mockTransportTypes, mockVehicles,
  mockAircraft, mockShips, mockCargo,
} from '@/data/mockData';
import { toast } from 'sonner';

type ModeKey = 'Land' | 'Air' | 'Water';

interface TransportMode {
  id: string;
  name: ModeKey;
  icon: typeof Truck;
  color: string;
  bg: string;
  border: string;
  gradient: string;
  description: string;
  advantages: string[];
  limitations: string[];
  typicalUse: string;
  maxSpeedKmh: number;
  avgCostPerKg: string;
  status: 'Active' | 'Inactive';
}

const MODES: TransportMode[] = [
  {
    id: 'mode-land',
    name: 'Land',
    icon: Truck,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    gradient: 'from-amber-500/20 to-amber-500/5',
    description: 'Road and rail-based freight transport covering domestic and cross-border routes.',
    advantages: [
      'Door-to-door delivery',
      'Flexible scheduling',
      'No transshipment for domestic',
      'Cost-effective for short-medium haul',
    ],
    limitations: [
      'Subject to traffic and road conditions',
      'Higher per-km cost vs sea for long haul',
      'Limited by road infrastructure',
    ],
    typicalUse: 'Last-mile delivery, regional distribution, perishable goods, e-commerce',
    maxSpeedKmh: 100,
    avgCostPerKg: '₹2–8 / km',
    status: 'Active',
  },
  {
    id: 'mode-air',
    name: 'Air',
    icon: Plane,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    gradient: 'from-sky-500/20 to-sky-500/5',
    description: 'Aircraft-based cargo transport for time-critical or high-value international shipments.',
    advantages: [
      'Fastest transit time globally',
      'High security and low damage rate',
      'Reliable scheduling',
      'Suitable for high-value / perishable cargo',
    ],
    limitations: [
      'Highest cost per kg',
      'Weight and dimension restrictions',
      'Hazardous cargo restrictions',
      'Dependent on airport proximity',
    ],
    typicalUse: 'Pharmaceuticals, electronics, urgent shipments, e-commerce cross-border',
    maxSpeedKmh: 900,
    avgCostPerKg: '₹250–600 / kg',
    status: 'Active',
  },
  {
    id: 'mode-water',
    name: 'Water',
    icon: Ship,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    gradient: 'from-primary/20 to-primary/5',
    description: 'Sea and inland waterway transport for bulk, containerised, and heavy cargo worldwide.',
    advantages: [
      'Lowest cost per tonne-km',
      'Highest capacity (TEU containers)',
      'Suitable for oversized / heavy cargo',
      'Lower carbon footprint vs air',
    ],
    limitations: [
      'Slowest transit time',
      'Port dependency',
      'Weather / seasonal delays',
      'High minimum cargo volumes',
    ],
    typicalUse: 'Bulk commodities, containerised exports, machinery, automotive, raw materials',
    maxSpeedKmh: 40,
    avgCostPerKg: '₹1–4 / kg',
    status: 'Active',
  },
];

// ── Live stats pulled from mockData ──
const getModeStats = (mode: ModeKey) => {
  const transportType = mockTransportTypes.find((t) => t.name === mode);
  const fleetCount =
    mode === 'Land'  ? mockVehicles.length :
    mode === 'Air'   ? mockAircraft.length :
                       mockShips.length;
  const cargoCount = mockCargo.filter((c) => c.transportMode === mode).length;

  return {
    typeId:     transportType?.id    ?? '—',
    typeStatus: transportType?.status ?? 'Inactive',
    fleet:      fleetCount,
    cargo:      cargoCount,
  };
};

export default function TransportModesPage() {
  const [modes, setModes] = useState(MODES);

  const toggleStatus = (id: string) => {
    setModes((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' }
          : m
      )
    );
    toast.success('Transport mode status updated');
  };

  const activeCount = modes.filter((m) => m.status === 'Active').length;
  const totalFleet  =
    mockVehicles.length + mockAircraft.length + mockShips.length;

  return (
    <PageWrapper
      title="Transport Modes"
      description="Configure Land, Air, and Water transport modes"
      actions={
        <button
          className="
            flex items-center gap-2 px-3.5 py-2 rounded-[10px]
            text-[0.82rem] font-bold text-white font-display cursor-pointer
            transition-all duration-200 hover:-translate-y-px
            hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]
          "
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Plus size={14} />
          Add Mode
        </button>
      }
    >

      {/* ── Stats Strip ── */}
      <div className="
        bg-card border border-border/60 rounded-xl
        px-5 py-3.5 mb-6 shadow-soft
        flex items-center gap-6 flex-wrap
      ">
        {[
          { label: 'Total Modes',   value: modes.length,   pill: 'bg-primary/10 text-primary border-primary/20'       },
          { label: 'Active',        value: activeCount,    pill: 'bg-success/10 text-success border-success/20'        },
          { label: 'Total Fleet',   value: totalFleet,     pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
          { label: 'Active Cargo',  value: mockCargo.length, pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20'     },
         ].map(({ label, value, pill }, i) => (
          <React.Fragment key={label}>
            {i > 0 && <div className="w-px h-4 bg-border/50" />}
            <div className="flex items-center gap-2">
              <span className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">
                {label}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[0.72rem] font-bold border ${pill}`}>
                {value}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ── Mode Cards — full width, stacked ── */}
      <div className="space-y-5">
        {modes.map((mode) => {
          const Icon  = mode.icon;
          const stats = getModeStats(mode.name);
          const isActive = mode.status === 'Active';

          return (
            <div
              key={mode.id}
              className={`
                group bg-card border rounded-xl shadow-soft overflow-hidden
                transition-all duration-300
                ${isActive
                  ? 'border-border/60 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]'
                  : 'border-border/30 opacity-60'}
              `}
            >
              {/* ── Gradient top accent ── */}
              <div className={`h-0.5 w-full bg-gradient-to-r ${mode.gradient}`} />

              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">

                  {/* ── Left: Identity ── */}
                  <div className="flex-shrink-0 w-full lg:w-64">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`
                        w-14 h-14 rounded-2xl border flex-shrink-0
                        flex items-center justify-center
                        ${mode.bg} ${mode.border}
                      `}>
                        <Icon className={`w-7 h-7 ${mode.color}`} />
                      </div>
                      <div>
                        <h3 className="text-[1.1rem] font-black font-display text-foreground">
                          {mode.name}
                        </h3>
                        <span className="text-[0.70rem] font-mono text-muted-foreground/60">
                          ID: {stats.typeId}
                        </span>
                      </div>
                    </div>

                    <p className="text-[0.78rem] text-muted-foreground leading-relaxed mb-4">
                      {mode.description}
                    </p>

                    {/* Quick specs */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[0.72rem] text-muted-foreground/60 flex items-center gap-1.5">
                          <Zap className="w-3 h-3" /> Max Speed
                        </span>
                        <span className="text-[0.78rem] font-bold font-mono text-foreground">
                          {mode.maxSpeedKmh.toLocaleString()} km/h
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[0.72rem] text-muted-foreground/60 flex items-center gap-1.5">
                          <Package className="w-3 h-3" /> Avg Cost
                        </span>
                        <span className="text-[0.78rem] font-bold font-mono text-foreground">
                          {mode.avgCostPerKg}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Middle: Advantages / Limitations ── */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Advantages */}
                    <div className="
                      bg-success/[0.04] border border-success/15
                      rounded-xl p-4
                    ">
                      <p className="
                        text-[0.65rem] font-bold text-success/80
                        uppercase tracking-widest mb-3
                        flex items-center gap-1.5
                      ">
                        <CheckCircle className="w-3 h-3" />
                        Advantages
                      </p>
                      <ul className="space-y-2">
                        {mode.advantages.map((a, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="
                              w-1.5 h-1.5 rounded-full bg-success/60
                              flex-shrink-0 mt-1.5
                            " />
                            <span className="text-[0.75rem] text-muted-foreground leading-snug">
                              {a}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Limitations */}
                    <div className="
                      bg-destructive/[0.03] border border-destructive/10
                      rounded-xl p-4
                    ">
                      <p className="
                        text-[0.65rem] font-bold text-destructive/70
                        uppercase tracking-widest mb-3
                        flex items-center gap-1.5
                      ">
                        <XCircle className="w-3 h-3" />
                        Limitations
                      </p>
                      <ul className="space-y-2">
                        {mode.limitations.map((l, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="
                              w-1.5 h-1.5 rounded-full bg-destructive/40
                              flex-shrink-0 mt-1.5
                            " />
                            <span className="text-[0.75rem] text-muted-foreground leading-snug">
                              {l}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Typical Use */}
                    <div className="
                      sm:col-span-2 bg-muted/20 border border-border/40
                      rounded-xl px-4 py-3
                      flex items-start gap-2.5
                    ">
                      <Route className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-widest mb-0.5">
                          Typical Use Cases
                        </p>
                        <p className="text-[0.78rem] text-muted-foreground leading-relaxed">
                          {mode.typicalUse}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Right: Live Stats + Controls ── */}
                  <div className="flex-shrink-0 w-full lg:w-44 flex flex-col gap-3">

                    {/* Live stats */}
                    {[
                      {
                        icon: Users,
                        label: 'Fleet',
                        value: stats.fleet,
                        color: mode.color,
                      },
                      {
                        icon: Package,
                        label: 'Active Cargo',
                        value: stats.cargo,
                        color: 'text-success',
                      },
                    ].map(({ icon: StatIcon, label, value, color }) => (
                      <div key={label} className="
                        bg-muted/20 border border-border/40
                        rounded-xl px-4 py-3
                        flex items-center gap-3
                      ">
                        <StatIcon className={`w-4 h-4 flex-shrink-0 ${color}`} />
                        <div>
                          <p className="text-[0.65rem] text-muted-foreground/60 uppercase tracking-wide font-bold">
                            {label}
                          </p>
                          <p className={`text-[1.1rem] font-black font-display ${color}`}>
                            {value}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Status badge */}
                    <div className="
                      bg-muted/20 border border-border/40
                      rounded-xl px-4 py-3
                    ">
                      <p className="text-[0.65rem] text-muted-foreground/60 uppercase tracking-wide font-bold mb-2">
                        Status
                      </p>
                      <span className={`
                        inline-flex items-center gap-1.5
                        px-2.5 py-0.5 rounded-full
                        text-[0.72rem] font-bold border
                        ${isActive
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-muted/50 text-muted-foreground border-border/40'}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success' : 'bg-muted-foreground'}`} />
                        {mode.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="
                      flex items-center gap-1.5 mt-auto
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-200
                    ">
                      <button className="
                        flex-1 flex items-center justify-center gap-1.5
                        h-8 rounded-lg text-[0.72rem] font-bold
                        bg-sky-500/10 border border-sky-500/20 text-sky-400
                        hover:bg-sky-500/20 transition-colors duration-150
                      ">
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(mode.id)}
                        className={`
                          flex-1 flex items-center justify-center gap-1.5
                          h-8 rounded-lg text-[0.72rem] font-bold
                          border transition-colors duration-150
                          ${isActive
                            ? 'bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20'
                            : 'bg-success/10 border-success/20 text-success hover:bg-success/20'}
                        `}
                      >
                        {isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        {isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </PageWrapper>
  );
}
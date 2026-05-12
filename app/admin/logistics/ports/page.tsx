'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockShips } from '@/data/mockData';
import type { Ship } from '@/data/mockData';
import {
  Plus, Search, Eye, Edit, Trash2,
  Anchor, MapPin, Ship as ShipIcon,
  Waves, Container, Clock, X,
  CheckCircle, Wrench, AlertTriangle,
} from 'lucide-react';

type PortType   = 'Seaport' | 'Inland Port' | 'Dry Port' | 'Container Terminal';
type PortStatus = 'Active' | 'Inactive' | 'Under Maintenance';

interface Port {
  id: string;
  code: string;             // UN/LOCODE e.g. INBOM
  name: string;
  city: string;
  state: string;
  country: string;
  type: PortType;
  status: PortStatus;
  berthCount: number;
  maxDraftM: number;         // max vessel draught in metres
  annualCapacityTEU: number; // TEU throughput capacity
  timezone: string;
  shipsAssigned: string[];   // ship IDs currently docked / operating from this port
  operatorName: string;
  lat: number;
  lng: number;
}

const MOCK_PORTS: Port[] = [
  {
    id: 'port-001', code: 'INBOM',
    name: 'Jawaharlal Nehru Port',
    city: 'Mumbai', state: 'Maharashtra', country: 'India',
    type: 'Container Terminal', status: 'Active',
    berthCount: 9, maxDraftM: 14.5,
    annualCapacityTEU: 7000000,
    timezone: 'IST (UTC+5:30)',
    shipsAssigned: ['ship-001'],
    operatorName: 'JNPA',
    lat: 18.9500, lng: 72.9500,
  },
  {
    id: 'port-002', code: 'INCCU',
    name: 'Kolkata Dock Complex',
    city: 'Kolkata', state: 'West Bengal', country: 'India',
    type: 'Seaport', status: 'Active',
    berthCount: 12, maxDraftM: 8.5,
    annualCapacityTEU: 820000,
    timezone: 'IST (UTC+5:30)',
    shipsAssigned: ['ship-002'],
    operatorName: 'Kolkata Port Trust',
    lat: 22.5726, lng: 88.3639,
  },
  {
    id: 'port-003', code: 'INMAA',
    name: 'Chennai Port',
    city: 'Chennai', state: 'Tamil Nadu', country: 'India',
    type: 'Seaport', status: 'Active',
    berthCount: 18, maxDraftM: 13.0,
    annualCapacityTEU: 2000000,
    timezone: 'IST (UTC+5:30)',
    shipsAssigned: [],
    operatorName: 'Chennai Port Authority',
    lat: 13.0827, lng: 80.2707,
  },
  {
    id: 'port-004', code: 'INCOK',
    name: 'Cochin Port',
    city: 'Kochi', state: 'Kerala', country: 'India',
    type: 'Container Terminal', status: 'Active',
    berthCount: 6, maxDraftM: 14.0,
    annualCapacityTEU: 1500000,
    timezone: 'IST (UTC+5:30)',
    shipsAssigned: [],
    operatorName: 'Cochin Port Authority',
    lat: 9.9312, lng: 76.2673,
  },
  {
    id: 'port-005', code: 'INVIZ',
    name: 'Visakhapatnam Port',
    city: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India',
    type: 'Seaport', status: 'Under Maintenance',
    berthCount: 24, maxDraftM: 16.5,
    annualCapacityTEU: 1200000,
    timezone: 'IST (UTC+5:30)',
    shipsAssigned: [],
    operatorName: 'Visakhapatnam Port Authority',
    lat: 17.6868, lng: 83.2185,
  },
  {
    id: 'port-006', code: 'INIXY',
    name: 'Kandla Port',
    city: 'Kandla', state: 'Gujarat', country: 'India',
    type: 'Dry Port', status: 'Active',
    berthCount: 15, maxDraftM: 11.0,
    annualCapacityTEU: 900000,
    timezone: 'IST (UTC+5:30)',
    shipsAssigned: [],
    operatorName: 'Deendayal Port Authority',
    lat: 23.0225, lng: 70.2137,
  },
];

// ── Config maps ──
const TYPE_META: Record<PortType, { color: string; bg: string; border: string }> = {
  'Container Terminal': { color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/20'    },
  'Seaport':            { color: 'text-sky-400',    bg: 'bg-sky-500/10',    border: 'border-sky-500/20'    },
  'Inland Port':        { color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  'Dry Port':           { color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
};

const STATUS_META: Record<PortStatus, {
  pill: string; dot: string; icon: typeof CheckCircle;
}> = {
  'Active':            { pill: 'bg-success/10 text-success border-success/20',           dot: 'bg-success',          icon: CheckCircle   },
  'Inactive':          { pill: 'bg-muted/50 text-muted-foreground border-border/40',     dot: 'bg-muted-foreground', icon: X             },
  'Under Maintenance': { pill: 'bg-warning/10 text-warning border-warning/20',           dot: 'bg-warning',          icon: Wrench        },
};

const SHIP_STATUS_COLOR: Record<Ship['status'], string> = {
  'Active':      'text-success',
  'Inactive':    'text-muted-foreground',
  'Maintenance': 'text-warning',
  'Docked':      'text-sky-400',
  'Decommissioned': 'text-destructive',
};

const PORT_TYPES: PortType[] = ['Seaport', 'Container Terminal', 'Inland Port', 'Dry Port'];

const fmtTEU = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${(n / 1000).toFixed(0)}K`;

export default function PortsPage() {
  const [search, setSearch]       = useState('');
  const [typeFilter, setType]     = useState<PortType | 'all'>('all');
  const [ports, setPorts]         = useState(MOCK_PORTS);

  const filtered = ports.filter((p) => {
    const q = search.toLowerCase();
    const matchQ =
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.operatorName.toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || p.type === typeFilter;
    return matchQ && matchType;
  });

  const handleDelete = (id: string) =>
    setPorts((prev) => prev.filter((p) => p.id !== id));

  const activeCount      = ports.filter((p) => p.status === 'Active').length;
  const totalBerths      = ports.reduce((s, p) => s + p.berthCount, 0);
  const totalCapacityTEU = ports.reduce((s, p) => s + p.annualCapacityTEU, 0);
  const dockedShips      = ports.reduce((s, p) => s + p.shipsAssigned.length, 0);

  return (
    <PageWrapper
      title="Ports"
      description="Manage water transport ports and assigned vessels"
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
          Add Port
        </button>
      }
    >

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total Ports',      value: ports.length,
            sub: `${activeCount} active`,
            icon: Anchor,
            iconCls: 'text-primary bg-primary/10 border-primary/20',
            pill: 'bg-primary/10 text-primary border-primary/20',
          },
          {
            label: 'Total Berths',     value: totalBerths,
            sub: 'across all ports',
            icon: Waves,
            iconCls: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
            pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          },
          {
            label: 'Ships Docked',     value: dockedShips,
            sub: 'currently assigned',
            icon: ShipIcon,
            iconCls: 'text-success bg-success/10 border-success/20',
            pill: 'bg-success/10 text-success border-success/20',
          },
          {
            label: 'Total Capacity',   value: fmtTEU(totalCapacityTEU),
            sub: 'TEU / year',
            icon: Container,
            iconCls: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          },
        ].map(({ label, value, sub, icon: Icon, iconCls, pill }) => (
          <div key={label} className="
            bg-card border border-border/60 rounded-xl
            px-5 py-4 shadow-soft flex items-center gap-4
          ">
            <div className={`
              w-10 h-10 rounded-xl flex-shrink-0 border
              flex items-center justify-center ${iconCls}
            `}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">
                {label}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-bold font-display text-foreground">{value}</span>
                <span className={`px-2 py-0.5 rounded-full text-[0.68rem] font-bold border ${pill}`}>
                  {sub}
                </span>
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
            <Search className="
              absolute left-3 top-1/2 -translate-y-1/2
              w-4 h-4 text-muted-foreground pointer-events-none
            "/>
            <input
              type="text"
              placeholder="Search by name, city, UN/LOCODE or operator..."
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

          {/* Type filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', ...PORT_TYPES] as const).map((t) => {
              const active = typeFilter === t;
              const meta   = t !== 'all' ? TYPE_META[t] : null;
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`
                    px-3 py-1.5 rounded-lg text-[0.75rem] font-bold border
                    transition-all duration-200
                    ${active
                      ? meta
                        ? `${meta.bg} ${meta.color} ${meta.border}`
                        : 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted/40'}
                  `}
                >
                  {t === 'all' ? 'All Types' : t}
                </button>
              );
            })}
            {typeFilter !== 'all' && (
              <button
                onClick={() => setType('all')}
                className="
                  w-7 h-7 flex items-center justify-center
                  bg-destructive/10 border border-destructive/20
                  rounded-lg text-destructive
                  hover:bg-destructive/20 transition-colors duration-150
                "
              ><X size={12} /></button>
            )}
          </div>
        </div>

        {(search || typeFilter !== 'all') && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">
            {filtered.length} port{filtered.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* ── Port Cards ── */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((port) => {
            const typeMeta   = TYPE_META[port.type];
            const statusMeta = STATUS_META[port.status];
            const dockedVessels = mockShips.filter((s: Ship) =>
              port.shipsAssigned.includes(s.id)
            );

            return (
              <div
                key={port.id}
                className="
                  group bg-card border border-border/60
                  rounded-xl shadow-soft overflow-hidden
                  transition-all duration-300
                  hover:border-primary/25
                  hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]
                "
              >
                {/* ── Header ── */}
                <div className="flex items-start gap-4 p-5">

                  {/* UN/LOCODE box */}
                  <div className="
                    w-14 h-14 rounded-xl flex-shrink-0
                    bg-primary/10 border border-primary/20
                    flex flex-col items-center justify-center gap-0.5
                  ">
                    <Anchor className="w-4 h-4 text-primary" />
                    <span className="text-[0.68rem] font-bold font-mono text-primary">
                      {port.code}
                    </span>
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="min-w-0">
                        <h3 className="
                          text-[0.92rem] font-bold font-display
                          text-foreground leading-tight truncate
                        ">
                          {port.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                          <span className="text-[0.75rem] text-muted-foreground">
                            {port.city}, {port.state} · {port.operatorName}
                          </span>
                        </div>
                      </div>

                      {/* Status + hover actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`
                          inline-flex items-center gap-1.5
                          px-2.5 py-0.5 rounded-full
                          text-[0.70rem] font-bold border
                          ${statusMeta.pill}
                        `}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                          {port.status}
                        </span>

                        <div className="
                          flex items-center gap-0.5
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-200
                        ">
                          <button className="
                            w-7 h-7 flex items-center justify-center rounded-lg
                            text-muted-foreground hover:bg-primary/10 hover:text-primary
                            transition-colors duration-150
                          "><Eye className="w-3.5 h-3.5" /></button>
                          <button className="
                            w-7 h-7 flex items-center justify-center rounded-lg
                            text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400
                            transition-colors duration-150
                          "><Edit className="w-3.5 h-3.5" /></button>
                          <button
                            onClick={() => handleDelete(port.id)}
                            className="
                              w-7 h-7 flex items-center justify-center rounded-lg
                              text-muted-foreground hover:bg-destructive/10 hover:text-destructive
                              transition-colors duration-150
                            "
                          ><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>

                    {/* Meta chips */}
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <span className={`
                        inline-flex items-center px-2 py-0.5
                        rounded-md text-[0.70rem] font-bold
                        ${typeMeta.bg} ${typeMeta.color} ${typeMeta.border}
                      `}>
                        {port.type}
                      </span>
                      <span className="
                        inline-flex items-center gap-1
                        px-2 py-0.5 rounded-md text-[0.70rem] font-semibold
                        bg-muted/40 border border-border/40 text-muted-foreground
                      ">
                        <Waves className="w-2.5 h-2.5" />
                        {port.berthCount} berths
                      </span>
                      <span className="
                        inline-flex items-center gap-1
                        px-2 py-0.5 rounded-md text-[0.70rem] font-semibold
                        bg-muted/40 border border-border/40 text-muted-foreground
                      ">
                        ↓ {port.maxDraftM}m draft
                      </span>
                      <span className="
                        inline-flex items-center gap-1
                        px-2 py-0.5 rounded-md text-[0.70rem] font-semibold
                        bg-muted/40 border border-border/40 text-muted-foreground
                      ">
                        <Clock className="w-2.5 h-2.5" />
                        {port.timezone}
                      </span>
                      <span className="
                        inline-flex items-center gap-1
                        px-2 py-0.5 rounded-md text-[0.70rem] font-semibold
                        bg-amber-500/10 border border-amber-500/20 text-amber-400
                      ">
                        <Container className="w-2.5 h-2.5" />
                        {fmtTEU(port.annualCapacityTEU)} TEU/yr
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Docked Vessels Section ── */}
                {dockedVessels.length > 0 ? (
                  <div className="border-t border-border/40 px-5 py-3.5 bg-muted/10">
                    <p className="
                      text-[0.70rem] font-bold text-muted-foreground
                      uppercase tracking-widest mb-2.5
                    ">
                      Vessels at Port ({dockedVessels.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {dockedVessels.map((ship) => (
                        <div key={ship.id} className="
                          flex items-center gap-2 px-3 py-1.5
                          bg-card border border-border/50 rounded-lg
                        ">
                          <ShipIcon className={`
                            w-3 h-3 flex-shrink-0
                            ${SHIP_STATUS_COLOR[ship.status]}
                          `} />
                          <div>
                            <span className="text-[0.75rem] font-bold text-foreground">
                              {ship.vesselName}
                            </span>
                            <span className="text-[0.70rem] text-muted-foreground ml-1.5 font-mono">
                              IMO {ship.imoNumber}
                            </span>
                          </div>
                          <span className={`
                            ml-1 px-1.5 py-0.5 rounded text-[0.62rem] font-bold
                            ${ship.status === 'Active'      ? 'bg-success/10 text-success' :
                              ship.status === 'Maintenance' ? 'bg-warning/10 text-warning' :
                              ship.status === 'Docked'      ? 'bg-sky-500/10 text-sky-400' :
                                                              'bg-muted/40 text-muted-foreground'}
                          `}>
                            {ship.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="
                    border-t border-border/40 px-5 py-3
                    bg-muted/10 flex items-center gap-2
                  ">
                    <ShipIcon className="w-3.5 h-3.5 text-muted-foreground/30" />
                    <span className="text-[0.75rem] text-muted-foreground/50 italic">
                      No vessels currently assigned to this port
                    </span>
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
            <Anchor className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No ports found</p>
          <p className="text-[0.78rem] text-muted-foreground">
            Try adjusting your search or add a new port
          </p>
        </div>
      )}

    </PageWrapper>
  );
}
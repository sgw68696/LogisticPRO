'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockAircraft } from '@/data/mockData';
import type { Aircraft } from '@/data/mockData';
import {
  Plus, Search, Eye, Edit, Trash2,
  Plane, MapPin, Clock, Gauge,
  AlertTriangle, CheckCircle, Wrench, X,
} from 'lucide-react';

// ── Static airport reference data (hubs your aircraft operate from) ──
interface Airport {
  id: string;
  code: string;       // IATA code
  name: string;
  city: string;
  state: string;
  type: 'International' | 'Domestic' | 'Cargo Hub';
  status: 'Active' | 'Inactive' | 'Under Maintenance';
  runways: number;
  aircraftAssigned: string[]; // aircraft IDs
  timezone: string;
  elevation: number;           // feet
}

const MOCK_AIRPORTS: Airport[] = [
  {
    id: 'apt-001',
    code: 'BLR',
    name: 'Kempegowda International Airport',
    city: 'Bangalore',
    state: 'Karnataka',
    type: 'International',
    status: 'Active',
    runways: 2,
    aircraftAssigned: ['air-001', 'air-002'],
    timezone: 'IST (UTC+5:30)',
    elevation: 3013,
  },
  {
    id: 'apt-002',
    code: 'BOM',
    name: 'Chhatrapati Shivaji Maharaj International Airport',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'International',
    status: 'Active',
    runways: 2,
    aircraftAssigned: ['air-003'],
    timezone: 'IST (UTC+5:30)',
    elevation: 37,
  },
  {
    id: 'apt-003',
    code: 'DEL',
    name: 'Indira Gandhi International Airport',
    city: 'Delhi',
    state: 'Delhi',
    type: 'International',
    status: 'Active',
    runways: 3,
    aircraftAssigned: ['air-004'],
    timezone: 'IST (UTC+5:30)',
    elevation: 777,
  },
  {
    id: 'apt-004',
    code: 'HYD',
    name: 'Rajiv Gandhi International Airport',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Cargo Hub',
    status: 'Active',
    runways: 1,
    aircraftAssigned: [],
    timezone: 'IST (UTC+5:30)',
    elevation: 2024,
  },
  {
    id: 'apt-005',
    code: 'MAA',
    name: 'Chennai International Airport',
    city: 'Chennai',
    state: 'Tamil Nadu',
    type: 'Domestic',
    status: 'Under Maintenance',
    runways: 2,
    aircraftAssigned: [],
    timezone: 'IST (UTC+5:30)',
    elevation: 52,
  },
];

const TYPE_STYLES: Record<Airport['type'], string> = {
  'International':      'bg-primary/10   text-primary      border border-primary/20',
  'Domestic':           'bg-sky-500/10   text-sky-400       border border-sky-500/20',
  'Cargo Hub':          'bg-amber-500/10 text-amber-400    border border-amber-500/20',
};

const STATUS_META: Record<Airport['status'], {
  pill: string; dot: string; icon: typeof CheckCircle;
}> = {
  'Active':             { pill: 'bg-success/10 text-success border-success/20',             dot: 'bg-success',           icon: CheckCircle   },
  'Inactive':           { pill: 'bg-muted/50 text-muted-foreground border-border/40',       dot: 'bg-muted-foreground',  icon: X             },
  'Under Maintenance':  { pill: 'bg-warning/10 text-warning border-warning/20',             dot: 'bg-warning',           icon: Wrench        },
};

const AIRCRAFT_STATUS_COLOR: Record<Aircraft['status'], string> = {
  'Available':    'text-success',
  'On Route':     'text-primary',
  'Maintenance':  'text-warning',
  'Grounded':     'text-destructive',
};

export default function AirportsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<Airport['type'] | 'all'>('all');
  const [airports] = useState(MOCK_AIRPORTS);

  const filtered = airports.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      a.name.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalAircraft = airports.reduce((s, a) => s + a.aircraftAssigned.length, 0);
  const active = airports.filter((a) => a.status === 'Active').length;

  return (
    <PageWrapper
      title="Airports"
      description="Manage air transport hubs and assigned aircraft"
      actions={
        <button
          className="
            flex items-center gap-2 px-3.5 py-2
            rounded-[10px] cursor-pointer
            text-[0.82rem] font-bold text-white font-display
            transition-all duration-200
            hover:-translate-y-px
            hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]
          "
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Plus size={14} />
          Add Airport
        </button>
      }
    >

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'Total Airports',
            value: airports.length,
            sub: `${active} active`,
            icon: MapPin,
            iconCls: 'text-primary bg-primary/10 border-primary/20',
            pill: 'bg-primary/10 text-primary border-primary/20',
          },
          {
            label: 'Aircraft Deployed',
            value: totalAircraft,
            sub: `across ${active} hubs`,
            icon: Plane,
            iconCls: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
            pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          },
          {
            label: 'Under Maintenance',
            value: airports.filter((a) => a.status === 'Under Maintenance').length,
            sub: 'hub(s) offline',
            icon: AlertTriangle,
            iconCls: 'text-warning bg-warning/10 border-warning/20',
            pill: 'bg-warning/10 text-warning border-warning/20',
          },
        ].map(({ label, value, sub, icon: Icon, iconCls, pill }) => (
          <div key={label} className="
            bg-card border border-border/60
            rounded-xl px-5 py-4 shadow-soft
            flex items-center gap-4
          ">
            <div className={`
              w-10 h-10 rounded-xl flex-shrink-0
              border flex items-center justify-center
              ${iconCls}
            `}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">
                {label}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-bold font-display text-foreground">{value}</span>
                <span className={`
                  px-2 py-0.5 rounded-full
                  text-[0.68rem] font-bold border
                  ${pill}
                `}>{sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="
        bg-card border border-border/60
        rounded-xl p-4 mb-6 shadow-soft
      ">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="
              absolute left-3 top-1/2 -translate-y-1/2
              w-4 h-4 text-muted-foreground pointer-events-none
            " />
            <input
              type="text"
              placeholder="Search by name, city or IATA code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                nb-search w-full h-9 pl-9 pr-3
                bg-muted/40 border border-border
                rounded-[9px] text-[0.84rem] text-foreground
                outline-none placeholder:text-muted-foreground
                focus:border-primary/50 focus:bg-primary/5
                focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]
              "
            />
          </div>

          {/* Type filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'International', 'Domestic', 'Cargo Hub'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`
                  px-3 py-1.5 rounded-lg text-[0.75rem] font-bold border
                  transition-all duration-200
                  ${typeFilter === t
                    ? t === 'all'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : TYPE_STYLES[t as Airport['type']]
                    : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted/40'}
                `}
              >
                {t === 'all' ? 'All Types' : t}
              </button>
            ))}
          </div>
        </div>

        {search && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* ── Airport Cards ── */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((airport) => {
            const statusMeta = STATUS_META[airport.status];
            const StatusIcon = statusMeta.icon;
            const assignedAircraft = mockAircraft.filter((ac) =>
              airport.aircraftAssigned.includes(ac.id)
            );

            return (
              <div
                key={airport.id}
                className="
                  group bg-card border border-border/60
                  rounded-xl shadow-soft overflow-hidden
                  transition-all duration-300
                  hover:border-primary/25
                  hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]
                "
              >
                {/* ── Card Header ── */}
                <div className="flex items-start gap-4 p-5">
                  {/* IATA Code box */}
                  <div className="
                    w-14 h-14 rounded-xl flex-shrink-0
                    bg-primary/10 border border-primary/20
                    flex flex-col items-center justify-center
                  ">
                    <Plane className="w-4 h-4 text-primary mb-0.5" />
                    <span className="text-[0.78rem] font-bold font-mono text-primary">
                      {airport.code}
                    </span>
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="min-w-0">
                        <h3 className="text-[0.92rem] font-bold font-display text-foreground leading-tight truncate">
                          {airport.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                          <span className="text-[0.75rem] text-muted-foreground">
                            {airport.city}, {airport.state}
                          </span>
                        </div>
                      </div>

                      {/* Status + actions */}
                      <div className="
                        flex items-center gap-2 flex-shrink-0
                      ">
                        <span className={`
                          inline-flex items-center gap-1.5
                          px-2.5 py-0.5 rounded-full
                          text-[0.70rem] font-bold border
                          ${statusMeta.pill}
                        `}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                          {airport.status}
                        </span>

                        {/* Action buttons — hover reveal */}
                        <div className="
                          flex items-center gap-0.5
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-200
                        ">
                          <button className="
                            w-7 h-7 flex items-center justify-center rounded-lg
                            text-muted-foreground
                            hover:bg-primary/10 hover:text-primary
                            transition-colors duration-150
                          "><Eye className="w-3.5 h-3.5" /></button>
                          <button className="
                            w-7 h-7 flex items-center justify-center rounded-lg
                            text-muted-foreground
                            hover:bg-sky-500/10 hover:text-sky-400
                            transition-colors duration-150
                          "><Edit className="w-3.5 h-3.5" /></button>
                          <button className="
                            w-7 h-7 flex items-center justify-center rounded-lg
                            text-muted-foreground
                            hover:bg-destructive/10 hover:text-destructive
                            transition-colors duration-150
                          "><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>

                    {/* Meta chips */}
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <span className={`
                        inline-flex items-center px-2 py-0.5
                        rounded-md text-[0.70rem] font-bold
                        ${TYPE_STYLES[airport.type]}
                      `}>
                        {airport.type}
                      </span>
                      <span className="
                        inline-flex items-center gap-1
                        px-2 py-0.5 rounded-md text-[0.70rem] font-semibold
                        bg-muted/40 border border-border/40 text-muted-foreground
                      ">
                        <Gauge className="w-2.5 h-2.5" />
                        {airport.runways} runway{airport.runways !== 1 ? 's' : ''}
                      </span>
                      <span className="
                        inline-flex items-center gap-1
                        px-2 py-0.5 rounded-md text-[0.70rem] font-semibold
                        bg-muted/40 border border-border/40 text-muted-foreground
                      ">
                        <Clock className="w-2.5 h-2.5" />
                        {airport.timezone}
                      </span>
                      <span className="
                        inline-flex items-center gap-1
                        px-2 py-0.5 rounded-md text-[0.70rem] font-semibold
                        bg-muted/40 border border-border/40 text-muted-foreground
                      ">
                        ↑ {airport.elevation.toLocaleString()} ft
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Assigned Aircraft Section ── */}
                {assignedAircraft.length > 0 ? (
                  <div className="
                    border-t border-border/40
                    px-5 py-3.5 bg-muted/10
                  ">
                    <p className="
                      text-[0.70rem] font-bold text-muted-foreground
                      uppercase tracking-widest mb-2.5
                    ">
                      Assigned Aircraft ({assignedAircraft.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {assignedAircraft.map((ac) => (
                        <div
                          key={ac.id}
                          className="
                            flex items-center gap-2 px-3 py-1.5
                            bg-card border border-border/50
                            rounded-lg
                          "
                        >
                          <Plane className={`w-3 h-3 flex-shrink-0 ${AIRCRAFT_STATUS_COLOR[ac.status]}`} />
                          <div>
                            <span className="text-[0.75rem] font-bold text-foreground font-mono">
                              {ac.registrationNumber}
                            </span>
                            <span className="text-[0.70rem] text-muted-foreground ml-1.5">
                              {ac.manufacturer} {ac.model}
                            </span>
                          </div>
                          <span className={`
                            ml-1 px-1.5 py-0.5 rounded text-[0.62rem] font-bold
                            ${ac.status === 'Available'   ? 'bg-success/10 text-success' :
                              ac.status === 'On Route'    ? 'bg-primary/10 text-primary' :
                              ac.status === 'Maintenance' ? 'bg-warning/10 text-warning' :
                                                            'bg-destructive/10 text-destructive'}
                          `}>
                            {ac.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="
                    border-t border-border/40
                    px-5 py-3 bg-muted/10
                    flex items-center gap-2
                  ">
                    <Plane className="w-3.5 h-3.5 text-muted-foreground/30" />
                    <span className="text-[0.75rem] text-muted-foreground/50 italic">
                      No aircraft currently assigned to this hub
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Empty state ── */
        <div className="
          bg-card border border-border/60
          rounded-xl shadow-soft
          py-20 flex flex-col items-center gap-3
        ">
          <div className="
            w-14 h-14 rounded-full
            bg-muted/40 border border-border/50
            flex items-center justify-center
          ">
            <Plane className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No airports found</p>
          <p className="text-[0.78rem] text-muted-foreground">
            Try adjusting your search or add a new airport hub
          </p>
        </div>
      )}

    </PageWrapper>
  );
}
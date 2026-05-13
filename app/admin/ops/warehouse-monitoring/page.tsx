'use client';

import { useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockWarehouses } from '@/data/mockData';
import type { Warehouse, InventoryItem } from '@/data/mockData';
import {
  Search, SlidersHorizontal, RotateCcw,
  Warehouse as WarehouseIcon, Package,
  TrendingUp, TrendingDown, ArrowUpRight,
  ArrowDownLeft, ChevronDown, ChevronUp,
  MapPin, User, Phone, BarChart3,
  AlertTriangle, CheckCircle, Clock,
  Layers, Hash,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

// ── Derived warehouse stats ──
interface WarehouseStats {
  wh: Warehouse;
  occupancyPct: number;
  totalInbound: number;
  totalOutbound: number;
  netFlow: number;
  topCategories: { category: string; count: number }[];
  lowStockItems: InventoryItem[];
  totalSKUs: number;
  avgQty: number;
  capacityStatus: 'Critical' | 'High' | 'Moderate' | 'Low';
}

const buildStats = (wh: Warehouse): WarehouseStats => {
  const occupancyPct = wh.capacity
    ? Math.round((wh.currentStock / wh.capacity) * 100)
    : 0;

  const totalInbound  = wh.inboundLogs?.reduce((s, l) => s + l.items, 0) ?? 0;
  const totalOutbound = wh.outboundLogs?.reduce((s, l) => s + l.items, 0) ?? 0;
  const netFlow       = totalInbound - totalOutbound;

  // Group inventory by category
  const catMap: Record<string, number> = {};
  for (const item of wh.inventory ?? []) {
    catMap[item.category] = (catMap[item.category] ?? 0) + 1;
  }
  const topCategories = Object.entries(catMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const lowStockItems = (wh.inventory ?? []).filter((i) => i.quantity < 100);
  const avgQty = wh.inventory?.length
    ? Math.round(wh.inventory.reduce((s, i) => s + i.quantity, 0) / wh.inventory.length)
    : 0;

  const capacityStatus: WarehouseStats['capacityStatus'] =
    occupancyPct >= 90 ? 'Critical' :
    occupancyPct >= 70 ? 'High'     :
    occupancyPct >= 40 ? 'Moderate' : 'Low';

  return {
    wh, occupancyPct, totalInbound, totalOutbound,
    netFlow, topCategories, lowStockItems,
    totalSKUs: wh.inventory?.length ?? 0,
    avgQty, capacityStatus,
  };
};

// ── Config ──
const CAPACITY_META: Record<WarehouseStats['capacityStatus'], {
  pill: string; bar: string; bg: string; icon: typeof CheckCircle;
}> = {
  Critical: { pill: 'bg-destructive/10 text-destructive border-destructive/20', bar: 'bg-destructive', bg: 'bg-destructive/5',  icon: AlertTriangle },
  High:     { pill: 'bg-warning/10 text-warning border-warning/20',             bar: 'bg-warning',     bg: 'bg-warning/5',      icon: Clock         },
  Moderate: { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       bar: 'bg-amber-400',   bg: 'bg-amber-500/5',    icon: BarChart3     },
  Low:      { pill: 'bg-success/10 text-success border-success/20',             bar: 'bg-success',     bg: 'bg-success/5',      icon: CheckCircle   },
};

// Category colour palette (cycles)
const CAT_COLORS = [
  'bg-primary/10 text-primary border-primary/20',
  'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'bg-success/10 text-success border-success/20',
  'bg-rose-500/10 text-rose-400 border-rose-500/20',
];

export default function WarehouseMonitoringPage() {
  const stats = useMemo(() => mockWarehouses.map(buildStats), []);

  const [search, setSearch]         = useState('');
  const [capacityFilter, setCapacity] = useState<string>('all');
  const [expanded, setExpanded]     = useState<string | null>(null);

  // Global KPI totals
  const kpi = useMemo(() => ({
    totalWarehouses: stats.length,
    totalCapacity:   stats.reduce((s, w) => s + w.wh.capacity, 0),
    totalStock:      stats.reduce((s, w) => s + w.wh.currentStock, 0),
    totalSKUs:       stats.reduce((s, w) => s + w.totalSKUs, 0),
    totalInbound:    stats.reduce((s, w) => s + w.totalInbound, 0),
    totalOutbound:   stats.reduce((s, w) => s + w.totalOutbound, 0),
    critical:        stats.filter((w) => w.capacityStatus === 'Critical').length,
    lowStock:        stats.reduce((s, w) => s + w.lowStockItems.length, 0),
  }), [stats]);

  const filtered = useMemo(() => stats.filter((w) => {
    const q = search.toLowerCase();
    const matchQ =
      w.wh.name.toLowerCase().includes(q)         ||
      w.wh.warehouseId.toLowerCase().includes(q)  ||
      w.wh.city.toLowerCase().includes(q)         ||
      w.wh.manager.toLowerCase().includes(q);
    const matchCap = capacityFilter === 'all' || w.capacityStatus === capacityFilter;
    return matchQ && matchCap;
  }), [stats, search, capacityFilter]);

  const hasFilters = search || capacityFilter !== 'all';
  const clearFilters = () => { setSearch(''); setCapacity('all'); };
  const toggle = (id: string) => setExpanded((p) => (p === id ? null : id));

  return (
    <PageWrapper
      title="Warehouse Monitoring"
      description="Inventory, capacity and throughput across all warehouse locations"
    >

      {/* ── Global KPI Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {[
          { label: 'Warehouses',  value: kpi.totalWarehouses,             fmt: 'n', cls: 'bg-primary/10 text-primary border-primary/20'             },
          { label: 'Total Cap',   value: kpi.totalCapacity,               fmt: 'u', cls: 'bg-muted/40 text-muted-foreground border-border/40'        },
          { label: 'Total Stock', value: kpi.totalStock,                  fmt: 'u', cls: 'bg-primary/10 text-primary border-primary/20'             },
          { label: 'Global Occ', value: Math.round((kpi.totalStock / kpi.totalCapacity) * 100), fmt: 'p', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
          { label: 'Total SKUs',  value: kpi.totalSKUs,                   fmt: 'n', cls: 'bg-sky-500/10 text-sky-400 border-sky-500/20'             },
          { label: 'Inbound',     value: kpi.totalInbound,                fmt: 'n', cls: 'bg-success/10 text-success border-success/20'             },
          { label: 'Outbound',    value: kpi.totalOutbound,               fmt: 'n', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20'       },
          { label: 'Critical',    value: kpi.critical,                    fmt: 'n', cls: 'bg-destructive/10 text-destructive border-destructive/20' },
        ].map(({ label, value, fmt, cls }) => (
          <div key={label} className="bg-card border border-border/60 rounded-xl px-3 py-3 shadow-soft text-center">
            <p className="text-[0.60rem] font-bold text-muted-foreground uppercase tracking-wide mb-1 leading-tight">{label}</p>
            <p className="text-[1.25rem] font-black font-display text-foreground leading-tight">
              {fmt === 'p' ? `${value}%` :
               fmt === 'u' ? `${(value / 1000).toFixed(0)}k` :
               value.toLocaleString()}
            </p>
            <span className={`inline-block mt-0.5 px-1.5 py-0 rounded-full text-[0.58rem] font-bold border ${cls}`}>
              {fmt === 'p' ? 'occupied' : fmt === 'u' ? 'units' : 'total'}
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
              placeholder="Search warehouse name, ID, city or manager..."
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

            {/* Capacity status pills */}
            {(['all', 'Critical', 'High', 'Moderate', 'Low'] as const).map((c) => {
              const meta   = c !== 'all' ? CAPACITY_META[c] : null;
              const active = capacityFilter === c;
              return (
                <button
                  key={c}
                  onClick={() => setCapacity(c)}
                  className={`
                    px-3 py-1.5 rounded-lg text-[0.75rem] font-bold border
                    transition-all duration-200
                    ${active
                      ? meta ? meta.pill : 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted/20 text-muted-foreground border-border/40 hover:bg-muted/40'}
                  `}
                >
                  {c === 'all' ? 'All' : c}
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
                <RotateCcw size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {hasFilters && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">
            {filtered.length} of {stats.length} warehouse{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ── Warehouse Cards ── */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((s) => {
            const { wh, occupancyPct, capacityStatus } = s;
            const capMeta   = CAPACITY_META[capacityStatus];
            const CapIcon   = capMeta.icon;
            const isOpen    = expanded === wh.id;

            return (
              <div
                key={wh.id}
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
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
                  onClick={() => toggle(wh.id)}
                >
                  {/* Icon */}
                  <div className={`
                    w-11 h-11 rounded-xl flex-shrink-0 border
                    flex items-center justify-center
                    ${capMeta.bg} ${capMeta.pill.split(' ').find((c) => c.startsWith('border'))!}
                  `}>
                    <WarehouseIcon className={`w-5 h-5 ${capMeta.pill.split(' ').find((c) => c.startsWith('text'))!}`} />
                  </div>

                  {/* Name + location */}
                  <div className="w-52 flex-shrink-0">
                    <p className="text-[0.86rem] font-bold text-foreground truncate">{wh.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                      <span className="text-[0.70rem] text-muted-foreground truncate">
                        {wh.city} · {wh.warehouseId}
                      </span>
                    </div>
                  </div>

                  {/* Occupancy bar */}
                  <div className="flex-1 min-w-0 hidden sm:block">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[0.68rem] text-muted-foreground/60">Occupancy</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[0.75rem] font-bold font-mono text-foreground">
                          {wh.currentStock.toLocaleString()} / {wh.capacity.toLocaleString()}
                        </span>
                        <span className={`
                          px-2 py-0.5 rounded-full text-[0.65rem] font-bold border
                          ${capMeta.pill}
                        `}>{occupancyPct}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${capMeta.bar}`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Throughput */}
                  <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <ArrowDownLeft className="w-3 h-3 text-success" />
                        <span className="text-[0.82rem] font-bold text-success">{s.totalInbound.toLocaleString()}</span>
                      </div>
                      <p className="text-[0.60rem] text-muted-foreground/60">In</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <ArrowUpRight className="w-3 h-3 text-amber-400" />
                        <span className="text-[0.82rem] font-bold text-amber-400">{s.totalOutbound.toLocaleString()}</span>
                      </div>
                      <p className="text-[0.60rem] text-muted-foreground/60">Out</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        {s.netFlow >= 0
                          ? <TrendingUp className="w-3 h-3 text-primary" />
                          : <TrendingDown className="w-3 h-3 text-destructive" />}
                        <span className={`text-[0.82rem] font-bold ${s.netFlow >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {s.netFlow >= 0 ? '+' : ''}{s.netFlow.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[0.60rem] text-muted-foreground/60">Net</p>
                    </div>
                  </div>

                  {/* SKUs */}
                  <div className="hidden lg:block text-center w-12 flex-shrink-0">
                    <p className="text-[0.88rem] font-bold font-display text-foreground">{s.totalSKUs}</p>
                    <p className="text-[0.60rem] text-muted-foreground/60">SKUs</p>
                  </div>

                  {/* Capacity badge */}
                  <span className={`
                    flex-shrink-0 inline-flex items-center gap-1.5
                    px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold border
                    ${capMeta.pill}
                  `}>
                    <CapIcon className="w-3 h-3" />
                    {capacityStatus}
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

                {/* ── Expanded Panel ── */}
                {isOpen && (
                  <div className="border-t border-border/40 px-5 pb-5 pt-4 bg-muted/[0.03]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                      {/* ── Col 1: Info + Inbound/Outbound logs ── */}
                      <div className="space-y-3">
                        <p className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">
                          Warehouse Info
                        </p>

                        {/* Manager + contact */}
                        <div className="bg-card border border-border/50 rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-[0.80rem] font-bold text-foreground">{wh.manager}</p>
                              <p className="text-[0.68rem] text-muted-foreground">Warehouse Manager</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-1.5 border-t border-border/30">
                            <Phone className="w-3 h-3 text-muted-foreground/50" />
                            <span className="text-[0.75rem] text-muted-foreground">{wh.contact}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-muted-foreground/50" />
                            <span className="text-[0.72rem] text-muted-foreground">{wh.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Hash className="w-3 h-3 text-muted-foreground/50" />
                            <span className="text-[0.72rem] text-muted-foreground font-mono">{wh.warehouseId}</span>
                          </div>
                        </div>

                        {/* Capacity detail */}
                        <div className={`border rounded-xl p-3.5 ${capMeta.bg} ${capMeta.pill.split(' ').find((c) => c.startsWith('border'))!}`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[0.68rem] font-bold uppercase tracking-wide opacity-70">Capacity</p>
                            <span className={`text-[0.70rem] font-bold ${capMeta.pill.split(' ').find((c) => c.startsWith('text'))!}`}>
                              {capacityStatus}
                            </span>
                          </div>
                          <div className="flex items-end justify-between mb-2">
                            <div>
                              <p className={`text-[1.5rem] font-black font-display ${capMeta.pill.split(' ').find((c) => c.startsWith('text'))!}`}>
                                {occupancyPct}%
                              </p>
                              <p className="text-[0.68rem] opacity-60">
                                {wh.currentStock.toLocaleString()} of {wh.capacity.toLocaleString()} units
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[0.72rem] font-semibold opacity-80">
                                {(wh.capacity - wh.currentStock).toLocaleString()}
                              </p>
                              <p className="text-[0.62rem] opacity-60">available</p>
                            </div>
                          </div>
                          <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${capMeta.bar}`}
                              style={{ width: `${occupancyPct}%` }}
                            />
                          </div>
                        </div>

                        {/* Inbound logs */}
                        {wh.inboundLogs?.length > 0 && (
                          <div className="bg-card border border-border/50 rounded-xl p-3.5">
                            <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                              <ArrowDownLeft className="w-3 h-3 text-success" />
                              Inbound Logs
                            </p>
                            <div className="space-y-2">
                              {wh.inboundLogs.map((log, i) => (
                                <div key={i} className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[0.72rem] font-semibold text-foreground">{log.source}</p>
                                    <p className="text-[0.62rem] text-muted-foreground/60">{formatDate(log.date)}</p>
                                  </div>
                                  <span className="text-[0.78rem] font-bold font-mono text-success">
                                    +{log.items.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Outbound logs */}
                        {wh.outboundLogs?.length > 0 && (
                          <div className="bg-card border border-border/50 rounded-xl p-3.5">
                            <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                              <ArrowUpRight className="w-3 h-3 text-amber-400" />
                              Outbound Logs
                            </p>
                            <div className="space-y-2">
                              {wh.outboundLogs.map((log, i) => (
                                <div key={i} className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[0.72rem] font-semibold text-foreground">{log.destination}</p>
                                    <p className="text-[0.62rem] text-muted-foreground/60">{formatDate(log.date)}</p>
                                  </div>
                                  <span className="text-[0.78rem] font-bold font-mono text-amber-400">
                                    -{log.items.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ── Col 2: Category breakdown + low stock ── */}
                      <div className="space-y-3">
                        <p className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">
                          Inventory Breakdown
                        </p>

                        {/* Category distribution */}
                        <div className="bg-card border border-border/50 rounded-xl p-3.5">
                          <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <Layers className="w-3 h-3" /> Top Categories
                          </p>
                          <div className="space-y-2.5">
                            {s.topCategories.map(({ category, count }, i) => {
                              const pct = s.totalSKUs > 0
                                ? Math.round((count / s.totalSKUs) * 100)
                                : 0;
                              return (
                                <div key={category}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`
                                      inline-flex items-center px-2 py-0.5
                                      rounded-md text-[0.68rem] font-bold border
                                      ${CAT_COLORS[i % CAT_COLORS.length]}
                                    `}>
                                      {category}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[0.68rem] text-muted-foreground/60">
                                        {count} SKU{count !== 1 ? 's' : ''}
                                      </span>
                                      <span className="text-[0.70rem] font-bold text-foreground w-8 text-right">
                                        {pct}%
                                      </span>
                                    </div>
                                  </div>
                                  <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        ['bg-primary', 'bg-sky-400', 'bg-amber-400', 'bg-violet-400'][i % 4]
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Avg + total stats */}
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'Total SKUs',  value: s.totalSKUs,             cls: 'text-foreground'   },
                            { label: 'Avg Stock',   value: s.avgQty,                cls: 'text-foreground'   },
                            { label: 'Low Stock',   value: s.lowStockItems.length,  cls: s.lowStockItems.length > 0 ? 'text-destructive' : 'text-success' },
                          ].map(({ label, value, cls }) => (
                            <div key={label} className="bg-card border border-border/50 rounded-xl p-3 text-center">
                              <p className={`text-[1.15rem] font-black font-display ${cls}`}>{value}</p>
                              <p className="text-[0.62rem] text-muted-foreground/60 mt-0.5">{label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Low stock alerts */}
                        {s.lowStockItems.length > 0 && (
                          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3.5">
                            <p className="text-[0.65rem] font-bold text-destructive/70 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock Alerts ({s.lowStockItems.length})
                            </p>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                              {s.lowStockItems.map((item) => (
                                <div key={item.sku} className="flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-[0.72rem] font-semibold text-foreground truncate">{item.productName}</p>
                                    <p className="text-[0.62rem] text-muted-foreground/60 font-mono">{item.sku}</p>
                                  </div>
                                  <span className={`
                                    flex-shrink-0 text-[0.68rem] font-bold px-2 py-0.5 rounded-full
                                    ${item.quantity < 50
                                      ? 'bg-destructive/15 text-destructive'
                                      : 'bg-warning/10 text-warning'}
                                  `}>
                                    {item.quantity} left
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ── Col 3: Full inventory table ── */}
                      <div className="space-y-3">
                        <p className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">
                          Inventory ({s.totalSKUs} SKUs)
                        </p>

                        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                          <div className="px-3 py-2.5 border-b border-border/30 bg-muted/20 grid grid-cols-[1fr_auto_auto] gap-2">
                            <span className="text-[0.62rem] font-bold text-muted-foreground/60 uppercase tracking-wide">Product</span>
                            <span className="text-[0.62rem] font-bold text-muted-foreground/60 uppercase tracking-wide text-right">Qty</span>
                            <span className="text-[0.62rem] font-bold text-muted-foreground/60 uppercase tracking-wide text-right w-16">Rack</span>
                          </div>

                          <div className="divide-y divide-border/20 max-h-[340px] overflow-y-auto">
                            {(wh.inventory ?? []).map((item) => (
                              <div
                                key={item.sku}
                                className="px-3 py-2 grid grid-cols-[1fr_auto_auto] gap-2 items-center hover:bg-muted/10 transition-colors duration-100"
                              >
                                <div className="min-w-0">
                                  <p className="text-[0.74rem] font-semibold text-foreground truncate">{item.productName}</p>
                                  <p className="text-[0.62rem] text-muted-foreground/50 font-mono">{item.sku}</p>
                                </div>
                                <span className={`
                                  text-[0.75rem] font-bold font-mono text-right
                                  ${item.quantity < 50  ? 'text-destructive' :
                                    item.quantity < 100 ? 'text-warning'     : 'text-foreground'}
                                `}>
                                  {item.quantity.toLocaleString()}
                                </span>
                                <span className="text-[0.68rem] text-muted-foreground/60 font-mono text-right w-16 truncate">
                                  {item.location}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
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
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center">
            <WarehouseIcon className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No warehouses found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your search or filter</p>
        </div>
      )}

    </PageWrapper>
  );
}
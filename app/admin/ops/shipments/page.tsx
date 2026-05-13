'use client';

import { useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { mockShipments, mockCompanies } from '@/data/mockData';
import type { Shipment, ShipmentStatus } from '@/data/mockData';
import {
  Plus, Search, SlidersHorizontal, X,
  Package, Truck, MapPin, Clock,
  CheckCircle, AlertCircle, XCircle,
  Circle, ArrowRight, RotateCcw, Eye, Edit,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

// ── Status config ──
const STATUS_META: Record<ShipmentStatus, {
  pill: string; dot: string; icon: typeof Circle;
}> = {
  'Pending':          { pill: 'bg-muted/50 text-muted-foreground border-border/40',       dot: 'bg-muted-foreground', icon: Circle       },
  'Picked Up':        { pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20',             dot: 'bg-sky-400',          icon: Package      },
  'In Transit':       { pill: 'bg-primary/10 text-primary border-primary/20',             dot: 'bg-primary',          icon: Truck        },
  'Out for Delivery': { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       dot: 'bg-amber-400',        icon: MapPin       },
  'Delivered':        { pill: 'bg-success/10 text-success border-success/20',             dot: 'bg-success',          icon: CheckCircle  },
  'Cancelled':        { pill: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive',      icon: XCircle      },
  'Failed':           { pill: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive',      icon: AlertCircle  },
};

const SERVICE_STYLES: Record<string, string> = {
  Express:  'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Standard: 'bg-muted/40 text-muted-foreground border border-border/40',
  Freight:  'bg-violet-500/10 text-violet-400 border border-violet-500/20',
};

const STATUSES: ShipmentStatus[] = [
  'Pending', 'Picked Up', 'In Transit',
  'Out for Delivery', 'Delivered', 'Cancelled', 'Failed',
];

const SERVICE_TYPES = ['Express', 'Standard', 'Freight'];

export default function AllShipmentsPage() {
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<ShipmentStatus | 'all'>('all');
  const [serviceFilter, setService] = useState<string | 'all'>('all');
  const [companyFilter, setCompany] = useState<string | 'all'>('all');

  // ── KPI counts (always from full dataset) ──
  const kpi = useMemo(() => ({
    total:       mockShipments.length,
    inTransit:   mockShipments.filter((s) => s.status === 'In Transit').length,
    delivered:   mockShipments.filter((s) => s.status === 'Delivered').length,
    pending:     mockShipments.filter((s) => s.status === 'Pending').length,
    failed:      mockShipments.filter((s) => ['Cancelled', 'Failed'].includes(s.status)).length,
  }), []);

  // ── Filtered rows ──
  const filtered = useMemo(() => mockShipments.filter((s) => {
    const q = search.toLowerCase();
    const matchQ =
      s.trackingNumber.toLowerCase().includes(q) ||
      s.senderName.toLowerCase().includes(q)     ||
      s.receiverName.toLowerCase().includes(q)   ||
      s.pickupAddress.toLowerCase().includes(q)  ||
      s.deliveryAddress.toLowerCase().includes(q);
    const matchStatus  = statusFilter  === 'all' || s.status      === statusFilter;
    const matchService = serviceFilter === 'all' || s.serviceType === serviceFilter;
    // company filter: mock shipments don't have companyId, so skip unless extended
    return matchQ && matchStatus && matchService;
  }), [search, statusFilter, serviceFilter]);

  const hasFilters = search || statusFilter !== 'all' || serviceFilter !== 'all' || companyFilter !== 'all';

  const clearFilters = () => {
    setSearch(''); setStatus('all'); setService('all'); setCompany('all');
  };

  // ── Table columns ──
  const columns: Column<Shipment>[] = [
    {
      key: 'trackingNumber',
      header: 'Tracking',
      sortable: true,
      render: (s) => (
        <div>
          <span className="text-[0.82rem] font-bold font-mono text-primary">
            {s.trackingNumber}
          </span>
          <p className="text-[0.68rem] text-muted-foreground/60 mt-0.5">
            {s.id}
          </p>
        </div>
      ),
    },
    {
      key: 'senderName',
      header: 'Sender → Receiver',
      sortable: true,
      render: (s) => (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[0.80rem] font-semibold text-foreground truncate max-w-[120px]">
              {s.senderName}
            </span>
            <ArrowRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
            <span className="text-[0.80rem] font-semibold text-foreground truncate max-w-[120px]">
              {s.receiverName}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-2.5 h-2.5 text-muted-foreground/40 flex-shrink-0" />
            <span className="text-[0.68rem] text-muted-foreground/60 truncate max-w-[240px]">
              {s.pickupAddress} → {s.deliveryAddress}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'serviceType',
      header: 'Service',
      sortable: true,
      render: (s) => (
        <span className={`
          inline-flex items-center px-2.5 py-0.5
          rounded-md text-[0.70rem] font-bold
          ${SERVICE_STYLES[s.serviceType] ?? SERVICE_STYLES.Standard}
        `}>
          {s.serviceType}
        </span>
      ),
    },
    {
      key: 'packageWeight',
      header: 'Weight',
      sortable: true,
      render: (s) => (
        <div>
          <span className="text-[0.82rem] font-bold font-mono text-foreground">
            {s.packageWeight} kg
          </span>
          <p className="text-[0.68rem] text-muted-foreground/60 mt-0.5">
            {s.packageType}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (s) => {
        const meta = STATUS_META[s.status];
        const StatusIcon = meta.icon;
        return (
          <span className={`
            inline-flex items-center gap-1.5
            px-2.5 py-0.5 rounded-full
            text-[0.70rem] font-bold border
            ${meta.pill}
          `}>
            <StatusIcon className="w-3 h-3" />
            {s.status}
          </span>
        );
      },
    },
    {
      key: 'estimatedDelivery',
      header: 'Est. Delivery',
      sortable: true,
      render: (s) => {
        const isLate =
          s.status !== 'Delivered' &&
          s.status !== 'Cancelled' &&
          new Date(s.estimatedDelivery) < new Date();
        return (
          <div className="flex items-center gap-1.5">
            <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${isLate ? 'text-destructive' : 'text-muted-foreground/50'}`} />
            <span className={`text-[0.78rem] ${isLate ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
              {formatDate(s.estimatedDelivery)}
              {isLate && <span className="ml-1 text-[0.65rem]">(Late)</span>}
            </span>
          </div>
        );
      },
    },
    {
      key: 'id',
      header: 'Actions',
      render: (s) => (
        <div className="flex items-center gap-1 justify-end">
          <button className="
            w-8 h-8 flex items-center justify-center rounded-lg
            text-muted-foreground hover:bg-primary/10 hover:text-primary
            transition-colors duration-150
          ">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button className="
            w-8 h-8 flex items-center justify-center rounded-lg
            text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400
            transition-colors duration-150
          ">
            <Edit className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="All Shipments"
      description="Platform-wide shipment management across all companies"
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
          New Shipment
        </button>
      }
    >

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total',        value: kpi.total,     pill: 'bg-primary/10 text-primary border-primary/20',             icon: Package   },
          { label: 'In Transit',   value: kpi.inTransit, pill: 'bg-primary/10 text-primary border-primary/20',             icon: Truck     },
          { label: 'Delivered',    value: kpi.delivered, pill: 'bg-success/10 text-success border-success/20',             icon: CheckCircle },
          { label: 'Pending',      value: kpi.pending,   pill: 'bg-muted/50 text-muted-foreground border-border/40',       icon: Clock     },
          { label: 'Failed/Cancel',value: kpi.failed,    pill: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle   },
        ].map(({ label, value, pill, icon: Icon }) => (
          <div key={label} className="
            bg-card border border-border/60 rounded-xl
            px-4 py-3.5 shadow-soft
            flex items-center gap-3
          ">
            <div className={`
              w-9 h-9 rounded-lg flex-shrink-0 border
              flex items-center justify-center
              ${pill}
            `}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wide">
                {label}
              </p>
              <p className="text-[1.3rem] font-black font-display text-foreground leading-tight">
                {value}
              </p>
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
              placeholder="Search tracking #, sender, receiver or address..."
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

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={(v) => setStatus(v as typeof statusFilter)}>
              <SelectTrigger className="w-[160px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all" className="text-[0.82rem]">All Statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="text-[0.82rem]">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Service type filter */}
            <Select value={serviceFilter} onValueChange={(v) => setService(v as typeof serviceFilter)}>
              <SelectTrigger className="w-[140px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all" className="text-[0.82rem]">All Services</SelectItem>
                {SERVICE_TYPES.map((s) => (
                  <SelectItem key={s} value={s} className="text-[0.82rem]">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Company filter */}
            <Select value={companyFilter} onValueChange={setCompany}>
              <SelectTrigger className="w-[160px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all" className="text-[0.82rem]">All Companies</SelectItem>
                {mockCompanies.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-[0.82rem]">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear all filters */}
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

        {/* Active filter pills + result count */}
        {hasFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40 flex-wrap">
            <span className="text-[0.70rem] text-muted-foreground font-bold uppercase tracking-wide">
              Filters:
            </span>
            {statusFilter !== 'all' && (
              <span className={`
                inline-flex items-center gap-1.5 px-2.5 py-0.5
                rounded-full text-[0.70rem] font-bold border
                ${STATUS_META[statusFilter].pill}
              `}>
                {statusFilter}
                <button onClick={() => setStatus('all')}><X size={10} /></button>
              </span>
            )}
            {serviceFilter !== 'all' && (
              <span className={`
                inline-flex items-center gap-1.5 px-2.5 py-0.5
                rounded-full text-[0.70rem] font-bold border
                ${SERVICE_STYLES[serviceFilter]}
              `}>
                {serviceFilter}
                <button onClick={() => setService('all')}><X size={10} /></button>
              </span>
            )}
            <span className="text-[0.72rem] text-muted-foreground ml-auto">
              {filtered.length} of {mockShipments.length} shipment{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <DataTable
        data={filtered}
        columns={columns}
        emptyMessage="No shipments match your filters"
      />

    </PageWrapper>
  );
}
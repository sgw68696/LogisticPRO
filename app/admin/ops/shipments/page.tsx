'use client';

import { useState, useMemo, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { shipmentService } from '@/services/shipment/shipmentService';
import { formatDate } from '@/lib/shipment-utils/formatting';
import { SHIPMENT_STATUS_CONFIG } from '@/config/statusConfig';
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
import type { ConsolidatedShipment, ShipmentStatus, ServiceType } from '@/types/shipment';

const STATUSES: ShipmentStatus[] = ['Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed'];
const SERVICE_TYPES: ServiceType[] = ['Express', 'Standard', 'Freight'];

const SERVICE_STYLES: Record<string, string> = {
  Express: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Standard: 'bg-muted/40 text-muted-foreground border border-border/40',
  Freight: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
};

export default function AllShipmentsPage() {
  const [shipments, setShipments] = useState<ConsolidatedShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatus] = useState<string>('all');
  const [serviceFilter, setService] = useState<string>('all');

  useEffect(() => {
    shipmentService.list({ role: 'SuperAdmin' }).then((data) => {
      setShipments(data);
      setLoading(false);
    });
  }, []);

  const kpi = useMemo(() => ({
    total: shipments.length,
    inTransit: shipments.filter((s) => s.status === 'In Transit').length,
    delivered: shipments.filter((s) => s.status === 'Delivered').length,
    pending: shipments.filter((s) => s.status === 'Pending').length,
    failed: shipments.filter((s) => ['Cancelled', 'Failed'].includes(s.status)).length,
  }), [shipments]);

  const filtered = useMemo(() => shipments.filter((s) => {
    const q = search.toLowerCase();
    const matchQ =
      s.trackingNumber.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q) ||
      s.sender.name.toLowerCase().includes(q) ||
      s.receiver.name.toLowerCase().includes(q) ||
      s.route.origin.toLowerCase().includes(q) ||
      s.route.destination.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchService = serviceFilter === 'all' || s.serviceType === serviceFilter;
    return matchQ && matchStatus && matchService;
  }), [shipments, search, statusFilter, serviceFilter]);

  const hasFilters = search || statusFilter !== 'all' || serviceFilter !== 'all';

  const clearFilters = () => {
    setSearch(''); setStatus('all'); setService('all');
  };

  const columns: Column<ConsolidatedShipment>[] = [
    {
      key: 'trackingNumber',
      header: 'Tracking',
      sortable: true,
      render: (s) => (
        <div>
          <span className="text-[0.82rem] font-bold font-mono text-primary">{s.trackingNumber}</span>
          <p className="text-[0.68rem] text-muted-foreground/60 mt-0.5">{s.id}</p>
        </div>
      ),
    },
    {
      key: 'sender',
      header: 'Sender → Receiver',
      sortable: true,
      render: (s) => (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[0.80rem] font-semibold text-foreground truncate max-w-[120px]">{s.sender.name}</span>
            <ArrowRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
            <span className="text-[0.80rem] font-semibold text-foreground truncate max-w-[120px]">{s.receiver.name}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-2.5 h-2.5 text-muted-foreground/40 flex-shrink-0" />
            <span className="text-[0.68rem] text-muted-foreground/60 truncate max-w-[240px]">
              {s.route.origin} → {s.route.destination}
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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[0.70rem] font-bold ${SERVICE_STYLES[s.serviceType] ?? SERVICE_STYLES.Standard}`}>
          {s.serviceType}
        </span>
      ),
    },
    {
      key: 'package',
      header: 'Weight',
      sortable: true,
      render: (s) => (
        <div>
          <span className="text-[0.82rem] font-bold font-mono text-foreground">{s.package.weight} kg</span>
          <p className="text-[0.68rem] text-muted-foreground/60 mt-0.5">{s.package.type}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: 'estimatedDelivery',
      header: 'Est. Delivery',
      sortable: true,
      render: (s) => {
        const isLate = s.status !== 'Delivered' && s.status !== 'Cancelled' && new Date(s.estimatedDelivery) < new Date();
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
      render: () => (
        <div className="flex items-center gap-1 justify-end">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-150">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors duration-150">
            <Edit className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <PageWrapper title="All Shipments" description="Platform-wide shipment management across all companies">
        <LoadingState rows={8} message="Loading shipments..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="All Shipments"
      description="Platform-wide shipment management across all companies"
      actions={
        <button
          className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-[0.82rem] font-bold text-white font-display cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Plus size={14} />
          New Shipment
        </button>
      }
    >
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: kpi.total, pill: 'bg-primary/10 text-primary border-primary/20', icon: Package },
          { label: 'In Transit', value: kpi.inTransit, pill: 'bg-primary/10 text-primary border-primary/20', icon: Truck },
          { label: 'Delivered', value: kpi.delivered, pill: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
          { label: 'Pending', value: kpi.pending, pill: 'bg-muted/50 text-muted-foreground border-border/40', icon: Clock },
          { label: 'Failed/Cancel', value: kpi.failed, pill: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
        ].map(({ label, value, pill, icon: Icon }) => (
          <div key={label} className="bg-card border border-border/60 rounded-xl px-4 py-3.5 shadow-soft flex items-center gap-3">
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

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search tracking #, customer, sender, receiver or route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="nb-search w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={13} className="text-muted-foreground shrink-0" />
            <Select value={statusFilter} onValueChange={(v) => setStatus(v)}>
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
            <Select value={serviceFilter} onValueChange={(v) => setService(v)}>
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
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-2.5 h-9 bg-destructive/10 border border-destructive/20 rounded-[9px] text-[0.78rem] font-semibold text-destructive hover:bg-destructive/20 transition-colors duration-150"
              >
                <RotateCcw size={12} />
                Clear
              </button>
            )}
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40 flex-wrap">
            <span className="text-[0.70rem] text-muted-foreground font-bold uppercase tracking-wide">Filters:</span>
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold border bg-primary/10 text-primary border-primary/20">
                {statusFilter}
                <button onClick={() => setStatus('all')}><X size={10} /></button>
              </span>
            )}
            {serviceFilter !== 'all' && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.70rem] font-bold border ${SERVICE_STYLES[serviceFilter]}`}>
                {serviceFilter}
                <button onClick={() => setService('all')}><X size={10} /></button>
              </span>
            )}
            <span className="text-[0.72rem] text-muted-foreground ml-auto">
              {filtered.length} of {shipments.length} shipment{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="No shipments match your filters"
          action={
            hasFilters ? (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-colors"
              >
                <RotateCcw size={12} />
                Clear Filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <DataTable data={filtered} columns={columns} emptyMessage="No shipments match your filters" />
      )}
    </PageWrapper>
  );
}

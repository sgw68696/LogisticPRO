'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { shipmentService } from '@/services/shipment/shipmentService';
import { formatDate } from '@/lib/shipment-utils/formatting';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Plus, Search, SlidersHorizontal, X,
  Package, Truck, Clock,
  CheckCircle, XCircle,
  RotateCcw, Eye, Edit,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { ConsolidatedShipment, ShipmentStatus, ServiceType } from '@/types/shipment';
import type { PaginatedResult } from '@/services/shipment/shipmentService';

const STATUSES: ShipmentStatus[] = ['Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed'];
const SERVICE_TYPES: ServiceType[] = ['Express', 'Standard', 'Freight'];

const SERVICE_STYLES: Record<string, string> = {
  Express: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Standard: 'bg-muted/40 text-muted-foreground border border-border/40',
  Freight: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
};

export default function AllShipmentsPage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [pageData, setPageData] = useState<PaginatedResult<ConsolidatedShipment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatus] = useState<string>('all');
  const [serviceFilter, setService] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  const fetchPage = useCallback(async (page: number, query: string, status: string, service: string, size: number) => {
    setLoading(true);
    const result = await shipmentService.listPaginated({
      role: 'SuperAdmin',
      page,
      pageSize: size,
      search: query || undefined,
      status: status !== 'all' ? status as ShipmentStatus : undefined,
      serviceType: service !== 'all' ? service as ServiceType : undefined,
      sortBy: 'createdAt',
      sortDir: 'desc',
    });
    setPageData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    shipmentService.getStats('SuperAdmin').then((data) => {
      setStats(data);
      setStatsLoading(false);
    });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, serviceFilter, pageSize]);

  useEffect(() => {
    fetchPage(currentPage, debouncedSearch, statusFilter, serviceFilter, pageSize);
  }, [currentPage, debouncedSearch, statusFilter, serviceFilter, pageSize, fetchPage]);

  const kpi = useMemo(() => {
    if (!stats) return null;
    return {
      total: stats.total ?? 0,
      inTransit: stats.inTransit ?? 0,
      delivered: stats.delivered ?? 0,
      pending: stats.pending ?? 0,
      failed: (stats.cancelled ?? 0) + (stats.failed ?? 0),
    };
  }, [stats]);

  const hasFilters = debouncedSearch || statusFilter !== 'all' || serviceFilter !== 'all';

  const clearFilters = () => {
    setSearch(''); setStatus('all'); setService('all');
  };

  const columns: Column<ConsolidatedShipment>[] = [
    {
      key: 'trackingNumber',
      header: 'Tracking',
      sortable: true,
      render: (s) => (
        <div className="whitespace-nowrap">
          <span className="text-[0.82rem] font-bold font-mono text-primary">{s.trackingNumber}</span>
          <p className="text-[0.68rem] text-muted-foreground/60 mt-0.5">{s.id}</p>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      render: (s) => (
        <span className="text-[0.80rem] text-foreground whitespace-nowrap">{s.customerName}</span>
      ),
    },
    {
      key: 'sender',
      header: 'Sender',
      sortable: true,
      render: (s) => (
        <span className="text-[0.78rem] text-foreground whitespace-nowrap">{s.sender.name}</span>
      ),
    },
    {
      key: 'receiver',
      header: 'Receiver',
      sortable: true,
      render: (s) => (
        <span className="text-[0.78rem] text-foreground whitespace-nowrap">{s.receiver.name}</span>
      ),
    },
    {
      key: 'route',
      header: 'Origin',
      sortable: true,
      render: (s) => (
        <span className="text-[0.78rem] text-foreground whitespace-nowrap">{s.route.origin}</span>
      ),
    },
    {
      key: 'routeDest',
      header: 'Destination',
      sortable: true,
      render: (s) => (
        <span className="text-[0.78rem] text-foreground whitespace-nowrap">{s.route.destination}</span>
      ),
    },
    {
      key: 'serviceType',
      header: 'Service',
      sortable: true,
      render: (s) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.70rem] font-bold whitespace-nowrap ${SERVICE_STYLES[s.serviceType] ?? SERVICE_STYLES.Standard}`}>
          {s.serviceType}
        </span>
      ),
    },
    {
      key: 'transportMode',
      header: 'Mode',
      sortable: true,
      render: (s) => (
        <span className="text-[0.78rem] text-foreground whitespace-nowrap">{s.route.transportMode}</span>
      ),
    },
    {
      key: 'distance',
      header: 'Dist.',
      sortable: true,
      render: (s) => (
        <span className="text-[0.78rem] font-mono text-foreground whitespace-nowrap">{s.route.distance} {s.route.distanceUnit}</span>
      ),
    },
    {
      key: 'weight',
      header: 'Weight',
      sortable: true,
      render: (s) => (
        <span className="text-[0.82rem] font-mono text-foreground whitespace-nowrap">{s.package.weight} kg</span>
      ),
    },
    {
      key: 'pieces',
      header: 'Pcs',
      sortable: true,
      render: (s) => (
        <span className="text-[0.80rem] font-mono text-foreground whitespace-nowrap">{s.package.pieces}</span>
      ),
    },
    {
      key: 'packageType',
      header: 'Type',
      sortable: true,
      render: (s) => (
        <span className="text-[0.78rem] text-foreground whitespace-nowrap">{s.package.type}</span>
      ),
    },
    {
      key: 'dimensions',
      header: 'Dims',
      sortable: true,
      render: (s) => (
        <span className="text-[0.72rem] font-mono text-muted-foreground whitespace-nowrap">{s.package.dimensions}</span>
      ),
    },
    {
      key: 'packageValue',
      header: 'Value',
      sortable: true,
      render: (s) => (
        <span className="text-[0.78rem] font-mono text-foreground whitespace-nowrap">₹{s.package.value.toLocaleString()}</span>
      ),
    },
    {
      key: 'assignedDriver',
      header: 'Driver',
      sortable: true,
      render: (s) => (
        <span className="text-[0.78rem] text-muted-foreground whitespace-nowrap">{s.assignedDriver ?? '—'}</span>
      ),
    },
    {
      key: 'assignedVehicle',
      header: 'Vehicle',
      sortable: true,
      render: (s) => (
        <span className="text-[0.78rem] text-muted-foreground whitespace-nowrap">{s.assignedVehicle ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: 'onTimeStatus',
      header: 'On-Time',
      sortable: true,
      render: (s) => {
        if (!s.onTimeStatus) return <span className="text-[0.78rem] text-muted-foreground">—</span>;
        const colors: Record<string, string> = { 'On Time': 'text-success', Delayed: 'text-destructive', Early: 'text-primary' };
        return <span className={`text-[0.78rem] font-semibold whitespace-nowrap ${colors[s.onTimeStatus] ?? ''}`}>{s.onTimeStatus}</span>;
      },
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (s) => (
        <span className="text-[0.75rem] text-muted-foreground whitespace-nowrap">{formatDate(s.createdAt)}</span>
      ),
    },
    {
      key: 'estimatedDelivery',
      header: 'Est. Delivery',
      sortable: true,
      render: (s) => {
        const isLate = s.status !== 'Delivered' && s.status !== 'Cancelled' && new Date(s.estimatedDelivery) < new Date();
        return (
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className={`text-[0.75rem] ${isLate ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
              {formatDate(s.estimatedDelivery)}
            </span>
          </div>
        );
      },
    },
    {
      key: 'customsStatus',
      header: 'Customs',
      sortable: true,
      render: (s) => (
        <span className="text-[0.78rem] text-foreground whitespace-nowrap">{s.customsStatus ?? '—'}</span>
      ),
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

  if (statsLoading && !stats) {
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
          { label: 'Total', value: kpi?.total ?? 0, pill: 'bg-primary/10 text-primary border-primary/20', icon: Package },
          { label: 'In Transit', value: kpi?.inTransit ?? 0, pill: 'bg-primary/10 text-primary border-primary/20', icon: Truck },
          { label: 'Delivered', value: kpi?.delivered ?? 0, pill: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
          { label: 'Pending', value: kpi?.pending ?? 0, pill: 'bg-muted/50 text-muted-foreground border-border/40', icon: Clock },
          { label: 'Failed/Cancel', value: kpi?.failed ?? 0, pill: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
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
              {pageData?.total ?? 0} shipment{(pageData?.total ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {loading || !pageData ? (
        <DataTable
          data={[]}
          columns={columns}
          pageSize={pageSize}
          controlledPagination
          currentPage={1}
          totalPages={1}
          totalItems={0}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          loading
        />
      ) : pageData.items.length === 0 ? (
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
        <DataTable
          data={pageData.items}
          columns={columns}
          emptyMessage="No shipments match your filters"
          pageSize={pageSize}
          controlledPagination
          currentPage={pageData.page}
          totalPages={pageData.totalPages}
          totalItems={pageData.total}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          loading={loading}
        />
      )}
    </PageWrapper>
  );
}

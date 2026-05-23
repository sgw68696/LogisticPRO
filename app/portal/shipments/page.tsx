'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { shipmentService } from '@/services/shipment/shipmentService';
import { formatDate } from '@/lib/shipment-utils/formatting';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import {
  Package, Search, X, Eye, Clock, CheckCircle2,
  Truck, Ship, Plane, ArrowRight, MapPin,
} from 'lucide-react';
import type { ConsolidatedShipment } from '@/types/shipment';
import type { PaginatedResult } from '@/services/shipment/shipmentService';

export default function PortalShipmentsPage() {
  const [pageData, setPageData] = useState<PaginatedResult<ConsolidatedShipment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  const fetchPage = useCallback(async (page: number, query: string, status: string, size: number) => {
    setLoading(true);
    const result = await shipmentService.listPaginated({
      role: 'CustomerPortal',
      page,
      pageSize: size,
      search: query || undefined,
      status: status !== 'All' ? status as any : undefined,
      sortBy: 'createdAt',
      sortDir: 'desc',
    });
    setPageData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    shipmentService.getStats('CustomerPortal').then((data) => {
      setStats(data);
      setStatsLoading(false);
    });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, pageSize]);

  useEffect(() => {
    fetchPage(currentPage, debouncedSearch, statusFilter, pageSize);
  }, [currentPage, debouncedSearch, statusFilter, pageSize, fetchPage]);

  const statsData = useMemo(() => ({
    total: stats?.total ?? 0,
    inTransit: stats?.inTransit ?? 0,
    delivered: stats?.delivered ?? 0,
    pending: stats?.pending ?? 0,
  }), [stats]);

  const statusPills = useMemo(() => {
    if (!stats) return [{ label: 'All', count: 0 }];
    const derived: { label: string; count: number }[] = [{ label: 'All', count: stats.total ?? 0 }];
    const map: [string, string][] = [
      ['pending', 'Pending'],
      ['pickedUp', 'Picked Up'],
      ['inTransit', 'In Transit'],
      ['outForDelivery', 'Out for Delivery'],
      ['delivered', 'Delivered'],
      ['failed', 'Failed'],
      ['cancelled', 'Cancelled'],
    ];
    for (const [key, label] of map) {
      const count = (stats as any)[key] ?? 0;
      if (count > 0) derived.push({ label, count });
    }
    return derived;
  }, [stats]);

  const columns: Column<ConsolidatedShipment>[] = [
    {
      key: 'trackingNumber',
      header: 'Tracking ID',
      render: (s) => (
        <Link href={`/portal/shipments/${s.id}`} className="font-mono text-xs text-foreground font-semibold hover:text-primary transition-colors">
          {s.trackingNumber}
        </Link>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      render: (s) => (
        <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
          {s.route.origin}
          <ArrowRight className="w-2.5 h-2.5 inline" />
          {s.route.destination}
        </span>
      ),
    },
    {
      key: 'serviceType',
      header: 'Service',
      render: (s) => (
        <span className="text-[0.65rem] text-muted-foreground">{s.serviceType}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: 'estimatedDelivery',
      header: 'ETA',
      render: (s) => (
        <span className="text-[0.7rem] text-muted-foreground">
          {formatDate(s.estimatedDelivery, { day: '2-digit', month: 'short' } as any)}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (s) => (
        <Link href={`/portal/shipments/${s.id}`}>
          <button className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
            <Eye className="w-3.5 h-3.5" />
          </button>
        </Link>
      ),
    },
  ];

  if (statsLoading && !stats) {
    return (
      <PageWrapper title="My Shipments" description="View and track all your shipments in one place">
        <LoadingState rows={6} message="Loading your shipments..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="My Shipments"
      description="View and track all your shipments in one place"
      actions={
        <Link href="/portal/bookings/new">
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-600 rounded-[10px] gap-2 text-xs h-9">
            <Package className="w-4 h-4" />
            New Shipment
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Shipments" value={statsData.total} icon={<Package className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="In Transit" value={statsData.inTransit} icon={<Truck className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Delivered" value={statsData.delivered} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Pending" value={statsData.pending} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); }}
              placeholder="Search by tracking ID, address, or recipient..."
              className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusPills.map(({ label, count }) => {
            const isActive = statusFilter === label;
            return (
              <button
                key={label}
                onClick={() => setStatusFilter(label)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold border transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                    : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'
                }`}
              >
                {label === 'All' ? null : <StatusBadge status={label} dot />}
                {label} <span className="text-[0.6rem] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
        {(debouncedSearch || statusFilter !== 'All') && (
          <p className="text-[0.65rem] text-muted-foreground mt-2 ml-1">{pageData?.total ?? 0} shipment(s) found</p>
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
          title="No shipments found"
          description="Try adjusting your search or filter criteria"
          action={
            <Button variant="outline" size="sm" className="rounded-[9px] text-xs" onClick={() => { setSearch(''); setStatusFilter('All'); }}>
              Clear Filters
            </Button>
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

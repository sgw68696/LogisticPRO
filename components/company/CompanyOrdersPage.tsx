'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  Package,
  Search,
  X,
  Filter,
  Plus,
  Eye,
  CreditCard,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { orderService, type OrderFilters } from '@/services/orderService';
import { useCompany } from '@/hooks/use-company';
import { useDebounce } from '@/hooks/use-debounce';
import type { Order } from '@/types/order';
import type { PaginatedResponse } from '@/data/mock-db';

const formatDate = (value: string): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

export function CompanyOrdersPage() {
  const { effectiveCompanyId } = useCompany();
  const [pageData, setPageData] = useState<PaginatedResponse<Order> | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    draft: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    returned: number;
    pendingPayment: number;
    paid: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  const fetchPage = useCallback(
    async (page: number, query: string, status: string, size: number) => {
      setLoading(true);
      try {
        const filters: OrderFilters = {
          companyId: effectiveCompanyId,
          page,
          pageSize: size,
          search: query || undefined,
          status: status !== 'All' ? (status as any) : undefined,
          sortBy: 'createdAt',
          sortDir: 'desc',
        };
        const result = await orderService.listPaginated(filters);
        setPageData(result);
      } finally {
        setLoading(false);
      }
    },
    [effectiveCompanyId]
  );

  useEffect(() => {
    orderService.getStats(effectiveCompanyId).then((data) => {
      setStats(data);
      setStatsLoading(false);
    });
  }, [effectiveCompanyId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, pageSize]);

  useEffect(() => {
    fetchPage(currentPage, debouncedSearch, statusFilter, pageSize);
  }, [currentPage, debouncedSearch, statusFilter, pageSize, fetchPage]);

  const activeOrders = useMemo(() => {
    return (stats?.confirmed ?? 0) + (stats?.processing ?? 0) + (stats?.shipped ?? 0);
  }, [stats]);

  const statusTabs = useMemo(() => {
    return [
      { label: 'All', value: 'All', count: stats?.total ?? 0 },
      { label: 'Draft', value: 'Draft', count: stats?.draft ?? 0 },
      { label: 'Confirmed', value: 'Confirmed', count: stats?.confirmed ?? 0 },
      { label: 'Processing', value: 'Processing', count: stats?.processing ?? 0 },
      { label: 'Shipped', value: 'Shipped', count: stats?.shipped ?? 0 },
      { label: 'Delivered', value: 'Delivered', count: stats?.delivered ?? 0 },
    ];
  }, [stats]);

  const columns: Column<Order>[] = [
    {
      key: 'orderId',
      header: 'Order #',
      sortable: true,
      render: (ord) => (
        <span className="text-xs font-mono font-semibold text-foreground">
          {ord.orderId}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      render: (ord) => (
        <span className="text-xs text-foreground">{ord.customerName}</span>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (ord) => (
        <Badge variant="outline" className="text-[0.6rem]">
          {(ord as any).items?.length ?? 0} items
        </Badge>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (ord) => (
        <div className="flex items-center gap-1.5">
          <CreditCard className={`w-3.5 h-3.5 ${ord.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`} />
          <span className="text-xs text-muted-foreground">{ord.paymentStatus}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (ord) => (
        <span className="text-xs text-muted-foreground">
          {ord.createdAt ? formatDate(ord.createdAt) : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (ord) => <StatusBadge status={ord.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (ord) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Truck className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      ),
    },
  ];

  if (statsLoading && !stats) {
    return (
      <PageWrapper title="Orders">
        <LoadingState rows={8} message="Loading orders..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Orders">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Orders"
          value={stats?.total ?? 0}
          icon={<ClipboardCheck className="w-5 h-5" />}
          iconColor="indigo"
        />
        <KPICard
          title="Active Orders"
          value={activeOrders}
          icon={<Package className="w-5 h-5" />}
          iconColor="teal"
        />
        <KPICard
          title="Delivered"
          value={stats?.delivered ?? 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconColor="green"
        />
        <KPICard
          title="Pending Payment"
          value={stats?.pendingPayment ?? 0}
          icon={<AlertCircle className="w-5 h-5" />}
          iconColor="amber"
        />
      </div>

      {/* Quick Actions */}
      <Card className="border-border/60 bg-gradient-to-r from-cyan-500/5 via-transparent to-teal-500/5 shadow-soft mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-[0.7rem] text-muted-foreground uppercase tracking-wide">
                Order Management
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage customer orders, track fulfillment status.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" size="sm" className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
                New Order
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5" />
                Advanced Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters & Search */}
      <Card className="border-border/60 bg-card shadow-soft mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order number, customer..."
                className="w-full rounded-md border border-border bg-muted/30 pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {statusTabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={statusFilter === tab.value ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(tab.value)}
                  className="gap-2 text-xs"
                >
                  {tab.label}
                  <Badge variant="secondary" className="text-[0.6rem]">
                    {tab.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      {loading || !pageData ? (
        <Card className="border-border/60 bg-card shadow-soft">
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>
      ) : pageData.items.length === 0 ? (
        <Card className="border-border/60 bg-card shadow-soft">
          <CardContent>
            <EmptyState
              icon={<ClipboardCheck className="w-8 h-8" />}
              title="No orders found"
              description="No orders match your current search or filter criteria."
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 bg-card shadow-soft">
          <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-cyan-500" />
              All Orders
              <Badge variant="outline" className="text-[0.6rem]">
                {pageData.total}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <DataTable
              data={pageData.items}
              columns={columns}
              pageSize={pageSize}
              controlledPagination
              currentPage={pageData.page}
              totalPages={pageData.totalPages}
              totalItems={pageData.total}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
              loading={loading}
            />
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  );
}

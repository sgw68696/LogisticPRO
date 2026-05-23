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
  Users,
  UserCheck,
  Building2,
  UserPlus,
  Search,
  X,
  Filter,
  Plus,
  Eye,
  TrendingUp,
  DollarSign,
  Mail,
  MapPin,
} from 'lucide-react';
import { customerService, type CustomerFilters } from '@/services/customerService';
import { useCompany } from '@/hooks/use-company';
import { useDebounce } from '@/hooks/use-debounce';
import type { Customer } from '@/types/customer';
import type { PaginatedResponse } from '@/data/mock-db';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export function CompanyCustomersPage() {
  const { effectiveCompanyId } = useCompany();
  const [pageData, setPageData] = useState<PaginatedResponse<Customer> | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    individuals: number;
    businesses: number;
    active: number;
    withOutstanding: number;
    totalOutstanding: number;
    topCities: { city: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  const fetchPage = useCallback(
    async (page: number, query: string, type: string, size: number) => {
      setLoading(true);
      try {
        const filters: CustomerFilters = {
          companyId: effectiveCompanyId,
          page,
          pageSize: size,
          search: query || undefined,
          type: type !== 'All' ? (type as any) : undefined,
          sortBy: 'createdAt',
          sortDir: 'desc',
        };
        const result = await customerService.listPaginated(filters);
        setPageData(result);
      } finally {
        setLoading(false);
      }
    },
    [effectiveCompanyId]
  );

  useEffect(() => {
    customerService.getStats(effectiveCompanyId).then((data) => {
      setStats(data);
      setStatsLoading(false);
    });
  }, [effectiveCompanyId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, typeFilter, pageSize]);

  useEffect(() => {
    fetchPage(currentPage, debouncedSearch, typeFilter, pageSize);
  }, [currentPage, debouncedSearch, typeFilter, pageSize, fetchPage]);

  const statusTabs = useMemo(() => {
    return [
      { label: 'All', value: 'All', count: stats?.total ?? 0 },
      { label: 'Individual', value: 'Individual', count: stats?.individuals ?? 0 },
      { label: 'Business', value: 'Business', count: stats?.businesses ?? 0 },
    ];
  }, [stats]);

  const columns: Column<Customer>[] = [
    {
      key: 'customerId',
      header: 'Customer #',
      sortable: true,
      render: (cust) => (
        <span className="text-xs font-mono font-semibold text-foreground">
          {cust.customerId}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (cust) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-[0.65rem] font-semibold text-primary">
              {cust.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <span className="text-xs text-foreground">{cust.name}</span>
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-muted-foreground" />
              <span className="text-[0.65rem] text-muted-foreground">{cust.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (cust) => (
        <Badge variant="outline" className="text-[0.6rem] gap-1">
          {cust.type === 'Business' ? (
            <Building2 className="w-3 h-3" />
          ) : (
            <UserCheck className="w-3 h-3" />
          )}
          {cust.type}
        </Badge>
      ),
    },
    {
      key: 'city',
      header: 'Location',
      sortable: true,
      render: (cust) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-xs text-muted-foreground">{cust.city}</span>
        </div>
      ),
    },
    {
      key: 'totalShipments',
      header: 'Shipments',
      sortable: true,
      render: (cust) => (
        <Badge variant="outline" className="text-[0.6rem]">
          <TrendingUp className="w-3 h-3 mr-1" />
          {cust.totalShipments ?? 0}
        </Badge>
      ),
    },
    {
      key: 'outstandingBalance',
      header: 'Balance',
      sortable: true,
      render: (cust) => {
        const bal = cust.outstandingBalance ?? 0;
        return (
          <span className={`text-xs font-medium ${bal > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {formatCurrency(bal)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (cust) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      ),
    },
  ];

  if (statsLoading && !stats) {
    return (
      <PageWrapper title="Customers">
        <LoadingState rows={8} message="Loading customers..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Customers">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Customers"
          value={stats?.total ?? 0}
          icon={<Users className="w-5 h-5" />}
          iconColor="indigo"
        />
        <KPICard
          title="Business Clients"
          value={stats?.businesses ?? 0}
          icon={<Building2 className="w-5 h-5" />}
          iconColor="blue"
        />
        <KPICard
          title="Active Customers"
          value={stats?.active ?? 0}
          icon={<UserCheck className="w-5 h-5" />}
          iconColor="teal"
        />
        <KPICard
          title="Outstanding Balance"
          value={formatCurrency(stats?.totalOutstanding ?? 0)}
          icon={<DollarSign className="w-5 h-5" />}
          iconColor="amber"
        />
      </div>

      {/* Quick Actions */}
      <Card className="border-border/60 bg-gradient-to-r from-indigo-500/5 via-transparent to-cyan-500/5 shadow-soft mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-[0.7rem] text-muted-foreground uppercase tracking-wide">
                Customer Management
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Manage customer accounts, track balances, and view shipment history.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" size="sm" className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
                Add Customer
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Cities */}
      {stats?.topCities && stats.topCities.length > 0 && (
        <Card className="border-border/60 bg-card shadow-soft mb-6">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              Customer Distribution by City
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {stats.topCities.map((tc) => (
                <div
                  key={tc.city}
                  className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center"
                >
                  <p className="text-xs font-medium text-foreground">{tc.city}</p>
                  <p className="text-lg font-bold text-primary">{tc.count}</p>
                  <p className="text-[0.65rem] text-muted-foreground">customers</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters & Search */}
      <Card className="border-border/60 bg-card shadow-soft mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer name, email, or ID..."
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
                  variant={typeFilter === tab.value ? 'default' : 'outline'}
                  onClick={() => setTypeFilter(tab.value)}
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

      {/* Customers Table */}
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
              icon={<Users className="w-8 h-8" />}
              title="No customers found"
              description="No customers match your current search or filter criteria."
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 bg-card shadow-soft">
          <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-500" />
              All Customers
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

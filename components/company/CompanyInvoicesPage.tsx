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
  ReceiptText,
  IndianRupee,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  X,
  Filter,
  Plus,
  Eye,
  Download,
} from 'lucide-react';
import { financeService, type InvoiceFilters } from '@/services/financeService';
import { useCompany } from '@/hooks/use-company';
import { useDebounce } from '@/hooks/use-debounce';
import type { Invoice } from '@/types/invoice';
import type { PaginatedResponse } from '@/data/mock-db';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value: string): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

export function CompanyInvoicesPage() {
  const { effectiveCompanyId } = useCompany();
  const [pageData, setPageData] = useState<PaginatedResponse<Invoice> | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    totalAmount: number;
    paid: number;
    paidAmount: number;
    unpaid: number;
    overdue: number;
    overdueAmount: number;
    cancelled: number;
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
        const filters: InvoiceFilters = {
          companyId: effectiveCompanyId,
          page,
          pageSize: size,
          search: query || undefined,
          status: status !== 'All' ? (status as any) : undefined,
          sortBy: 'createdAt',
          sortDir: 'desc',
        };
        const result = await financeService.listPaginated(filters);
        setPageData(result);
      } finally {
        setLoading(false);
      }
    },
    [effectiveCompanyId]
  );

  useEffect(() => {
    financeService.getStats(effectiveCompanyId).then((data) => {
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

  const statusTabs = useMemo(() => {
    return [
      { label: 'All', value: 'All', count: stats?.total ?? 0 },
      { label: 'Paid', value: 'Paid', count: stats?.paid ?? 0 },
      { label: 'Unpaid', value: 'Unpaid', count: stats?.unpaid ?? 0 },
      { label: 'Overdue', value: 'Overdue', count: stats?.overdue ?? 0 },
    ];
  }, [stats]);

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceId',
      header: 'Invoice #',
      sortable: true,
      render: (inv) => (
        <span className="text-xs font-mono font-semibold text-foreground">
          {inv.invoiceId}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      render: (inv) => (
        <span className="text-xs text-foreground">{inv.customerName}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (inv) => (
        <span className="text-xs font-medium text-foreground">
          {formatCurrency(inv.amount)}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (inv) => (
        <span className="text-xs text-muted-foreground">
          {inv.dueDate ? formatDate(inv.dueDate) : '-'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Issued',
      sortable: true,
      render: (inv) => (
        <span className="text-xs text-muted-foreground">
          {inv.createdAt ? formatDate(inv.createdAt) : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (inv) => <StatusBadge status={inv.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (inv) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      ),
    },
  ];

  if (statsLoading && !stats) {
    return (
      <PageWrapper title="Invoices">
        <LoadingState rows={8} message="Loading invoices..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Invoices">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Invoices"
          value={stats?.total ?? 0}
          icon={<ReceiptText className="w-5 h-5" />}
          iconColor="indigo"
        />
        <KPICard
          title="Paid"
          value={stats?.paid ?? 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconColor="green"
          trend={`${formatCurrency(stats?.paidAmount ?? 0)}`}
        />
        <KPICard
          title="Pending"
          value={stats?.unpaid ?? 0}
          icon={<Clock className="w-5 h-5" />}
          iconColor="amber"
        />
        <KPICard
          title="Overdue"
          value={stats?.overdue ?? 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconColor="rose"
          trend={`${formatCurrency(stats?.overdueAmount ?? 0)}`}
        />
      </div>

      {/* Summary Card */}
      <Card className="border-border/60 bg-gradient-to-r from-emerald-500/5 via-transparent to-indigo-500/5 shadow-soft mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-[0.7rem] text-muted-foreground uppercase tracking-wide">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {formatCurrency(stats?.totalAmount ?? 0)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" size="sm" className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
                New Invoice
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" />
                Export
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
                placeholder="Search invoice number, customer..."
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

      {/* Invoices Table */}
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
              icon={<ReceiptText className="w-8 h-8" />}
              title="No invoices found"
              description="No invoices match your current search or filter criteria."
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 bg-card shadow-soft">
          <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-cyan-500" />
              All Invoices
              <Badge variant="outline" className="text-[0.6rem]">
                {pageData.total}
              </Badge>
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5" />
              More Filters
            </Button>
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

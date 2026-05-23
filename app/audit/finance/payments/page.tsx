'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatINR } from '@/lib/shipment-utils/formatting';
import { formatDate } from '@/lib/utils';
import {
  CreditCard, Search, X, RotateCcw, ShieldAlert, DollarSign,
  CheckCircle, TrendingUp
} from 'lucide-react';
import { mockInvoices, mockAnalytics } from '@/data/mockData';
import type { Invoice } from '@/types/invoice';

const STATUS_FILTERS = ['All', 'Paid', 'Overdue'] as const;

export default function AuditPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const paymentData = useMemo(() => {
    return mockInvoices.filter(i => i.status === 'Paid' || i.status === 'Overdue');
  }, []);

  const filteredData = useMemo(() => {
    let data = paymentData;
    if (statusFilter !== 'All') {
      data = data.filter(i => i.status === statusFilter);
    }
    if (search) {
      const query = search.toLowerCase();
      data = data.filter(i =>
        i.invoiceId.toLowerCase().includes(query) ||
        i.customerName.toLowerCase().includes(query)
      );
    }
    return data;
  }, [paymentData, statusFilter, search]);

  const kpis = useMemo(() => {
    const paidInvoices = paymentData.filter(i => i.status === 'Paid');
    const totalRevenue = paidInvoices.reduce((s, i) => s + i.amount, 0);
    const avgPayment = paidInvoices.length > 0 ? Math.round(totalRevenue / paidInvoices.length) : 0;

    const currentMonth = new Date().getMonth();
    const thisMonthRevenue = paidInvoices
      .filter(i => i.paidDate && new Date(i.paidDate).getMonth() === currentMonth)
      .reduce((s, i) => s + i.amount, 0);

    return {
      totalPayments: paymentData.length,
      totalRevenue,
      thisMonthRevenue,
      avgPayment,
    };
  }, [paymentData]);

  const columns: Column<Invoice>[] = useMemo(() => [
    {
      key: 'invoiceId',
      header: 'Invoice ID',
      render: (item) => (
        <span className="font-mono text-sm font-medium">{item.invoiceId}</span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer Name',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item) => <span className="font-medium">{formatINR(item.amount)}</span>,
    },
    {
      key: 'paidDate',
      header: 'Paid Date',
      render: (item) => (
        <span className="text-sm">{item.paidDate ? formatDate(item.paidDate) : '—'}</span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      render: () => <span className="text-sm text-muted-foreground">N/A</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ], []);

  return (
    <PageWrapper
      title="Payments"
      description="Read-only payment records"
      actions={
        <Badge variant="secondary" className="gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" />
          Read-Only
        </Badge>
      }
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Payments"
          value={kpis.totalPayments}
          icon={<CreditCard className="w-5 h-5" />}
          iconColor="indigo"
        />
        <KPICard
          title="Total Revenue"
          value={formatINR(kpis.totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          iconColor="green"
        />
        <KPICard
          title="This Month"
          value={formatINR(kpis.thisMonthRevenue)}
          icon={<TrendingUp className="w-5 h-5" />}
          iconColor="green"
        />
        <KPICard
          title="Average Payment"
          value={formatINR(kpis.avgPayment)}
          icon={<CheckCircle className="w-5 h-5" />}
          iconColor="cyan"
        />
      </div>

      {/* Revenue Trend */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {mockAnalytics.monthlyRevenue.map((item) => (
              <div key={item.month} className="text-center">
                <div className="text-xs text-muted-foreground mb-2">{item.month}</div>
                <div className="h-24 bg-muted/50 rounded-md flex flex-col justify-end overflow-hidden">
                  <div
                    className="bg-gradient-to-t from-primary/80 to-primary rounded-t-md transition-all"
                    style={{
                      height: `${Math.max(20, (item.revenue / 2000000) * 100)}%`
                    }}
                  />
                </div>
                <div className="text-xs font-medium mt-2">{formatINR(item.revenue)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search + Status Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by invoice ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-8 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {status === 'All' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState rows={6} message="Loading payments..." />
      ) : filteredData.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-8 h-8 text-muted-foreground" />}
          title="No payments found"
          description={
            search || statusFilter !== 'All'
              ? 'Try adjusting your search or filter criteria.'
              : 'No payment records are available for audit review.'
          }
          action={
            (search || statusFilter !== 'All') ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearch(''); setStatusFilter('All'); }}
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DataTable
          data={filteredData}
          columns={columns}
          pageSize={10}
          emptyMessage="No payments match your criteria."
        />
      )}
    </PageWrapper>
  );
}

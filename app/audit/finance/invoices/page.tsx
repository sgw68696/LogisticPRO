'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatINR } from '@/lib/shipment-utils/formatting';
import { formatDate } from '@/lib/utils';
import { getStatusStyle } from '@/config/statusConfig';
import {
  FileText, Search, X, RotateCcw, ShieldAlert, DollarSign,
  CheckCircle, Clock, AlertTriangle, Download,
} from 'lucide-react';
import { auditService } from '@/services/audit/auditService';
import type { Invoice } from '@/types/invoice';

const STATUS_FILTERS = ['All', 'Unpaid', 'Paid', 'Overdue', 'Cancelled'] as const;

export default function AuditInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await auditService.getInvoices({
        status: statusFilter === 'All' ? undefined : statusFilter,
        search: search || undefined,
      });
      setInvoices(data);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const kpis = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter(i => i.status === 'Paid').length;
    const unpaid = invoices.filter(i => i.status === 'Unpaid').length;
    const overdue = invoices.filter(i => i.status === 'Overdue').length;
    const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);
    return { total, paid, unpaid, overdue, totalAmount };
  }, [invoices]);

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
      key: 'status',
      header: 'Status',
      render: (item) => {
        const style = getStatusStyle(item.status);
        return (
          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium', style.bg, style.text, style.border)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', style.dot)} />
            {style.label}
          </span>
        );
      },
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (item) => <span className="text-sm">{formatDate(item.dueDate)}</span>,
    },
    {
      key: 'paidDate',
      header: 'Paid Date',
      render: (item) => (
        <span className="text-sm">{item.paidDate ? formatDate(item.paidDate) : '—'}</span>
      ),
    },
    {
      key: 'items',
      header: 'Items Count',
      render: (item) => <span className="text-sm">{item.items.length}</span>,
    },
  ], []);

  return (
    <PageWrapper
      title="Invoices"
      description="Read-only invoice audit records"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            Read-Only
          </Badge>
          <Button variant="outline" size="sm" onClick={() => {}}>
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>
        </div>
      }
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Invoices"
          value={kpis.total}
          icon={<FileText className="w-5 h-5" />}
          iconColor="indigo"
        />
        <KPICard
          title="Paid"
          value={kpis.paid}
          icon={<CheckCircle className="w-5 h-5" />}
          iconColor="green"
        />
        <KPICard
          title="Unpaid"
          value={kpis.unpaid}
          icon={<Clock className="w-5 h-5" />}
          iconColor="amber"
        />
        <KPICard
          title="Overdue"
          value={kpis.overdue}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconColor="red"
        />
      </div>

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
        <LoadingState rows={6} message="Loading invoices..." />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-muted-foreground" />}
          title="No invoices found"
          description={
            search || statusFilter !== 'All'
              ? 'Try adjusting your search or filter criteria.'
              : 'No invoice records are available for audit review.'
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
          data={invoices}
          columns={columns}
          pageSize={10}
          emptyMessage="No invoices match your criteria."
        />
      )}
    </PageWrapper>
  );
}

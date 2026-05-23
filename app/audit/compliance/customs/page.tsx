'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn, formatDate } from '@/lib/utils';
import { FileCheck, Search, X, RotateCcw, ShieldAlert, Scale, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { auditService } from '@/services/audit/auditService';
import type { ComplianceRecord } from '@/types/audit';

const STATUS_FILTERS = ['All', 'Compliant', 'Pending', 'Non-Compliant', 'Expired'] as const;

const riskBadge = (level: string) => {
  const colorMap: Record<string, string> = {
    Low: 'bg-green-500/10 text-green-400 border-green-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    High: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-semibold border', colorMap[level] || 'bg-gray-500/10 text-gray-400 border-gray-500/20')}>
      {level}
    </span>
  );
};

export default function CustomsCompliancePage() {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await auditService.getComplianceRecords({
        type: 'Customs',
        status: statusFilter === 'All' ? undefined : statusFilter,
        search: search || undefined,
      });
      setRecords(data);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const kpis = useMemo(() => {
    const total = records.length;
    const compliant = records.filter(r => r.status === 'Compliant').length;
    const pending = records.filter(r => r.status === 'Pending').length;
    const nonCompliant = records.filter(r => r.status === 'Non-Compliant').length;
    return { total, compliant, pending, nonCompliant };
  }, [records]);

  const columns: Column<ComplianceRecord>[] = useMemo(() => [
    {
      key: 'referenceNumber',
      header: 'Reference Number',
      render: (item) => (
        <span className="font-mono text-sm font-medium">{item.referenceNumber}</span>
      ),
    },
    {
      key: 'issuingAuthority',
      header: 'Issuing Authority',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'riskLevel',
      header: 'Risk Level',
      render: (item) => riskBadge(item.riskLevel),
    },
    {
      key: 'issuedDate',
      header: 'Issue Date',
      render: (item) => <span className="text-sm">{formatDate(item.issuedDate)}</span>,
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      render: (item) => (
        <span className="text-sm">{item.expiryDate ? formatDate(item.expiryDate) : '—'}</span>
      ),
    },
    {
      key: 'lastReviewed',
      header: 'Last Reviewed',
      render: (item) => <span className="text-sm">{formatDate(item.lastReviewed)}</span>,
    },
  ], []);

  return (
    <PageWrapper
      title="Customs Declarations"
      description="Read-only customs compliance records"
      actions={
        <Badge variant="outline" className="gap-1.5 text-xs border-amber-500/20 text-amber-400 bg-amber-500/5">
          <ShieldAlert className="w-3 h-3" />
          Read-Only
        </Badge>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Customs Records"
          value={kpis.total}
          icon={<Scale className="w-5 h-5" />}
          iconColor="indigo"
        />
        <KPICard
          title="Compliant"
          value={kpis.compliant}
          icon={<CheckCircle className="w-5 h-5" />}
          iconColor="green"
        />
        <KPICard
          title="Pending"
          value={kpis.pending}
          icon={<Clock className="w-5 h-5" />}
          iconColor="amber"
        />
        <KPICard
          title="Non-Compliant"
          value={kpis.nonCompliant}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconColor="red"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by reference, authority, or description..."
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

      {loading ? (
        <LoadingState rows={6} message="Loading customs compliance records..." />
      ) : records.length === 0 ? (
        <EmptyState
          icon={<FileCheck className="w-8 h-8 text-muted-foreground" />}
          title="No customs records found"
          description={
            search || statusFilter !== 'All'
              ? 'Try adjusting your search or filter criteria.'
              : 'No customs compliance records are available for audit review.'
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
          data={records}
          columns={columns}
          pageSize={10}
          emptyMessage="No customs records match your criteria."
        />
      )}
    </PageWrapper>
  );
}

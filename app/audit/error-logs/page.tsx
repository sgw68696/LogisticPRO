'use client';

import { useState, useEffect, useMemo } from 'react';
import { auditService } from '@/services/audit/auditService';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { AlertTriangle, Bug, CheckCircle, XCircle, Clock, Wifi, Search, X, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ErrorLog } from '@/types/audit';

const MODULES = ['All', 'Shipments', 'Finance', 'Compliance', 'Users', 'Settings', 'Reports'];
const SEVERITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];
const RESOLUTION_STATUSES = ['All', 'Resolved', 'Unresolved'];
const PAGE_SIZE = 50;

const severityColors: Record<string, string> = {
  Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  High: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function AuditErrorLogsPage() {
  const [data, setData] = useState<{ items: ErrorLog[]; total: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [module, setModule] = useState('All');
  const [severity, setSeverity] = useState('All');
  const [resolution, setResolution] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    auditService
      .getErrorLogs({
        page,
        pageSize: PAGE_SIZE,
        ...(module !== 'All' ? { module } : {}),
        ...(severity !== 'All' ? { severity } : {}),
        ...(resolution !== 'All' ? { resolved: resolution === 'Resolved' } : {}),
        ...(search ? { search } : {}),
      })
      .then(res => {
        setData(res);
        setLoading(false);
      });
  }, [page, module, severity, resolution, search]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const kpis = useMemo(() => {
    if (!data) return { total: 0, critical: 0, high: 0, resolved: 0, unresolved: 0 };
    return {
      total: data.total,
      critical: data.items.filter(e => e.severity === 'Critical').length,
      high: data.items.filter(e => e.severity === 'High').length,
      resolved: data.items.filter(e => e.resolved).length,
      unresolved: data.items.filter(e => !e.resolved).length,
    };
  }, [data]);

  const formatTimestamp = (ts: string) =>
    new Date(ts).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <PageWrapper
      title="Error Logs"
      description="System error records and exceptions"
      actions={
        <Badge variant="outline" className="gap-1.5 border-amber-500/30 bg-amber-500/5 text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5" /> Read-Only
        </Badge>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <KPICard
          title="Total Errors"
          value={kpis.total}
          icon={<Bug className="w-5 h-5" />}
          iconColor="indigo"
        />
        <KPICard
          title="Critical"
          value={kpis.critical}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconColor="red"
        />
        <KPICard
          title="High"
          value={kpis.high}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconColor="amber"
        />
        <KPICard
          title="Resolved"
          value={kpis.resolved}
          icon={<CheckCircle className="w-5 h-5" />}
          iconColor="green"
        />
        <KPICard
          title="Unresolved"
          value={kpis.unresolved}
          icon={<XCircle className="w-5 h-5" />}
          iconColor="red"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-medium text-muted-foreground mr-1">Module:</span>
        {MODULES.map(m => (
          <button
            key={m}
            onClick={() => { setModule(m); setPage(1); }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              module === m
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-muted/30 text-muted-foreground border border-border/50 hover:bg-muted/50',
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs font-medium text-muted-foreground mr-1">Severity:</span>
        {SEVERITIES.map(s => (
          <button
            key={s}
            onClick={() => { setSeverity(s); setPage(1); }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              severity === s
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-muted/30 text-muted-foreground border border-border/50 hover:bg-muted/50',
            )}
          >
            {s}
          </button>
        ))}
        <span className="text-xs font-medium text-muted-foreground ml-4 mr-1">Status:</span>
        {RESOLUTION_STATUSES.map(r => (
          <button
            key={r}
            onClick={() => { setResolution(r); setPage(1); }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              resolution === r
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-muted/30 text-muted-foreground border border-border/50 hover:bg-muted/50',
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold">Error Records</CardTitle>
            {data && (
              <p className="text-sm text-muted-foreground mt-1">
                Page {page} of {data.totalPages}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by error code, message, module..."
              className="w-full h-9 pl-9 pr-8 bg-muted/40 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {loading ? (
            <LoadingState rows={8} message="Loading error logs..." />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              icon={<Bug className="w-8 h-8" />}
              title="No error logs found"
              description={search ? 'Try adjusting your search or filter criteria.' : 'No errors have been recorded yet.'}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Timestamp</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Error Code</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Message</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Module</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Severity</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Resolved</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Resolved By</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map(entry => (
                    <tr key={entry.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                      <td className="py-2.5 px-2 text-xs text-muted-foreground">{formatTimestamp(entry.timestamp)}</td>
                      <td className="py-2.5 px-2">
                        <span className="text-xs font-mono font-medium text-foreground">{entry.errorCode}</span>
                      </td>
                      <td className="py-2.5 px-2 text-xs text-muted-foreground max-w-[200px] truncate" title={entry.message}>
                        {entry.message}
                      </td>
                      <td className="py-2.5 px-2 text-xs text-muted-foreground">{entry.module}</td>
                      <td className="py-2.5 px-2">
                        <Badge variant="outline" className={cn('text-[0.65rem] px-1.5 py-0 border', severityColors[entry.severity])}>
                          {entry.severity}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-2">
                        {entry.resolved ? (
                          <Badge variant="outline" className="text-[0.65rem] px-1.5 py-0 border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[0.65rem] px-1.5 py-0 border bg-amber-500/10 text-amber-400 border-amber-500/20">
                            No
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-xs text-muted-foreground">{entry.resolvedBy || '-'}</td>
                      <td className="py-2.5 px-2">
                        <button
                          onClick={() => toggleRow(entry.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {expandedRows.has(entry.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {expandedRows.size > 0 && (
                <div className="mt-2 space-y-2">
                  {data.items.filter(e => expandedRows.has(e.id)).map(entry => (
                    <div key={`exp-${entry.id}`} className="p-3 rounded-lg bg-muted/20 border border-border/40 text-xs space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground font-medium shrink-0">Stack Trace:</span>
                        <pre className="text-foreground font-mono text-[0.65rem] whitespace-pre-wrap overflow-x-auto max-h-32 overflow-y-auto">
                          {entry.stackTrace}
                        </pre>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {entry.resolvedAt && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Resolved:</span>
                            <span className="text-foreground">{formatTimestamp(entry.resolvedAt)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Wifi className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">IP:</span>
                          <span className="text-foreground font-mono">{entry.ipAddress}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">User Agent:</span>
                          <span className="text-foreground">{entry.userAgent}</span>
                        </div>
                        {entry.userId && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">User ID:</span>
                            <span className="text-foreground font-mono">{entry.userId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {data && data.items.length > 0 && (
            <p className="text-[0.65rem] text-muted-foreground mt-3">
              Showing {data.items.length} of {data.total} entries
            </p>
          )}
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationPrevious
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
          <PaginationContent>
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(p => (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={() => setPage(p)}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
          </PaginationContent>
          <PaginationNext
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            className={page === data.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </Pagination>
      )}
    </PageWrapper>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X, Download, ChevronDown, ChevronUp, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  module: string;
  description: string;
  severity: string;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: any;
}

interface AuditLogViewerProps {
  title: string;
  description?: string;
  data: LogEntry[];
  loading?: boolean;
  columns: {
    key: string;
    header: string;
    render?: (item: LogEntry) => React.ReactNode;
    sortable?: boolean;
  }[];
  searchFields?: (keyof LogEntry)[];
  emptyMessage?: string;
  onExport?: () => void;
}

const severityConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  Critical: { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: <AlertTriangle className="w-3 h-3" /> },
  High: { color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: <AlertTriangle className="w-3 h-3" /> },
  Medium: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <Info className="w-3 h-3" /> },
  Warning: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <Info className="w-3 h-3" /> },
  Low: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <Info className="w-3 h-3" /> },
  Info: { color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: <Info className="w-3 h-3" /> },
};

export function AuditLogViewer({
  title,
  description,
  data,
  loading,
  columns,
  searchFields = ['actor', 'action', 'module', 'description'],
  emptyMessage = 'No log entries found',
  onExport,
}: AuditLogViewerProps) {
  const [search, setSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filtered = data.filter(item => {
    if (!search) return true;
    const q = search.toLowerCase();
    return searchFields.some(field => {
      const val = item[field as string];
      return val != null && String(val).toLowerCase().includes(q);
    });
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = String(a[sortKey] ?? '');
    const bVal = String(b[sortKey] ?? '');
    return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const getSeverityDisplay = (severity: string) => {
    const config = severityConfig[severity];
    if (!config) return null;
    return (
      <Badge variant="outline" className={cn('text-[0.65rem] px-1.5 py-0 border gap-1', config.color)}>
        {config.icon}
        {severity}
      </Badge>
    );
  };

  const formatTimestamp = (ts: string) => {
    return new Date(ts).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full h-9 pl-9 pr-8 bg-muted/40 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <ShieldAlert className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {columns.map(col => (
                    <th
                      key={col.key}
                      className={cn(
                        'text-left py-2 px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider',
                        col.sortable && 'cursor-pointer hover:text-foreground select-none'
                      )}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        {col.header}
                        {col.sortable && sortKey === col.key && (
                          sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                    {columns.map(col => (
                      <td key={col.key} className="py-2.5 px-2">
                        {col.key === 'severity'
                          ? getSeverityDisplay(entry.severity)
                          : col.key === 'timestamp'
                            ? <span className="text-xs text-muted-foreground">{formatTimestamp(entry.timestamp)}</span>
                            : col.render
                              ? col.render(entry)
                              : <span className="text-xs">{String(entry[col.key] ?? '')}</span>
                        }
                      </td>
                    ))}
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
          </div>
        )}

        {sorted.length > 0 && (
          <p className="text-[0.65rem] text-muted-foreground mt-3">
            Showing {sorted.length} of {data.length} entries
          </p>
        )}
      </CardContent>
    </Card>
  );
}

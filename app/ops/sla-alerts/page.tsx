'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KPICard } from '@/components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockShipments } from '@/data/mockData';
import {
  Search, X, AlertTriangle, Clock, CheckCircle2,
  TrendingUp, RefreshCw, Filter, ArrowUp,
  Bell, Shield,
} from 'lucide-react';

const SEVERITY_META = {
  Critical: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
  High: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  Medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
};

export default function SLAAlertsPage() {
  const [search, setSearch] = useState('');
  const [sevFilter, setSevFilter] = useState<'All' | 'Critical' | 'High' | 'Medium'>('All');

  const delayedShipments = useMemo(() => {
    const now = new Date();
    return mockShipments
      .filter(s => new Date(s.estimatedDelivery) < now && s.status !== 'Delivered' && s.status !== 'Cancelled')
      .map(s => {
        const estimatedDate = new Date(s.estimatedDelivery);
        const daysOverdue = Math.floor((now.getTime() - estimatedDate.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...s,
          daysOverdue,
          severity: daysOverdue > 5 ? 'Critical' as const : daysOverdue > 2 ? 'High' as const : 'Medium' as const,
        };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, []);

  const filtered = useMemo(() => {
    let data = delayedShipments;
    const q = search.toLowerCase();
    if (q) data = data.filter(s => s.trackingNumber.toLowerCase().includes(q) || s.receiverName.toLowerCase().includes(q) || s.senderName.toLowerCase().includes(q));
    if (sevFilter !== 'All') data = data.filter(s => s.severity === sevFilter);
    return data;
  }, [delayedShipments, search, sevFilter]);

  const stats = useMemo(() => ({
    total: delayedShipments.length,
    critical: delayedShipments.filter(s => s.severity === 'Critical').length,
    high: delayedShipments.filter(s => s.severity === 'High').length,
    medium: delayedShipments.filter(s => s.severity === 'Medium').length,
  }), [delayedShipments]);

  const columns: Column<typeof delayedShipments[0]>[] = [
    {
      key: 'tracking', header: 'Tracking #', sortable: true,
      render: (s) => (
        <div>
          <span className="text-xs font-mono font-semibold text-foreground">{s.trackingNumber}</span>
          <p className="text-[0.6rem] text-muted-foreground">{s.receiverName}</p>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: 'estimatedDelivery', header: 'Est. Delivery', sortable: true,
      render: (s) => <span className="text-xs text-muted-foreground">{new Date(s.estimatedDelivery).toLocaleDateString()}</span>,
    },
    {
      key: 'daysOverdue', header: 'Overdue', sortable: true,
      render: (s) => <span className="text-xs font-bold text-destructive">{s.daysOverdue}d</span>,
    },
    {
      key: 'severity', header: 'Severity', sortable: true,
      render: (s) => {
        const m = SEVERITY_META[s.severity];
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.62rem] font-bold border ${m.bg} ${m.color} ${m.border}`}>
            <AlertTriangle className="w-2.5 h-2.5" />
            {s.severity}
          </span>
        );
      },
    },
    {
      key: 'actions', header: '',
      render: () => (
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Bell className="w-3.5 h-3.5" title="Notify customer" /></button>
          <button className="p-1.5 rounded text-muted-foreground hover:text-sky-400 hover:bg-sky-500/10 transition-colors"><TrendingUp className="w-3.5 h-3.5" title="Escalate" /></button>
        </div>
      ),
    },
  ];

  const criticalLabel = stats.critical > 0 ? `!${stats.critical}` : '0';

  return (
    <PageWrapper
      title="SLA Alerts"
      description={`${delayedShipments.length} shipment(s) exceeding SLA deadlines`}
      actions={
        <div className="flex items-center gap-2">
          {stats.critical > 0 && (
            <Badge variant="destructive" className="text-[0.65rem] px-2 py-0.5 h-auto gap-1">
              <AlertTriangle className="w-3 h-3" /> {stats.critical} Critical
            </Badge>
          )}
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8"><RefreshCw className="w-3.5 h-3.5" /> Refresh</Button>
        </div>
      }
    >
      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="SLA Breaches" value={stats.total} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" />
        <KPICard title="Critical" value={stats.critical} icon={<Shield className="w-5 h-5" />} iconColor="red" />
        <KPICard title="High" value={stats.high} icon={<ArrowUp className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Medium" value={stats.medium} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
      </div>

      {delayedShipments.length === 0 ? (
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardContent className="py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-success" />
            </div>
            <p className="text-[0.92rem] font-semibold text-foreground">All shipments on track!</p>
            <p className="text-[0.78rem] text-muted-foreground mt-1">No SLA breaches detected</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-card border border-border/60 shadow-soft mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input type="text" placeholder="Search tracking ID or customer..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.82rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 transition-all" />
                  {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
                </div>
                {(['All', 'Critical', 'High', 'Medium'] as const).map(s => (
                  <button key={s} onClick={() => setSevFilter(s)}
                    className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold border transition-all ${sevFilter === s ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'}`}
                  >{s}</button>
                ))}
              </div>
            </CardContent>
          </Card>
          <DataTable data={filtered} columns={columns} pageSize={15} searchKey="trackingNumber" />
        </>
      )}
    </PageWrapper>
  );
}

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { portService } from '@/services/port/portService';
import type { PortDashboardStats } from '@/types/port';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';
import { cn, formatDate } from '@/lib/utils';
import { exportToCSV } from '@/lib/export-utils';
import { toast } from 'sonner';
import { BarChart3, FileText, Download, Eye, Search, X, RotateCcw, Ship, Anchor, DollarSign, TrendingUp, TrendingDown, Clock, Package, AlertTriangle, Printer, PieChart, LineChart, Activity, CalendarDays, RefreshCw } from 'lucide-react';

const periodOptions = ['All', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function SimpleBarChart({ data, dataKey, labelKey, color }: { data: any[]; dataKey: string; labelKey: string; color: string }) {
  const max = Math.max(...data.map(d => d[dataKey]), 1);
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${(d[dataKey] / max) * 100}%`, backgroundColor: color }} />
          <span className="text-[0.6rem] text-muted-foreground">{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ icon, label, value, sub, trend, positive }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; trend?: string; positive?: boolean;
}) {
  return (
    <Card className="shadow-soft hover:border-primary/25 transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</CardTitle>
        <div className="w-8 h-8 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-center text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-extrabold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        {trend && (
          <span className={cn('inline-flex items-center gap-0.5 text-xs font-bold mt-1', positive ? 'text-emerald-400' : 'text-red-400')}>
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [reportsData, setReportsData] = useState<any>(null);
  const [vessels, setVessels] = useState<any[]>([]);
  const [charges, setCharges] = useState<any[]>([]);
  const [cargoOps, setCargoOps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reports, vesselData, chargeData, cargoData] = await Promise.all([
        portService.getReportsData(),
        portService.listVessels(),
        portService.listCharges(),
        portService.listCargoOps(),
      ]);
      setReportsData(reports);
      setVessels(vesselData);
      setCharges(chargeData);
      setCargoOps(cargoData);
    } catch {
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const kpis = useMemo(() => {
    if (!reportsData) return null;
    const { vesselSummary, cargoThroughput, berthUtilization, revenue, performance } = reportsData;
    return [
      { label: 'Vessels This Month', value: vesselSummary.total, icon: <Ship className="w-5 h-5" />, iconColor: 'cyan' as const },
      { label: 'Cargo Volume (tons)', value: cargoThroughput.totalWeight.toLocaleString(), icon: <Package className="w-5 h-5" />, iconColor: 'indigo' as const },
      { label: 'Avg Turnaround (hours)', value: performance.avgTurnaround, icon: <Clock className="w-5 h-5" />, iconColor: 'teal' as const },
      { label: 'Revenue', value: formatCurrency(revenue.total), icon: <DollarSign className="w-5 h-5" />, iconColor: 'green' as const },
      { label: 'Berth Utilization', value: `${berthUtilization.avgOccupancyRate}%`, icon: <Anchor className="w-5 h-5" />, iconColor: 'amber' as const },
      { label: 'Customs Clearance Rate', value: `${reportsData.customsClearanceRate ?? 94}%`, icon: <Activity className="w-5 h-5" />, iconColor: 'red' as const },
    ];
  }, [reportsData]);

  const vesselMetrics = useMemo(() => {
    if (!reportsData) return { arrived: 0, departed: 0, delayed: 0, total: 0 };
    return reportsData.vesselSummary;
  }, [reportsData]);

  const chargesByType = useMemo(() => {
    const grouped: Record<string, { count: number; total: number; collected: number; pending: number }> = {};
    charges.forEach(c => {
      const key = c.type || 'Other';
      if (!grouped[key]) grouped[key] = { count: 0, total: 0, collected: 0, pending: 0 };
      grouped[key].count++;
      grouped[key].total += c.amount;
      if (c.status === 'Collected') grouped[key].collected += c.amount;
      else if (c.status === 'Pending' || c.status === 'Overdue') grouped[key].pending += c.amount;
    });
    return Object.entries(grouped).map(([type, data]) => ({ type, ...data }));
  }, [charges]);

  const cargoByType = useMemo(() => {
    const grouped: Record<string, { count: number; totalWeight: number; totalDuration: number }> = {};
    cargoOps.forEach(op => {
      const key = op.type || 'Other';
      if (!grouped[key]) grouped[key] = { count: 0, totalWeight: 0, totalDuration: 0 };
      grouped[key].count++;
      grouped[key].totalWeight += op.cargoWeight || 0;
      grouped[key].totalDuration += op.duration || 0;
    });
    return Object.entries(grouped).map(([type, data]) => ({
      type,
      count: data.count,
      totalWeight: data.totalWeight,
      avgDuration: data.count > 0 ? Math.round((data.totalDuration / data.count) * 10) / 10 : 0,
    }));
  }, [cargoOps]);

  const vesselTableData = useMemo(() => {
    return vessels.map(v => ({
      name: v.name,
      imo: v.imo,
      status: v.status,
      calls: v.calls ?? 1,
      delays: v.delays ?? 0,
      avgTurnaround: v.avgTurnaround ?? '-',
    }));
  }, [vessels]);

  const handleExportVessels = () => {
    exportToCSV(vesselTableData, 'vessel-performance', [
      { key: 'name', label: 'Vessel Name' },
      { key: 'imo', label: 'IMO' },
      { key: 'status', label: 'Status' },
      { key: 'calls', label: 'Calls' },
      { key: 'delays', label: 'Delays' },
      { key: 'avgTurnaround', label: 'Avg Turnaround' },
    ]);
    toast.success('Vessel data exported');
  };

  const handleExportRevenue = () => {
    exportToCSV(chargesByType, 'revenue-analysis', [
      { key: 'type', label: 'Category' },
      { key: 'count', label: 'Count' },
      { key: 'total', label: 'Total Amount' },
      { key: 'collected', label: 'Collected' },
      { key: 'pending', label: 'Pending' },
    ]);
    toast.success('Revenue data exported');
  };

  const handleExportCargo = () => {
    exportToCSV(cargoByType, 'cargo-analytics', [
      { key: 'type', label: 'Operation Type' },
      { key: 'count', label: 'Count' },
      { key: 'totalWeight', label: 'Total Weight' },
      { key: 'avgDuration', label: 'Avg Duration (hrs)' },
    ]);
    toast.success('Cargo data exported');
  };

  const handleExportAll = () => {
    handleExportVessels();
    handleExportRevenue();
    handleExportCargo();
  };

  if (error) {
    return (
      <PageWrapper title="Port Operations Reports" description="Cargo throughput, delay analysis, revenue and berth utilization reports">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Failed to load reports</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">{error}</p>
          <Button variant="outline" onClick={fetchAll} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Port Operations Reports"
      description="Cargo throughput, delay analysis, revenue and berth utilization reports"
      actions={
        <div className="flex items-center gap-2">
          <select
            value={periodFilter}
            onChange={e => setPeriodFilter(e.target.value)}
            className="h-9 bg-muted/40 border border-border rounded-[7px] text-xs text-foreground outline-none focus:border-primary/50 px-2"
          >
            {periodOptions.map(p => (
              <option key={p} value={p}>{p === 'All' ? 'All Periods' : p}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs rounded-[7px]" onClick={handleExportAll}>
            <Download className="w-3.5 h-3.5" />
            Export All
          </Button>
          <Button size="sm" className="h-9 bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg rounded-[9px] gap-2">
            <BarChart3 className="w-4 h-4" />
            Generate Report
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-[7px]" onClick={fetchAll}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      }
    >
      {/* KPI Row */}
      {loading ? (
        <LoadingState rows={1} message="Loading KPIs..." />
      ) : kpis ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
          {kpis.map(kpi => (
            <KPICard key={kpi.label} title={kpi.label} value={kpi.value} icon={kpi.icon} iconColor={kpi.iconColor} />
          ))}
        </div>
      ) : null}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vessel-performance">Vessel Performance</TabsTrigger>
            <TabsTrigger value="revenue-analysis">Revenue Analysis</TabsTrigger>
            <TabsTrigger value="cargo-analytics">Cargo Analytics</TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-0">
          {loading ? (
            <LoadingState rows={4} message="Loading report data..." />
          ) : !reportsData ? (
            <EmptyState
              icon={<BarChart3 className="w-8 h-8 text-muted-foreground" />}
              title="No report data available"
              description="Report data will appear here once generated"
            />
          ) : (
            <div className="space-y-6">
              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="shadow-soft">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Ship className="w-4 h-4 text-cyan-400" />
                      Monthly Vessel Calls
                    </CardTitle>
                    <CardDescription className="text-xs">Last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SimpleBarChart
                      data={reportsData.monthlyTrend || []}
                      dataKey="vesselCalls"
                      labelKey="month"
                      color="#06b6d4"
                    />
                  </CardContent>
                </Card>
                <Card className="shadow-soft">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      Monthly Revenue
                    </CardTitle>
                    <CardDescription className="text-xs">Last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SimpleBarChart
                      data={reportsData.monthlyTrend || []}
                      dataKey="revenue"
                      labelKey="month"
                      color="#22c55e"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <SummaryCard
                  icon={<Ship className="w-4 h-4" />}
                  label="Vessel Summary"
                  value={reportsData.vesselSummary.total.toString()}
                  sub={`${reportsData.vesselSummary.arrived} arrived · ${reportsData.vesselSummary.departed} departed · ${reportsData.vesselSummary.delayed} delayed`}
                  trend={reportsData.vesselSummary.total > 0 ? '+12%' : undefined}
                  positive
                />
                <SummaryCard
                  icon={<Package className="w-4 h-4" />}
                  label="Cargo Throughput"
                  value={`${reportsData.cargoThroughput.totalWeight.toLocaleString()} tons`}
                  sub={`${reportsData.cargoThroughput.completed} of ${reportsData.cargoThroughput.totalOps} ops completed`}
                  trend="+8.2%"
                  positive
                />
                <SummaryCard
                  icon={<Anchor className="w-4 h-4" />}
                  label="Berth Utilization"
                  value={`${reportsData.berthUtilization.avgOccupancyRate}%`}
                  sub={`${reportsData.berthUtilization.occupied} of ${reportsData.berthUtilization.total} berths occupied`}
                  trend="-3%"
                  positive={false}
                />
                <SummaryCard
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Revenue"
                  value={formatCurrency(reportsData.revenue.total)}
                  sub={`${formatCurrency(reportsData.revenue.collected)} collected · ${formatCurrency(reportsData.revenue.pending)} pending`}
                  trend="+15.3%"
                  positive
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* Vessel Performance Tab */}
        <TabsContent value="vessel-performance" className="mt-0">
          {loading ? (
            <LoadingState rows={6} message="Loading vessel data..." />
          ) : vessels.length === 0 ? (
            <EmptyState
              icon={<Ship className="w-8 h-8 text-muted-foreground" />}
              title="No vessel data"
              description="Vessel performance data will appear here once available"
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 px-4 py-2 bg-card border border-border/60 rounded-lg shadow-soft text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Ship className="w-3.5 h-3.5" />{vesselMetrics.total} vessels</span>
                  <span className="w-px h-3 bg-border/50" />
                  <span className="flex items-center gap-1.5 text-emerald-400"><TrendingUp className="w-3.5 h-3.5" />{vesselMetrics.arrived} arrived</span>
                  <span className="w-px h-3 bg-border/50" />
                  <span className="flex items-center gap-1.5 text-blue-400"><Ship className="w-3.5 h-3.5" />{vesselMetrics.departed} departed</span>
                  <span className="w-px h-3 bg-border/50" />
                  <span className="flex items-center gap-1.5 text-red-400"><AlertTriangle className="w-3.5 h-3.5" />{vesselMetrics.delayed} delayed</span>
                </div>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded-[7px]" onClick={handleExportVessels}>
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </Button>
              </div>
              <Card className="shadow-soft border-border/60">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/20 border-b border-border/40">
                      <tr>
                        <th className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-widest text-left px-4 py-3">Vessel Name</th>
                        <th className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-widest text-left px-4 py-3">IMO</th>
                        <th className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-widest text-left px-4 py-3">Status</th>
                        <th className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-widest text-left px-4 py-3">Calls</th>
                        <th className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-widest text-left px-4 py-3">Delays</th>
                        <th className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-widest text-left px-4 py-3">Avg Turnaround</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vesselTableData.map((v, i) => (
                        <tr key={v.imo + i} className="border-b border-border/25 hover:bg-primary/[0.03] transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-foreground">{v.name}</td>
                          <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{v.imo}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-xs">{v.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">{v.calls}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={cn(v.delays > 0 ? 'text-red-400' : 'text-muted-foreground')}>{v.delays}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{v.avgTurnaround}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Revenue Analysis Tab */}
        <TabsContent value="revenue-analysis" className="mt-0">
          {loading ? (
            <LoadingState rows={5} message="Loading revenue data..." />
          ) : chargesByType.length === 0 ? (
            <EmptyState
              icon={<DollarSign className="w-8 h-8 text-muted-foreground" />}
              title="No revenue data"
              description="Revenue analysis data will appear here once charges are recorded"
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 px-4 py-2 bg-card border border-border/60 rounded-lg shadow-soft text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" />{chargesByType.length} charge types</span>
                  <span className="w-px h-3 bg-border/50" />
                  <span className="flex items-center gap-1.5">{charges.length} total transactions</span>
                  <span className="w-px h-3 bg-border/50" />
                  <span className="flex items-center gap-1.5 text-emerald-400"><TrendingUp className="w-3.5 h-3.5" />{formatCurrency(charges.reduce((s, c) => s + c.amount, 0))} total</span>
                </div>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded-[7px]" onClick={handleExportRevenue}>
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </Button>
              </div>
              <Card className="shadow-soft border-border/60">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/20 border-b border-border/40">
                      <tr>
                        <th className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-widest text-left px-4 py-3">Category</th>
                        <th className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-widest text-left px-4 py-3">Count</th>
                        <th className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-widest text-left px-4 py-3">Total Amount</th>
                        <th className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-widest text-left px-4 py-3">Collected</th>
                        <th className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-widest text-left px-4 py-3">Pending</th>
                        <th className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-widest text-left px-4 py-3">Collection Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chargesByType.map((r, i) => {
                        const rate = r.total > 0 ? Math.round((r.collected / r.total) * 100) : 0;
                        return (
                          <tr key={r.type + i} className="border-b border-border/25 hover:bg-primary/[0.03] transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-foreground">{r.type}</td>
                            <td className="px-4 py-3 text-sm text-foreground">{r.count}</td>
                            <td className="px-4 py-3 text-sm font-mono text-foreground">{formatCurrency(r.total)}</td>
                            <td className="px-4 py-3 text-sm font-mono text-emerald-400">{formatCurrency(r.collected)}</td>
                            <td className="px-4 py-3 text-sm font-mono text-amber-400">{formatCurrency(r.pending)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden min-w-[60px]">
                                  <div className={cn('h-full rounded-full', rate > 80 ? 'bg-emerald-400' : rate > 50 ? 'bg-amber-400' : 'bg-red-400')} style={{ width: `${rate}%` }} />
                                </div>
                                <span className="text-xs font-medium tabular-nums w-10 text-right">{rate}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Cargo Analytics Tab */}
        <TabsContent value="cargo-analytics" className="mt-0">
          {loading ? (
            <LoadingState rows={5} message="Loading cargo data..." />
          ) : cargoByType.length === 0 ? (
            <EmptyState
              icon={<Package className="w-8 h-8 text-muted-foreground" />}
              title="No cargo data"
              description="Cargo analytics data will appear here once operations are recorded"
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 px-4 py-2 bg-card border border-border/60 rounded-lg shadow-soft text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" />{cargoByType.length} operation types</span>
                  <span className="w-px h-3 bg-border/50" />
                  <span className="flex items-center gap-1.5">{cargoOps.length} total operations</span>
                  <span className="w-px h-3 bg-border/50" />
                  <span className="flex items-center gap-1.5 text-indigo-400"><Activity className="w-3.5 h-3.5" />{cargoOps.reduce((s, o) => s + (o.cargoWeight || 0), 0).toLocaleString()} tons moved</span>
                </div>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded-[7px]" onClick={handleExportCargo}>
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </Button>
              </div>
              <Card className="shadow-soft border-border/60">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/20 border-b border-border/40">
                      <tr>
                        <th className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-widest text-left px-4 py-3">Operation Type</th>
                        <th className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-widest text-left px-4 py-3">Count</th>
                        <th className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-widest text-left px-4 py-3">Total Weight</th>
                        <th className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-widest text-left px-4 py-3">Avg Duration (hrs)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cargoByType.map((r, i) => (
                        <tr key={r.type + i} className="border-b border-border/25 hover:bg-primary/[0.03] transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-foreground">{r.type}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{r.count}</td>
                          <td className="px-4 py-3 text-sm font-mono text-foreground">{r.totalWeight.toLocaleString()} tons</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{r.avgDuration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

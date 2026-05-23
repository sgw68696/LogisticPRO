'use client';

import { useState, useEffect, useMemo } from 'react';
import { warehouseService } from '@/services/warehouseService';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, formatDate } from '@/lib/utils';
import { exportToCSV } from '@/lib/export-utils';
import { toast } from 'sonner';
import { BarChart3, FileText, Download, RefreshCw, TrendingUp, TrendingDown, Package, Truck, AlertTriangle, DollarSign, Activity, Clock, Box, Warehouse as WarehouseIcon } from 'lucide-react';

interface ReportsData {
  inboundSummary: { total: number; completed: number; totalItems: number; pending: number };
  outboundSummary: { total: number; completed: number; totalItems: number; pending: number };
  damageSummary: { total: number; bySeverity: Record<string, number>; approved: number };
  warehouseUtilization: { name: string; capacity: number; currentStock: number; utilization: number }[];
  monthlyTrend: { month: string; inbound: number; outbound: number; damage: number }[];
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

function UtilizationBar({ value }: { value: number }) {
  const color = value > 90 ? 'bg-red-500' : value > 75 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

const severityColors: Record<string, string> = {
  Minor: 'bg-blue-500/10 text-blue-400',
  Moderate: 'bg-amber-500/10 text-amber-400',
  Severe: 'bg-orange-500/10 text-orange-400',
  Critical: 'bg-red-500/10 text-red-400',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('6m');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await warehouseService.getReportsData();
      setReports(data as ReportsData);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleExport = (tab: string) => {
    if (!reports) return;
    const filename = `warehouse-${tab}-report`;
    switch (tab) {
      case 'inbound': {
        const data = [{ Total: reports.inboundSummary.total, Completed: reports.inboundSummary.completed, 'Total Items': reports.inboundSummary.totalItems, Pending: reports.inboundSummary.pending }];
        exportToCSV(data, filename, [
          { key: 'Total', label: 'Total' }, { key: 'Completed', label: 'Completed' },
          { key: 'Total Items', label: 'Total Items' }, { key: 'Pending', label: 'Pending' },
        ]);
        break;
      }
      case 'outbound': {
        const data = [{ Total: reports.outboundSummary.total, Completed: reports.outboundSummary.completed, 'Total Items': reports.outboundSummary.totalItems, Pending: reports.outboundSummary.pending }];
        exportToCSV(data, filename, [
          { key: 'Total', label: 'Total' }, { key: 'Completed', label: 'Completed' },
          { key: 'Total Items', label: 'Total Items' }, { key: 'Pending', label: 'Pending' },
        ]);
        break;
      }
      case 'damage': {
        const data: Record<string, unknown>[] = [{ Total: reports.damageSummary.total, ...reports.damageSummary.bySeverity, Approved: reports.damageSummary.approved }];
        exportToCSV(data, filename, [
          { key: 'Total', label: 'Total' }, { key: 'Minor', label: 'Minor' },
          { key: 'Moderate', label: 'Moderate' }, { key: 'Severe', label: 'Severe' },
          { key: 'Critical', label: 'Critical' }, { key: 'Approved', label: 'Approved' },
        ]);
        break;
      }
      default: {
        const data = reports.monthlyTrend;
        exportToCSV(data, filename, [
          { key: 'month', label: 'Month' }, { key: 'inbound', label: 'Inbound' },
          { key: 'outbound', label: 'Outbound' }, { key: 'damage', label: 'Damage' },
        ]);
        break;
      }
    }
    toast.success(`${tab.charAt(0).toUpperCase() + tab.slice(1)} report exported`);
  };

  if (loading) {
    return (
      <PageWrapper title="Reports" description="Warehouse analytics and reports">
        <LoadingState rows={8} message="Loading reports..." />
      </PageWrapper>
    );
  }

  if (!reports) {
    return (
      <PageWrapper title="Reports" description="Warehouse analytics and reports">
        <EmptyState
          icon={<BarChart3 className="w-8 h-8" />}
          title="No report data"
          description="Unable to load report data. Try refreshing."
          action={<Button variant="outline" size="sm" className="gap-1.5" onClick={fetchReports}><RefreshCw className="w-3.5 h-3.5" /> Refresh</Button>}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Reports"
      description="Warehouse analytics and reports"
      actions={
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[100px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={fetchReports}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <KPICard title="Total Inbound" value={reports.inboundSummary.totalItems.toLocaleString()} icon={<Package className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Total Outbound" value={reports.outboundSummary.totalItems.toLocaleString()} icon={<Truck className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Damage Reports" value={reports.damageSummary.total} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" />
        <KPICard title="Pending Orders" value={reports.inboundSummary.pending + reports.outboundSummary.pending} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Warehouses" value={reports.warehouseUtilization.length} icon={<WarehouseIcon className="w-5 h-5" />} iconColor="indigo" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="inbound" className="text-xs">Inbound Analysis</TabsTrigger>
              <TabsTrigger value="outbound" className="text-xs">Outbound Analysis</TabsTrigger>
              <TabsTrigger value="damage" className="text-xs">Damage Analysis</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleExport(activeTab)}>
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </div>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Monthly Trend</CardTitle>
                <CardDescription className="text-xs">Inbound / Outbound / Damage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <p className="text-xs font-semibold text-green-400 mb-3">Inbound</p>
                    <SimpleBarChart data={reports.monthlyTrend} dataKey="inbound" labelKey="month" color="oklch(0.627 0.194 149.214)" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-cyan-400 mb-3">Outbound</p>
                    <SimpleBarChart data={reports.monthlyTrend} dataKey="outbound" labelKey="month" color="oklch(0.715 0.143 215.221)" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-400 mb-3">Damage</p>
                    <SimpleBarChart data={reports.monthlyTrend} dataKey="damage" labelKey="month" color="oklch(0.637 0.237 25.331)" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Inbound Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total GRNs</span>
                    <span className="text-sm font-semibold">{reports.inboundSummary.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Completed</span>
                    <span className="text-sm font-semibold text-green-400">{reports.inboundSummary.completed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Pending</span>
                    <span className="text-sm font-semibold text-amber-400">{reports.inboundSummary.pending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total Items</span>
                    <span className="text-sm font-semibold">{reports.inboundSummary.totalItems.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Outbound Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total GDNs</span>
                    <span className="text-sm font-semibold">{reports.outboundSummary.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Delivered</span>
                    <span className="text-sm font-semibold text-green-400">{reports.outboundSummary.completed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Pending</span>
                    <span className="text-sm font-semibold text-amber-400">{reports.outboundSummary.pending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total Items</span>
                    <span className="text-sm font-semibold">{reports.outboundSummary.totalItems.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Damage Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(reports.damageSummary.bySeverity).map(([sev, count]) => (
                    <div key={sev} className="text-center p-3 rounded-lg bg-muted/30">
                      <p className={cn('text-lg font-bold', severityColors[sev] || '')}>{count}</p>
                      <p className="text-[0.6rem] text-muted-foreground mt-1">{sev}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Warehouse Utilization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reports.warehouseUtilization.map(w => (
                  <div key={w.name}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium">{w.name}</span>
                      <span className="text-xs text-muted-foreground">{w.currentStock.toLocaleString()} / {w.capacity.toLocaleString()} ({w.utilization}%)</span>
                    </div>
                    <UtilizationBar value={w.utilization} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inbound" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Inbound Analysis</CardTitle>
                <CardDescription className="text-xs">GRN inbound summary breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-semibold">Metric</th>
                        <th className="text-right p-3 font-semibold">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="p-3">Total GRNs</td>
                        <td className="p-3 text-right font-semibold">{reports.inboundSummary.total}</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-3">Completed</td>
                        <td className="p-3 text-right font-semibold text-green-400">{reports.inboundSummary.completed}</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-3">Pending</td>
                        <td className="p-3 text-right font-semibold text-amber-400">{reports.inboundSummary.pending}</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-3">Total Items Received</td>
                        <td className="p-3 text-right font-semibold">{reports.inboundSummary.totalItems.toLocaleString()}</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-3">Completion Rate</td>
                        <td className="p-3 text-right font-semibold">{reports.inboundSummary.total ? Math.round((reports.inboundSummary.completed / reports.inboundSummary.total) * 100) : 0}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outbound" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Outbound Analysis</CardTitle>
                <CardDescription className="text-xs">GDN outbound summary breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-semibold">Metric</th>
                        <th className="text-right p-3 font-semibold">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="p-3">Total GDNs</td>
                        <td className="p-3 text-right font-semibold">{reports.outboundSummary.total}</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-3">Delivered</td>
                        <td className="p-3 text-right font-semibold text-green-400">{reports.outboundSummary.completed}</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-3">Pending</td>
                        <td className="p-3 text-right font-semibold text-amber-400">{reports.outboundSummary.pending}</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-3">Total Items Dispatched</td>
                        <td className="p-3 text-right font-semibold">{reports.outboundSummary.totalItems.toLocaleString()}</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-3">Delivery Rate</td>
                        <td className="p-3 text-right font-semibold">{reports.outboundSummary.total ? Math.round((reports.outboundSummary.completed / reports.outboundSummary.total) * 100) : 0}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="damage" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Damage Analysis</CardTitle>
                <CardDescription className="text-xs">Damage reports by severity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-semibold">Severity</th>
                        <th className="text-right p-3 font-semibold">Count</th>
                        <th className="text-right p-3 font-semibold">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(reports.damageSummary.bySeverity).map(([sev, count]) => (
                        <tr key={sev} className="border-t border-border">
                          <td className="p-3">
                            <Badge variant="outline" className={cn('text-[0.6rem] font-semibold', severityColors[sev])}>{sev}</Badge>
                          </td>
                          <td className="p-3 text-right font-semibold">{count}</td>
                          <td className="p-3 text-right text-muted-foreground">
                            {reports.damageSummary.total ? Math.round((count / reports.damageSummary.total) * 100) : 0}%
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t border-border bg-muted/30">
                        <td className="p-3 font-semibold">Approved / Compensated</td>
                        <td className="p-3 text-right font-semibold text-green-400">{reports.damageSummary.approved}</td>
                        <td className="p-3 text-right text-muted-foreground">
                          {reports.damageSummary.total ? Math.round((reports.damageSummary.approved / reports.damageSummary.total) * 100) : 0}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { warehouseService } from '@/services/warehouseService';
import type { WarehouseDashboardStats, GoodsReceivedNote, GoodsDispatchNote, WarehouseNotification } from '@/types/warehouse';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatDate } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Package, TrendingUp, AlertCircle, CheckCircle, Truck, MapPin, FileCheck,
  AlertTriangle, Warehouse as WarehouseIcon, ArrowRight, RefreshCw, Activity,
  DollarSign, Box, ClipboardList, Clock, Bell, Ship, BarChart3
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  entityType: string;
  icon: typeof Package;
  iconColor: string;
}

const grnStatusColors: Record<string, string> = {
  Draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Expected: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Received: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'In Inspection': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Putaway: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const gdnStatusColors: Record<string, string> = {
  Draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Picking: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Packed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Loading: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Dispatched: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const notifSeverityColors: Record<string, string> = {
  Info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AgentDashboard() {
  const [stats, setStats] = useState<WarehouseDashboardStats | null>(null);
  const [grns, setGrns] = useState<GoodsReceivedNote[]>([]);
  const [gdns, setGdns] = useState<GoodsDispatchNote[]>([]);
  const [notifications, setNotifications] = useState<WarehouseNotification[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, grnsData, gdnsData, notifsData, activityData] = await Promise.all([
        warehouseService.getDashboardStats(),
        warehouseService.listGRNs({ status: 'All' }),
        warehouseService.listGDNs({ status: 'All' }),
        warehouseService.listNotifications(),
        warehouseService.getActivities({ limit: 10 }),
      ]);
      setStats(statsData);
      const recentGrns = (grnsData as GoodsReceivedNote[])
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setGrns(recentGrns);
      const recentGdns = (gdnsData as GoodsDispatchNote[])
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setGdns(recentGdns);
      setNotifications((notifsData as WarehouseNotification[]).slice(0, 5));

      const activityIconMap: Record<string, typeof Package> = {
        GRN: FileCheck, GDN: Truck, Damage: AlertTriangle, Shipment: Package, Stock: Package, System: Bell,
      };
      const activityColorMap: Record<string, string> = {
        GRN: 'text-cyan-400', GDN: 'text-amber-400', Damage: 'text-red-400',
        Shipment: 'text-indigo-400', Stock: 'text-emerald-400', System: 'text-blue-400',
      };
      setActivities(
        (activityData as any[]).slice(0, 8).map((a) => ({
          id: a.id,
          type: a.type,
          title: a.title,
          description: a.description,
          timestamp: a.timestamp,
          entityType: a.entityType,
          icon: activityIconMap[a.entityType] || Package,
          iconColor: activityColorMap[a.entityType] || 'text-muted-foreground',
        }))
      );
      setLastUpdated(new Date().toISOString());
    } catch {
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !stats) {
    return (
      <PageWrapper title="Dashboard">
        <LoadingState rows={12} message="Loading dashboard..." />
      </PageWrapper>
    );
  }

  if (error && !stats) {
    return (
      <PageWrapper title="Dashboard">
        <EmptyState
          icon={<AlertCircle className="w-8 h-8" />}
          title="Failed to load dashboard"
          description={error}
          action={<Button variant="outline" size="sm" className="gap-1.5" onClick={fetchData}><RefreshCw className="w-3.5 h-3.5" /> Retry</Button>}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Warehouse Dashboard"
      description="Real-time overview of warehouse operations"
      actions={
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[0.65rem] text-muted-foreground">
              Last updated: {formatDate(lastUpdated, 'datetime')}
            </span>
          )}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      }
    >
      {loading && <LoadingState rows={3} message="Refreshing..." />}

      {!loading && stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
            <KPICard title="GRNs Today" value={stats.grnsToday} icon={<Package className="w-5 h-5" />} iconColor="cyan" />
            <KPICard title="Pending Outbound" value={stats.pendingOutbound} icon={<Truck className="w-5 h-5" />} iconColor="amber" />
            <KPICard title="Inventory Value" value={formatCurrency(stats.inventoryValue)} icon={<DollarSign className="w-5 h-5" />} iconColor="green" />
            <KPICard title="Stock Alerts" value={stats.stockAlerts} icon={<AlertCircle className="w-5 h-5" />} iconColor="red" />
            <KPICard title="Damaged Goods" value={stats.damagedGoods} icon={<AlertTriangle className="w-5 h-5" />} iconColor="amber" />
            <KPICard title="Active Shipments" value={stats.activeShipments} icon={<Box className="w-5 h-5" />} iconColor="indigo" />
            <KPICard title="Space Utilization" value={`${stats.spaceUtilization}%`} icon={<Activity className="w-5 h-5" />} iconColor="teal" />
            <KPICard title="Delayed Dispatches" value={stats.delayedDispatches} icon={<Clock className="w-5 h-5" />} iconColor="red" />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button size="sm" className="gap-1.5"><Package className="w-4 h-4" /> New GRN</Button>
            <Button size="sm" variant="outline" className="gap-1.5"><Truck className="w-4 h-4" /> New GDN</Button>
            <Button size="sm" variant="outline" className="gap-1.5"><WarehouseIcon className="w-4 h-4" /> View Stock</Button>
            <Button size="sm" variant="outline" className="gap-1.5"><BarChart3 className="w-4 h-4" /> Reports</Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-cyan-400" />
                    Recent GRNs
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                  </Button>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {grns.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">No GRNs found</div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {grns.map((grn) => (
                        <div key={grn.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{grn.grnId}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span>{grn.vendor}</span>
                              <span>·</span>
                              <span>{grn.totalItems} items</span>
                              <span>·</span>
                              <span>{formatDate(grn.createdAt)}</span>
                            </div>
                          </div>
                          <Badge className={cn('ml-3 text-[0.65rem] font-semibold', grnStatusColors[grn.status] || 'bg-gray-500/10 text-gray-400')}>
                            {grn.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    Pending Outbound
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                  </Button>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {gdns.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">No outbound dispatches found</div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {gdns.map((gdn) => (
                        <div key={gdn.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{gdn.gdnId}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span>{gdn.customer}</span>
                              <span>·</span>
                              <span>{gdn.totalItems} items</span>
                              <span>·</span>
                              <span>{formatDate(gdn.createdAt)}</span>
                            </div>
                          </div>
                          <Badge className={cn('ml-3 text-[0.65rem] font-semibold', gdnStatusColors[gdn.status] || 'bg-gray-500/10 text-gray-400')}>
                            {gdn.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    Stock Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {notifications.filter((n) => n.type === 'Stock Alert').length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">No stock alerts</div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {notifications.filter((n) => n.type === 'Stock Alert').map((n) => (
                        <div key={n.id} className="px-5 py-3 hover:bg-muted/20 transition-colors">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-foreground">{n.title}</p>
                              <p className="text-[0.65rem] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Activity Feed
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {activities.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">No recent activity</div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {activities.map((a) => {
                        const Icon = a.icon;
                        return (
                          <div key={a.id} className="flex items-start gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                            <div className={cn('mt-0.5', a.iconColor)}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-foreground truncate">{a.title}</p>
                              <p className="text-[0.6rem] text-muted-foreground mt-0.5 line-clamp-1">{a.description}</p>
                              <p className="text-[0.55rem] text-muted-foreground/60 mt-0.5">{formatDate(a.timestamp, 'datetime')}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {notifications.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">No notifications</div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {notifications.map((n) => (
                        <div key={n.id} className="flex items-start gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                          <div className={cn('mt-0.5', n.severity === 'Critical' ? 'text-red-400' : n.severity === 'Warning' ? 'text-amber-400' : 'text-blue-400')}>
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-foreground truncate">{n.title}</p>
                              <Badge className={cn('text-[0.55rem] px-1.5 py-0', notifSeverityColors[n.severity])}>{n.severity}</Badge>
                            </div>
                            <p className="text-[0.6rem] text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                            <p className="text-[0.55rem] text-muted-foreground/60 mt-0.5">{formatDate(n.timestamp, 'datetime')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </PageWrapper>
  );
}

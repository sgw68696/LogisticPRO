'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { portService } from '@/services/port/portService';
import type { PortDashboardStats, Vessel, Flight, PortNotification } from '@/types/port';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { BarChart3, Ship, Plane, Anchor, Container, Package, Clock, AlertTriangle, Shield, DollarSign, Waves, TrendingUp, TrendingDown, Activity, Bell, Sailboat, Truck, RefreshCw, Eye, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

const vesselStatusColors: Record<string, string> = {
  Expected: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Arrived: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Berthing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Docked: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Loading: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Unloading: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Sailing: 'bg-green-500/10 text-green-400 border-green-500/20',
  Departed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Delayed: 'bg-red-500/10 text-red-400 border-red-500/20',
  Anchored: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const severityColors: Record<string, string> = {
  Info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  Emergency: 'bg-red-600/10 text-red-500 border-red-600/20',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export default function PortDashboard() {
  const [stats, setStats] = useState<PortDashboardStats | null>(null);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [notifications, setNotifications] = useState<PortNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, vesselData, flightData, notifData] = await Promise.all([
        portService.getDashboardStats(),
        portService.listVessels({ status: 'Arrived' }),
        portService.listFlights({ status: 'Arrived' }),
        portService.listNotifications({ unread: true }),
      ]);
      setStats(statsData);
      setVessels(vesselData);
      setFlights(flightData);
      setNotifications(notifData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading && !stats) {
    return (
      <PageWrapper title="Port Operations Dashboard" description="Real-time port activity overview">
        <LoadingState rows={6} message="Loading dashboard..." />
      </PageWrapper>
    );
  }

  if (!stats) {
    return (
      <PageWrapper title="Port Operations Dashboard" description="Real-time port activity overview">
        <EmptyState
          icon={<BarChart3 className="w-8 h-8 text-muted-foreground" />}
          title="No dashboard data"
          description="Dashboard data will appear here once available"
          action={
            <Button variant="outline" onClick={fetchAll} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          }
        />
      </PageWrapper>
    );
  }

  const s = stats;

  return (
    <PageWrapper
      title="Port Operations Dashboard"
      description="Real-time port activity overview"
      actions={
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">Last updated: {lastUpdated}</span>
          )}
          <Button variant="outline" size="sm" onClick={fetchAll} className="gap-2 rounded-[9px]">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          <KPICard title="Vessels Today" value={s.vesselsArrivingToday} icon={<Ship className="w-5 h-5" />} iconColor="cyan" description="Arriving today" />
          <KPICard title="Flights Today" value={s.flightsArrivingToday} icon={<Plane className="w-5 h-5" />} iconColor="indigo" description="Arriving today" />
          <KPICard title="Containers in Port" value={s.containersInPort} icon={<Container className="w-5 h-5" />} iconColor="teal" description="In yard / on vessels" />
          <KPICard title="Cargo Pending" value={s.cargoPendingOffload.toLocaleString()} icon={<Package className="w-5 h-5" />} iconColor="amber" description="Awaiting unloading" />
          <KPICard title="Berths Occupied/Available" value={`${s.berthsOccupied}/${s.berthsAvailable}`} icon={<Anchor className="w-5 h-5" />} iconColor="green" description={`${s.berthOccupancyRate}% utilization`} />
          <KPICard title="Revenue Today" value={formatCurrency(s.portRevenueToday)} icon={<DollarSign className="w-5 h-5" />} iconColor="green" description="Port charges today" />
          <KPICard title="Delayed Arrivals" value={s.delayedArrivals} icon={<Clock className="w-5 h-5" />} iconColor="red" description="Behind schedule" />
          <KPICard title="Customs Holds" value={s.customsHoldCount} icon={<Shield className="w-5 h-5" />} iconColor="indigo" description="On hold" />
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column (2/3) */}
          <div className="xl:col-span-2 space-y-6">
            {/* Today's Vessel Activity */}
            <Card className="border-border/60 bg-card shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-5 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Ship className="w-4 h-4 text-cyan-400" />
                  <CardTitle className="text-sm font-semibold">Today&apos;s Vessel Activity</CardTitle>
                </div>
                <Link href="/port/vessels">
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                    View All
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {vessels.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">No vessel activity today</div>
                ) : (
                  <div className="divide-y divide-border/25">
                    {vessels.slice(0, 5).map(v => (
                      <div key={v.id} className="flex items-center justify-between px-5 py-3 hover:bg-primary/[0.03] transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-base shrink-0">{v.flag || '🚢'}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{v.name}</p>
                            <p className="text-xs text-muted-foreground">IMO {v.imo}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold border', vesselStatusColors[v.status] || 'bg-muted/50 text-muted-foreground border-border/40')}>
                            {v.status}
                          </span>
                          <span className="text-xs text-muted-foreground">{v.berth || '—'}</span>
                          <span className="text-xs text-muted-foreground font-mono">{v.eta ? formatDate(v.eta, 'datetime') : '—'}</span>
                        </div>
                      </div>
                    ))}
                    {vessels.length > 5 && (
                      <div className="px-5 py-2 text-center border-t border-border/25">
                        <Link href="/port/vessels" className="text-xs text-primary hover:underline">
                          +{vessels.length - 5} more vessels
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cargo Movement */}
            <Card className="border-border/60 bg-card shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-5 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-400" />
                  <CardTitle className="text-sm font-semibold">Cargo Movement</CardTitle>
                </div>
                <Link href="/port/cargo-log">
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                    View All
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-5 py-4 text-center text-sm text-muted-foreground">
                  <Package className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  <p>Cargo operations feed will appear here</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Yard Utilization', value: `${s.yardUtilization}%`, sub: `${s.totalContainers} containers stored`, bar: s.yardUtilization },
                { label: 'Berth Occupancy Rate', value: `${s.berthOccupancyRate}%`, sub: `${s.berthsOccupied} of ${s.totalBerths} berths active`, bar: s.berthOccupancyRate },
                { label: 'Equipment Available', value: `${s.equipmentAvailable}`, sub: 'Units operational', bar: Math.min(s.equipmentAvailable * 5, 100) },
                { label: 'Customs Clearance Rate', value: `${s.customsClearanceRate}%`, sub: `${s.customsHoldCount} on hold`, bar: s.customsClearanceRate },
              ].map(stat => (
                <div key={stat.label} className="bg-card border border-border/60 rounded-xl p-4 shadow-soft">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[0.7rem] font-bold uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                    <span className="text-[0.7rem] font-bold px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/30">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-[0.72rem] text-muted-foreground">{stat.sub}</p>
                  <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden mt-2">
                    <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500" style={{ width: `${stat.bar}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-6">
            {/* Operational Alerts */}
            <Card className="border-border/60 bg-card shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-5 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <CardTitle className="text-sm font-semibold">Operational Alerts</CardTitle>
                </div>
                <Link href="/port/notifications">
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                    View All
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
                    <p>No active alerts</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/25">
                    {notifications.slice(0, 5).map(n => (
                      <div key={n.id} className="flex items-start gap-3 px-5 py-3 hover:bg-primary/[0.03] transition-colors">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', severityColors[n.severity] || severityColors.Info)}>
                          {n.severity === 'Critical' || n.severity === 'Emergency' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium text-foreground">{n.title}</p>
                            <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[0.6rem] font-bold border', severityColors[n.severity] || severityColors.Info)}>
                              {n.severity}
                            </span>
                          </div>
                          <p className="text-[0.7rem] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[0.6rem] text-muted-foreground mt-1">{formatDate(n.timestamp, 'datetime')}</p>
                        </div>
                      </div>
                    ))}
                    {notifications.length > 5 && (
                      <div className="px-5 py-2 text-center border-t border-border/25">
                        <Link href="/port/notifications" className="text-xs text-primary hover:underline">
                          +{notifications.length - 5} more alerts
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Port Revenue Mini Card */}
            <Card className="border-border/60 bg-card shadow-soft overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
              <CardContent className="p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Port Revenue Today</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-extrabold text-foreground">{formatCurrency(s.portRevenueToday)}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">+8.2% vs yesterday</span>
                </div>
                <div className="flex items-center gap-3 mt-3 text-[0.65rem] text-muted-foreground">
                  <span>{s.totalVessels} vessels</span>
                  <span className="w-px h-3 bg-border/50" />
                  <span>{s.totalFlights} flights</span>
                  <span className="w-px h-3 bg-border/50" />
                  <span>{s.totalContainers} containers</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

'use client';

import { useEffect, useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  MapPinned,
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
  Truck,
  Warehouse,
  Users,
  FileText,
  Bell,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  Box,
  CreditCard,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { shipmentService } from '@/services/shipment/shipmentService';
import { financeService } from '@/services/financeService';
import { warehouseService } from '@/services/warehouseService';
import { notificationService } from '@/services/notificationService';
import { useCompany } from '@/hooks/use-company';
import { useAuth } from '@/context/AuthContext';
import type { ConsolidatedShipment } from '@/types/shipment';
import type { Invoice } from '@/types/invoice';

export function CompanyDashboard() {
  const { effectiveCompanyId, userRole } = useCompany();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shipmentStats, setShipmentStats] = useState<Record<string, number> | null>(null);
  const [recentShipments, setRecentShipments] = useState<ConsolidatedShipment[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [warehouseStats, setWarehouseStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [stats, shipmentsResult, invoices, whStats, notifs, unread] = await Promise.all([
          shipmentService.getStats('CompanyAdmin'),
          shipmentService.listPaginated({
            role: 'CompanyAdmin',
            page: 1,
            pageSize: 5,
            sortBy: 'createdAt',
            sortDir: 'desc',
          }),
          financeService.list(),
          warehouseService.getDashboardStats(effectiveCompanyId),
          notificationService.list(effectiveCompanyId, userRole, { limit: 5, pageSize: 5 }),
          notificationService.getUnreadCount(effectiveCompanyId, userRole),
        ]);

        setShipmentStats(stats);
        setRecentShipments(shipmentsResult.items);
        setRecentInvoices(invoices.slice(0, 5));
        setWarehouseStats(whStats);
        setNotifications(notifs.items);
        setUnreadCount(unread);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [effectiveCompanyId, userRole]);

  const kpis = useMemo(() => {
    if (!shipmentStats) return [];

    const active =
      (shipmentStats.total ?? 0) -
      ((shipmentStats.delivered ?? 0) + (shipmentStats.cancelled ?? 0) + (shipmentStats.failed ?? 0));
    const inTransit = (shipmentStats.inTransit ?? 0) + (shipmentStats.outForDelivery ?? 0);
    const issues = (shipmentStats.failed ?? 0) + (shipmentStats.cancelled ?? 0);

    return [
      {
        title: 'Active Shipments',
        value: active,
        icon: <Package className="w-5 h-5" />,
        iconColor: 'indigo' as const,
        trend: '+12%',
        trendUp: true,
      },
      {
        title: 'In Transit',
        value: inTransit,
        icon: <MapPinned className="w-5 h-5" />,
        iconColor: 'teal' as const,
        trend: '+5%',
        trendUp: true,
      },
      {
        title: 'Delivered This Month',
        value: shipmentStats.delivered ?? 0,
        icon: <CheckCircle2 className="w-5 h-5" />,
        iconColor: 'green' as const,
        trend: '+18%',
        trendUp: true,
      },
      {
        title: 'Issues',
        value: issues,
        icon: <AlertTriangle className="w-5 h-5" />,
        iconColor: 'amber' as const,
        trend: '-8%',
        trendUp: false,
      },
    ];
  }, [shipmentStats]);

  const financeKPIs = useMemo(() => {
    const totalRevenue = recentInvoices
      .filter((i) => i.status === 'Paid')
      .reduce((sum, i) => sum + (i.amount ?? 0), 0);
    const pending = recentInvoices.filter((i) => i.status === 'Unpaid').length;
    const overdue = recentInvoices.filter((i) => i.status === 'Overdue').length;

    return [
      {
        title: 'Revenue (MTD)',
        value: `₹${(totalRevenue + 1250000).toLocaleString('en-IN')}`,
        icon: <IndianRupee className="w-5 h-5" />,
        iconColor: 'emerald' as const,
      },
      {
        title: 'Pending Payments',
        value: pending,
        icon: <CreditCard className="w-5 h-5" />,
        iconColor: 'amber' as const,
      },
      {
        title: 'Overdue',
        value: overdue,
        icon: <AlertCircle className="w-5 h-5" />,
        iconColor: 'rose' as const,
      },
    ];
  }, [recentInvoices]);

  const shipmentColumns: Column<ConsolidatedShipment>[] = [
    {
      key: 'trackingNumber',
      header: 'Tracking ID',
      sortable: true,
      render: (s) => (
        <span className="text-xs font-mono font-semibold text-foreground">{s.trackingNumber}</span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (s) => <span className="text-xs text-foreground">{s.customerName}</span>,
    },
    {
      key: 'route',
      header: 'Route',
      render: (s) => (
        <span className="text-xs text-muted-foreground">
          {s.route.origin} → {s.route.destination}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (s) => <StatusBadge status={s.status} />,
    },
  ];

  const invoiceColumns: Column<Invoice>[] = [
    {
      key: 'invoiceId',
      header: 'Invoice #',
      render: (i) => <span className="text-xs font-mono text-foreground">{i.invoiceId}</span>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (i) => <span className="text-xs text-foreground">{i.customerName}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (i) => (
        <span className="text-xs font-medium text-foreground">₹{i.amount?.toLocaleString('en-IN')}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (i) => <StatusBadge status={i.status} />,
    },
  ];

  if (loading) {
    return (
      <PageWrapper title="Dashboard">
        <LoadingState rows={8} message="Loading dashboard..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <Card className="border-border/60 bg-gradient-to-r from-cyan-500/10 via-transparent to-indigo-500/10 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Welcome back, {user?.name?.split(' ')[0] || 'User'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Here's what's happening with your logistics operations today.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="gap-1.5 text-xs">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  System Active
                </Badge>
                <Badge variant="outline" className="gap-1.5 text-xs">
                  <Clock className="w-3.5 h-3.5 text-cyan-500" />
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipment KPIs */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-500" />
            Shipment Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis.map((kpi, idx) => (
              <KPICard
                key={idx}
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
                iconColor={kpi.iconColor}
                trend={kpi.trend}
                trendUp={kpi.trendUp}
              />
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Shipments */}
          <Card className="xl:col-span-2 border-border/60 bg-card shadow-soft">
            <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-500" />
                Recent Shipments
              </CardTitle>
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {recentShipments.length === 0 ? (
                <EmptyState
                  icon={<Package className="w-8 h-8" />}
                  title="No shipments"
                  description="No recent shipments found."
                />
              ) : (
                <DataTable
                  data={recentShipments}
                  columns={shipmentColumns}
                  pageSize={5}
                  showPagination={false}
                />
              )}
            </CardContent>
          </Card>

          {/* Notifications / Alerts */}
          <Card className="border-border/60 bg-card shadow-soft">
            <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                Recent Alerts
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-[0.6rem]">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">No pending alerts.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer hover:bg-white/[0.02] ${
                      notif.read
                        ? 'bg-transparent border-border/40'
                        : 'bg-cyan-500/5 border-cyan-500/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                          notif.severity === 'Critical'
                            ? 'bg-rose-500'
                            : notif.severity === 'High'
                              ? 'bg-amber-500'
                              : notif.severity === 'Medium'
                                ? 'bg-blue-500'
                                : 'bg-emerald-500'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[0.6rem] text-muted-foreground mt-1">
                          {new Date(notif.timestamp).toLocaleString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Finance & Warehouse Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Finance KPIs */}
          <Card className="border-border/60 bg-card shadow-soft">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-500" />
                Finance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {financeKPIs.map((kpi, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-border/40"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        kpi.iconColor === 'emerald'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : kpi.iconColor === 'amber'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {kpi.icon}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{kpi.title}</p>
                      <p className="text-sm font-semibold text-foreground">{kpi.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card className="border-border/60 bg-card shadow-soft">
            <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Recent Invoices
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {recentInvoices.length === 0 ? (
                <EmptyState
                  icon={<FileText className="w-8 h-8" />}
                  title="No invoices"
                  description="No recent invoices found."
                />
              ) : (
                <DataTable
                  data={recentInvoices.slice(0, 4)}
                  columns={invoiceColumns}
                  pageSize={4}
                  showPagination={false}
                />
              )}
            </CardContent>
          </Card>

          {/* Quick Stats / Warehouse */}
          <Card className="border-border/60 bg-card shadow-soft">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-orange-500" />
                Warehouse Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Box className="w-4 h-4 text-orange-500" />
                    <span className="text-[0.6rem] text-muted-foreground uppercase tracking-wide">
                      Total Locations
                    </span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {warehouseStats?.totalLocations ?? 5}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span className="text-[0.6rem] text-muted-foreground uppercase tracking-wide">
                      Customers
                    </span>
                  </div>
                  <p className="text-lg font-bold text-foreground">32</p>
                </div>
                <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="w-4 h-4 text-cyan-500" />
                    <span className="text-[0.6rem] text-muted-foreground uppercase tracking-wide">
                      Fleet
                    </span>
                  </div>
                  <p className="text-lg font-bold text-foreground">15</p>
                </div>
                <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span className="text-[0.6rem] text-muted-foreground uppercase tracking-wide">
                      Drivers
                    </span>
                  </div>
                  <p className="text-lg font-bold text-foreground">22</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-3 border-t border-border/50">
                <p className="text-[0.6rem] text-muted-foreground uppercase tracking-wide mb-2">
                  Quick Actions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    + New Shipment
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    + Create Invoice
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    + GRN Entry
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    View Reports
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}

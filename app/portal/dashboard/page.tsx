'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import {
  Package, CheckCircle2, Clock, FileText, MessageSquare,
  TrendingUp, TrendingDown, ArrowRight, Ship, Truck, Plane,
  IndianRupee, Activity, CalendarDays,
} from 'lucide-react';
import { portalShipments, portalInvoices, portalDashboardStats } from '@/data/portal-mock-data';

const STATUS_COLORS: Record<string, string> = {
  Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'In Transit': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Out for Delivery': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Pending: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'Picked Up': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  Failed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const INVOICE_STATUS_COLORS: Record<string, string> = {
  Paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Unpaid: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
  Cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const SERVICE_ICONS: Record<string, any> = { Express: Plane, Standard: Truck, Freight: Ship };

export default function CustomerPortalDashboard() {
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => portalDashboardStats, []);

  const recentShipments = useMemo(() =>
    portalShipments.slice(0, 5).map(s => ({
      ...s,
      route: `${s.pickupAddress.split(',')[0]} → ${s.deliveryAddress.split(',')[0]}`,
      eta: new Date(s.estimatedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    })), []);

  const pendingInvoices = useMemo(() =>
    portalInvoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue').slice(0, 4), []);

  const kpis = [
    { title: 'Active Shipments', value: String(stats.activeShipments), icon: <Package className="w-5 h-5" />, trend: { value: 2, isPositive: true }, iconColor: 'cyan' as const },
    { title: 'In Transit', value: String(stats.inTransit), icon: <Truck className="w-5 h-5" />, iconColor: 'indigo' as const },
    { title: 'Delivered This Month', value: String(stats.deliveredThisMonth), icon: <CheckCircle2 className="w-5 h-5" />, trend: { value: 3, isPositive: true }, iconColor: 'green' as const },
    { title: 'Pending Invoices', value: String(stats.invoicesDue), icon: <FileText className="w-5 h-5" />, trend: { value: 1, isPositive: false }, iconColor: 'amber' as const },
    { title: 'Open Tickets', value: String(stats.openTickets), icon: <MessageSquare className="w-5 h-5" />, iconColor: 'red' as const },
  ];

  return (
    <PageWrapper
      title="My Dashboard"
      description="Track your shipments, manage invoices, and stay updated"
      actions={
        <div className="flex items-center gap-2">
          <Link href="/portal/bookings/new">
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-600 rounded-[10px] gap-2 text-xs h-9">
              <Package className="w-4 h-4" />
              New Booking
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="rounded-[10px] text-xs gap-1.5 h-9" onClick={() => setLoading(true)}>
            <CalendarDays className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Button>
        </div>
      }
    >
      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {kpis.map(kpi => <KPICard key={kpi.title} {...kpi} />)}
      </div>

      {/* Stats Highlight Bar */}
      <div className="bg-card border border-border/60 rounded-xl shadow-soft p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Spent This Month</p>
              <p className="text-sm font-semibold text-foreground">₹{stats.totalSpentThisMonth.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">On-Time Rate</p>
              <p className="text-sm font-semibold text-foreground">{stats.onTimeRate}%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Pending Bookings</p>
              <p className="text-sm font-semibold text-foreground">{stats.pendingBookings}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Open Tickets</p>
              <p className="text-sm font-semibold text-foreground">{stats.openTickets}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Shipments */}
        <div className="xl:col-span-2">
          <Card className="border border-border/60 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                Recent Shipments
              </CardTitle>
              <Link href="/portal/shipments">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                  View All <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {loading ? <SkeletonLoader variant="table" count={5} />
                : <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-y border-border/50">
                          <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Tracking ID</th>
                          <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Route</th>
                          <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Service</th>
                          <th className="text-left py-2.5 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Status</th>
                          <th className="text-right py-2.5 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">ETA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentShipments.map((s, i) => {
                          const ServiceIcon = SERVICE_ICONS[s.serviceType] || Truck;
                          return (
                            <tr key={s.id} className={`border-b border-border/30 hover:bg-muted/20 transition-colors cursor-pointer ${i === recentShipments.length - 1 ? 'border-b-0' : ''}`}
                              onClick={() => window.location.href = `/portal/shipments/${s.id}`}>
                              <td className="py-3 px-4 font-mono text-[0.75rem] text-foreground font-semibold">{s.trackingNumber}</td>
                              <td className="py-3 px-4 text-muted-foreground text-[0.75rem] max-w-[200px] truncate">{s.route}</td>
                              <td className="py-3 px-4"><ServiceIcon className="w-3.5 h-3.5 text-muted-foreground" /></td>
                              <td className="py-3 px-4">
                                <Badge variant="outline" className={`text-[0.6rem] px-1.5 py-0 border ${STATUS_COLORS[s.status] || STATUS_COLORS.Pending}`}>{s.status}</Badge>
                              </td>
                              <td className="py-3 px-4 text-right text-muted-foreground text-[0.75rem]">{s.eta}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Invoices */}
          <Card className="border border-border/60 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Pending Invoices
              </CardTitle>
              <Link href="/portal/invoices">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                  View All <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {pendingInvoices.length === 0 ? (
                <div className="py-8 flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400/50" />
                  <p className="text-xs text-muted-foreground">All invoices paid</p>
                </div>
              ) : <div className="space-y-1 px-1 pb-2">
                {pendingInvoices.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-[0.75rem] font-medium text-foreground font-mono">{inv.invoiceId}</p>
                      <p className="text-[0.65rem] text-muted-foreground">Due {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[0.75rem] font-semibold text-foreground">₹{inv.amount.toLocaleString('en-IN')}</p>
                      <Badge variant="outline" className={`text-[0.55rem] px-1.5 py-0 border ${INVOICE_STATUS_COLORS[inv.status] || ''}`}>{inv.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-border/60 shadow-soft">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-2 gap-3">
                <Link href="/portal/tracking"><Button variant="outline" className="w-full justify-start gap-2 text-xs rounded-[9px] h-9"><Package className="w-3.5 h-3.5" />Track Shipment</Button></Link>
                <Link href="/portal/bookings/new"><Button variant="outline" className="w-full justify-start gap-2 text-xs rounded-[9px] h-9"><Ship className="w-3.5 h-3.5" />New Booking</Button></Link>
                <Link href="/portal/support/new"><Button variant="outline" className="w-full justify-start gap-2 text-xs rounded-[9px] h-9"><MessageSquare className="w-3.5 h-3.5" />Raise Query</Button></Link>
                <Link href="/portal/payments"><Button variant="outline" className="w-full justify-start gap-2 text-xs rounded-[9px] h-9"><IndianRupee className="w-3.5 h-3.5" />Make Payment</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}

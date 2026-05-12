"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { Button } from '@/components/ui/button';
import {
  Package, Truck, Clock, DollarSign,
  CheckCircle, Gauge, AlertTriangle, ArrowRight,
  TrendingUp, Activity,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, BarChart, Bar, Legend,
} from 'recharts';
import { mockAnalytics, mockShipments, mockNotifications } from '@/data/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { user, isSuperAdmin } = useAuth();

  useEffect(() => {
    // Redirect SuperAdmin to their dedicated dashboard
    if (isSuperAdmin) {
      router.push('/admin/dashboard');
      return;
    }
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [isSuperAdmin, router]);

  const { kpiSummary, shipmentTrend, statusDistribution, monthlyRevenue } = mockAnalytics;
  const recentShipments = mockShipments.slice(0, 5);
  const alerts = mockNotifications.filter((n) => !n.read).slice(0, 4);

  // Matches your login page brand palette
  const PIE_COLORS = ['#22c55e', '#0ea5e9', '#f59e0b', '#6366f1', '#ef4444', '#64748b'];

  // Custom tooltip shared style
  const tooltipStyle = {
    backgroundColor: 'rgba(8, 14, 28, 0.97)',
    border: '1px solid rgba(14, 165, 233, 0.2)',
    borderRadius: '10px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.82rem',
  };

  if (loading) {
    return (
      <PageWrapper title="Dashboard">
        <SkeletonLoader variant="card" count={6} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <SkeletonLoader variant="table" count={3} />
          <SkeletonLoader variant="table" count={3} />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}`}
      description="Here's what's happening with your logistics operations today."
    >

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        <KPICard
          title="Total Shipments"
          value={kpiSummary.totalShipments.toLocaleString()}
          icon={<Package className="w-5 h-5" />}
          iconColor="indigo"
          trend={{ value: 12.5, isPositive: true }}
          description="vs last month"
        />
        <KPICard
          title="Active Deliveries"
          value={kpiSummary.activeDeliveries}
          icon={<Truck className="w-5 h-5" />}
          iconColor="cyan"
          trend={{ value: 8.2, isPositive: true }}
          description="in transit"
        />
        <KPICard
          title="Pending Pickups"
          value={kpiSummary.pendingPickups}
          icon={<Clock className="w-5 h-5" />}
          iconColor="amber"
          trend={{ value: 3.1, isPositive: false }}
          description="awaiting"
        />
        <KPICard
          title="Revenue (Month)"
          value={formatCurrency(kpiSummary.revenueThisMonth)}
          icon={<DollarSign className="w-5 h-5" />}
          iconColor="green"
          trend={{ value: 15.3, isPositive: true }}
          description="vs last month"
        />
        <KPICard
          title="On-Time Delivery"
          value={`${kpiSummary.onTimeDeliveryRate}%`}
          icon={<CheckCircle className="w-5 h-5" />}
          iconColor="teal"
          trend={{ value: 2.1, isPositive: true }}
          description="performance"
        />
        <KPICard
          title="Fleet Utilization"
          value={`${kpiSummary.fleetUtilization}%`}
          icon={<Gauge className="w-5 h-5" />}
          iconColor="cyan"
          trend={{ value: 5.4, isPositive: true }}
          description="efficiency"
        />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid gap-6 lg:grid-cols-5 mb-6">

        {/* Shipments Trend — wider */}
        <div className="
          lg:col-span-3
          bg-card border border-border/60
          rounded-xl overflow-hidden
          shadow-soft
          transition-all duration-300
          hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]
        ">
          <div className="px-6 pt-5 pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[0.95rem] font-bold font-display text-foreground tracking-tight">
                  Shipments Overview
                </h3>
                <p className="text-[0.78rem] text-muted-foreground mt-0.5">
                  Daily shipment activity over the last 30 days
                </p>
              </div>
              <div className="flex items-center gap-4 text-[0.72rem] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                  <span className="text-muted-foreground">Shipments</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />
                  <span className="text-muted-foreground">Delivered</span>
                </span>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="h-[270px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={shipmentTrend} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(99,102,241,0.08)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => new Date(v).getDate().toString()}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
                    itemStyle={{ color: '#e2e8f0' }}
                    labelFormatter={(v) => formatDate(v)}
                    cursor={{ stroke: 'rgba(99,102,241,0.2)', strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="shipments"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="delivered"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Status Distribution — narrower */}
        <div className="
          lg:col-span-2
          bg-card border border-border/60
          rounded-xl overflow-hidden
          shadow-soft
          transition-all duration-300
          hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]
        ">
          <div className="px-6 pt-5 pb-3 border-b border-border/40">
            <h3 className="text-[0.95rem] font-bold font-display text-foreground tracking-tight">
              Status Distribution
            </h3>
            <p className="text-[0.78rem] text-muted-foreground mt-0.5">
              Current breakdown of all shipments
            </p>
          </div>
          <div className="p-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="status"
                    stroke="none"
                  >
                    {statusDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        opacity={0.9}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="mt-1 space-y-1.5 px-1">
              {statusDistribution.map((item, index) => {
                const total = statusDistribution.reduce((s, i) => s + i.count, 0);
                const pct = ((item.count / total) * 100).toFixed(0);
                return (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="text-[0.75rem] text-muted-foreground capitalize">
                        {item.status}
                      </span>
                    </div>
                    <span className="text-[0.75rem] font-bold text-foreground">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Revenue Chart ── */}
      <div className="
        bg-card border border-border/60
        rounded-xl overflow-hidden shadow-soft mb-6
        transition-all duration-300
        hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]
      ">
        <div className="px-6 pt-5 pb-3 border-b border-border/40 flex items-center justify-between">
          <div>
            <h3 className="text-[0.95rem] font-bold font-display text-foreground tracking-tight">
              Revenue vs Expenses
            </h3>
            <p className="text-[0.78rem] text-muted-foreground mt-0.5">
              Monthly financial overview for the past 6 months
            </p>
          </div>
          <div className="
            flex items-center gap-1.5 px-3 py-1.5
            bg-success/10 border border-success/20 rounded-full
          ">
            <TrendingUp size={12} className="text-success" />
            <span className="text-[0.72rem] font-bold text-success">+15.3%</span>
          </div>
        </div>
        <div className="p-5">
          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}
                barCategoryGap="30%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(99,102,241,0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: '#e2e8f0' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
                  formatter={(value: number) => formatCurrency(value)}
                  cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '0.75rem', color: '#64748b', paddingTop: '12px' }}
                />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#6366f1"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="rgba(100,116,139,0.35)"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Recent Shipments */}
        <div className="
          bg-card border border-border/60
          rounded-xl overflow-hidden shadow-soft
          transition-all duration-300
          hover:border-primary/25
        ">
          <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
            <div>
              <h3 className="text-[0.95rem] font-bold font-display text-foreground tracking-tight">
                Recent Shipments
              </h3>
              <p className="text-[0.78rem] text-muted-foreground mt-0.5">
                Latest shipment activities
              </p>
            </div>
            <Link
              href="/shipments"
              className="
                flex items-center gap-1.5
                text-[0.78rem] font-semibold text-primary
                hover:text-primary/80 transition-colors duration-200
                no-underline
              "
            >
              View all
              <ArrowRight size={13} />
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {recentShipments.map((shipment) => (
              <div
                key={shipment.id}
                className="
                  flex items-center justify-between
                  px-3 py-2.5 rounded-lg
                  bg-muted/30 hover:bg-primary/5
                  border border-transparent hover:border-primary/15
                  transition-all duration-200 cursor-pointer
                "
              >
                <div className="flex items-center gap-3">
                  <div className="
                    w-9 h-9 rounded-lg
                    bg-primary/10 border border-primary/15
                    flex items-center justify-center flex-shrink-0
                  ">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[0.84rem] font-semibold text-foreground">
                      {shipment.trackingNumber}
                    </p>
                    <p className="text-[0.73rem] text-muted-foreground">
                      {shipment.receiverName}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <StatusBadge status={shipment.status} />
                  <p className="text-[0.7rem] text-muted-foreground">
                    {formatDate(shipment.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="
          bg-card border border-border/60
          rounded-xl overflow-hidden shadow-soft
          transition-all duration-300
          hover:border-destructive/20
        ">
          <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
            <div>
              <h3 className="text-[0.95rem] font-bold font-display text-foreground tracking-tight">
                Alerts & Notifications
              </h3>
              <p className="text-[0.78rem] text-muted-foreground mt-0.5">
                Items requiring attention
              </p>
            </div>
            <div className="flex items-center gap-3">
              {alerts.length > 0 && (
                <span className="
                  px-2 py-0.5 rounded-full
                  bg-destructive/10 border border-destructive/20
                  text-[0.7rem] font-bold text-destructive
                ">
                  {alerts.length} new
                </span>
              )}
              <Link
                href="/notifications"
                className="
                  flex items-center gap-1.5
                  text-[0.78rem] font-semibold text-primary
                  hover:text-primary/80 transition-colors duration-200
                  no-underline
                "
              >
                View all
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="
                    flex items-start gap-3
                    px-3 py-2.5 rounded-lg
                    bg-muted/30 hover:bg-destructive/5
                    border border-transparent hover:border-destructive/15
                    transition-all duration-200 cursor-pointer
                  "
                >
                  <div className="
                    w-9 h-9 rounded-lg
                    bg-destructive/10 border border-destructive/15
                    flex items-center justify-center flex-shrink-0 mt-0.5
                  ">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.84rem] font-semibold text-foreground">
                      {alert.title}
                    </p>
                    <p className="text-[0.73rem] text-muted-foreground line-clamp-2 mt-0.5">
                      {alert.message}
                    </p>
                    <p className="text-[0.7rem] text-muted-foreground/70 mt-1">
                      {formatDate(alert.timestamp, 'datetime')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <div className="
                  w-14 h-14 rounded-full
                  bg-success/10 border border-success/20
                  flex items-center justify-center mx-auto mb-3
                ">
                  <CheckCircle className="w-7 h-7 text-success" />
                </div>
                <p className="text-[0.84rem] font-semibold text-foreground mb-1">
                  All clear!
                </p>
                <p className="text-[0.78rem] text-muted-foreground">
                  No pending alerts at this time
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </PageWrapper>
  );
}

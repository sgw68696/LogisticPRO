"use client";

import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getShipmentReport, getRevenueReport, getFleetReport,
} from "@/services/reportService";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";
import {
  Download, Calendar, TrendingUp, Package, Truck,
  IndianRupee, FileText, BarChart3, PieChartIcon, Activity,
} from "lucide-react";

// ── Chart palette (theme-aware) ──────────────
const PALETTE = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

// ── Recharts shared style tokens ────────────
const AXIS_STYLE   = { fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'inherit' };
const GRID_STYLE   = { stroke: 'oklch(var(--border)/0.5)', strokeDasharray: '4 4' };
const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'var(--card)',
    border: '1px solid oklch(var(--border)/0.6)',
    borderRadius: '10px',
    fontSize: '0.78rem',
    color: 'var(--foreground)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
  },
  labelStyle: { color: 'var(--muted-foreground)', fontWeight: 600 },
  cursor: { fill: 'oklch(var(--primary)/0.06)' },
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");
  const [shipmentData, setShipmentData] = useState<any>(null);
  const [revenueData, setRevenueData]   = useState<any>(null);
  const [fleetData, setFleetData]       = useState<any>(null);

  useEffect(() => { loadReports(); }, [dateRange]);

  const getDateRangeFilters = (range: string) => {
    const now = new Date();
    switch (range) {
      case 'week':
        return {
          dateFrom: new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0],
          dateTo: now.toISOString().split('T')[0],
        };
      case 'month':
        return {
          dateFrom: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
          dateTo: now.toISOString().split('T')[0],
        };
      case 'quarter': {
        const qs = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        return { dateFrom: qs.toISOString().split('T')[0], dateTo: now.toISOString().split('T')[0] };
      }
      case 'year':
        return {
          dateFrom: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
          dateTo: now.toISOString().split('T')[0],
        };
      default: return {};
    }
  };

  const loadReports = async () => {
    setLoading(true);
    const filters = getDateRangeFilters(dateRange);
    const [shipments, revenue, fleet] = await Promise.all([
      getShipmentReport(filters),
      getRevenueReport(filters),
      getFleetReport(filters),
    ]);
    setShipmentData(shipments);
    setRevenueData(revenue);
    setFleetData(fleet);
    setLoading(false);
  };

  if (loading) return (
    <PageWrapper title="Reports & Analytics" description="View detailed reports">
      <SkeletonLoader variant="card" count={4} />
    </PageWrapper>
  );

  const kpiCards = [
    {
      label: 'Total Shipments',
      value: shipmentData?.summary.total ?? 0,
      sub: `+${shipmentData?.summary.growth ?? 0}% growth`,
      subColor: 'text-green-400',
      icon: <Package size={18} />,
      color: 'bg-primary/10 border-primary/15 text-primary',
      valueColor: 'text-foreground',
      trend: <TrendingUp size={12} className="text-green-400" />,
    },
    {
      label: 'Delivery Rate',
      value: `${shipmentData?.summary.deliveryRate ?? 0}%`,
      sub: 'On Track',
      subColor: 'text-green-400',
      icon: <Truck size={18} />,
      color: 'bg-green-500/10 border-green-500/15 text-green-400',
      valueColor: 'text-green-400',
      trend: <TrendingUp size={12} className="text-green-400" />,
    },
    {
      label: 'Revenue',
      value: formatCurrency(revenueData?.summary.total ?? 0),
      sub: `+${revenueData?.summary.growth ?? 0}% vs last period`,
      subColor: 'text-green-400',
      icon: <IndianRupee size={18} />,
      color: 'bg-sky-500/10 border-sky-500/15 text-sky-400',
      valueColor: 'text-foreground',
      trend: <TrendingUp size={12} className="text-green-400" />,
    },
    {
      label: 'Fleet Utilization',
      value: `${fleetData?.summary.utilization ?? 0}%`,
      sub: 'Good',
      subColor: 'text-amber-400',
      icon: <Activity size={18} />,
      color: 'bg-amber-500/10 border-amber-500/15 text-amber-400',
      valueColor: 'text-amber-400',
      trend: <Activity size={12} className="text-amber-400" />,
    },
  ];

  return (
    <PageWrapper
      title="Reports & Analytics"
      description="View detailed reports and analytics"
      actions={
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="
              w-[155px] h-9 text-[0.82rem]
              bg-muted/40 border-border/60 rounded-[9px]
              focus:ring-0 focus:border-primary/50
            ">
              <Calendar size={13} className="mr-1.5 text-muted-foreground flex-shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="nb-dropdown">
              {[
                { value: 'week',    label: 'This Week' },
                { value: 'month',   label: 'This Month' },
                { value: 'quarter', label: 'This Quarter' },
                { value: 'year',    label: 'This Year' },
              ].map(({ value, label }) => (
                <SelectItem key={value} value={value} className="text-[0.82rem]">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button className="
            flex items-center gap-2 px-3.5 py-2
            bg-muted/40 border border-border/60 rounded-[10px]
            text-[0.82rem] font-semibold text-muted-foreground
            hover:bg-muted/70 hover:text-foreground
            hover:-translate-y-px transition-all duration-200
          ">
            <Download size={13} /> Export
          </button>
        </div>
      }
    >
      {/* ── KPI Cards ── */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {kpiCards.map(({ label, value, sub, subColor, icon, color, valueColor, trend }) => (
          <div
            key={label}
            className="
              group relative bg-card border border-border/60
              rounded-xl p-5 shadow-soft overflow-hidden
              transition-all duration-300
              hover:-translate-y-0.5 hover:border-primary/25
              hover:shadow-[0_8px_28px_oklch(var(--primary)/0.08)]
              before:absolute before:inset-x-0 before:top-0 before:h-px
              before:bg-gradient-to-r before:from-transparent before:via-primary/30 before:to-transparent
              before:opacity-0 before:transition-opacity before:duration-300
              hover:before:opacity-100
            "
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.7px] text-muted-foreground mb-1.5">
                  {label}
                </p>
                <p className={`text-[1.75rem] font-extrabold font-display leading-none mb-1.5 ${valueColor}`}>
                  {value}
                </p>
                <div className={`flex items-center gap-1 text-[0.72rem] font-semibold ${subColor}`}>
                  {trend}
                  <span>{sub}</span>
                </div>
              </div>
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${color}`}>
                {icon}
              </div>
            </div>
            <div className="mt-3 h-[2px] rounded-full bg-gradient-to-r from-primary/20 via-primary/40 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="shipments" className="space-y-6">
        <TabsList className="bg-muted/40 border border-border/60 rounded-[10px] p-1 h-auto gap-1">
          {[
            { value: 'shipments', label: 'Shipments', icon: <Package size={13} /> },
            { value: 'revenue',   label: 'Revenue',   icon: <IndianRupee size={13} /> },
            { value: 'fleet',     label: 'Fleet',     icon: <Truck size={13} /> },
          ].map(({ value, label, icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="
                flex items-center gap-1.5
                text-[0.8rem] font-semibold rounded-[8px] px-4 py-1.5
                data-[state=active]:bg-card data-[state=active]:text-foreground
                data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60
                text-muted-foreground transition-all duration-200
              "
            >
              {icon} {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Shipments Tab ── */}
        <TabsContent value="shipments" className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard
              title="Shipments by Status"
              description="Distribution of shipment statuses"
              icon={<BarChart3 size={15} />}
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={shipmentData?.byStatus || []} barSize={32}>
                  <CartesianGrid {...GRID_STYLE} vertical={false} />
                  <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Shipments by Region"
              description="Geographic distribution"
              icon={<PieChartIcon size={15} />}
            >
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={shipmentData?.byRegion || []}
                    cx="50%" cy="45%"
                    innerRadius={65} outerRadius={105}
                    paddingAngle={4} dataKey="value"
                  >
                    {(shipmentData?.byRegion || []).map((_: any, i: number) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="lg:col-span-2">
              <ChartCard
                title="Shipment Trends"
                description="Daily shipment volume over time"
                icon={<Activity size={15} />}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={shipmentData?.trends || []}>
                    <defs>
                      <linearGradient id="shipGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...GRID_STYLE} vertical={false} />
                    <XAxis dataKey="date" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Area
                      type="monotone" dataKey="shipments"
                      stroke="#6366f1" strokeWidth={2}
                      fill="url(#shipGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        </TabsContent>

        {/* ── Revenue Tab ── */}
        <TabsContent value="revenue" className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <ChartCard
                title="Revenue Trends"
                description="Revenue vs Expenses over time"
                icon={<TrendingUp size={15} />}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={revenueData?.trends || []}>
                    <CartesianGrid {...GRID_STYLE} vertical={false} />
                    <XAxis dataKey="date" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => formatCurrency(v)} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem' }} />
                    <Line type="monotone" dataKey="revenue"  stroke="#22c55e" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2.5} dot={false} strokeDasharray="5 4" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard
              title="Revenue by Service"
              description="Breakdown by service type"
              icon={<PieChartIcon size={15} />}
            >
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={revenueData?.byService || []}
                    cx="50%" cy="45%"
                    innerRadius={65} outerRadius={105}
                    paddingAngle={4} dataKey="value"
                  >
                    {(revenueData?.byService || []).map((_: any, i: number) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => formatCurrency(v)} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Expense Categories"
              description="Breakdown by expense type"
              icon={<BarChart3 size={15} />}
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueData?.expenses || []} layout="vertical" barSize={22}>
                  <CartesianGrid {...GRID_STYLE} horizontal={false} />
                  <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${(v/1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" tick={AXIS_STYLE} axisLine={false} tickLine={false} width={90} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="value" fill="#ef4444" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* ── Fleet Tab ── */}
        <TabsContent value="fleet" className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard
              title="Vehicle Status"
              description="Current fleet status distribution"
              icon={<PieChartIcon size={15} />}
            >
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={fleetData?.byStatus || []}
                    cx="50%" cy="45%"
                    innerRadius={65} outerRadius={105}
                    paddingAngle={4} dataKey="value"
                  >
                    {(fleetData?.byStatus || []).map((_: any, i: number) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Fleet by Type"
              description="Vehicle type distribution"
              icon={<BarChart3 size={15} />}
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={fleetData?.byType || []} barSize={36}>
                  <CartesianGrid {...GRID_STYLE} vertical={false} />
                  <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="lg:col-span-2">
              <ChartCard
                title="Fleet Performance"
                description="Trips and distance over time"
                icon={<Activity size={15} />}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={fleetData?.performance || []}>
                    <CartesianGrid {...GRID_STYLE} vertical={false} />
                    <XAxis dataKey="date" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left"  tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem' }} />
                    <Line yAxisId="left"  type="monotone" dataKey="trips"    stroke="#6366f1" strokeWidth={2.5} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="distance" stroke="#22c55e" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

/* ── ChartCard wrapper ──────────────────────── */
function ChartCard({
  title, description, icon, children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="
      group relative bg-card border border-border/60
      rounded-xl shadow-soft overflow-hidden
      transition-all duration-300
      hover:border-primary/20
      hover:shadow-[0_8px_28px_oklch(var(--primary)/0.07)]
      before:absolute before:inset-x-0 before:top-0 before:h-px
      before:bg-gradient-to-r before:from-transparent before:via-primary/25 before:to-transparent
      before:opacity-0 before:transition-opacity before:duration-300
      hover:before:opacity-100
    ">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-primary opacity-70">{icon}</span>
            <h3 className="text-[0.88rem] font-bold font-display text-foreground tracking-tight">
              {title}
            </h3>
          </div>
          <p className="text-[0.72rem] text-muted-foreground">{description}</p>
        </div>
      </div>
      {/* Chart area */}
      <div className="px-4 pt-4 pb-5">
        {children}
      </div>
    </div>
  );
}
'use client';

import { useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2, Users, TrendingUp, AlertCircle,
  Package, Truck, DollarSign, Activity,
  BarChart3, MapPin, UserPlus, Settings,
  ExternalLink, ArrowRight, RefreshCw,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import { mockCompanies, mockUsers, mockOrganizations, mockAnalytics, mockShipments } from '@/data/mockData';

const STATUS_COLORS: Record<string, string> = {
  Delivered: '#22c55e', 'In Transit': '#3b82f6', 'Out for Delivery': '#f59e0b',
  Pending: '#6b7280', 'Picked Up': '#14b8a6', Cancelled: '#ef4444', Failed: '#dc2626',
};

const revenueConfig = {
  revenue: { label: 'Revenue', color: '#0ea5e9' },
  expenses: { label: 'Expenses', color: '#ef4444' },
};

const chartConfig = {
  shipments: { label: 'Shipments', color: '#0ea5e9' },
  delivered: { label: 'Delivered', color: '#22c55e' },
};

type CompanyRow = {
  id: string; name: string; city: string; status: string; plan: string; users: number;
};

type UserRow = {
  id: string; name: string; email: string; role: string; status: string; lastLogin: string;
};

export default function SuperAdminDashboard() {
  const stats = useMemo(() => {
    const activeCompanies = mockCompanies.filter(c => c.status === 'Active');
    const pendingCompanies = mockCompanies.filter(c => c.status === 'Pending');
    const activeUsers = mockUsers.filter(u => u.status === 'Active');
    const totalOrgs = mockOrganizations.length;
    const totalShipments = mockShipments.length;
    const delivered = mockShipments.filter(s => s.status === 'Delivered').length;
    const inTransit = mockShipments.filter(s => s.status === 'In Transit').length;
    const totalShipmentsKPI = mockAnalytics.kpiSummary.totalShipments;
    const revenue = mockAnalytics.kpiSummary.revenueThisMonth;
    const onTimeRate = mockAnalytics.kpiSummary.onTimeDeliveryRate;
    return { activeCompanies, pendingCompanies, activeUsers, totalOrgs, totalShipments, delivered, inTransit, totalShipmentsKPI, revenue, onTimeRate };
  }, []);

  const companyRows: CompanyRow[] = useMemo(() =>
    mockCompanies.slice(0, 6).map(c => ({
      id: c.id, name: c.name,
      city: `${c.city}, ${c.state}`,
      status: c.status,
      plan: c.plan,
      users: c.currentAgents,
    })), []);

  const userRows: UserRow[] = useMemo(() =>
    mockUsers.slice(0, 6).map(u => ({
      id: u.id, name: u.name, email: u.email,
      role: u.role, status: u.status,
      lastLogin: new Date(u.lastLogin).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    })), []);

  const companyColumns: Column<CompanyRow>[] = [
    { key: 'name', header: 'Company', sortable: true, render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'city', header: 'Location' },
    { key: 'plan', header: 'Plan', render: (r) => <Badge variant="outline" className="border-primary/20 text-primary">{r.plan}</Badge> },
    { key: 'status', header: 'Status', sortable: true, render: (r) => (
      <Badge variant="outline" className={r.status === 'Active' ? 'border-green-500/30 text-green-400' : 'border-amber-500/30 text-amber-400'}>{r.status}</Badge>
    )},
    { key: 'users', header: 'Agents' },
  ];

  const userColumns: Column<UserRow>[] = [
    { key: 'name', header: 'Name', sortable: true, render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', sortable: true, render: (r) => <Badge variant="outline" className="border-indigo-500/30 text-indigo-400">{r.role}</Badge> },
    { key: 'status', header: 'Status', sortable: true, render: (r) => (
      <Badge variant="outline" className={r.status === 'Active' ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}>{r.status}</Badge>
    )},
    { key: 'lastLogin', header: 'Last Login' },
  ];

  const statusData = mockAnalytics.statusDistribution;
  const revenueData = mockAnalytics.monthlyRevenue;
  const trendData = mockAnalytics.shipmentTrend.slice(-14).map(m => ({
    date: new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    shipments: m.shipments,
    delivered: m.delivered,
  }));

  return (
    <PageWrapper
      title="SuperAdmin Dashboard"
      description="Platform overview and key metrics"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 gap-2"><RefreshCw className="w-4 h-4" />Refresh</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Total Companies" value={stats.activeCompanies.length} icon={<Building2 className="w-5 h-5" />} trend={{ value: 12, isPositive: true }} iconColor="cyan" />
        <KPICard title="Active Users" value={stats.activeUsers.length} icon={<Users className="w-5 h-5" />} trend={{ value: 8, isPositive: true }} iconColor="green" />
        <KPICard title="Platform Revenue" value={`$${(stats.revenue / 1000).toFixed(1)}K`} icon={<DollarSign className="w-5 h-5" />} trend={{ value: 15, isPositive: true }} iconColor="indigo" />
        <KPICard title="Pending Approvals" value={stats.pendingCompanies.length} icon={<AlertCircle className="w-5 h-5" />} description="Needs review" iconColor="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" />Revenue & Expenses</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ChartContainer config={revenueConfig} className="h-full w-full">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="#0ea5e9" radius={[3, 3, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[3, 3, 0, 0]} name="Expenses" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><Package className="w-4 h-4 text-muted-foreground" />Shipment Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="flex h-[280px] items-center">
              <div className="w-[55%] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="count" nameKey="status">
                      {statusData.map(e => <Cell key={e.status} fill={e.color} stroke="rgba(255,255,255,0.05)" />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0d1f38', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '8px', color: '#e0f2fe' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[45%] space-y-1.5">
                {statusData.map(item => (
                  <div key={item.status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.status}</span>
                    </div>
                    <span className="text-foreground font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-muted-foreground" />Daily Shipment Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="shipmentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 10 }} interval={3} />
                  <YAxis tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="shipments" stroke="#0ea5e9" fill="url(#shipmentGrad)" strokeWidth={2} name="Shipments" />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" />Revenue by Region</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAnalytics.revenueByRegion.map((r, i) => {
                const maxRevenue = Math.max(...mockAnalytics.revenueByRegion.map(x => x.revenue));
                return (
                  <div key={r.region}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground text-xs">{r.region}</span>
                      <span className="text-foreground font-semibold text-xs">${(r.revenue / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#6366f1]" style={{ width: `${(r.revenue / maxRevenue) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-muted-foreground" />Platform KPIs</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[
                { label: 'On-Time Delivery', value: stats.onTimeRate, suffix: '%', color: '#22c55e' },
                { label: 'Fleet Utilization', value: mockAnalytics.kpiSummary.fleetUtilization, suffix: '%', color: '#0ea5e9' },
                { label: 'Active Deliveries', value: stats.inTransit, suffix: '', color: '#f59e0b', raw: true },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="text-foreground font-semibold">{m.value}{m.suffix}</span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{
                      width: `${'raw' in m ? (m.value as number / 20) * 100 : Math.min(m.value as number * 1.05, 100)}%`,
                      background: `linear-gradient(90deg, ${m.color}, ${m.color}88)`,
                    }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border/30 space-y-1">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Shipments</span><span className="text-foreground font-semibold">{stats.totalShipmentsKPI.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivered</span><span className="text-foreground font-semibold">{stats.delivered}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">In Transit</span><span className="text-foreground font-semibold">{stats.inTransit}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2"><Building2 className="w-4 h-4 text-muted-foreground" />Recent Companies</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground">View All <ArrowRight className="w-3 h-3" /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable data={companyRows} columns={companyColumns} pageSize={6} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" />Recent Users</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground">View All <ArrowRight className="w-3 h-3" /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable data={userRows} columns={userColumns} pageSize={6} />
          </CardContent>
        </Card>
      </div>

      <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-[#e0f2fe]">Quick Actions</h2>
            <p className="text-sm text-[rgba(148,163,184,0.7)] mt-0.5">Common administrative tasks</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add Company', icon: Building2, desc: 'Register a new logistics company' },
            { label: 'Invite Users', icon: UserPlus, desc: 'Send invitation to new users' },
            { label: 'System Settings', icon: Settings, desc: 'Configure platform settings' },
            { label: 'View Reports', icon: ExternalLink, desc: 'Access analytics and reports' },
          ].map(action => (
            <Button key={action.label} variant="outline" className="h-auto flex-col gap-2 py-5 px-4 items-start">
              <action.icon className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="text-sm font-medium">{action.label}</div>
                <div className="text-[0.7rem] text-muted-foreground mt-0.5">{action.desc}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

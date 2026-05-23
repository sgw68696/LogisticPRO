'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Package,
  TrendingUp,
  Truck,
  Users,
  AlertCircle,
  Download,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockShipments, mockAnalytics, mockCustomers, mockDrivers, mockInvoices } from '@/data/mockData';

const statusCounts = mockShipments.reduce((acc, s) => {
  acc[s.status] = (acc[s.status] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
const STATUS_COLORS: Record<string, string> = {
  Delivered: '#22c55e',
  'In Transit': '#3b82f6',
  'Out for Delivery': '#f59e0b',
  Pending: '#6b7280',
  'Picked Up': '#14b8a6',
  Cancelled: '#ef4444',
  Failed: '#dc2626',
};

const serviceTypeCounts = mockShipments.reduce((acc, s) => {
  acc[s.serviceType] = (acc[s.serviceType] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
const serviceChartData = Object.entries(serviceTypeCounts).map(([name, value]) => ({ name, value }));
const SERVICE_COLORS = { Express: '#0ea5e9', Standard: '#22c55e', Freight: '#a855f7' };

const monthlyShipmentTrend = mockAnalytics.shipmentTrend.slice(-12);
const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const trendChartData = monthlyShipmentTrend.map(m => ({
  date: monthNames[new Date(m.date).getMonth()],
  shipments: m.shipments,
  delivered: m.delivered,
}));

const platformChartConfig = {
  shipments: { label: 'Shipments', color: '#0ea5e9' },
  delivered: { label: 'Delivered', color: '#22c55e' },
};

type TopCustomer = { name: string; shipments: number; type: string; revenue: number };
const topCustomers: TopCustomer[] = mockCustomers
  .sort((a, b) => b.totalShipments - a.totalShipments)
  .slice(0, 10)
  .map(c => ({ name: c.name, shipments: c.totalShipments, type: c.type, revenue: Math.floor(Math.random() * 200000) + 50000 }));

const customerColumns: Column<TopCustomer>[] = [
  { key: 'name', header: 'Customer', sortable: true },
  { key: 'shipments', header: 'Shipments', sortable: true, className: 'text-right' },
  {
    key: 'type', header: 'Type', sortable: true,
    render: (item) => (
      <Badge variant="outline" className={item.type === 'Business' ? 'border-blue-500/30 text-blue-400' : 'border-green-500/30 text-green-400'}>
        {item.type}
      </Badge>
    ),
  },
  {
    key: 'revenue', header: 'Revenue', sortable: true, className: 'text-right',
    render: (item) => <span className="font-semibold">₹{item.revenue.toLocaleString('en-IN')}</span>,
  },
];

const recentActivityColumns: Column<{ action: string; entity: string; timestamp: string; status: string }>[] = [
  { key: 'action', header: 'Action', sortable: true },
  { key: 'entity', header: 'Entity', sortable: true },
  { key: 'timestamp', header: 'Timestamp', render: (item) => new Date(item.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) },
  {
    key: 'status', header: 'Status',
    render: (item) => (
      <Badge variant="outline" className={
        item.status === 'Completed' ? 'border-green-500/30 text-green-400' :
        item.status === 'Pending' ? 'border-amber-500/30 text-amber-400' :
        'border-red-500/30 text-red-400'
      }>{item.status}</Badge>
    ),
  },
];

const recentActivity = mockShipments.slice(0, 8).map(s => ({
  action: s.status === 'Delivered' ? 'Shipment Delivered' : s.status === 'In Transit' ? 'Shipment In Transit' : 'Shipment Updated',
  entity: s.trackingNumber,
  timestamp: s.updatedAt,
  status: s.status === 'Delivered' ? 'Completed' : s.status === 'Cancelled' || s.status === 'Failed' ? 'Failed' : 'Pending',
}));

export default function PlatformReportsPage() {
  const [period, setPeriod] = useState('30d');
  const totalShipments = mockShipments.length;
  const deliveredCount = mockShipments.filter(s => s.status === 'Delivered').length;
  const onTimeRate = mockAnalytics.kpiSummary.onTimeDeliveryRate;
  const activeDrivers = mockDrivers.filter(d => d.status === 'Active' || d.status === 'On Duty').length;

  return (
    <PageWrapper
      title="Platform Reports"
      description="Executive summary of platform-wide performance and key metrics"
      actions={
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-9 gap-2"><Download className="w-4 h-4" />Export</Button>
          <Button variant="outline" className="h-9 gap-2"><RefreshCw className="w-4 h-4" />Refresh</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KPICard title="Total Shipments" value={totalShipments} icon={<Package className="w-5 h-5" />} trend={{ value: 12, isPositive: true }} iconColor="cyan" />
        <KPICard title="Delivered" value={deliveredCount} icon={<Truck className="w-5 h-5" />} trend={{ value: 8, isPositive: true }} iconColor="green" />
        <KPICard title="On-Time Rate" value={`${onTimeRate}%`} icon={<TrendingUp className="w-5 h-5" />} trend={{ value: 2.3, isPositive: true }} iconColor="indigo" />
        <KPICard title="Active Drivers" value={activeDrivers} icon={<Users className="w-5 h-5" />} description={`of ${mockDrivers.length} total`} iconColor="teal" />
        <KPICard title="Pending Actions" value={mockShipments.filter(s => s.status === 'Pending').length} icon={<AlertCircle className="w-5 h-5" />} iconColor="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-muted-foreground" />Shipment Trend (30 Days)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ChartContainer config={platformChartConfig} className="h-full w-full">
                <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorShipments" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Area type="monotone" dataKey="shipments" stroke="#0ea5e9" fill="url(#colorShipments)" strokeWidth={2} name="Shipments" />
                  <Area type="monotone" dataKey="delivered" stroke="#22c55e" fill="url(#colorDelivered)" strokeWidth={2} name="Delivered" />
                </AreaChart>
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
                    <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" nameKey="name">
                      {statusChartData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6b7280'} stroke="rgba(255,255,255,0.05)" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0d1f38', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '8px', color: '#e0f2fe' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[45%] space-y-2">
                {statusChartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.name] || '#6b7280' }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="text-foreground font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-muted-foreground" />Service Type Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ChartContainer config={{}} className="h-full w-full">
                <BarChart data={serviceChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 11 }} width={70} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {serviceChartData.map((entry) => (
                      <Cell key={entry.name} fill={SERVICE_COLORS[entry.name as keyof typeof SERVICE_COLORS] || '#0ea5e9'} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" />Delivery Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[
                { label: 'On-Time Delivery', value: onTimeRate, color: '#22c55e' },
                { label: 'Average Transit Time', value: 2.4, suffix: ' days', color: '#0ea5e9' },
                { label: 'Avg Delivery Time', value: 3.1, suffix: ' days', color: '#a855f7' },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">{metric.label}</span>
                    <span className="text-foreground font-semibold">{metric.value}{metric.suffix || '%'}</span>
                  </div>
                  <div className="h-2.5 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{
                      width: `${typeof metric.value === 'number' ? (metric.label.includes('Rate') ? metric.value : Math.min(metric.value / 5 * 100, 100)) : 0}%`,
                      background: `linear-gradient(90deg, ${metric.color}, ${metric.color}88)`,
                    }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border/30">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Shipments</span>
                  <span className="text-foreground font-semibold">{totalShipments}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Unique Customers</span>
                  <span className="text-foreground font-semibold">{mockCustomers.length}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Active Drivers</span>
                  <span className="text-foreground font-semibold">{activeDrivers}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" />Customer Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[
                    { name: 'Business', value: mockCustomers.filter(c => c.type === 'Business').length },
                    { name: 'Individual', value: mockCustomers.filter(c => c.type === 'Individual').length },
                  ]} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value">
                    <Cell fill="#0ea5e9" stroke="rgba(255,255,255,0.05)" />
                    <Cell fill="#a855f7" stroke="rgba(255,255,255,0.05)" />
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0d1f38', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '8px', color: '#e0f2fe' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 -mt-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]" />
                  <span className="text-muted-foreground">Business ({mockCustomers.filter(c => c.type === 'Business').length})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
                  <span className="text-muted-foreground">Individual ({mockCustomers.filter(c => c.type === 'Individual').length})</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" />Top Customers by Volume</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              Updated {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable data={topCustomers} columns={customerColumns} searchKey="name" searchPlaceholder="Search customers..." pageSize={5} />
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><RefreshCw className="w-4 h-4 text-muted-foreground" />Recent Platform Activity</CardTitle></CardHeader>
          <CardContent>
            <DataTable data={recentActivity} columns={recentActivityColumns} pageSize={5} />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

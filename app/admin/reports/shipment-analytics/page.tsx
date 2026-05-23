'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  TrendingUp,
  Clock,
  XCircle,
  Download,
  RefreshCw,
  MapPin,
  BarChart3,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockShipments, mockAnalytics, mockDrivers } from '@/data/mockData';

const statusCounts = mockShipments.reduce((acc, s) => {
  acc[s.status] = (acc[s.status] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
const STATUS_COLORS: Record<string, string> = {
  Delivered: '#22c55e', 'In Transit': '#3b82f6', 'Out for Delivery': '#f59e0b',
  Pending: '#6b7280', 'Picked Up': '#14b8a6', Cancelled: '#ef4444', Failed: '#dc2626',
};

const serviceCounts = mockShipments.reduce((acc, s) => {
  acc[s.serviceType] = (acc[s.serviceType] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
const serviceData = Object.entries(serviceCounts).map(([name, value]) => ({ name, value }));
const SERVICE_COLORS: Record<string, string> = { Express: '#0ea5e9', Standard: '#22c55e', Freight: '#a855f7' };

const cityPairs = mockShipments.reduce((acc, s) => {
  const from = s.pickupAddress.split(',').pop()?.trim() || 'Unknown';
  const to = s.deliveryAddress.split(',').pop()?.trim() || 'Unknown';
  const route = `${from} → ${to}`;
  acc[route] = (acc[route] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
const topRoutes = Object.entries(cityPairs)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8)
  .map(([route, count]) => ({ route, count }));

const dailyTrend = mockAnalytics.shipmentTrend.slice(-30).map(m => ({
  date: new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
  shipments: m.shipments,
  delivered: m.delivered,
}));

const chartConfig = { shipments: { label: 'Shipments', color: '#0ea5e9' }, delivered: { label: 'Delivered', color: '#22c55e' } };

type ShipmentRow = {
  id: string; tracking: string; sender: string; service: string; status: string; origin: string; destination: string;
};
const shipmentRows: ShipmentRow[] = mockShipments.map(s => ({
  id: s.id, tracking: s.trackingNumber, sender: s.senderName,
  service: s.serviceType, status: s.status,
  origin: s.pickupAddress.split(',').pop()?.trim() || '',
  destination: s.deliveryAddress.split(',').pop()?.trim() || '',
}));

const shipmentColumns: Column<ShipmentRow>[] = [
  { key: 'tracking', header: 'Tracking', sortable: true, render: (i) => <span className="font-mono text-xs">{i.tracking}</span> },
  { key: 'sender', header: 'Sender', sortable: true },
  { key: 'service', header: 'Service', sortable: true,
    render: (i) => (
      <Badge variant="outline" className={
        i.service === 'Express' ? 'border-sky-500/30 text-sky-400' :
        i.service === 'Freight' ? 'border-purple-500/30 text-purple-400' :
        'border-green-500/30 text-green-400'
      }>{i.service}</Badge>
    ),
  },
  { key: 'origin', header: 'Origin' },
  { key: 'destination', header: 'Destination' },
  {
    key: 'status', header: 'Status', sortable: true,
    render: (i) => (
      <Badge variant="outline" className={`border ${STATUS_COLORS[i.status] ? `border${STATUS_COLORS[i.status].replace('#', '-')}/30 text${STATUS_COLORS[i.status].replace('#', '-')}` : 'border-slate-500/30 text-slate-400'}`}>
        {i.status}
      </Badge>
    ),
  },
];

const statusBadge = (status: string) => {
  const color = STATUS_COLORS[status] || '#6b7280';
  return `border text-[${color}]/30 text-[${color}]`;
};

export default function ShipmentAnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  const totalShipments = mockShipments.length;
  const delivered = mockShipments.filter(s => s.status === 'Delivered').length;
  const inTransit = mockShipments.filter(s => s.status === 'In Transit').length;
  const cancelled = mockShipments.filter(s => s.status === 'Cancelled' || s.status === 'Failed').length;
  const avgDelivery = delivered > 0
    ? mockShipments
        .filter(s => s.status === 'Delivered' && s.actualDelivery && s.createdAt)
        .reduce((sum, s) => {
          const diff = new Date(s.actualDelivery!).getTime() - new Date(s.createdAt).getTime();
          return sum + diff / (1000 * 60 * 60 * 24);
        }, 0) / delivered
    : 0;

  return (
    <PageWrapper
      title="Shipment Analytics"
      description="Comprehensive analysis of shipment data, trends, and operational metrics"
      actions={
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Period" /></SelectTrigger>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Total Shipments" value={totalShipments} icon={<Package className="w-5 h-5" />} trend={{ value: 12, isPositive: true }} iconColor="cyan" />
        <KPICard title="Delivered" value={delivered} icon={<TrendingUp className="w-5 h-5" />} trend={{ value: 8, isPositive: true }} iconColor="green" />
        <KPICard title="In Transit" value={inTransit} icon={<Package className="w-5 h-5" />} description="Currently moving" iconColor="indigo" />
        <KPICard title="Avg Delivery Time" value={`${avgDelivery.toFixed(1)}d`} icon={<Clock className="w-5 h-5" />} trend={{ value: 5, isPositive: true }} iconColor="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-muted-foreground" />Daily Shipment Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 10 }} interval={4} />
                  <YAxis tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="shipments" fill="#0ea5e9" radius={[3, 3, 0, 0]} name="Shipments" />
                  <Bar dataKey="delivered" fill="#22c55e" radius={[3, 3, 0, 0]} name="Delivered" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><Package className="w-4 h-4 text-muted-foreground" />Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="flex h-[280px] items-center">
              <div className="w-[55%] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name">
                      {statusChartData.map(e => <Cell key={e.name} fill={STATUS_COLORS[e.name] || '#6b7280'} stroke="rgba(255,255,255,0.05)" />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0d1f38', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '8px', color: '#e0f2fe' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[45%] space-y-1.5">
                {statusChartData.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.name] }} />
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
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-muted-foreground" />Service Type Split</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ChartContainer config={{}} className="h-full w-full">
                <BarChart data={serviceData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 11 }} width={70} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {serviceData.map(e => <Cell key={e.name} fill={SERVICE_COLORS[e.name]} />)}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" />Top Routes</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRoutes.map((r, i) => {
                const maxCount = topRoutes[0].count;
                return (
                  <div key={r.route}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground text-xs truncate max-w-[200px]">{r.route}</span>
                      <span className="text-foreground font-semibold text-xs">{r.count}</span>
                    </div>
                    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#6366f1]" style={{ width: `${(r.count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" />Shipment KPIs</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[
                { label: 'On-Time Delivery', value: mockAnalytics.kpiSummary.onTimeDeliveryRate, suffix: '%', color: '#22c55e' },
                { label: 'Cancellation Rate', value: totalShipments > 0 ? ((cancelled / totalShipments) * 100).toFixed(1) : '0', suffix: '%', color: '#ef4444' },
                { label: 'Avg Transit per Shipment', value: avgDelivery.toFixed(1), suffix: ' days', color: '#0ea5e9' },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="text-foreground font-semibold">{m.value}{m.suffix}</span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{
                      width: `${typeof m.value === 'string' ? Math.min(Number(m.value) * 10, 100) : Math.min(m.value * 20, 100)}%`,
                      background: `linear-gradient(90deg, ${m.color}, ${m.color}88)`,
                    }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border/30 space-y-1">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Yesterday Shipments</span><span className="text-foreground font-semibold">{Math.floor(totalShipments / 30)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Avg Daily Volume</span><span className="text-foreground font-semibold">{(totalShipments / 30).toFixed(1)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Peak Day Volume</span><span className="text-foreground font-semibold">{Math.max(...dailyTrend.map(d => d.shipments))}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><Package className="w-4 h-4 text-muted-foreground" />All Shipments</CardTitle>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500/50" />
              {mockShipments.filter(s => s.status === 'Delivered').length} Delivered
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable data={shipmentRows} columns={shipmentColumns} searchKey="sender" searchPlaceholder="Search by sender..." pageSize={10} />
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

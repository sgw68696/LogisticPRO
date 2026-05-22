'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockShipments, mockDrivers, mockVehicles } from '@/data/mockData';
import {
  Truck, Users, TrendingUp, AlertCircle, Package,
  Clock, CheckCircle2, MapPin, Bell,
  ArrowRight, Activity, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Cell,
  PieChart, Pie,
} from 'recharts';

const FLEET_COLORS = ['#22c55e', '#0ea5e9', '#f59e0b', '#ef4444', '#6366f1'];

export default function OpsDashboard() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  const kpis = useMemo(() => {
    const activeShipments = mockShipments.filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled');
    const pendingDispatches = mockShipments.filter(s => s.status === 'Pending').length;
    const driversAvailable = mockDrivers.filter(d => d.status === 'Available' || d.status === 'Off Duty').length;
    const vehiclesInTransit = mockVehicles.filter(v => v.status === 'On Route').length;
    const delayedShipments = activeShipments.filter(s =>
      s.status !== 'Delivered' && s.status !== 'Cancelled' &&
      new Date(s.estimatedDelivery) < new Date()
    ).length;
    const onTimeCount = activeShipments.length - delayedShipments;
    const onTimeRate = activeShipments.length > 0 ? Math.round((onTimeCount / activeShipments.length) * 100) : 100;

    return { pendingDispatches, driversAvailable, vehiclesInTransit, delayedShipments, onTimeRate, activeShipments: activeShipments.length };
  }, []);

  const dispatchQueue = useMemo(() =>
    mockShipments
      .filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled')
      .slice(0, 6)
      .map(s => ({
        ...s,
        driver: mockDrivers.find(d => d.id === s.assignedDriver),
        vehicle: mockVehicles.find(v => v.id === s.assignedVehicle),
      })),
  []);

  const fleetSummary = useMemo(() => {
    const statuses = ['Available', 'On Route', 'Maintenance', 'Inactive'] as const;
    return statuses.map(st => ({
      name: st,
      value: mockVehicles.filter(v => v.status === st).length,
      color: FLEET_COLORS[statuses.indexOf(st)],
    }));
  }, []);

  const dispatchTrend = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dispatched: Math.floor(Math.random() * 15) + 8,
        completed: Math.floor(Math.random() * 12) + 3,
      };
    }),
  []);

  const driverStatusSummary = useMemo(() => {
    const statuses = ['Active', 'On Duty', 'Off Duty', 'Suspended'] as const;
    return statuses.map(st => ({
      name: st,
      count: mockDrivers.filter(d => d.status === st).length,
      color: st === 'Active' ? '#22c55e' : st === 'On Duty' ? '#0ea5e9' : st === 'Off Duty' ? '#6b7280' : '#ef4444',
    }));
  }, []);

  return (
    <PageWrapper
      title="Operations Dashboard"
      description="Real-time dispatch and fleet overview"
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/40 border border-border/40 rounded-lg p-0.5">
            {(['24h', '7d', '30d'] as const).map(r => (
              <button key={r} onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-md text-[0.65rem] font-bold transition-all ${timeRange === r ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
              >{r}</button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      }
    >
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KPICard title="Active Shipments" value={kpis.activeShipments} icon={<Package className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Pending Dispatch" value={kpis.pendingDispatches} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Drivers Available" value={kpis.driversAvailable} icon={<Users className="w-5 h-5" />} iconColor="green" />
        <KPICard title="In Transit" value={kpis.vehiclesInTransit} icon={<Truck className="w-5 h-5" />} iconColor="cyan" trend={{ value: kpis.onTimeRate, isPositive: true }} />
        <KPICard title="Delayed" value={kpis.delayedShipments} icon={<AlertCircle className="w-5 h-5" />} iconColor="red" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Dispatch Trend Chart */}
        <Card className="lg:col-span-2 bg-card border border-border/60 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-[0.82rem] font-bold font-display flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Dispatch Activity (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dispatchTrend} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'oklch(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'oklch(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'oklch(var(--card))', border: '1px solid oklch(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="dispatched" name="Dispatched" radius={[3, 3, 0, 0]} fill="#0ea5e9" />
                  <Bar dataKey="completed" name="Completed" radius={[3, 3, 0, 0]} fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Distribution */}
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-[0.82rem] font-bold font-display flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              Fleet Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={fleetSummary} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {fleetSummary.map(e => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'oklch(var(--card))', border: '1px solid oklch(var(--border))', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {fleetSummary.map(f => (
                <div key={f.name} className="flex items-center gap-2 text-[0.65rem]">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                  <span className="text-muted-foreground">{f.name}</span>
                  <span className="font-bold text-foreground ml-auto">{f.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dispatch Queue */}
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[0.82rem] font-bold font-display flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Dispatch Queue
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground h-7">
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {dispatchQueue.length > 0 ? (
              <div className="divide-y divide-border/40">
                {dispatchQueue.map(item => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/10 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[0.72rem] font-mono font-semibold text-foreground">{item.trackingNumber}</span>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[0.6rem] text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{item.pickupAddress.split(',')[0]}</span>
                        <ArrowRight className="w-2 h-2" />
                        <span>{item.deliveryAddress.split(',')[0]}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[0.65rem] font-medium text-foreground">{item.driver?.name || 'Unassigned'}</p>
                      <p className="text-[0.55rem] text-muted-foreground">{item.vehicle?.registrationNumber || 'No vehicle'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-[0.78rem] text-muted-foreground">No pending dispatches</div>
            )}
          </CardContent>
        </Card>

        {/* Driver Status Summary */}
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[0.82rem] font-bold font-display flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Driver Availability
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground h-7">
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-3 p-4">
              {driverStatusSummary.map(d => (
                <div key={d.name} className="bg-muted/20 border border-border/40 rounded-lg p-3 text-center">
                  <p className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wide">{d.name}</p>
                  <p className="text-2xl font-black font-display text-foreground mt-1" style={{ color: d.color }}>{d.count}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border/40 px-4 py-3">
              <p className="text-[0.65rem] text-muted-foreground">
                <span className="text-success font-bold">{kpis.driversAvailable}</span> drivers currently available for dispatch
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

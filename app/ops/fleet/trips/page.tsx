'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KPICard } from '@/components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockDrivers, mockShipments } from '@/data/mockData';
import {
  Search, X, Users, Award, TrendingUp,
  Clock, CheckCircle2, AlertTriangle,
  RefreshCw, MapPin, Star, Route,
} from 'lucide-react';

export default function TripHistoryPage() {
  const [search, setSearch] = useState('');

  const tripData = useMemo(() =>
    mockDrivers.map(driver => {
      const shipments = mockShipments.filter(s => s.assignedDriver === driver.id);
      const completed = shipments.filter(s => s.status === 'Delivered');
      const totalTrips = shipments.length;
      const completedTrips = completed.length;
      const completionRate = totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0;
      const avgDeliveryTime = completed.length > 0
        ? Math.round(completed.reduce((sum, s) => {
          const created = new Date(s.createdAt).getTime();
          const delivered = s.actualDelivery ? new Date(s.actualDelivery).getTime() : Date.now();
          return sum + (delivered - created);
        }, 0) / completed.length / (1000 * 60 * 60))
        : 0;
      const lastTripDate = shipments.length > 0
        ? new Date(Math.max(...shipments.map(s => new Date(s.updatedAt).getTime()))).toLocaleDateString()
        : 'N/A';
      return { driver, totalTrips, completedTrips, completionRate, avgDeliveryTime, lastTripDate };
    }),
  []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return tripData;
    return tripData.filter(d => d.driver.name.toLowerCase().includes(q));
  }, [tripData, search]);

  const stats = useMemo(() => ({
    total: mockDrivers.length,
    activeDrivers: mockDrivers.filter(d => d.status === 'Active' || d.status === 'On Duty').length,
    totalTrips: tripData.reduce((s, d) => s + d.totalTrips, 0),
    avgCompletion: Math.round(tripData.reduce((s, d) => s + d.completionRate, 0) / tripData.length),
  }), [tripData]);

  const columns: Column<typeof tripData[0]>[] = [
    {
      key: 'driver', header: 'Driver', sortable: true,
      render: (d) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#6366f1] flex items-center justify-center text-white text-[0.55rem] font-bold">
            {d.driver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-[0.78rem] font-medium text-foreground">{d.driver.name}</p>
            <div className="flex items-center gap-1 text-[0.6rem] text-muted-foreground">
              <Star className="w-2.5 h-2.5 text-amber-400" fill="currentColor" />
              {d.driver.rating}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'totalTrips', header: 'Total Trips', sortable: true,
      render: (d) => <span className="text-xs font-semibold text-foreground">{d.totalTrips}</span>,
    },
    {
      key: 'completedTrips', header: 'Completed', sortable: true,
      render: (d) => <span className="text-xs text-muted-foreground">{d.completedTrips}</span>,
    },
    {
      key: 'completionRate', header: 'Rate', sortable: true,
      render: (d) => (
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${d.completionRate >= 80 ? 'bg-success' : d.completionRate >= 60 ? 'bg-amber-400' : 'bg-destructive'}`}
              style={{ width: `${d.completionRate}%` }} />
          </div>
          <span className={`text-[0.6rem] font-bold ${d.completionRate >= 80 ? 'text-success' : d.completionRate >= 60 ? 'text-amber-400' : 'text-destructive'}`}>
            {d.completionRate}%
          </span>
        </div>
      ),
    },
    {
      key: 'avgDeliveryTime', header: 'Avg Time',
      render: (d) => <span className="text-xs text-muted-foreground">{d.avgDeliveryTime}h</span>,
    },
    {
      key: 'lastTripDate', header: 'Last Trip',
      render: (d) => <span className="text-xs text-muted-foreground">{d.lastTripDate}</span>,
    },
  ];

  return (
    <PageWrapper title="Trip History" description="Driver trip history, completion rates, and performance metrics">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Drivers" value={stats.total} icon={<Users className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Active Drivers" value={stats.activeDrivers} icon={<Route className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Total Trips Logged" value={stats.totalTrips} icon={<TrendingUp className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Avg Completion" value={`${stats.avgCompletion}%`} icon={<Award className="w-5 h-5" />} iconColor="amber" />
      </div>

      <Card className="bg-card border border-border/60 shadow-soft mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input type="text" placeholder="Search driver name..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.82rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 transition-all" />
              {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable data={filtered} columns={columns} pageSize={15} searchKey="driver.name" />
    </PageWrapper>
  );
}

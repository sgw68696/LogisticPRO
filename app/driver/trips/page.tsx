'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KPICard } from '@/components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockDrivers, mockShipments } from '@/data/mockData';
import {
  Search, X, Route, MapPin, ArrowRight,
  Clock, CheckCircle2, AlertTriangle, Star,
  Navigation, Eye, TrendingUp, Calendar,
} from 'lucide-react';

const DRIVER_ID = 'drv-001';

export default function DriverTripsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const trips = useMemo(() => {
    const shipments = mockShipments.filter(s => s.assignedDriver === DRIVER_ID);
    return shipments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, []);

  const statuses = useMemo(() => {
    const s = new Set(trips.map(t => t.status));
    return ['All', ...Array.from(s)];
  }, [trips]);

  const filtered = useMemo(() => {
    let data = trips;
    const q = search.toLowerCase();
    if (q) data = data.filter(t => t.trackingNumber.toLowerCase().includes(q) || t.receiverName.toLowerCase().includes(q) || t.senderName.toLowerCase().includes(q) || t.pickupAddress.toLowerCase().includes(q) || t.deliveryAddress.toLowerCase().includes(q));
    if (statusFilter !== 'All') data = data.filter(t => t.status === statusFilter);
    return data;
  }, [trips, search, statusFilter]);

  const stats = useMemo(() => ({
    total: trips.length,
    active: trips.filter(t => t.status !== 'Delivered' && t.status !== 'Cancelled').length,
    completed: trips.filter(t => t.status === 'Delivered').length,
    cancelled: trips.filter(t => t.status === 'Cancelled').length,
  }), [trips]);

  const columns: Column<typeof trips[0]>[] = [
    {
      key: 'tracking', header: 'Tracking #', sortable: true,
      render: (t) => <span className="text-xs font-mono font-semibold text-foreground">{t.trackingNumber}</span>,
    },
    {
      key: 'route', header: 'Route', sortable: true,
      render: (t) => (
        <div className="flex items-center gap-1.5 text-xs min-w-0">
          <span className="truncate max-w-[80px]">{t.pickupAddress.split(',')[0]}</span>
          <ArrowRight className="w-2.5 h-2.5 text-muted-foreground/40 flex-shrink-0" />
          <span className="truncate max-w-[80px]">{t.deliveryAddress.split(',')[0]}</span>
        </div>
      ),
    },
    {
      key: 'sender', header: 'From',
      render: (t) => <span className="text-xs text-muted-foreground">{t.senderName}</span>,
    },
    {
      key: 'receiver', header: 'To',
      render: (t) => <span className="text-xs text-muted-foreground">{t.receiverName}</span>,
    },
    { key: 'weight', header: 'Wt', render: (t) => <span className="text-xs text-muted-foreground">{t.packageWeight}kg</span> },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: 'actions', header: '',
      render: (t) => (
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="View details"><Eye className="w-3.5 h-3.5" /></button>
          {t.status !== 'Delivered' && t.status !== 'Cancelled' && (
            <button className="p-1.5 rounded text-muted-foreground hover:text-sky-400 hover:bg-sky-500/10 transition-colors" title="Navigate"><Navigation className="w-3.5 h-3.5" /></button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageWrapper title="My Trips" description="View all your assigned trips and delivery history">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Trips" value={stats.total} icon={<Route className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Active" value={stats.active} icon={<Clock className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Completed" value={stats.completed} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Cancelled" value={stats.cancelled} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" />
      </div>

      <Card className="bg-card border border-border/60 shadow-soft mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input type="text" placeholder="Search tracking ID, customer, or address..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.82rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 transition-all" />
              {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {statuses.map(st => (
                <button key={st} onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold border transition-all ${statusFilter === st ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'}`}
                >{st} <span className="text-[0.55rem] opacity-60">({st === 'All' ? trips.length : trips.filter(t => t.status === st).length})</span></button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable data={filtered} columns={columns} pageSize={15} searchKey="trackingNumber" />
    </PageWrapper>
  );
}

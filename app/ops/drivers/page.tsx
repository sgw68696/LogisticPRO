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
  Search, X, Users, Star, Phone,
  Award, Clock, CheckCircle2, AlertTriangle,
  RefreshCw, TrendingUp,
} from 'lucide-react';

export default function DriversPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const drivers = useMemo(() => {
    return mockDrivers.map(d => {
      const shipments = mockShipments.filter(s => s.assignedDriver === d.id);
      const completed = shipments.filter(s => s.status === 'Delivered').length;
      const active = shipments.filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled').length;
      return { ...d, activeTrips: active, completedTrips: completed, totalJobs: shipments.length };
    });
  }, []);

  const statuses = useMemo(() => {
    const s = new Set(drivers.map(d => d.status));
    return ['All', ...Array.from(s)];
  }, [drivers]);

  const filtered = useMemo(() => {
    let data = drivers;
    const q = search.toLowerCase();
    if (q) data = data.filter(d => d.name.toLowerCase().includes(q) || d.phone.includes(q) || d.licenseNumber.toLowerCase().includes(q));
    if (statusFilter !== 'All') data = data.filter(d => d.status === statusFilter);
    return data;
  }, [drivers, search, statusFilter]);

  const stats = useMemo(() => ({
    total: drivers.length,
    onDuty: drivers.filter(d => d.status === 'On Duty').length,
    available: drivers.filter(d => d.status === 'Active' || d.status === 'Off Duty').length,
    suspended: drivers.filter(d => d.status === 'Suspended').length,
  }), [drivers]);

  const columns: Column<typeof drivers[0]>[] = [
    {
      key: 'name', header: 'Driver', sortable: true,
      render: (d) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#6366f1] flex items-center justify-center text-white text-[0.55rem] font-bold">
            {d.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-[0.78rem] font-medium text-foreground">{d.name}</p>
            <div className="flex items-center gap-1.5 text-[0.6rem] text-muted-foreground">
              <Star className="w-2.5 h-2.5 text-amber-400" fill="currentColor" />
              {d.rating} · ID: {d.driverId}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (d) => <StatusBadge status={d.status} />,
    },
    {
      key: 'licenseNumber', header: 'License',
      render: (d) => <span className="text-xs font-mono text-muted-foreground">{d.licenseNumber}</span>,
    },
    {
      key: 'activeTrips', header: 'Active', sortable: true,
      render: (d) => <span className="text-xs font-semibold text-foreground">{d.activeTrips}</span>,
    },
    {
      key: 'completedTrips', header: 'Completed', sortable: true,
      render: (d) => <span className="text-xs text-muted-foreground">{d.completedTrips}</span>,
    },
    {
      key: 'totalTrips', header: 'Total Trips',
      render: (d) => <span className="text-xs text-muted-foreground">{d.totalTrips}</span>,
    },
    {
      key: 'phone', header: 'Contact',
      render: (d) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="w-3 h-3" />{d.phone}
        </div>
      ),
    },
  ];

  return (
    <PageWrapper title="Drivers" description="View and manage all driver profiles and statuses">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Drivers" value={stats.total} icon={<Users className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="On Duty" value={stats.onDuty} icon={<Clock className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Available" value={stats.available} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Suspended" value={stats.suspended} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" />
      </div>

      <Card className="bg-card border border-border/60 shadow-soft mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text" placeholder="Search by name, phone, or license..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.82rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 transition-all"
              />
              {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {statuses.map(st => (
                <button key={st} onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold border transition-all ${statusFilter === st ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'}`}
                >{st} <span className="text-[0.55rem] opacity-60">({st === 'All' ? drivers.length : drivers.filter(d => d.status === st).length})</span></button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable data={filtered} columns={columns} pageSize={20} searchKey="name" />
    </PageWrapper>
  );
}

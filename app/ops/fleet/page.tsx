'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KPICard } from '@/components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockVehicles, mockDrivers, mockShipments } from '@/data/mockData';
import {
  Search, X, Truck, Gauge, Wrench,
  MapPin, Users, Fuel, Clock,
  AlertTriangle, CheckCircle2, RefreshCw,
  Calendar, Shield,
} from 'lucide-react';

export default function FleetPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const vehicles = useMemo(() => {
    return mockVehicles.map(v => ({
      ...v,
      driver: mockDrivers.find(d => d.id === v.currentDriver),
      activeShipments: mockShipments.filter(s => s.assignedVehicle === v.id && s.status !== 'Delivered' && s.status !== 'Cancelled').length,
    }));
  }, []);

  const statuses = useMemo(() => {
    const s = new Set(vehicles.map(v => v.status));
    return ['All', ...Array.from(s)];
  }, [vehicles]);

  const filtered = useMemo(() => {
    let data = vehicles;
    const q = search.toLowerCase();
    if (q) data = data.filter(v => v.registrationNumber.toLowerCase().includes(q) || v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q));
    if (statusFilter !== 'All') data = data.filter(v => v.status === statusFilter);
    return data;
  }, [vehicles, search, statusFilter]);

  const stats = useMemo(() => ({
    total: vehicles.length,
    onRoute: vehicles.filter(v => v.status === 'On Route').length,
    available: vehicles.filter(v => v.status === 'Available').length,
    maintenance: vehicles.filter(v => v.status === 'Maintenance').length,
  }), [vehicles]);

  const columns: Column<typeof vehicles[0]>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      sortable: true,
      render: (v) => (
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${v.status === 'Available' ? 'bg-success/10 text-success border-success/20' : v.status === 'On Route' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : v.status === 'Maintenance' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-muted/40 text-muted-foreground border-border/40'}`}>
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[0.78rem] font-medium text-foreground">{v.registrationNumber}</p>
            <p className="text-[0.6rem] text-muted-foreground">{v.make} {v.model} ({v.year})</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (v) => <StatusBadge status={v.status} />,
    },
    {
      key: 'capacity', header: 'Capacity',
      render: (v) => <span className="text-xs text-muted-foreground">{v.capacity} {v.capacityUnit}</span>,
    },
    {
      key: 'driver', header: 'Driver',
      render: (v) => v.driver
        ? <span className="text-xs text-foreground">{v.driver.name}</span>
        : <span className="text-xs text-muted-foreground/50">Unassigned</span>,
    },
    {
      key: 'activeShipments', header: 'Jobs', sortable: true,
      render: (v) => <span className="text-xs font-semibold text-foreground">{v.activeShipments}</span>,
    },
    {
      key: 'fuelType', header: 'Fuel',
      render: (v) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Fuel className="w-3 h-3" />
          {v.fuelType}
        </div>
      ),
    },
    {
      key: 'nextService', header: 'Service',
      render: (v) => (
        <span className={`text-xs ${new Date(v.nextServiceDue || v.lastServiceDate) < new Date() ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
          {v.lastServiceDate || 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Fleet Management"
      description="Monitor and manage vehicle fleet status and assignments"
    >
      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Vehicles" value={stats.total} icon={<Truck className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="On Route" value={stats.onRoute} icon={<MapPin className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Available" value={stats.available} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Maintenance" value={stats.maintenance} icon={<Wrench className="w-5 h-5" />} iconColor="amber" />
      </div>

      {/* Filter Bar */}
      <Card className="bg-card border border-border/60 shadow-soft mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text" placeholder="Search by reg, make, or model..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.82rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 transition-all"
              />
              {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {statuses.map(st => (
                <button key={st} onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold border transition-all ${statusFilter === st ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'}`}
                >{st} <span className="text-[0.55rem] opacity-60">({st === 'All' ? vehicles.length : vehicles.filter(v => v.status === st).length})</span></button>
              ))}
            </div>
            {(search || statusFilter !== 'All') && (
              <p className="text-[0.65rem] text-muted-foreground ml-auto">{filtered.length} vehicle(s) found</p>
            )}
          </div>
        </CardContent>
      </Card>

      <DataTable data={filtered} columns={columns} pageSize={15} searchKey="registrationNumber" />
    </PageWrapper>
  );
}

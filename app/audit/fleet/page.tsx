'use client';

import { useMemo, useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fleetService } from '@/services/fleetService';
import { getStatusStyle } from '@/config/statusConfig';
import { cn } from '@/lib/utils';
import { Truck, Search, X, RotateCcw, ShieldAlert, Wrench, MapPin, CheckCircle } from 'lucide-react';
import type { FleetVehicle } from '@/types/vehicle';

export default function AuditFleetPage() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fleetService.list().then((data) => {
      setVehicles(data);
      setLoading(false);
    });
  }, []);

  const statuses = useMemo(() => {
    const set = new Set(vehicles.map(v => v.status));
    return ['All', ...Array.from(set)];
  }, [vehicles]);

  const filtered = useMemo(() => {
    let result = [...vehicles];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(v =>
        v.vehicleId.toLowerCase().includes(q) ||
        v.licensePlate.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        (v.assignedDriver && v.assignedDriver.toLowerCase().includes(q)) ||
        v.currentLocation.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') result = result.filter(v => v.status === statusFilter);
    return result;
  }, [vehicles, search, statusFilter]);

  const stats = useMemo(() => ({
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'Available').length,
    onRoute: vehicles.filter(v => v.status === 'On Route').length,
    maintenance: vehicles.filter(v => v.status === 'Maintenance').length,
  }), [vehicles]);

  const columns: Column<FleetVehicle>[] = [
    {
      key: 'vehicleId',
      header: 'Vehicle ID',
      sortable: true,
      render: (v) => (
        <span className="text-xs font-mono font-semibold text-foreground">{v.vehicleId}</span>
      ),
    },
    {
      key: 'model',
      header: 'Type + Model',
      sortable: true,
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-7 h-7 rounded-lg border flex items-center justify-center',
            v.type === 'Truck' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
            v.type === 'Van' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
            v.type === 'Bike' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            'bg-muted/40 text-muted-foreground border-border/40'
          )}>
            <Truck className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">{v.type}</p>
            <p className="text-[0.6rem] text-muted-foreground">{v.model}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'licensePlate',
      header: 'License Plate',
      sortable: true,
      render: (v) => (
        <span className="text-xs font-mono text-foreground">{v.licensePlate}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (v) => {
        const style = getStatusStyle(v.status);
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} ${style.border} border`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {style.label}
          </span>
        );
      },
    },
    {
      key: 'assignedDriver',
      header: 'Assigned Driver',
      sortable: true,
      render: (v) => (
        <span className={cn('text-xs', v.assignedDriver ? 'text-foreground' : 'text-muted-foreground/50')}>
          {v.assignedDriver || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'currentLocation',
      header: 'Current Location',
      render: (v) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {v.currentLocation}
        </div>
      ),
    },
    {
      key: 'maintenanceHistory',
      header: 'Last Updated',
      sortable: true,
      render: (v) => {
        const dates = (v.maintenanceHistory ?? []).map(m => m.date).filter(Boolean);
        const latest = dates.length > 0 ? dates.sort().reverse()[0] : null;
        return latest ? (
          <span className="text-xs text-muted-foreground">{new Date(latest).toLocaleDateString()}</span>
        ) : (
          <span className="text-xs text-muted-foreground/50">&mdash;</span>
        );
      },
    },
  ];

  if (loading) {
    return (
      <PageWrapper title="Fleet Records" description="Read-only fleet vehicle audit records">
        <LoadingState rows={8} message="Loading fleet records..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Fleet Records"
      description="Read-only fleet vehicle audit records"
      actions={
        <Badge variant="outline" className="gap-1.5 text-xs border-amber-500/20 text-amber-400 bg-amber-500/5">
          <ShieldAlert className="w-3 h-3" />
          Read-Only
        </Badge>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Vehicles" value={stats.total} icon={<Truck className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Available" value={stats.available} icon={<CheckCircle className="w-5 h-5" />} iconColor="green" />
        <KPICard title="On Route" value={stats.onRoute} icon={<MapPin className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="In Maintenance" value={stats.maintenance} icon={<Wrench className="w-5 h-5" />} iconColor="amber" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, plate, model, driver, or location..."
              className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statuses.map((st) => {
            const isActive = statusFilter === st;
            const count = st === 'All' ? vehicles.length : vehicles.filter(v => v.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold border transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                    : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'
                }`}
              >
                {st}
                <span className="text-[0.6rem] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
        {(search || statusFilter !== 'All') && (
          <p className="text-[0.65rem] text-muted-foreground mt-2 ml-1">{filtered.length} record(s) found</p>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert className="w-8 h-8" />}
          title="No fleet records found"
          description="No audit records match your current search or filter criteria."
          action={
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setSearch(''); setStatusFilter('All'); }}>
              <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
            </Button>
          }
        />
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          pageSize={15}
          searchKey="vehicleId"
          searchPlaceholder="Search in results..."
        />
      )}
    </PageWrapper>
  );
}

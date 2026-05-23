'use client';

import { useMemo, useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { warehouseService } from '@/services/warehouseService';
import { formatDate } from '@/lib/shipment-utils/formatting';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Warehouse as WarehouseIcon, Package, Search, X, RotateCcw, ShieldAlert, Building2, Users, Boxes, BarChart3, MapPin } from 'lucide-react';
import type { Warehouse } from '@/types/warehouse';

export default function AuditWarehousePage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');

  useEffect(() => {
    warehouseService.list().then((data) => {
      setWarehouses(data);
      setLoading(false);
    });
  }, []);

  const cities = useMemo(() => {
    const set = new Set(warehouses.map(w => w.city));
    return ['All', ...Array.from(set)];
  }, [warehouses]);

  const filtered = useMemo(() => {
    let result = [...warehouses];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.warehouseId.toLowerCase().includes(q) ||
        w.city.toLowerCase().includes(q) ||
        w.manager.toLowerCase().includes(q) ||
        w.location.toLowerCase().includes(q)
      );
    }
    if (cityFilter !== 'All') result = result.filter(w => w.city === cityFilter);
    return result;
  }, [warehouses, search, cityFilter]);

  const stats = useMemo(() => {
    const total = warehouses.length;
    const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0);
    const totalStock = warehouses.reduce((sum, w) => sum + w.currentStock, 0);
    const utilization = totalCapacity > 0 ? Math.round((totalStock / totalCapacity) * 100) : 0;
    return { total, totalCapacity, totalStock, utilization };
  }, [warehouses]);

  const formatCapacity = (val: number) => {
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toLocaleString();
  };

  const getUtilizationColor = (pct: number) => {
    if (pct >= 90) return 'text-red-400';
    if (pct >= 70) return 'text-amber-400';
    return 'text-green-400';
  };

  const getUtilizationBar = (pct: number) => {
    const color =
      pct >= 90 ? 'bg-red-500' :
      pct >= 70 ? 'bg-amber-500' :
      pct >= 40 ? 'bg-green-500' :
      'bg-blue-500';
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <span className={cn('text-xs font-bold', getUtilizationColor(pct))}>{pct}%</span>
      </div>
    );
  };

  const columns: Column<Warehouse>[] = [
    {
      key: 'warehouseId',
      header: 'Warehouse ID',
      sortable: true,
      render: (w) => (
        <div>
          <span className="text-xs font-mono font-semibold text-foreground">{w.warehouseId}</span>
          <p className="text-[0.6rem] text-muted-foreground mt-0.5">{w.id}</p>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (w) => (
        <div className="min-w-0">
          <span className="text-xs font-medium text-foreground truncate max-w-[160px] block">{w.name}</span>
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Location',
      sortable: true,
      render: (w) => (
        <span className="text-xs text-muted-foreground">{w.city}</span>
      ),
    },
    {
      key: 'capacity',
      header: 'Capacity',
      sortable: true,
      render: (w) => (
        <span className="text-xs text-muted-foreground">{formatCapacity(w.capacity)} units</span>
      ),
    },
    {
      key: 'currentStock',
      header: 'Current Stock',
      sortable: true,
      render: (w) => (
        <span className="text-xs text-muted-foreground">{formatCapacity(w.currentStock)} units</span>
      ),
    },
    {
      key: 'currentStock',
      header: 'Utilization',
      sortable: true,
      render: (w) => {
        const pct = w.capacity > 0 ? Math.round((w.currentStock / w.capacity) * 100) : 0;
        return getUtilizationBar(pct);
      },
    },
    {
      key: 'manager',
      header: 'Manager',
      sortable: true,
      render: (w) => <span className="text-xs text-muted-foreground">{w.manager}</span>,
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (w) => <span className="text-xs text-muted-foreground">{w.contact}</span>,
    },
  ];

  if (loading) {
    return (
      <PageWrapper title="Warehouse Records" description="Read-only warehouse audit records">
        <LoadingState rows={5} message="Loading warehouse records..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Warehouse Records"
      description="Read-only warehouse audit records"
      actions={
        <Badge variant="outline" className="gap-1.5 text-xs border-amber-500/20 text-amber-400 bg-amber-500/5">
          <ShieldAlert className="w-3 h-3" />
          Read-Only
        </Badge>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Warehouses" value={stats.total} icon={<Building2 className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Total Capacity" value={`${formatCapacity(stats.totalCapacity)} units`} icon={<BarChart3 className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Current Stock" value={`${formatCapacity(stats.totalStock)} units`} icon={<Boxes className="w-5 h-5" />} iconColor="teal" />
        <KPICard title="Utilization" value={`${stats.utilization}%`} icon={<Package className="w-5 h-5" />} iconColor="amber" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, city, or manager..."
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
          {cities.map((city) => {
            const isActive = cityFilter === city;
            const count = city === 'All' ? warehouses.length : warehouses.filter(w => w.city === city).length;
            return (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold border transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                    : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'
                }`}
              >
                {city}
                <span className="text-[0.6rem] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
        {(search || cityFilter !== 'All') && (
          <p className="text-[0.65rem] text-muted-foreground mt-2 ml-1">{filtered.length} record(s) found</p>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<WarehouseIcon className="w-8 h-8" />}
          title="No warehouse records found"
          description="No audit records match your current search or filter criteria."
          action={
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setSearch(''); setCityFilter('All'); }}>
              <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
            </Button>
          }
        />
      ) : filtered.length <= 5 && !search && cityFilter === 'All' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((w) => {
            const pct = w.capacity > 0 ? Math.round((w.currentStock / w.capacity) * 100) : 0;
            return (
              <div key={w.id} className="bg-card border border-border/60 rounded-xl p-5 shadow-soft hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-mono font-semibold text-muted-foreground">{w.warehouseId}</p>
                    <h3 className="text-sm font-semibold text-foreground mt-0.5">{w.name}</h3>
                  </div>
                  <Building2 className="w-5 h-5 text-muted-foreground/40" />
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>{w.city} — {w.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    <span>{w.manager} · {w.contact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Boxes className="w-3 h-3" />
                    <span>{formatCapacity(w.currentStock)} / {formatCapacity(w.capacity)} units</span>
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-muted-foreground/60">Utilization</span>
                      <span className={cn('text-xs font-bold', getUtilizationColor(pct))}>{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : pct >= 40 ? 'bg-green-500' : 'bg-blue-500')}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          pageSize={10}
          searchKey="name"
          searchPlaceholder="Search in results..."
        />
      )}
    </PageWrapper>
  );
}

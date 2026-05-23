'use client';

import { useMemo, useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { shipmentService } from '@/services/shipment/shipmentService';
import { formatDate } from '@/lib/shipment-utils/formatting';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, RotateCcw, Package, Truck, Clock, CheckCircle2, AlertTriangle, ArrowRight, MapPin, Plus } from 'lucide-react';
import type { ConsolidatedShipment, ShipmentStatus } from '@/types/shipment';

const STATUSES: ShipmentStatus[] = ['Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed'];

export default function ManagerShipmentsPage() {
  const [shipments, setShipments] = useState<ConsolidatedShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');

  useEffect(() => {
    shipmentService.list({ role: 'Manager' }).then((data) => {
      setShipments(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = [...shipments];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.trackingNumber.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.sender.name.toLowerCase().includes(q) ||
        s.receiver.name.toLowerCase().includes(q) ||
        s.route.origin.toLowerCase().includes(q) ||
        s.route.destination.toLowerCase().includes(q) ||
        s.sender.city.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') result = result.filter(s => s.status === statusFilter);
    if (serviceFilter !== 'All') result = result.filter(s => s.serviceType === serviceFilter);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [shipments, search, statusFilter, serviceFilter]);

  const stats = useMemo(() => ({
    total: shipments.length,
    inTransit: shipments.filter(s => s.status === 'In Transit').length,
    delivered: shipments.filter(s => s.status === 'Delivered').length,
    pending: shipments.filter(s => s.status === 'Pending').length,
    delayed: shipments.filter(s => s.status === 'Failed' || s.status === 'Cancelled').length,
  }), [shipments]);

  const columns: Column<ConsolidatedShipment>[] = [
    {
      key: 'trackingNumber',
      header: 'Tracking',
      sortable: true,
      render: (s) => (
        <div>
          <span className="text-xs font-mono font-semibold text-foreground">{s.trackingNumber}</span>
          <p className="text-[0.6rem] text-muted-foreground mt-0.5">{s.customerName}</p>
        </div>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      render: (s) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate max-w-[120px]">{s.route.origin}</span>
          <ArrowRight className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate max-w-[120px]">{s.route.destination}</span>
        </div>
      ),
    },
    {
      key: 'serviceType',
      header: 'Service',
      sortable: true,
      render: (s) => <span className="text-xs text-muted-foreground">{s.serviceType}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: 'estimatedDelivery',
      header: 'ETA',
      sortable: true,
      render: (s) => {
        const isLate = s.status !== 'Delivered' && s.status !== 'Cancelled' && new Date(s.estimatedDelivery) < new Date();
        return (
          <span className={`text-xs ${isLate ? 'text-red-400 font-semibold' : 'text-muted-foreground'}`}>
            {formatDate(s.estimatedDelivery)}
            {isLate && <span className="ml-1 text-[0.55rem] text-red-400">(Late)</span>}
          </span>
        );
      },
    },
    {
      key: 'assignedDriver',
      header: 'Driver',
      render: (s) => <span className="text-xs text-muted-foreground">{s.assignedDriver || '—'}</span>,
    },
  ];

  if (loading) {
    return (
      <PageWrapper title="Shipments" description="Manage and monitor all company shipments">
        <LoadingState rows={8} message="Loading shipments..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Shipments"
      description="Manage and monitor all company shipments"
      actions={
        <Button className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg text-xs h-9 gap-1.5 rounded-[10px]">
          <Plus className="w-3.5 h-3.5" />
          New Shipment
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Shipments" value={stats.total} icon={<Package className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="In Transit" value={stats.inTransit} icon={<Truck className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Delivered" value={stats.delivered} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Issues" value={stats.delayed} icon={<AlertTriangle className="w-5 h-5" />} iconColor="amber" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tracking ID, customer, route, or city..."
              className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs bg-muted/40 border-border/60 rounded-[9px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All" className="text-xs">All Statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-[130px] h-9 text-xs bg-muted/40 border-border/60 rounded-[9px]">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All" className="text-xs">All Services</SelectItem>
              <SelectItem value="Express" className="text-xs">Express</SelectItem>
              <SelectItem value="Standard" className="text-xs">Standard</SelectItem>
              <SelectItem value="Freight" className="text-xs">Freight</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(search || statusFilter !== 'All' || serviceFilter !== 'All') && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
            <p className="text-[0.65rem] text-muted-foreground">{filtered.length} of {shipments.length} shipment(s)</p>
            <Button variant="ghost" size="sm" className="h-6 text-[0.65rem] gap-1" onClick={() => { setSearch(''); setStatusFilter('All'); setServiceFilter('All'); }}>
              <RotateCcw className="w-3 h-3" /> Clear
            </Button>
          </div>
        )}
      </div>

      {filtered.length === 0 && (search || statusFilter !== 'All' || serviceFilter !== 'All') ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="No shipments found"
          description="Try adjusting your search or filter criteria."
          action={
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setSearch(''); setStatusFilter('All'); setServiceFilter('All'); }}>
              <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
            </Button>
          }
        />
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          pageSize={15}
          searchKey="trackingNumber"
          searchPlaceholder="Search in results..."
        />
      )}
    </PageWrapper>
  );
}

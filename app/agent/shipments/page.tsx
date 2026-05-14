'use client';

import { useMemo, useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ShipmentCard } from '@/components/shared/ShipmentCard';
import { shipmentService } from '@/services/shipment/shipmentService';
import { formatDate } from '@/lib/shipment-utils/formatting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search, X, RotateCcw, Package, Truck, Warehouse, User, MapPin,
  ArrowRight, Clock, CheckCircle2, AlertTriangle, LayoutGrid, List,
} from 'lucide-react';
import type { ConsolidatedShipment } from '@/types/shipment';

const AGENT_VIEWS = [
  { role: 'Warehouse', label: 'Warehouse Agent', icon: Warehouse },
  { role: 'Driver', label: 'Driver', icon: Truck },
  { role: 'Finance', label: 'Finance Agent', icon: User },
] as const;

export default function AgentShipmentsPage() {
  const [shipments, setShipments] = useState<ConsolidatedShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [agentView, setAgentView] = useState<string>('Warehouse');
  const [cardView, setCardView] = useState(true);

  useEffect(() => {
    shipmentService.list({ role: agentView }).then((data) => {
      setShipments(data);
      setLoading(false);
    });
  }, [agentView]);

  const statuses = useMemo(() => {
    const set = new Set(shipments.map(s => s.status));
    return ['All', ...Array.from(set)];
  }, [shipments]);

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
        s.route.destination.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') result = result.filter(s => s.status === statusFilter);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [shipments, search, statusFilter]);

  const stats = useMemo(() => ({
    total: shipments.length,
    pending: shipments.filter(s => s.status === 'Pending').length,
    inTransit: shipments.filter(s => s.status === 'In Transit').length,
    outForDelivery: shipments.filter(s => s.status === 'Out for Delivery').length,
    delivered: shipments.filter(s => s.status === 'Delivered').length,
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
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-2.5 h-2.5" />
          <span className="truncate max-w-[140px]">{s.route.origin} → {s.route.destination}</span>
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
      key: 'package',
      header: 'Pkg',
      render: (s) => <span className="text-xs text-muted-foreground">{s.package.pieces}pcs · {s.package.weight}kg</span>,
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
      render: (s) => <span className="text-xs text-muted-foreground">{formatDate(s.estimatedDelivery)}</span>,
    },
  ];

  if (loading) {
    return (
      <PageWrapper title="My Shipments" description="Track and manage your assigned shipments">
        <LoadingState rows={8} message="Loading shipments..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="My Shipments"
      description="Track and manage your assigned shipments"
      actions={
        <div className="flex items-center gap-2">
          {AGENT_VIEWS.map(({ role, label, icon: Icon }) => (
            <Button
              key={role}
              variant={agentView === role ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => { setAgentView(role); setLoading(true); }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setCardView(!cardView)}
          >
            {cardView ? <List className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
            {cardView ? 'Table' : 'Cards'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total" value={stats.total} icon={<Package className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="In Transit" value={stats.inTransit} icon={<Truck className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Delivered" value={stats.delivered} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tracking ID, customer, or route..."
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
            const count = st === 'All' ? shipments.length : shipments.filter(s => s.status === st).length;
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
          <p className="text-[0.65rem] text-muted-foreground mt-2 ml-1">{filtered.length} shipment(s) found</p>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="No shipments found"
          description="No shipments match your current search or filter criteria for this agent view."
          action={
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setSearch(''); setStatusFilter('All'); }}>
              <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
            </Button>
          }
        />
      ) : cardView ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <ShipmentCard key={s.id} shipment={s} />
          ))}
        </div>
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

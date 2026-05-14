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
import { Badge } from '@/components/ui/badge';
import { Search, X, RotateCcw, Package, CheckCircle2, ShieldAlert, Clock, AlertTriangle, ArrowRight, MapPin } from 'lucide-react';
import type { ConsolidatedShipment } from '@/types/shipment';

export default function AuditShipmentsPage() {
  const [shipments, setShipments] = useState<ConsolidatedShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    shipmentService.list({ role: 'AuditorReadOnly' }).then((data) => {
      setShipments(data);
      setLoading(false);
    });
  }, []);

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
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [shipments, search, statusFilter]);

  const stats = useMemo(() => ({
    total: shipments.length,
    delivered: shipments.filter(s => s.status === 'Delivered').length,
    cancelled: shipments.filter(s => s.status === 'Cancelled').length,
    failed: shipments.filter(s => s.status === 'Failed').length,
  }), [shipments]);

  const columns: Column<ConsolidatedShipment>[] = [
    {
      key: 'trackingNumber',
      header: 'Tracking ID',
      sortable: true,
      render: (s) => (
        <div>
          <span className="text-xs font-mono font-semibold text-foreground">{s.trackingNumber}</span>
          <p className="text-[0.6rem] text-muted-foreground mt-0.5">{s.customerName}</p>
        </div>
      ),
    },
    {
      key: 'sender',
      header: 'Sender → Receiver',
      render: (s) => (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-foreground truncate max-w-[100px]">{s.sender.name}</span>
            <ArrowRight className="w-2.5 h-2.5 text-muted-foreground/40" />
            <span className="text-xs font-medium text-foreground truncate max-w-[100px]">{s.receiver.name}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-2 h-2 text-muted-foreground/40" />
            <span className="text-[0.6rem] text-muted-foreground truncate max-w-[200px]">{s.route.origin} → {s.route.destination}</span>
          </div>
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
      render: (s) => <span className="text-xs text-muted-foreground">{formatDate(s.estimatedDelivery)}</span>,
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      sortable: true,
      render: (s) => <span className="text-xs text-muted-foreground">{formatDate(s.updatedAt)}</span>,
    },
  ];

  if (loading) {
    return (
      <PageWrapper title="Audit: All Shipments" description="Read-only view of completed and cancelled shipments">
        <LoadingState rows={8} message="Loading shipment records..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Audit: All Shipments"
      description="Read-only view of completed, cancelled, and failed shipment records"
      actions={
        <Badge variant="outline" className="gap-1.5 text-xs border-amber-500/20 text-amber-400 bg-amber-500/5">
          <ShieldAlert className="w-3 h-3" />
          Read-Only
        </Badge>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Records" value={stats.total} icon={<Package className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Delivered" value={stats.delivered} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Cancelled" value={stats.cancelled} icon={<X className="w-5 h-5" />} iconColor="red" />
        <KPICard title="Failed" value={stats.failed} icon={<AlertTriangle className="w-5 h-5" />} iconColor="amber" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tracking ID, customer, sender, receiver, or route..."
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
          <p className="text-[0.65rem] text-muted-foreground mt-2 ml-1">{filtered.length} record(s) found</p>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert className="w-8 h-8" />}
          title="No shipment records found"
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
          searchKey="trackingNumber"
          searchPlaceholder="Search in results..."
        />
      )}
    </PageWrapper>
  );
}

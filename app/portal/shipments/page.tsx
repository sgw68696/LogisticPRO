'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { shipmentService } from '@/services/shipment/shipmentService';
import { formatDate } from '@/lib/shipment-utils/formatting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package, Search, X, Eye, Clock, CheckCircle2,
  Truck, Ship, Plane, ArrowRight, MapPin,
} from 'lucide-react';
import type { ConsolidatedShipment } from '@/types/shipment';

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Express: Plane, Standard: Truck, Freight: Ship,
};

export default function PortalShipmentsPage() {
  const [shipments, setShipments] = useState<ConsolidatedShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    shipmentService.list({ role: 'CustomerPortal' }).then((data) => {
      setShipments(data);
      setLoading(false);
    });
  }, []);

  const statuses = useMemo(() => ['All', ...Array.from(new Set(shipments.map(s => s.status)))], [shipments]);

  const filtered = useMemo(() => {
    let r = [...shipments];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(s =>
        s.trackingNumber.toLowerCase().includes(q) ||
        s.route.origin.toLowerCase().includes(q) ||
        s.route.destination.toLowerCase().includes(q) ||
        s.receiver.name.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') r = r.filter(s => s.status === statusFilter);
    return r.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [shipments, search, statusFilter]);

  const stats = useMemo(() => ({
    total: shipments.length,
    inTransit: shipments.filter(s => s.status === 'In Transit').length,
    delivered: shipments.filter(s => s.status === 'Delivered').length,
    pending: shipments.filter(s => s.status === 'Pending').length,
  }), [shipments]);

  if (loading) {
    return (
      <PageWrapper title="My Shipments" description="View and track all your shipments in one place">
        <LoadingState rows={6} message="Loading your shipments..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="My Shipments"
      description="View and track all your shipments in one place"
      actions={
        <Link href="/portal/bookings/new">
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-600 rounded-[10px] gap-2 text-xs h-9">
            <Package className="w-4 h-4" />
            New Shipment
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Shipments" value={stats.total} icon={<Package className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="In Transit" value={stats.inTransit} icon={<Truck className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Delivered" value={stats.delivered} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); }}
              placeholder="Search by tracking ID, address, or recipient..."
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
                {st === 'All' ? null : <StatusBadge status={st} dot />}
                {st} <span className="text-[0.6rem] opacity-60">({count})</span>
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
          description="Try adjusting your search or filter criteria"
          action={
            <Button variant="outline" size="sm" className="rounded-[9px] text-xs" onClick={() => { setSearch(''); setStatusFilter('All'); }}>
              Clear Filters
            </Button>
          }
        />
      ) : (
        <div className="bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/10">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Tracking ID</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Route</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Service</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">ETA</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const ServiceIcon = SERVICE_ICONS[s.serviceType] || Truck;
                  return (
                    <tr key={s.id} className={`border-b border-border/20 hover:bg-muted/10 transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}>
                      <td className="py-3 px-4">
                        <Link href={`/portal/shipments/${s.id}`} className="font-mono text-xs text-foreground font-semibold hover:text-primary transition-colors">
                          {s.trackingNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4 max-w-[200px]">
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          {s.route.origin}
                          <ArrowRight className="w-2.5 h-2.5 inline" />
                          {s.route.destination}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <ServiceIcon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[0.65rem] text-muted-foreground">{s.serviceType}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="py-3 px-4 text-right text-[0.7rem] text-muted-foreground">
                        {formatDate(s.estimatedDelivery, { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/portal/shipments/${s.id}`}>
                          <button className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

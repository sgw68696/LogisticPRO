'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import {
  ClipboardList, Search, X, Eye, Plus, ArrowRight,
  Clock, CheckCircle2, Loader2, XCircle, FileText,
} from 'lucide-react';
import { portalMockBookings } from '@/data/portal-mock-data';
import type { PortalBookingStatus } from '@/types/portal';

const STATUS_META: Record<PortalBookingStatus, { pill: string; dot: string }> = {
  Draft: { pill: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
  Confirmed: { pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' },
  Processing: { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  Shipped: { pill: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', dot: 'bg-cyan-400' },
  Delivered: { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  Cancelled: { pill: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' },
};

export default function PortalBookingsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let r = [...portalMockBookings];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(b => b.bookingRef.toLowerCase().includes(q) || b.pickupAddress.toLowerCase().includes(q) || b.deliveryAddress.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
    }
    if (statusFilter !== 'All') r = r.filter(b => b.status === statusFilter);
    return r.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [search, statusFilter]);

  const stats = useMemo(() => ({
    total: portalMockBookings.length,
    active: portalMockBookings.filter(b => b.status === 'Shipped' || b.status === 'Processing').length,
    delivered: portalMockBookings.filter(b => b.status === 'Delivered').length,
    draft: portalMockBookings.filter(b => b.status === 'Draft').length,
  }), []);

  const statuses = useMemo(() => {
    const counts: Record<string, number> = {};
    portalMockBookings.forEach(b => { counts[b.status] = (counts[b.status] || 0) + 1; });
    return [{ label: 'All', count: portalMockBookings.length }, ...Object.entries(counts).map(([label, count]) => ({ label, count }))];
  }, []);

  return (
    <PageWrapper
      title="My Bookings"
      description="View and manage all your shipment bookings"
      actions={
        <Link href="/portal/bookings/new">
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-600 rounded-[10px] gap-2 text-xs h-9">
            <Plus className="w-4 h-4" />
            New Booking
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Bookings" value={stats.total} icon={<ClipboardList className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Active" value={stats.active} icon={<Loader2 className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Delivered" value={stats.delivered} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Drafts" value={stats.draft} icon={<FileText className="w-5 h-5" />} iconColor="amber" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => { setSearch(e.target.value); setLoading(true); setTimeout(() => setLoading(false), 300); }}
              placeholder="Search by booking ref, address, or description..." className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statuses.map(st => {
            const isActive = statusFilter === st.label;
            const meta = st.label !== 'All' ? STATUS_META[st.label as PortalBookingStatus] : null;
            return (
              <button key={st.label} onClick={() => setStatusFilter(st.label)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold border transition-all ${isActive ? meta ? `${meta.pill} shadow-sm` : 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'}`}>
                {meta && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
                {st.label} <span className="text-[0.6rem] opacity-60">{st.count}</span>
              </button>
            );
          })}
        </div>
        {(search || statusFilter !== 'All') && <p className="text-[0.65rem] text-muted-foreground mt-2 ml-1">{filtered.length} booking(s) found</p>}
      </div>

      {loading ? <SkeletonLoader variant="table" count={5} />
        : filtered.length === 0 ? (
          <div className="bg-card border border-border/60 rounded-xl shadow-soft py-16 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-muted/30 border border-border/50 flex items-center justify-center">
              <ClipboardList className="w-7 h-7 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-semibold text-foreground">No bookings found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or create a new booking</p>
          </div>
        ) : (
          <div className="bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/10">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Booking Ref</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Route</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Service</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Amount</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b, i) => {
                    const meta = STATUS_META[b.status];
                    return (
                      <tr key={b.id} className={`border-b border-border/20 hover:bg-muted/10 transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}>
                        <td className="py-3 px-4">
                          <Link href={`/portal/tracking?ref=${b.bookingRef}`} className="font-mono text-xs text-foreground font-semibold hover:text-primary transition-colors">{b.bookingRef}</Link>
                        </td>
                        <td className="py-3 px-4 max-w-[180px]">
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            {b.pickupAddress.split(',')[0]}
                            <ArrowRight className="w-2.5 h-2.5 inline" />
                            {b.deliveryAddress.split(',')[0]}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">{b.serviceType}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`text-[0.6rem] px-1.5 py-0 border ${meta?.pill || ''}`}>
                            <span className={`w-1 h-1 rounded-full ${meta?.dot || ''} mr-1`} />{b.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-xs font-medium text-foreground">₹{b.quotedPrice.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-right text-[0.65rem] text-muted-foreground">
                          {new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
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

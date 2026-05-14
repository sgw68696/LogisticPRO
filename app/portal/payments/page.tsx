'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import {
  CreditCard, Search, X, Download, CheckCircle2,
  Clock, AlertTriangle, IndianRupee, ArrowLeftRight,
  Wallet, Ban, RotateCcw,
} from 'lucide-react';
import { portalMockPayments } from '@/data/portal-mock-data';
import type { PortalPaymentStatus, PortalPaymentMethod } from '@/types/portal';

const STATUS_META: Record<PortalPaymentStatus, { pill: string; dot: string }> = {
  Completed: { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  Pending: { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  Failed: { pill: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' },
  Refunded: { pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' },
};

const METHOD_ICONS: Record<string, any> = {
  'Credit Card': CreditCard, 'Debit Card': CreditCard,
  'Net Banking': Wallet, 'UPI': ArrowLeftRight,
  'Wire Transfer': Ban, 'Cash': IndianRupee,
};

export default function PortalPaymentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let r = [...portalMockPayments];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(p => p.paymentRef.toLowerCase().includes(q) || p.invoiceRef.toLowerCase().includes(q) || p.transactionId.toLowerCase().includes(q));
    }
    if (statusFilter !== 'All') r = r.filter(p => p.status === statusFilter);
    return r.sort((a, b) => new Date(b.paidAt || b.paymentRef).getTime() - new Date(a.paidAt || a.paymentRef).getTime());
  }, [search, statusFilter]);

  const stats = useMemo(() => ({
    total: portalMockPayments.length,
    completed: portalMockPayments.filter(p => p.status === 'Completed').length,
    pending: portalMockPayments.filter(p => p.status === 'Pending').length,
    totalAmount: portalMockPayments.filter(p => p.status === 'Completed').reduce((s, p) => s + p.amount, 0),
  }), []);

  return (
    <PageWrapper title="Payment History" description="View all your payment transactions and receipts">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Transactions" value={stats.total} icon={<CreditCard className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Completed" value={stats.completed} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Total Spent" value={`₹${(stats.totalAmount / 1000).toFixed(1)}K`} icon={<IndianRupee className="w-5 h-5" />} iconColor="indigo" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => { setSearch(e.target.value); setLoading(true); setTimeout(() => setLoading(false), 300); }}
              placeholder="Search by reference, invoice, or transaction ID..." className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 bg-muted/40 border-border rounded-[9px] text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              {['All', 'Completed', 'Pending', 'Failed', 'Refunded'].map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {(search || statusFilter !== 'All') && <p className="text-[0.65rem] text-muted-foreground mt-2 ml-1">{filtered.length} payment(s) found</p>}
      </div>

      {loading ? <SkeletonLoader variant="table" count={5} />
        : filtered.length === 0 ? (
          <div className="bg-card border border-border/60 rounded-xl shadow-soft py-16 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-muted/30 border border-border/50 flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-semibold text-foreground">No payments found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/10">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Payment Ref</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Invoice</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Method</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Amount</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Date</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const meta = STATUS_META[p.status];
                    const MethodIcon = METHOD_ICONS[p.method] || CreditCard;
                    return (
                      <tr key={p.id} className={`border-b border-border/20 hover:bg-muted/10 transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}>
                        <td className="py-3 px-4 font-mono text-xs text-foreground font-semibold">{p.paymentRef}</td>
                        <td className="py-3 px-4 text-xs text-muted-foreground font-mono">{p.invoiceRef}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <MethodIcon className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{p.method}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-xs font-semibold text-foreground">₹{p.amount.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`text-[0.6rem] px-1.5 py-0 border ${meta?.pill || ''}`}>
                            <span className={`w-1 h-1 rounded-full ${meta?.dot || ''} mr-1`} />{p.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-[0.65rem] text-muted-foreground">
                          {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {p.status === 'Completed' && (
                            <button className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
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

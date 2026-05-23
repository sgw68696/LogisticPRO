'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import {
  FileText, Search, X, Download, Eye, Clock,
  CheckCircle2, AlertTriangle, IndianRupee, Receipt,
} from 'lucide-react';
import type { InvoiceStatus } from '@/data/mockData';
import { portalInvoices } from '@/data/portal-mock-data';

const STATUS_META: Record<InvoiceStatus, { pill: string; dot: string }> = {
  Paid: { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  Unpaid: { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  Overdue: { pill: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' },
  Cancelled: { pill: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
};

export default function PortalInvoicesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let r = [...portalInvoices];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(inv => inv.invoiceId.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q));
    }
    if (statusFilter !== 'All') r = r.filter(inv => inv.status === statusFilter);
    return r.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [search, statusFilter]);

  const stats = useMemo(() => ({
    total: portalInvoices.length,
    paid: portalInvoices.filter(inv => inv.status === 'Paid').length,
    unpaid: portalInvoices.filter(inv => inv.status === 'Unpaid').length,
    overdue: portalInvoices.filter(inv => inv.status === 'Overdue').length,
    totalAmount: portalInvoices.reduce((s, inv) => s + inv.amount, 0),
    pendingAmount: portalInvoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue').reduce((s, inv) => s + inv.amount, 0),
  }), []);

  return (
    <PageWrapper
      title="My Invoices"
      description="View and download your invoices"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <KPICard title="Total Invoices" value={stats.total} icon={<Receipt className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Paid" value={stats.paid} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Unpaid" value={stats.unpaid} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Overdue" value={stats.overdue} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" />
        <KPICard title="Total Billed" value={`₹${(stats.totalAmount / 1000).toFixed(1)}K`} icon={<IndianRupee className="w-5 h-5" />} iconColor="indigo" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => { setSearch(e.target.value); setLoading(true); setTimeout(() => setLoading(false), 300); }}
              placeholder="Search by invoice number or customer..." className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 bg-muted/40 border-border rounded-[9px] text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              {['All', 'Paid', 'Unpaid', 'Overdue', 'Cancelled'].map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {(search || statusFilter !== 'All') && <p className="text-[0.65rem] text-muted-foreground mt-2 ml-1">{filtered.length} invoice(s) found</p>}
      </div>

      {loading ? <SkeletonLoader variant="table" count={5} />
        : filtered.length === 0 ? (
          <div className="bg-card border border-border/60 rounded-xl shadow-soft py-16 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-muted/30 border border-border/50 flex items-center justify-center">
              <Receipt className="w-7 h-7 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-semibold text-foreground">No invoices found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/10">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Invoice No.</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Customer</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Items</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Amount</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Due Date</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium text-[0.65rem] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv, i) => {
                    const meta = STATUS_META[inv.status];
                    return (
                      <tr key={inv.id} className={`border-b border-border/20 hover:bg-muted/10 transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}>
                        <td className="py-3 px-4 font-mono text-xs text-foreground font-semibold">{inv.invoiceId}</td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">{inv.customerName}</td>
                        <td className="py-3 px-4 text-[0.65rem] text-muted-foreground">{inv.items.length} item(s)</td>
                        <td className="py-3 px-4 text-right text-xs font-semibold text-foreground">₹{inv.amount.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-right text-[0.65rem] text-muted-foreground">
                          {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`text-[0.6rem] px-1.5 py-0 border ${meta?.pill || ''}`}>
                            <span className={`w-1 h-1 rounded-full ${meta?.dot || ''} mr-1`} />{inv.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                            <button className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors"><Download className="w-3.5 h-3.5" /></button>
                          </div>
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

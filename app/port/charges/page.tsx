'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DollarSign, Search, FileText, CheckCircle2, AlertTriangle, Clock,
  Eye, Edit, Trash2, X, Ship, Download, Printer, CalendarDays,
  ArrowRight, User, CreditCard, Receipt, Percent,
} from 'lucide-react';

type ChargeStatus = 'Paid' | 'Pending' | 'Overdue' | 'Disputed' | 'Waived';
type ChargeCategory = 'Berthage' | 'Wharfage' | 'Pilotage' | 'Towage' | 'Mooring' | 'Storage' | 'Handling' | 'Customs' | 'Security' | 'Other';

interface PortCharge {
  id: string;
  invoice: string;
  vessel: string;
  voyage: string;
  category: ChargeCategory;
  description: string;
  amount: number;
  currency: string;
  status: ChargeStatus;
  issuedDate: string;
  dueDate: string;
  paidDate: string | null;
  payer: string;
  refNo: string;
  quantity: string;
  unitRate: string;
}

const STATUS_META: Record<ChargeStatus, { pill: string; dot: string }> = {
  Paid: { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  Pending: { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  Overdue: { pill: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
  Disputed: { pill: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' },
  Waived: { pill: 'bg-muted/50 text-muted-foreground border-border/40', dot: 'bg-muted-foreground' },
};

const CATEGORY_META: Record<ChargeCategory, { bg: string; color: string }> = {
  Berthage: { bg: 'bg-blue-500/10', color: 'text-blue-400' },
  Wharfage: { bg: 'bg-indigo-500/10', color: 'text-indigo-400' },
  Pilotage: { bg: 'bg-cyan-500/10', color: 'text-cyan-400' },
  Towage: { bg: 'bg-amber-500/10', color: 'text-amber-400' },
  Mooring: { bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
  Storage: { bg: 'bg-violet-500/10', color: 'text-violet-400' },
  Handling: { bg: 'bg-sky-500/10', color: 'text-sky-400' },
  Customs: { bg: 'bg-rose-500/10', color: 'text-rose-400' },
  Security: { bg: 'bg-muted/30', color: 'text-muted-foreground' },
  Other: { bg: 'bg-muted/20', color: 'text-muted-foreground' },
};

const charges: PortCharge[] = [
  { id: 'CHG-001', invoice: 'INV-2026-0421', vessel: 'CMA CGM ALTAMIRA', voyage: 'CNYTN-ALT-2026', category: 'Berthage', description: 'Berth B-12 occupancy (12h)', amount: 4800, currency: 'USD', status: 'Paid', issuedDate: '13 May 2026', dueDate: '20 May 2026', paidDate: '13 May 2026', payer: 'CMA CGM', refNo: 'BTH-0421', quantity: '12 hours', unitRate: '$400/h' },
  { id: 'CHG-002', invoice: 'INV-2026-0421', vessel: 'CMA CGM ALTAMIRA', voyage: 'CNYTN-ALT-2026', category: 'Wharfage', description: 'Container storage (34 TEU × 2 days)', amount: 4080, currency: 'USD', status: 'Paid', issuedDate: '13 May 2026', dueDate: '20 May 2026', paidDate: '13 May 2026', payer: 'CMA CGM', refNo: 'WHF-0421', quantity: '68 TEU-days', unitRate: '$60/TEU-day' },
  { id: 'CHG-003', invoice: 'INV-2026-0421', vessel: 'CMA CGM ALTAMIRA', voyage: 'CNYTN-ALT-2026', category: 'Pilotage', description: 'Pilot service (arrival)', amount: 1500, currency: 'USD', status: 'Paid', issuedDate: '13 May 2026', dueDate: '20 May 2026', paidDate: '13 May 2026', payer: 'CMA CGM', refNo: 'PIL-0421', quantity: '1 service', unitRate: '$1,500' },
  { id: 'CHG-004', invoice: 'INV-2026-0422', vessel: 'MAERSK GUJARAT', voyage: 'INMUM-SGSIN-2026', category: 'Berthage', description: 'Berth C-03 reservation', amount: 3600, currency: 'USD', status: 'Pending', issuedDate: '14 May 2026', dueDate: '21 May 2026', paidDate: null, payer: 'Maersk Line', refNo: 'BTH-0422', quantity: '8 hours', unitRate: '$450/h' },
  { id: 'CHG-005', invoice: 'INV-2026-0422', vessel: 'MAERSK GUJARAT', voyage: 'INMUM-SGSIN-2026', category: 'Towage', description: 'Tug assistance (2 tugs × 2h)', amount: 3200, currency: 'USD', status: 'Pending', issuedDate: '14 May 2026', dueDate: '21 May 2026', paidDate: null, payer: 'Maersk Line', refNo: 'TOW-0422', quantity: '4 tug-hours', unitRate: '$800/tug-h' },
  { id: 'CHG-006', invoice: 'INV-2026-0423', vessel: 'MSC ZOE', voyage: 'LKCMB-JPTYO-2026', category: 'Handling', description: 'Cargo handling (18 containers)', amount: 5400, currency: 'USD', status: 'Overdue', issuedDate: '12 May 2026', dueDate: '19 May 2026', paidDate: null, payer: 'MSC', refNo: 'HDL-0423', quantity: '18 lifts', unitRate: '$300/lift' },
  { id: 'CHG-007', invoice: 'INV-2026-0423', vessel: 'MSC ZOE', voyage: 'LKCMB-JPTYO-2026', category: 'Mooring', description: 'Mooring/unmooring service', amount: 800, currency: 'USD', status: 'Overdue', issuedDate: '12 May 2026', dueDate: '19 May 2026', paidDate: null, payer: 'MSC', refNo: 'MOO-0423', quantity: '2 services', unitRate: '$400' },
  { id: 'CHG-008', invoice: 'INV-2026-0424', vessel: 'OOCL HONG KONG', voyage: 'SGSIN-INNSA-2026', category: 'Customs', description: 'Customs inspection fee', amount: 1200, currency: 'USD', status: 'Pending', issuedDate: '14 May 2026', dueDate: '21 May 2026', paidDate: null, payer: 'OOCL', refNo: 'CUS-0424', quantity: '1 inspection', unitRate: '$1,200' },
  { id: 'CHG-009', invoice: 'INV-2026-0425', vessel: 'MSC AURORA', voyage: 'DEHAM-CNSHA-2026', category: 'Storage', description: 'Container storage (31 TEU × 5 days)', amount: 9300, currency: 'USD', status: 'Disputed', issuedDate: '10 May 2026', dueDate: '17 May 2026', paidDate: null, payer: 'MSC', refNo: 'STR-0425', quantity: '155 TEU-days', unitRate: '$60/TEU-day' },
  { id: 'CHG-010', invoice: 'INV-2026-0426', vessel: 'EVERGREEN LOTUS', voyage: 'NLRTM-CNSHA-2026', category: 'Security', description: 'Port security fee', amount: 450, currency: 'USD', status: 'Paid', issuedDate: '14 May 2026', dueDate: '21 May 2026', paidDate: '14 May 2026', payer: 'Evergreen', refNo: 'SEC-0426', quantity: '1 vessel', unitRate: '$450' },
];

export default function ChargesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const categories = useMemo(() => [...new Set(charges.map(c => c.category))], []);

  const filtered = useMemo(() => {
    let result = [...charges];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.invoice.toLowerCase().includes(q) || c.vessel.toLowerCase().includes(q) || c.payer.toLowerCase().includes(q) || c.refNo.toLowerCase().includes(q));
    }
    if (statusFilter !== 'All') result = result.filter(c => c.status === statusFilter);
    if (categoryFilter !== 'All') result = result.filter(c => c.category === categoryFilter);
    return result;
  }, [search, statusFilter, categoryFilter]);

  const stats = useMemo(() => ({
    total: charges.length,
    totalAmount: charges.reduce((s, c) => s + c.amount, 0),
    paid: charges.filter(c => c.status === 'Paid').reduce((s, c) => s + c.amount, 0),
    pending: charges.filter(c => c.status === 'Pending').reduce((s, c) => s + c.amount, 0),
    overdue: charges.filter(c => c.status === 'Overdue').reduce((s, c) => s + c.amount, 0),
    disputed: charges.filter(c => c.status === 'Disputed').reduce((s, c) => s + c.amount, 0),
  }), []);

  const statusPills = [
    { label: 'All', count: charges.length },
    { label: 'Pending', count: charges.filter(c => c.status === 'Pending').length },
    { label: 'Paid', count: charges.filter(c => c.status === 'Paid').length },
    { label: 'Overdue', count: charges.filter(c => c.status === 'Overdue').length },
    { label: 'Disputed', count: charges.filter(c => c.status === 'Disputed').length },
  ];

  const formatUSD = (n: number) => `$${n.toLocaleString()}`;

  return (
    <PageWrapper
      title="Port Charges"
      description="Manage port fees, invoices, billing for berthage, wharfage, pilotage, and all port services"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 rounded-[9px]"><Printer className="w-4 h-4" />Print</Button>
          <Button className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:from-sky-600 hover:to-indigo-600 rounded-[10px] gap-2">
            <Receipt className="w-4 h-4" />Generate Invoice
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <KPICard title="Total Charges" value={formatUSD(stats.totalAmount)} icon={<DollarSign className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Collected" value={formatUSD(stats.paid)} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Pending" value={formatUSD(stats.pending)} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Overdue" value={formatUSD(stats.overdue)} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" />
        <KPICard title="Disputed" value={formatUSD(stats.disputed)} icon={<FileText className="w-5 h-5" />} iconColor="indigo" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => { setSearch(e.target.value); setLoading(true); setTimeout(() => setLoading(false), 300); }} placeholder="Search invoice, vessel, payer, ref..." className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)] transition-all duration-200" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[170px] h-9 bg-muted/40 border-border rounded-[9px] text-[0.84rem]"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusPills.map(pill => {
            const isActive = statusFilter === pill.label;
            const meta = pill.label !== 'All' ? STATUS_META[pill.label as ChargeStatus] : null;
            return (
              <button key={pill.label} onClick={() => setStatusFilter(pill.label)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.70rem] font-bold border transition-all ${isActive ? meta ? `${meta.pill} shadow-sm` : 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:border-border'}`}>
                {meta && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
                {pill.label} <span className="text-[0.65rem] opacity-60">{pill.count}</span>
              </button>
            );
          })}
        </div>
        {(search || statusFilter !== 'All' || categoryFilter !== 'All') && <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">{filtered.length} charge(s) found</p>}
      </div>

      {loading ? <SkeletonLoader variant="card" count={4} /> : filtered.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center"><DollarSign className="w-7 h-7 text-muted-foreground/30" /></div>
          <p className="text-[0.88rem] font-semibold text-foreground">No charges found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 px-4 py-2 mb-4 bg-card border border-border/60 rounded-lg shadow-soft text-[0.78rem] text-muted-foreground">
            <span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5" />{filtered.length} charges</span>
            <span className="w-px h-3 bg-border/50" />
            <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" />Total: {formatUSD(filtered.reduce((s, c) => s + c.amount, 0))}</span>
          </div>
          <div className="space-y-3">
            {filtered.map(charge => {
              const meta = STATUS_META[charge.status];
              const cat = CATEGORY_META[charge.category];
              return (
                <div key={charge.id} className="group bg-card border border-border/60 rounded-xl shadow-soft p-4 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center shrink-0 ${cat.color}`}>
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-[0.88rem] font-semibold text-foreground font-mono">{charge.invoice}</h3>
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.65rem] font-bold border ${meta.pill}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{charge.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-[0.72rem] text-muted-foreground">
                              <span>{charge.vessel}</span>
                              <span className="w-px h-3 bg-border/40" />
                              <span className="font-mono">{charge.voyage}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[0.90rem] font-bold text-foreground font-mono">
                          {formatUSD(charge.amount)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Category</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5">{charge.category}</p>
                          <p className="text-[0.70rem] text-muted-foreground">{charge.description}</p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Payer</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5">{charge.payer}</p>
                          <p className="text-[0.70rem] text-muted-foreground font-mono">{charge.refNo}</p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Quantity / Rate</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5">{charge.quantity}</p>
                          <p className="text-[0.70rem] text-muted-foreground">@ {charge.unitRate}</p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Due / Paid</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5">Due: {charge.dueDate}</p>
                          <p className="text-[0.70rem] text-muted-foreground">{charge.paidDate ? `Paid: ${charge.paidDate}` : 'Unpaid'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex lg:flex-col items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400"><Download className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </PageWrapper>
  );
}

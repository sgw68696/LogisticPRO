'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Plus, Search, Eye, Edit, Trash2,
  X, CheckCircle, XCircle,
  Layers, Tags, Zap, RefreshCw,
  ArrowRight, Circle,
} from 'lucide-react';

type StatusCategory = 'Shipment' | 'Order' | 'Payment' | 'Compliance' | 'Custom';
type StatusStatus = 'Active' | 'Inactive';

interface CustomStatus {
  id: string;
  name: string;
  category: StatusCategory;
  entity: string;
  color: string;
  description: string;
  workflowCount: number;
  status: StatusStatus;
  isDefault: boolean;
  createdAt: string;
}

const MOCK_STATUSES: CustomStatus[] = [
  { id: 'cs-001', name: 'Pending Pickup', category: 'Shipment', entity: 'Shipment', color: '#f59e0b', description: 'Shipment created but not yet picked up by carrier', workflowCount: 3, status: 'Active', isDefault: true, createdAt: '2025-12-01' },
  { id: 'cs-002', name: 'Customs Hold', category: 'Shipment', entity: 'Shipment', color: '#ef4444', description: 'Shipment held for customs documentation review', workflowCount: 2, status: 'Active', isDefault: false, createdAt: '2025-12-05' },
  { id: 'cs-003', name: 'Quality Check', category: 'Shipment', entity: 'Shipment', color: '#6366f1', description: 'Shipment undergoing quality inspection', workflowCount: 1, status: 'Active', isDefault: false, createdAt: '2026-01-10' },
  { id: 'cs-004', name: 'Awaiting Payment', category: 'Order', entity: 'Order', color: '#f59e0b', description: 'Order confirmed but payment is pending', workflowCount: 2, status: 'Active', isDefault: true, createdAt: '2025-12-01' },
  { id: 'cs-005', name: 'Payment Verified', category: 'Order', entity: 'Order', color: '#22c55e', description: 'Payment received and verified', workflowCount: 3, status: 'Active', isDefault: true, createdAt: '2025-12-01' },
  { id: 'cs-006', name: 'Partially Shipped', category: 'Order', entity: 'Order', color: '#0ea5e9', description: 'Partial shipment dispatched, remaining items pending', workflowCount: 1, status: 'Active', isDefault: false, createdAt: '2026-02-15' },
  { id: 'cs-007', name: 'Refund Initiated', category: 'Payment', entity: 'Order', color: '#f97316', description: 'Refund process has been started', workflowCount: 1, status: 'Active', isDefault: false, createdAt: '2026-02-20' },
  { id: 'cs-008', name: 'Payment Disputed', category: 'Payment', entity: 'Order', color: '#ef4444', description: 'Customer has initiated a payment dispute', workflowCount: 2, status: 'Active', isDefault: false, createdAt: '2026-03-01' },
  { id: 'cs-009', name: 'Document Review', category: 'Compliance', entity: 'Shipment', color: '#6366f1', description: 'Export/import documents under compliance review', workflowCount: 2, status: 'Active', isDefault: true, createdAt: '2025-12-10' },
  { id: 'cs-010', name: 'Cleared by Customs', category: 'Compliance', entity: 'Shipment', color: '#22c55e', description: 'Customs clearance obtained for shipment', workflowCount: 3, status: 'Active', isDefault: true, createdAt: '2025-12-10' },
  { id: 'cs-011', name: 'Regulatory Hold', category: 'Compliance', entity: 'Shipment', color: '#ef4444', description: 'Shipment held for regulatory agency review', workflowCount: 1, status: 'Active', isDefault: false, createdAt: '2026-03-15' },
  { id: 'cs-012', name: 'Vendor Approved', category: 'Custom', entity: 'Vendor', color: '#22c55e', description: 'Vendor has been approved for operations', workflowCount: 2, status: 'Active', isDefault: true, createdAt: '2026-01-05' },
  { id: 'cs-013', name: 'Vendor Suspended', category: 'Custom', entity: 'Vendor', color: '#ef4444', description: 'Vendor temporarily suspended pending review', workflowCount: 1, status: 'Inactive', isDefault: false, createdAt: '2026-01-20' },
  { id: 'cs-014', name: 'Awaiting Documentation', category: 'Custom', entity: 'Driver', color: '#f59e0b', description: 'Driver awaiting document submission', workflowCount: 1, status: 'Active', isDefault: false, createdAt: '2026-04-01' },
  { id: 'cs-015', name: 'Ready for Dispatch', category: 'Shipment', entity: 'Shipment', color: '#0ea5e9', description: 'All checks passed, ready for dispatch', workflowCount: 4, status: 'Active', isDefault: false, createdAt: '2026-04-10' },
];

const CATEGORY_META: Record<StatusCategory, { color: string; bg: string; border: string }> = {
  Shipment:   { color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/20' },
  Order:      { color: 'text-sky-400',    bg: 'bg-sky-500/10',    border: 'border-sky-500/20' },
  Payment:    { color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
  Compliance: { color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  Custom:     { color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20' },
};

const CATEGORIES: StatusCategory[] = ['Shipment', 'Order', 'Payment', 'Compliance', 'Custom'];

export default function CustomStatusesPage() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<StatusCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusStatus | 'all'>('all');
  const [statuses, setStatuses] = useState(MOCK_STATUSES);

  const filtered = statuses.filter(s => {
    const q = search.toLowerCase();
    const matchQ = s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.entity.toLowerCase().includes(q);
    const matchCat = catFilter === 'all' || s.category === catFilter;
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchQ && matchCat && matchStatus;
  });

  const handleDelete = (id: string) => setStatuses(prev => prev.filter(s => s.id !== id));

  const activeCount = statuses.filter(s => s.status === 'Active').length;
  const totalWorkflows = statuses.reduce((s, c) => s + c.workflowCount, 0);
  const defaultCount = statuses.filter(s => s.isDefault).length;

  return (
    <PageWrapper
      title="Custom Statuses"
      description="Create and manage custom statuses for tracking workflow progress"
      actions={
        <button
          className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-[0.82rem] font-bold text-white font-display cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Plus size={14} />
          Add Status
        </button>
      }
    >
      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Statuses', value: statuses.length, sub: `${activeCount} active`, icon: Layers, iconCls: 'text-primary bg-primary/10 border-primary/20', pill: 'bg-primary/10 text-primary border-primary/20' },
          { label: 'Used in Workflows', value: totalWorkflows, sub: 'total references', icon: Zap, iconCls: 'text-sky-400 bg-sky-500/10 border-sky-500/20', pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
          { label: 'Default Statuses', value: defaultCount, sub: 'system defaults', icon: Tags, iconCls: 'text-amber-400 bg-amber-500/10 border-amber-500/20', pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
          { label: 'Categories', value: CATEGORIES.length, sub: 'status categories', icon: Layers, iconCls: 'text-success bg-success/10 border-success/20', pill: 'bg-success/10 text-success border-success/20' },
        ].map(({ label, value, sub, icon: Icon, iconCls, pill }) => (
          <div key={label} className="bg-card border border-border/60 rounded-xl px-5 py-4 shadow-soft flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex-shrink-0 border flex items-center justify-center ${iconCls}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-bold font-display text-foreground">{value}</span>
                <span className={`px-2 py-0.5 rounded-full text-[0.68rem] font-bold border ${pill}`}>{sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text" placeholder="Search statuses..." value={search} onChange={e => setSearch(e.target.value)}
              className="nb-search w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', ...CATEGORIES] as const).map(c => {
              const active = catFilter === c;
              const meta = c !== 'all' ? CATEGORY_META[c] : null;
              return (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`px-3 py-1.5 rounded-lg text-[0.75rem] font-bold border transition-all duration-200 ${active ? meta ? `${meta.bg} ${meta.color} ${meta.border}` : 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted/40'}`}
                >{c === 'all' ? 'All Categories' : c}</button>
              );
            })}
          </div>
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusStatus | 'all')}
            className="h-9 px-3 rounded-lg text-[0.75rem] font-bold border bg-muted/20 text-muted-foreground border-border/40 outline-none focus:border-primary/50"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          {(search || catFilter !== 'all' || statusFilter !== 'all') && (
            <button onClick={() => { setSearch(''); setCatFilter('all'); setStatusFilter('all'); }}
              className="w-7 h-7 flex items-center justify-center bg-destructive/10 border border-destructive/20 rounded-lg text-destructive hover:bg-destructive/20 transition-colors duration-150"
            ><X size={12} /></button>
          )}
        </div>
        {(search || catFilter !== 'all' || statusFilter !== 'all') && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">{filtered.length} status{filtered.length !== 1 ? 'es' : ''} found</p>
        )}
      </div>

      {/* Status Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(status => {
            const catMeta = CATEGORY_META[status.category];
            return (
              <div key={status.id} className="group bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]">
                {/* Color bar */}
                <div className="h-1.5 w-full" style={{ backgroundColor: status.color }} />

                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Circle className="w-4 h-4 flex-shrink-0" style={{ color: status.color, fill: status.color }} fillOpacity={0.2} />
                      <div className="min-w-0">
                        <h3 className="text-[0.88rem] font-bold font-display text-foreground truncate">{status.name}</h3>
                        <p className="text-[0.65rem] text-muted-foreground">{status.entity} · {status.isDefault ? 'Default' : 'Custom'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-150"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors duration-150"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(status.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-150"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[0.72rem] text-muted-foreground mb-3 line-clamp-2">{status.description}</p>

                  {/* Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.68rem] font-bold ${catMeta.bg} ${catMeta.color} ${catMeta.border}`}>
                      {status.category}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.68rem] font-semibold bg-muted/40 border border-border/40 text-muted-foreground">
                      <Zap className="w-2.5 h-2.5" />
                      {status.workflowCount} workflow{status.workflowCount !== 1 ? 's' : ''}
                    </span>
                    {status.isDefault && (
                      <Badge variant="outline" className="text-[0.62rem] px-1.5 py-0.5 h-auto bg-primary/10 text-primary border-primary/20">Default</Badge>
                    )}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.68rem] font-semibold border ${status.status === 'Active' ? 'bg-success/10 text-success border-success/20' : 'bg-muted/40 text-muted-foreground border-border/40'}`}>
                      {status.status === 'Active' ? <CheckCircle className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                      {status.status}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[0.65rem] text-muted-foreground">Created {status.createdAt}</span>
                    <div className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                      <span className="font-mono">{status.color}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center">
            <Tags className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No custom statuses found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your filters or add a new status</p>
        </div>
      )}
    </PageWrapper>
  );
}

'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Plus, Search, Eye, Edit, Trash2, X,
  CheckCircle, XCircle, Mail, Clock,
  Send, FileText, Copy, RefreshCw,
  MessageSquare,
} from 'lucide-react';

type TemplateStatus = 'Active' | 'Inactive' | 'Draft';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  triggerEvent: string;
  status: TemplateStatus;
  lastModified: string;
  sentCount: number;
  openRate: number;
  hasVariables: boolean;
  createdAt: string;
}

const MOCK_TEMPLATES: EmailTemplate[] = [
  { id: 'et-001', name: 'Shipment Confirmation', subject: 'Your shipment #{shipment_id} has been confirmed', category: 'Shipment', triggerEvent: 'Shipment Created', status: 'Active', lastModified: '2026-05-15', sentCount: 12450, openRate: 68.5, hasVariables: true, createdAt: '2025-12-01' },
  { id: 'et-002', name: 'Shipment In Transit', subject: 'Shipment #{shipment_id} is now in transit', category: 'Shipment', triggerEvent: 'Status: In Transit', status: 'Active', lastModified: '2026-05-10', sentCount: 9870, openRate: 72.1, hasVariables: true, createdAt: '2025-12-01' },
  { id: 'et-003', name: 'Delivery Confirmation', subject: 'Your delivery #{order_id} has been completed', category: 'Shipment', triggerEvent: 'Status: Delivered', status: 'Active', lastModified: '2026-05-18', sentCount: 11230, openRate: 65.3, hasVariables: true, createdAt: '2025-12-05' },
  { id: 'et-004', name: 'Payment Receipt', subject: 'Payment received for invoice #{invoice_id}', category: 'Finance', triggerEvent: 'Payment Received', status: 'Active', lastModified: '2026-05-12', sentCount: 8450, openRate: 58.7, hasVariables: true, createdAt: '2025-12-10' },
  { id: 'et-005', name: 'Invoice Overdue', subject: 'Invoice #{invoice_id} is now overdue', category: 'Finance', triggerEvent: 'Invoice Overdue', status: 'Active', lastModified: '2026-05-08', sentCount: 3210, openRate: 82.4, hasVariables: true, createdAt: '2026-01-05' },
  { id: 'et-006', name: 'Account Welcome', subject: 'Welcome to LogisticPRO, {company_name}!', category: 'Account', triggerEvent: 'Company Created', status: 'Active', lastModified: '2026-04-20', sentCount: 1560, openRate: 91.2, hasVariables: true, createdAt: '2025-12-01' },
  { id: 'et-007', name: 'Password Reset', subject: 'Password reset instructions for your account', category: 'Account', triggerEvent: 'Password Reset Requested', status: 'Active', lastModified: '2026-03-15', sentCount: 2340, openRate: 76.8, hasVariables: false, createdAt: '2025-12-01' },
  { id: 'et-008', name: 'Customs Hold Notice', subject: 'Shipment #{shipment_id} held for customs review', category: 'Compliance', triggerEvent: 'Status: Customs Hold', status: 'Active', lastModified: '2026-05-05', sentCount: 890, openRate: 88.3, hasVariables: true, createdAt: '2026-02-01' },
  { id: 'et-009', name: 'Driver Assignment', subject: 'New shipment assigned to you - #{shipment_id}', category: 'Driver', triggerEvent: 'Driver Assigned', status: 'Active', lastModified: '2026-04-28', sentCount: 6750, openRate: 85.1, hasVariables: true, createdAt: '2026-01-15' },
  { id: 'et-010', name: 'Weekly Report', subject: 'Weekly Operations Report - Week {week_number}', category: 'Reports', triggerEvent: 'Schedule: Weekly', status: 'Active', lastModified: '2026-05-14', sentCount: 520, openRate: 71.4, hasVariables: true, createdAt: '2026-02-10' },
  { id: 'et-011', name: 'Low Stock Alert', subject: 'Low stock alert: {item_name} below threshold', category: 'Inventory', triggerEvent: 'Stock Threshold Reached', status: 'Draft', lastModified: '2026-05-01', sentCount: 0, openRate: 0, hasVariables: true, createdAt: '2026-04-01' },
  { id: 'et-012', name: 'Refund Processed', subject: 'Refund for order #{order_id} has been processed', category: 'Finance', triggerEvent: 'Refund Completed', status: 'Inactive', lastModified: '2026-03-20', sentCount: 450, openRate: 63.2, hasVariables: true, createdAt: '2026-02-20' },
];

const CATEGORIES = ['Shipment', 'Finance', 'Account', 'Compliance', 'Driver', 'Reports', 'Inventory'];

export default function EmailTemplatesPage() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | 'all'>('all');
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);

  const filtered = templates.filter(t => {
    const q = search.toLowerCase();
    const matchQ = t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.triggerEvent.toLowerCase().includes(q);
    const matchCat = catFilter === 'all' || t.category === catFilter;
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchQ && matchCat && matchStatus;
  });

  const handleDelete = (id: string) => setTemplates(prev => prev.filter(t => t.id !== id));

  const activeCount = templates.filter(t => t.status === 'Active').length;
  const totalSent = templates.reduce((s, t) => s + t.sentCount, 0);
  const draftCount = templates.filter(t => t.status === 'Draft').length;
  const avgOpenRate = Math.round(templates.filter(t => t.openRate > 0).reduce((s, t) => s + t.openRate, 0) / templates.filter(t => t.openRate > 0).length);

  return (
    <PageWrapper
      title="Email Templates"
      description="Manage email notification templates for system events and communications"
      actions={
        <button
          className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-[0.82rem] font-bold text-white font-display cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Plus size={14} />
          New Template
        </button>
      }
    >
      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Templates', value: templates.length, sub: `${activeCount} active`, icon: Mail, iconCls: 'text-primary bg-primary/10 border-primary/20', pill: 'bg-primary/10 text-primary border-primary/20' },
          { label: 'Emails Sent', value: totalSent.toLocaleString(), sub: 'all time', icon: Send, iconCls: 'text-sky-400 bg-sky-500/10 border-sky-500/20', pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
          { label: 'Avg Open Rate', value: `${avgOpenRate}%`, sub: 'across templates', icon: MessageSquare, iconCls: 'text-amber-400 bg-amber-500/10 border-amber-500/20', pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
          { label: 'Drafts', value: draftCount, sub: 'not published yet', icon: FileText, iconCls: 'text-violet-400 bg-violet-500/10 border-violet-500/20', pill: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
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
              type="text" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)}
              className="nb-search w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', ...CATEGORIES] as const).map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-[0.75rem] font-bold border transition-all duration-200 ${catFilter === c ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted/40'}`}
              >{c === 'all' ? 'All Categories' : c}</button>
            ))}
          </div>
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value as TemplateStatus | 'all')}
            className="h-9 px-3 rounded-lg text-[0.75rem] font-bold border bg-muted/20 text-muted-foreground border-border/40 outline-none focus:border-primary/50"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Draft">Draft</option>
          </select>
          {(search || catFilter !== 'all' || statusFilter !== 'all') && (
            <button onClick={() => { setSearch(''); setCatFilter('all'); setStatusFilter('all'); }}
              className="w-7 h-7 flex items-center justify-center bg-destructive/10 border border-destructive/20 rounded-lg text-destructive hover:bg-destructive/20 transition-colors duration-150"
            ><X size={12} /></button>
          )}
        </div>
        {(search || catFilter !== 'all' || statusFilter !== 'all') && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">{filtered.length} template{filtered.length !== 1 ? 's' : ''} found</p>
        )}
      </div>

      {/* Template Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(template => (
            <div key={template.id} className="group bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]">
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[0.88rem] font-bold font-display text-foreground truncate">{template.name}</h3>
                      <p className="text-[0.65rem] text-muted-foreground truncate">{template.triggerEvent}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-150"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors duration-150"><Edit className="w-3.5 h-3.5" /></button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-150"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(template.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-150"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                {/* Subject Line */}
                <div className="bg-muted/20 border border-border/40 rounded-lg px-3 py-2 mb-3">
                  <p className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">Subject</p>
                  <p className="text-[0.78rem] font-medium text-foreground font-mono truncate">{template.subject}</p>
                </div>

                {/* Chips */}
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  <Badge variant="outline" className="text-[0.62rem] px-1.5 py-0.5 h-auto bg-muted/40 text-muted-foreground border-border/40">{template.category}</Badge>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.68rem] font-semibold border ${template.status === 'Active' ? 'bg-success/10 text-success border-success/20' : template.status === 'Draft' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-muted/40 text-muted-foreground border-border/40'}`}>
                    {template.status === 'Active' ? <CheckCircle className="w-2.5 h-2.5" /> : template.status === 'Draft' ? <FileText className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                    {template.status}
                  </span>
                  {template.hasVariables && (
                    <Badge variant="outline" className="text-[0.62rem] px-1.5 py-0.5 h-auto bg-violet-500/10 text-violet-400 border-violet-500/20">
                      Variables
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-[0.65rem] text-muted-foreground pt-3 border-t border-border/40">
                  <span className="flex items-center gap-1"><Send className="w-3 h-3" />{template.sentCount.toLocaleString()} sent</span>
                  {template.openRate > 0 && <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{template.openRate}% open rate</span>}
                  <span className="ml-auto flex items-center gap-1"><Clock className="w-3 h-3" />Modified {template.lastModified}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center">
            <Mail className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No email templates found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your filters or create a new template</p>
        </div>
      )}
    </PageWrapper>
  );
}

'use client';

import { useState } from 'react';
import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  Plus, Search, Eye, Edit, Trash2, X,
  CheckCircle, XCircle, Play, Pause,
  Workflow, ArrowRight, Clock, Users,
  Mail, Bell, Database, Shield,
  RefreshCw, FileText,
} from 'lucide-react';

type TriggerType = 'Status Change' | 'Schedule' | 'API Call' | 'Form Submit' | 'Email Received';
type WorkflowStatus = 'Active' | 'Inactive' | 'Draft';

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  config: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: TriggerType;
  triggerConfig: string;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  lastRun: string | null;
  runCount: number;
  category: string;
  createdAt: string;
}

const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-001', name: 'New Shipment Processing', description: 'Auto-assign carrier and notify shipper when a new shipment is created',
    trigger: 'API Call', triggerConfig: 'Webhook: shipment.created',
    steps: [
      { id: 'step-1', name: 'Validate Address', type: 'Validation', config: 'Verify shipping address' },
      { id: 'step-2', name: 'Assign Carrier', type: 'Assignment', config: 'Route to cheapest carrier' },
      { id: 'step-3', name: 'Notify Shipper', type: 'Notification', config: 'Email + SMS to shipper' },
    ],
    status: 'Active', lastRun: '2026-05-21 14:32', runCount: 1847, category: 'Shipment', createdAt: '2025-12-01',
  },
  {
    id: 'wf-002', name: 'Payment Verification', description: 'Verify payment, update order status, and trigger fulfillment',
    trigger: 'API Call', triggerConfig: 'Webhook: payment.received',
    steps: [
      { id: 'step-4', name: 'Verify Amount', type: 'Validation', config: 'Match payment to invoice' },
      { id: 'step-5', name: 'Update Order', type: 'Update', config: 'Set status to Paid' },
      { id: 'step-6', name: 'Notify Warehouse', type: 'Notification', config: 'Push to warehouse queue' },
    ],
    status: 'Active', lastRun: '2026-05-21 13:15', runCount: 3241, category: 'Finance', createdAt: '2025-12-05',
  },
  {
    id: 'wf-003', name: 'Customs Documentation Check', description: 'Auto-review customs docs and flag missing items',
    trigger: 'Status Change', triggerConfig: 'Status: Customs Hold',
    steps: [
      { id: 'step-7', name: 'Check Documents', type: 'Validation', config: 'Verify all docs present' },
      { id: 'step-8', name: 'Flag Missing Items', type: 'Action', config: 'Create compliance ticket' },
      { id: 'step-9', name: 'Notify Agent', type: 'Notification', config: 'Email assigned customs agent' },
    ],
    status: 'Active', lastRun: '2026-05-21 10:45', runCount: 892, category: 'Compliance', createdAt: '2026-01-10',
  },
  {
    id: 'wf-004', name: 'Weekly Report Generation', description: 'Generate and email weekly operations report every Monday',
    trigger: 'Schedule', triggerConfig: 'Cron: 0 8 * * 1',
    steps: [
      { id: 'step-10', name: 'Collect Data', type: 'Data', config: 'Query shipment/order stats' },
      { id: 'step-11', name: 'Generate PDF', type: 'Action', config: 'Render report template' },
      { id: 'step-12', name: 'Email Report', type: 'Notification', config: 'Send to management team' },
    ],
    status: 'Active', lastRun: '2026-05-18 08:00', runCount: 20, category: 'Reports', createdAt: '2026-02-01',
  },
  {
    id: 'wf-005', name: 'Driver Onboarding', description: 'Auto-create accounts, assign documents, and schedule orientation',
    trigger: 'Form Submit', triggerConfig: 'Form: Driver Application',
    steps: [
      { id: 'step-13', name: 'Create Account', type: 'Action', config: 'Create driver portal account' },
      { id: 'step-14', name: 'Assign Documents', type: 'Assignment', config: 'Request license, medical, background check' },
      { id: 'step-15', name: 'Schedule Orientation', type: 'Action', config: 'Book orientation slot' },
    ],
    status: 'Active', lastRun: '2026-05-20 16:20', runCount: 156, category: 'HR', createdAt: '2026-02-15',
  },
  {
    id: 'wf-006', name: 'Late Delivery Escalation', description: 'Escalate late deliveries to management and notify customer',
    trigger: 'Status Change', triggerConfig: 'Status: Delayed',
    steps: [
      { id: 'step-16', name: 'Calculate Delay', type: 'Validation', config: 'Compute delay duration' },
      { id: 'step-17', name: 'Send Alert', type: 'Notification', config: 'SMS + Email to customer' },
      { id: 'step-18', name: 'Escalate', type: 'Action', config: 'Create escalation ticket' },
    ],
    status: 'Active', lastRun: '2026-05-21 12:05', runCount: 423, category: 'Shipment', createdAt: '2026-03-01',
  },
  {
    id: 'wf-007', name: 'Invoice Auto-Send', description: 'Auto-generate and email invoices upon order delivery confirmation',
    trigger: 'Status Change', triggerConfig: 'Status: Delivered',
    steps: [
      { id: 'step-19', name: 'Generate Invoice', type: 'Action', config: 'Create invoice from order data' },
      { id: 'step-20', name: 'Apply Discounts', type: 'Validation', config: 'Check for applicable discounts' },
      { id: 'step-21', name: 'Email Invoice', type: 'Notification', config: 'Send invoice PDF to customer' },
    ],
    status: 'Draft', lastRun: null, runCount: 0, category: 'Finance', createdAt: '2026-03-15',
  },
  {
    id: 'wf-008', name: 'Inventory Reorder Alert', description: 'Monitor stock levels and trigger reorder when below threshold',
    trigger: 'API Call', triggerConfig: 'Webhook: stock.threshold',
    steps: [
      { id: 'step-22', name: 'Check Stock', type: 'Validation', config: 'Verify current inventory levels' },
      { id: 'step-23', name: 'Create PO', type: 'Action', config: 'Generate purchase order' },
      { id: 'step-24', name: 'Notify Purchasing', type: 'Notification', config: 'Email purchasing department' },
    ],
    status: 'Inactive', lastRun: '2026-04-10 09:30', runCount: 67, category: 'Inventory', createdAt: '2026-03-20',
  },
];

const TRIGGER_ICONS: Record<TriggerType, any> = {
  'Status Change': RefreshCw,
  'Schedule': Clock,
  'API Call': Database,
  'Form Submit': FileText,
  'Email Received': Mail,
};

const CATEGORIES = ['Shipment', 'Finance', 'Compliance', 'Reports', 'HR', 'Inventory'];
const TRIGGERS: TriggerType[] = ['Status Change', 'Schedule', 'API Call', 'Form Submit', 'Email Received'];

const STEP_ICONS: Record<string, any> = {
  'Validation': Shield,
  'Assignment': Users,
  'Notification': Bell,
  'Update': RefreshCw,
  'Action': Play,
  'Data': Database,
};

export default function WorkflowBuilderPage() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'all'>('all');
  const [workflows, setWorkflows] = useState(MOCK_WORKFLOWS);

  const filtered = workflows.filter(w => {
    const q = search.toLowerCase();
    const matchQ = w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q);
    const matchCat = catFilter === 'all' || w.category === catFilter;
    const matchStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchQ && matchCat && matchStatus;
  });

  const toggleStatus = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, status: w.status === 'Active' ? 'Inactive' as const : 'Active' as const } : w));
  };

  const handleDelete = (id: string) => setWorkflows(prev => prev.filter(w => w.id !== id));

  const activeCount = workflows.filter(w => w.status === 'Active').length;
  const totalRuns = workflows.reduce((s, w) => s + w.runCount, 0);
  const draftCount = workflows.filter(w => w.status === 'Draft').length;

  return (
    <PageWrapper
      title="Workflow Builder"
      description="Design and manage automated workflows for logistics operations"
      actions={
        <button
          className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-[0.82rem] font-bold text-white font-display cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Plus size={14} />
          New Workflow
        </button>
      }
    >
      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Workflows', value: workflows.length, sub: `${activeCount} active`, icon: Workflow, iconCls: 'text-primary bg-primary/10 border-primary/20', pill: 'bg-primary/10 text-primary border-primary/20' },
          { label: 'Total Runs', value: totalRuns.toLocaleString(), sub: 'executions', icon: Play, iconCls: 'text-sky-400 bg-sky-500/10 border-sky-500/20', pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
          { label: 'Drafts', value: draftCount, sub: 'not published', icon: FileText, iconCls: 'text-amber-400 bg-amber-500/10 border-amber-500/20', pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
          { label: 'Categories', value: CATEGORIES.length, sub: 'workflow categories', icon: Database, iconCls: 'text-success bg-success/10 border-success/20', pill: 'bg-success/10 text-success border-success/20' },
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
              type="text" placeholder="Search workflows..." value={search} onChange={e => setSearch(e.target.value)}
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
            value={statusFilter} onChange={e => setStatusFilter(e.target.value as WorkflowStatus | 'all')}
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
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">{filtered.length} workflow{filtered.length !== 1 ? 's' : ''} found</p>
        )}
      </div>

      {/* Workflow Cards */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(wf => {
            const TriggerIcon = TRIGGER_ICONS[wf.trigger];
            return (
              <div key={wf.id} className="group bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]">
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Workflow className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[0.92rem] font-bold font-display text-foreground truncate">{wf.name}</h3>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold border ${wf.status === 'Active' ? 'bg-success/10 text-success border-success/20' : wf.status === 'Draft' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-muted/40 text-muted-foreground border-border/40'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${wf.status === 'Active' ? 'bg-success' : wf.status === 'Draft' ? 'bg-amber-400' : 'bg-muted-foreground'}`} />
                            {wf.status}
                          </span>
                        </div>
                        <p className="text-[0.72rem] text-muted-foreground mt-0.5">{wf.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch checked={wf.status === 'Active'} onCheckedChange={() => toggleStatus(wf.id)} />
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-150"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors duration-150"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(wf.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-150"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>

                  {/* Trigger Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.68rem] font-bold bg-primary/10 text-primary border border-primary/20">
                      <TriggerIcon className="w-2.5 h-2.5" />
                      {wf.trigger}
                    </span>
                    <span className="text-[0.68rem] font-mono text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md border border-border/40">{wf.triggerConfig}</span>
                    <Badge variant="outline" className="text-[0.62rem] px-1.5 py-0.5 h-auto bg-muted/40 text-muted-foreground border-border/40">{wf.category}</Badge>
                  </div>

                  {/* Steps Pipeline */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {wf.steps.map((step, idx) => {
                      const StepIcon = STEP_ICONS[step.type] || Play;
                      return (
                        <React.Fragment key={step.id}>
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/20 border border-border/40 rounded-lg">
                            <StepIcon className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[0.68rem] font-semibold text-muted-foreground">{step.name}</span>
                          </div>
                          {idx < wf.steps.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/30" />}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-[0.65rem] text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Play className="w-3 h-3" />{wf.runCount.toLocaleString()} runs</span>
                      {wf.lastRun && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Last {wf.lastRun}</span>}
                    </div>
                    <span>Created {wf.createdAt}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center">
            <Workflow className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No workflows found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your filters or create a new workflow</p>
        </div>
      )}
    </PageWrapper>
  );
}

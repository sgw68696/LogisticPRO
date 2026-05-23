'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Plus, Search, Eye, Edit, Trash2, X,
  CheckCircle, XCircle, Bell, Smartphone,
  Mail, MessageSquare, Send, Clock,
  FileText, RefreshCw, Globe,
} from 'lucide-react';

type NotificationChannel = 'Push' | 'Email' | 'SMS' | 'In-App';
type TemplateStatus = 'Active' | 'Inactive' | 'Draft';

interface NotificationTemplate {
  id: string;
  name: string;
  channel: NotificationChannel;
  triggerEvent: string;
  title: string;
  message: string;
  status: TemplateStatus;
  lastSent: string | null;
  sentToday: number;
  category: string;
  priority: 'High' | 'Normal' | 'Low';
  createdAt: string;
}

const CHANNEL_META: Record<NotificationChannel, { color: string; bg: string; border: string; icon: any }> = {
  Push:    { color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/20',    icon: Bell },
  Email:   { color: 'text-sky-400',    bg: 'bg-sky-500/10',    border: 'border-sky-500/20',    icon: Mail },
  SMS:     { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Smartphone },
  'In-App': { color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: MessageSquare },
};

const MOCK_TEMPLATES: NotificationTemplate[] = [
  { id: 'nt-001', name: 'Shipment Update', channel: 'Push', triggerEvent: 'Shipment Status Change', title: 'Shipment #{shipment_id} {status}', message: 'Your shipment is now {status}. Expected delivery: {eta}.', status: 'Active', lastSent: '2 min ago', sentToday: 1240, category: 'Shipment', priority: 'Normal', createdAt: '2025-12-01' },
  { id: 'nt-002', name: 'Delivery Alert', channel: 'Push', triggerEvent: 'Out for Delivery', title: 'Out for delivery!', message: 'Your package #{shipment_id} is out for delivery. Track in real-time.', status: 'Active', lastSent: '5 min ago', sentToday: 890, category: 'Shipment', priority: 'High', createdAt: '2025-12-01' },
  { id: 'nt-003', name: 'Payment Confirmation', channel: 'Email', triggerEvent: 'Payment Received', title: 'Payment Received', message: 'We have received your payment of {amount} for invoice #{invoice_id}.', status: 'Active', lastSent: '12 min ago', sentToday: 456, category: 'Finance', priority: 'Normal', createdAt: '2025-12-05' },
  { id: 'nt-004', name: 'Customs Clearance', channel: 'SMS', triggerEvent: 'Customs Status Change', title: 'Customs Update', message: 'Customs {status} for shipment #{shipment_id}. Check portal for details.', status: 'Active', lastSent: '1 hour ago', sentToday: 123, category: 'Compliance', priority: 'High', createdAt: '2026-01-10' },
  { id: 'nt-005', name: 'Driver Dispatch Notice', channel: 'SMS', triggerEvent: 'Driver Assigned', title: 'New Assignment', message: 'New pickup at {pickup_location}. Contact: {contact_info}.', status: 'Active', lastSent: '3 min ago', sentToday: 342, category: 'Driver', priority: 'High', createdAt: '2026-01-15' },
  { id: 'nt-006', name: 'Order Ready Notice', channel: 'In-App', triggerEvent: 'Order Ready', title: 'Order Ready for Pickup', message: 'Order #{order_id} is ready for pickup at {warehouse_name}.', status: 'Active', lastSent: '8 min ago', sentToday: 234, category: 'Warehouse', priority: 'Normal', createdAt: '2026-02-01' },
  { id: 'nt-007', name: 'Weekly Summary', channel: 'Email', triggerEvent: 'Schedule: Weekly', title: 'Your Weekly Summary', message: 'Here is your weekly operations summary for {date_range}.', status: 'Active', lastSent: '2 days ago', sentToday: 0, category: 'Reports', priority: 'Low', createdAt: '2026-02-10' },
  { id: 'nt-008', name: 'Account Alert', channel: 'Push', triggerEvent: 'Login Detected', title: 'New Login Detected', message: 'New login to your account from {device} at {location}.', status: 'Active', lastSent: '1 day ago', sentToday: 45, category: 'Security', priority: 'High', createdAt: '2026-02-15' },
  { id: 'nt-009', name: 'Low Stock Alert', channel: 'In-App', triggerEvent: 'Stock Threshold', title: 'Low Stock: {item}', message: 'Stock level for {item_name} is at {quantity} units (threshold: {threshold}).', status: 'Active', lastSent: '15 min ago', sentToday: 67, category: 'Inventory', priority: 'Normal', createdAt: '2026-03-01' },
  { id: 'nt-010', name: 'Welcome Message', channel: 'Push', triggerEvent: 'User Registered', title: 'Welcome to LogisticPRO!', message: 'Welcome {user_name}! Start managing your shipments and operations.', status: 'Active', lastSent: '30 min ago', sentToday: 28, category: 'Account', priority: 'Normal', createdAt: '2025-12-01' },
  { id: 'nt-011', name: 'Refund Notification', channel: 'Email', triggerEvent: 'Refund Completed', title: 'Refund Processed', message: 'Your refund of {amount} for order #{order_id} has been processed.', status: 'Draft', lastSent: null, sentToday: 0, category: 'Finance', priority: 'Normal', createdAt: '2026-04-01' },
  { id: 'nt-012', name: 'Rate Change Alert', channel: 'SMS', triggerEvent: 'Rate Updated', title: 'Rate Change', message: 'Shipping rates for {route} have been updated. Check new rates.', status: 'Inactive', lastSent: '1 month ago', sentToday: 0, category: 'Pricing', priority: 'Low', createdAt: '2026-03-15' },
];

const CHANNELS: NotificationChannel[] = ['Push', 'Email', 'SMS', 'In-App'];
const CATEGORIES = ['Shipment', 'Finance', 'Compliance', 'Driver', 'Warehouse', 'Reports', 'Security', 'Inventory', 'Account', 'Pricing'];

export default function NotificationTemplatesPage() {
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<NotificationChannel | 'all'>('all');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | 'all'>('all');
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);

  const filtered = templates.filter(t => {
    const q = search.toLowerCase();
    const matchQ = t.name.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || t.message.toLowerCase().includes(q) || t.triggerEvent.toLowerCase().includes(q);
    const matchChannel = channelFilter === 'all' || t.channel === channelFilter;
    const matchCat = catFilter === 'all' || t.category === catFilter;
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchQ && matchChannel && matchCat && matchStatus;
  });

  const handleDelete = (id: string) => setTemplates(prev => prev.filter(t => t.id !== id));

  const activeCount = templates.filter(t => t.status === 'Active').length;
  const sentToday = templates.reduce((s, t) => s + t.sentToday, 0);
  const channelCount = CHANNELS.length;

  return (
    <PageWrapper
      title="Notification Templates"
      description="Manage push, email, SMS, and in-app notification templates"
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
          { label: 'Total Templates', value: templates.length, sub: `${activeCount} active`, icon: Bell, iconCls: 'text-primary bg-primary/10 border-primary/20', pill: 'bg-primary/10 text-primary border-primary/20' },
          { label: 'Sent Today', value: sentToday.toLocaleString(), sub: 'notifications', icon: Send, iconCls: 'text-sky-400 bg-sky-500/10 border-sky-500/20', pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
          { label: 'Channels', value: channelCount, sub: 'delivery methods', icon: Globe, iconCls: 'text-amber-400 bg-amber-500/10 border-amber-500/20', pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
          { label: 'Categories', value: CATEGORIES.length, sub: 'event categories', icon: FileText, iconCls: 'text-success bg-success/10 border-success/20', pill: 'bg-success/10 text-success border-success/20' },
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
            {(['all', ...CHANNELS] as const).map(ch => {
              const active = channelFilter === ch;
              const meta = ch !== 'all' ? CHANNEL_META[ch] : null;
              return (
                <button key={ch} onClick={() => setChannelFilter(ch)}
                  className={`px-3 py-1.5 rounded-lg text-[0.75rem] font-bold border transition-all duration-200 ${active ? meta ? `${meta.bg} ${meta.color} ${meta.border}` : 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted/40'}`}
                >{ch === 'all' ? 'All Channels' : ch}</button>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', ...CATEGORIES] as const).map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`px-2 py-1.5 rounded-lg text-[0.70rem] font-bold border transition-all duration-200 ${catFilter === c ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted/40'}`}
              >{c === 'all' ? 'All' : c}</button>
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
          {(search || channelFilter !== 'all' || catFilter !== 'all' || statusFilter !== 'all') && (
            <button onClick={() => { setSearch(''); setChannelFilter('all'); setCatFilter('all'); setStatusFilter('all'); }}
              className="w-7 h-7 flex items-center justify-center bg-destructive/10 border border-destructive/20 rounded-lg text-destructive hover:bg-destructive/20 transition-colors duration-150"
            ><X size={12} /></button>
          )}
        </div>
        {(search || channelFilter !== 'all' || catFilter !== 'all' || statusFilter !== 'all') && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">{filtered.length} template{filtered.length !== 1 ? 's' : ''} found</p>
        )}
      </div>

      {/* Template Cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(template => {
            const chMeta = CHANNEL_META[template.channel];
            const ChIcon = chMeta.icon;
            return (
              <div key={template.id} className="group bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex-shrink-0 border flex items-center justify-center ${chMeta.bg} ${chMeta.color} ${chMeta.border}`}>
                        <ChIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[0.88rem] font-bold font-display text-foreground truncate">{template.name}</h3>
                        <p className="text-[0.65rem] text-muted-foreground">{template.triggerEvent}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-150"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors duration-150"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(template.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-150"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {/* Title & Message Preview */}
                  <div className="bg-muted/20 border border-border/40 rounded-lg px-3 py-2 mb-3 space-y-1.5">
                    <div>
                      <p className="text-[0.60rem] font-bold text-muted-foreground uppercase tracking-wide">Title</p>
                      <p className="text-[0.78rem] font-medium text-foreground truncate">{template.title}</p>
                    </div>
                    <div>
                      <p className="text-[0.60rem] font-bold text-muted-foreground uppercase tracking-wide">Message</p>
                      <p className="text-[0.72rem] text-muted-foreground line-clamp-2">{template.message}</p>
                    </div>
                  </div>

                  {/* Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.68rem] font-bold ${chMeta.bg} ${chMeta.color} ${chMeta.border}`}>
                      <ChIcon className="w-2.5 h-2.5" />
                      {template.channel}
                    </span>
                    <Badge variant="outline" className="text-[0.62rem] px-1.5 py-0.5 h-auto bg-muted/40 text-muted-foreground border-border/40">{template.category}</Badge>
                    <Badge variant="outline" className={`text-[0.62rem] px-1.5 py-0.5 h-auto ${template.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : template.priority === 'Low' ? 'bg-muted/40 text-muted-foreground border-border/40' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      {template.priority}
                    </Badge>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.68rem] font-semibold border ${template.status === 'Active' ? 'bg-success/10 text-success border-success/20' : template.status === 'Draft' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-muted/40 text-muted-foreground border-border/40'}`}>
                      {template.status === 'Active' ? <CheckCircle className="w-2.5 h-2.5" /> : template.status === 'Draft' ? <FileText className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                      {template.status}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-4 text-[0.65rem] text-muted-foreground pt-3 border-t border-border/40">
                    <span className="flex items-center gap-1"><Send className="w-3 h-3" />{template.sentToday.toLocaleString()} today</span>
                    {template.lastSent && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{template.lastSent}</span>}
                    <span className="ml-auto">Created {template.createdAt}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center">
            <Bell className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No notification templates found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your filters or create a new template</p>
        </div>
      )}
    </PageWrapper>
  );
}

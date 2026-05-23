'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Search, X, RefreshCw, ExternalLink,
  CheckCircle, XCircle, AlertTriangle,
  Truck, Package, CreditCard, BarChart3,
  MessageSquare, Mail, FileText, Users,
  Globe, Database, Settings, Cloud,
  Link, Unlink, Clock, Zap, MapPin,
} from 'lucide-react';

type IntegrationStatus = 'Connected' | 'Disconnected' | 'Error';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: IntegrationStatus;
  connected: boolean;
  lastSync: string | null;
  icon: any;
  iconBg: string;
  iconColor: string;
}

const MOCK_INTEGRATIONS: Integration[] = [
  { id: 'int-001', name: 'ShipEngine', description: 'Multi-carrier shipping label generation and tracking', category: 'Shipping', status: 'Connected', connected: true, lastSync: '2 min ago', icon: Truck, iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  { id: 'int-002', name: 'FedEx', description: 'FedEx shipping rates, labels, and tracking integration', category: 'Carrier', status: 'Connected', connected: true, lastSync: '5 min ago', icon: Package, iconBg: 'bg-violet-500/10', iconColor: 'text-violet-400' },
  { id: 'int-003', name: 'UPS', description: 'UPS shipping services with real-time rate quotes', category: 'Carrier', status: 'Connected', connected: true, lastSync: '8 min ago', icon: Package, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400' },
  { id: 'int-004', name: 'DHL', description: 'DHL Express and freight shipping integration', category: 'Carrier', status: 'Connected', connected: true, lastSync: '12 min ago', icon: Package, iconBg: 'bg-rose-500/10', iconColor: 'text-rose-400' },
  { id: 'int-005', name: 'Stripe', description: 'Payment processing for invoices and subscriptions', category: 'Payments', status: 'Connected', connected: true, lastSync: '1 min ago', icon: CreditCard, iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-400' },
  { id: 'int-006', name: 'QuickBooks', description: 'Accounting and financial management sync', category: 'Finance', status: 'Connected', connected: true, lastSync: '1 hour ago', icon: BarChart3, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
  { id: 'int-007', name: 'Slack', description: 'Receive notifications and alerts in Slack channels', category: 'Communication', status: 'Connected', connected: true, lastSync: '15 min ago', icon: MessageSquare, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400' },
  { id: 'int-008', name: 'SendGrid', description: 'Transactional email delivery service', category: 'Communication', status: 'Connected', connected: true, lastSync: '3 min ago', icon: Mail, iconBg: 'bg-sky-500/10', iconColor: 'text-sky-400' },
  { id: 'int-009', name: 'Twilio', description: 'SMS and voice notification delivery', category: 'Communication', status: 'Disconnected', connected: false, lastSync: null, icon: MessageSquare, iconBg: 'bg-rose-500/10', iconColor: 'text-rose-400' },
  { id: 'int-010', name: 'Google Docs', description: 'Document generation and Google Sheets export', category: 'Productivity', status: 'Connected', connected: true, lastSync: '1 day ago', icon: FileText, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-400' },
  { id: 'int-011', name: 'Zendesk', description: 'Customer support ticket integration', category: 'Support', status: 'Error', connected: true, lastSync: '2 days ago', icon: Users, iconBg: 'bg-success/10', iconColor: 'text-success' },
  { id: 'int-012', name: 'AWS S3', description: 'Cloud storage for documents and shipment files', category: 'Storage', status: 'Connected', connected: true, lastSync: '30 min ago', icon: Database, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400' },
  { id: 'int-013', name: 'Google Maps', description: 'Geocoding, route optimization and mapping', category: 'Mapping', status: 'Connected', connected: true, lastSync: '5 min ago', icon: MapPin, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
  { id: 'int-014', name: 'Custom Webhook', description: 'Send real-time data to custom endpoints', category: 'Developer', status: 'Connected', connected: true, lastSync: '10 min ago', icon: Link, iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  { id: 'int-015', name: 'Zapier', description: 'Connect with 5000+ apps via Zapier automations', category: 'Automation', status: 'Disconnected', connected: false, lastSync: null, icon: Zap, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400' },
  { id: 'int-016', name: 'Microsoft 365', description: 'Outlook calendar and SharePoint integration', category: 'Productivity', status: 'Disconnected', connected: false, lastSync: null, icon: Globe, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-400' },
];

const CATEGORIES = ['Shipping', 'Carrier', 'Payments', 'Finance', 'Communication', 'Productivity', 'Support', 'Storage', 'Mapping', 'Developer', 'Automation'];

export default function IntegrationsPage() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<IntegrationStatus | 'all'>('all');
  const [integrations, setIntegrations] = useState(MOCK_INTEGRATIONS);

  const filtered = integrations.filter(i => {
    const q = search.toLowerCase();
    const matchQ = i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
    const matchCat = catFilter === 'all' || i.category === catFilter;
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchQ && matchCat && matchStatus;
  });

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(i => {
      if (i.id !== id) return i;
      const nowConnected = !i.connected;
      return {
        ...i,
        connected: nowConnected,
        status: nowConnected ? 'Connected' as const : 'Disconnected' as const,
        lastSync: nowConnected ? 'Just now' : null,
      };
    }));
    const int = integrations.find(i => i.id === id);
    toast.success(`${int?.name} ${int?.connected ? 'disconnected' : 'connected'} successfully`);
  };

  const connected = integrations.filter(i => i.connected).length;
  const errored = integrations.filter(i => i.status === 'Error').length;
  const synced = integrations.filter(i => i.lastSync !== null).length;

  return (
    <PageWrapper
      title="Integrations"
      description="Connect and manage third-party services and APIs"
      actions={
        <button
          className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-[0.82rem] font-bold text-white font-display cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Link size={14} />
          Add Integration
        </button>
      }
    >
      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Integrations', value: integrations.length, sub: `${connected} connected`, icon: Cloud, iconCls: 'text-primary bg-primary/10 border-primary/20', pill: 'bg-primary/10 text-primary border-primary/20' },
          { label: 'Connected', value: connected, sub: 'active services', icon: Link, iconCls: 'text-success bg-success/10 border-success/20', pill: 'bg-success/10 text-success border-success/20' },
          { label: 'With Errors', value: errored, sub: 'need attention', icon: AlertTriangle, iconCls: 'text-destructive bg-destructive/10 border-destructive/20', pill: 'bg-destructive/10 text-destructive border-destructive/20' },
          { label: 'Recently Synced', value: synced, sub: 'synced in 24h', icon: RefreshCw, iconCls: 'text-sky-400 bg-sky-500/10 border-sky-500/20', pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
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
              type="text" placeholder="Search integrations..." value={search} onChange={e => setSearch(e.target.value)}
              className="nb-search w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', ...CATEGORIES] as const).map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`px-2 py-1.5 rounded-lg text-[0.70rem] font-bold border transition-all duration-200 ${catFilter === c ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted/40'}`}
              >{c === 'all' ? 'All' : c}</button>
            ))}
          </div>
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value as IntegrationStatus | 'all')}
            className="h-9 px-3 rounded-lg text-[0.75rem] font-bold border bg-muted/20 text-muted-foreground border-border/40 outline-none focus:border-primary/50"
          >
            <option value="all">All Status</option>
            <option value="Connected">Connected</option>
            <option value="Disconnected">Disconnected</option>
            <option value="Error">Error</option>
          </select>
          {(search || catFilter !== 'all' || statusFilter !== 'all') && (
            <button onClick={() => { setSearch(''); setCatFilter('all'); setStatusFilter('all'); }}
              className="w-7 h-7 flex items-center justify-center bg-destructive/10 border border-destructive/20 rounded-lg text-destructive hover:bg-destructive/20 transition-colors duration-150"
            ><X size={12} /></button>
          )}
        </div>
        {(search || catFilter !== 'all' || statusFilter !== 'all') && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">{filtered.length} integration{filtered.length !== 1 ? 's' : ''} found</p>
        )}
      </div>

      {/* Integration Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map(int => {
            const Icon = int.icon;
            return (
              <div key={int.id} className="group bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex-shrink-0 border flex items-center justify-center ${int.iconBg} ${int.iconColor} border-current/20`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[0.88rem] font-bold font-display text-foreground truncate">{int.name}</h3>
                        <Badge variant="outline" className="text-[0.60rem] px-1.5 py-0 h-auto bg-muted/40 text-muted-foreground border-border/40 mt-0.5">
                          {int.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-150 opacity-0 group-hover:opacity-100"><ExternalLink className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors duration-150 opacity-0 group-hover:opacity-100"><Settings className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[0.72rem] text-muted-foreground mb-3 line-clamp-2">{int.description}</p>

                  {/* Status and Toggle */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <div className="flex items-center gap-2">
                      {int.status === 'Connected' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.65rem] font-semibold bg-success/10 text-success border border-success/20">
                          <CheckCircle className="w-2.5 h-2.5" /> Connected
                        </span>
                      ) : int.status === 'Error' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.65rem] font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                          <AlertTriangle className="w-2.5 h-2.5" /> Error
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[0.65rem] font-semibold bg-muted/40 text-muted-foreground border border-border/40">
                          <XCircle className="w-2.5 h-2.5" /> Disconnected
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {int.lastSync && (
                        <span className="text-[0.60rem] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />{int.lastSync}
                        </span>
                      )}
                      <Switch checked={int.connected} onCheckedChange={() => toggleConnection(int.id)} />
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
            <Cloud className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No integrations found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your filters or add a new integration</p>
        </div>
      )}
    </PageWrapper>
  );
}

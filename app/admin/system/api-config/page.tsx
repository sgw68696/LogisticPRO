'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Plus, Search, Copy, Eye, EyeOff,
  Trash2, Key, Globe, Webhook,
  RefreshCw, CheckCircle, XCircle,
  Clock, Shield, Server, Activity,
  AlertTriangle, Save, RotateCcw,
  Download,
} from 'lucide-react';

type ApiKeyStatus = 'Active' | 'Expired' | 'Revoked';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  maskedKey: string;
  created: string;
  lastUsed: string | null;
  status: ApiKeyStatus;
  permissions: string[];
  rateLimit: number;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'Active' | 'Inactive';
  lastTriggered: string | null;
  failureCount: number;
}

interface RateLimitRule {
  id: string;
  name: string;
  limit: number;
  window: string;
  description: string;
}

const MOCK_API_KEYS: ApiKey[] = [
  { id: 'ak-001', name: 'Production - Main', key: 'lpro_sk_prod_a1b2c3d4e5f6g7h8i9j0', maskedKey: 'lpro_sk_prod_...', created: '2026-01-15', lastUsed: '2 min ago', status: 'Active', permissions: ['read', 'write', 'delete'], rateLimit: 1000 },
  { id: 'ak-002', name: 'Staging Environment', key: 'lpro_sk_stag_k1l2m3n4o5p6q7r8s9t0', maskedKey: 'lpro_sk_stag_...', created: '2026-02-01', lastUsed: '1 hour ago', status: 'Active', permissions: ['read', 'write'], rateLimit: 500 },
  { id: 'ak-003', name: 'Mobile App', key: 'lpro_sk_mob_u1v2w3x4y5z6a7b8c9d0', maskedKey: 'lpro_sk_mob_...', created: '2026-03-10', lastUsed: '5 min ago', status: 'Active', permissions: ['read'], rateLimit: 300 },
  { id: 'ak-004', name: 'Partner Integration', key: 'lpro_sk_prt_e1f2g3h4i5j6k7l8m9n0', maskedKey: 'lpro_sk_prt_...', created: '2026-01-20', lastUsed: '3 days ago', status: 'Active', permissions: ['read', 'write'], rateLimit: 200 },
  { id: 'ak-005', name: 'Old Integration', key: 'lpro_sk_old_o1p2q3r4s5t6u7v8w9x0', maskedKey: 'lpro_sk_old_...', created: '2025-06-01', lastUsed: '6 months ago', status: 'Expired', permissions: ['read'], rateLimit: 100 },
  { id: 'ak-006', name: 'Compromised Key', key: 'lpro_sk_comp_y1z2a3b4c5d6e7f8g9h0', maskedKey: 'lpro_sk_comp_...', created: '2025-11-01', lastUsed: '1 month ago', status: 'Revoked', permissions: ['read', 'write', 'delete'], rateLimit: 1000 },
];

const MOCK_WEBHOOKS: WebhookEndpoint[] = [
  { id: 'wh-001', name: 'Shipment Status Updates', url: 'https://api.client.com/webhooks/shipment-status', events: ['shipment.created', 'shipment.updated', 'shipment.delivered'], status: 'Active', lastTriggered: '5 min ago', failureCount: 2 },
  { id: 'wh-002', name: 'Order Notifications', url: 'https://api.client.com/webhooks/order-events', events: ['order.created', 'order.cancelled'], status: 'Active', lastTriggered: '12 min ago', failureCount: 0 },
  { id: 'wh-003', name: 'Payment Webhook', url: 'https://api.client.com/webhooks/payments', events: ['payment.received', 'payment.failed'], status: 'Inactive', lastTriggered: null, failureCount: 15 },
];

const MOCK_RATE_LIMITS: RateLimitRule[] = [
  { id: 'rl-001', name: 'Default', limit: 100, window: '1 minute', description: 'General API request limit per minute' },
  { id: 'rl-002', name: 'Auth Endpoints', limit: 20, window: '1 minute', description: 'Login and authentication requests' },
  { id: 'rl-003', name: 'Bulk Operations', limit: 10, window: '1 minute', description: 'Batch import/export operations' },
  { id: 'rl-004', name: 'Webhook Delivery', limit: 50, window: '1 minute', description: 'Outgoing webhook requests' },
];

const PERMISSION_COLORS: Record<string, string> = {
  read: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  write: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  delete: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export default function ApiConfigPage() {
  const [apiKeys, setApiKeys] = useState(MOCK_API_KEYS);
  const [webhooks, setWebhooks] = useState(MOCK_WEBHOOKS);
  const [visibleKey, setVisibleKey] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const revokeKey = (id: string) => {
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'Revoked' as const } : k));
    toast.success('API key revoked');
  };

  const generateKey = () => {
    const newKey: ApiKey = {
      id: `ak-${Date.now()}`,
      name: 'New API Key',
      key: `lpro_sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      maskedKey: 'lpro_sk_new_...',
      created: new Date().toISOString().split('T')[0],
      lastUsed: null,
      status: 'Active',
      permissions: ['read'],
      rateLimit: 100,
    };
    setApiKeys(prev => [newKey, ...prev]);
    toast.success('New API key generated');
  };

  const filteredKeys = apiKeys.filter(k => {
    const q = search.toLowerCase();
    return k.name.toLowerCase().includes(q) || k.status.toLowerCase().includes(q);
  });

  return (
    <PageWrapper
      title="API Configuration"
      description="Manage API keys, rate limits, and webhook endpoints"
      actions={
        <Button size="sm" onClick={generateKey} className="gap-1.5 text-xs h-8 text-white"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Plus className="w-3.5 h-3.5" /> Generate Key
        </Button>
      }
    >
      <div className="space-y-6">

        {/* API Keys Section */}
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Key className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-[0.92rem] font-bold font-display">API Keys</CardTitle>
              </div>
              <div className="relative w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text" placeholder="Search keys..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-2 bg-muted/40 border border-border rounded-lg text-[0.75rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40">
                    {['Name', 'API Key', 'Created', 'Last Used', 'Permissions', 'Rate Limit', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredKeys.map(key => (
                    <tr key={key.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors duration-150">
                      <td className="px-4 py-3">
                        <span className="text-[0.78rem] font-medium text-foreground">{key.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <code className="text-[0.70rem] font-mono bg-muted/30 px-2 py-0.5 rounded border border-border/40 text-muted-foreground">
                            {visibleKey === key.id ? key.key : key.maskedKey}
                          </code>
                          <button onClick={() => setVisibleKey(visibleKey === key.id ? null : key.id)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors duration-150">
                            {visibleKey === key.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button onClick={() => copyToClipboard(key.key)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors duration-150">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[0.70rem] text-muted-foreground">{key.created}</td>
                      <td className="px-4 py-3 text-[0.70rem] text-muted-foreground">{key.lastUsed || 'Never'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {key.permissions.map(p => (
                            <span key={p} className={`px-1.5 py-0.5 rounded text-[0.60rem] font-bold border ${PERMISSION_COLORS[p] || 'bg-muted/40 text-muted-foreground border-border/40'}`}>
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[0.70rem] font-mono text-muted-foreground">{key.rateLimit}/min</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.62rem] font-bold border ${key.status === 'Active' ? 'bg-success/10 text-success border-success/20' : key.status === 'Expired' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${key.status === 'Active' ? 'bg-success' : key.status === 'Expired' ? 'bg-amber-400' : 'bg-destructive'}`} />
                          {key.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {key.status === 'Active' && (
                            <button onClick={() => revokeKey(key.id)}
                              className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
                              title="Revoke key"
                            ><Trash2 className="w-3.5 h-3.5" /></button>
                          )}
                          <button className="p-1.5 rounded text-muted-foreground hover:text-sky-400 hover:bg-sky-500/10 transition-colors duration-150" title="Edit key"><RotateCcw className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredKeys.length === 0 && (
                <div className="py-12 text-center">
                  <Key className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-[0.82rem] text-muted-foreground">No API keys found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits Section */}
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <CardTitle className="text-[0.92rem] font-bold font-display">Rate Limiting Rules</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  {['Rule', 'Limit', 'Window', 'Description', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_RATE_LIMITS.map(rule => (
                  <tr key={rule.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors duration-150">
                    <td className="px-4 py-3">
                      <span className="text-[0.78rem] font-medium text-foreground">{rule.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[0.78rem] font-mono font-bold text-foreground">{rule.limit}</span>
                    </td>
                    <td className="px-4 py-3 text-[0.70rem] text-muted-foreground">{rule.window}</td>
                    <td className="px-4 py-3 text-[0.70rem] text-muted-foreground">{rule.description}</td>
                    <td className="px-4 py-3">
                      <Switch defaultChecked />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Webhook Endpoints Section */}
        <Card className="bg-card border border-border/60 shadow-soft">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Webhook className="w-4 h-4 text-violet-400" />
                </div>
                <CardTitle className="text-[0.92rem] font-bold font-display">Webhook Endpoints</CardTitle>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                <Plus className="w-3.5 h-3.5" /> Add Endpoint
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            {webhooks.map(wh => (
              <div key={wh.id} className="bg-muted/20 border border-border/40 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[0.82rem] font-bold font-display text-foreground">{wh.name}</h4>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.60rem] font-bold border ${wh.status === 'Active' ? 'bg-success/10 text-success border-success/20' : 'bg-muted/40 text-muted-foreground border-border/40'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${wh.status === 'Active' ? 'bg-success' : 'bg-muted-foreground'}`} />
                        {wh.status}
                      </span>
                    </div>
                    <code className="text-[0.70rem] font-mono text-muted-foreground break-all">{wh.url}</code>
                  </div>
                  <Switch checked={wh.status === 'Active'} onCheckedChange={v => {
                    setWebhooks(prev => prev.map(w => w.id === wh.id ? { ...w, status: v ? 'Active' as const : 'Inactive' as const } : w));
                    toast.success(`Webhook ${v ? 'activated' : 'deactivated'}`);
                  }} />
                </div>
                <div className="flex items-center gap-3 text-[0.65rem] text-muted-foreground">
                  <div className="flex gap-1 flex-wrap">
                    {wh.events.map(ev => (
                      <span key={ev} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[0.58rem] font-bold">{ev}</span>
                    ))}
                  </div>
                  <span className="ml-auto flex items-center gap-1"><Clock className="w-3 h-3" />{wh.lastTriggered || 'Never triggered'}</span>
                  {wh.failureCount > 0 && (
                    <span className="flex items-center gap-1 text-destructive"><AlertTriangle className="w-3 h-3" />{wh.failureCount} failures</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </PageWrapper>
  );
}

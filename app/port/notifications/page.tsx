'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell, Search, CheckCircle2, AlertTriangle, Clock, Eye,
  X, Ship, Anchor, Package, DollarSign, FileText, ArrowRight,
  Shield, Info, Trash2, CalendarDays, Loader2, Activity,
} from 'lucide-react';

type NotifSeverity = 'critical' | 'warning' | 'info' | 'success';
type NotifCategory = 'vessel' | 'cargo' | 'berth' | 'customs' | 'finance' | 'system' | 'security';

interface Notification {
  id: string;
  title: string;
  message: string;
  severity: NotifSeverity;
  category: NotifCategory;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  actionLabel: string | null;
}

const CATEGORY_META: Record<NotifCategory, { icon: typeof Bell; color: string; bg: string }> = {
  vessel: { icon: Ship, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  cargo: { icon: Package, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  berth: { icon: Anchor, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  customs: { icon: Shield, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  finance: { icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  system: { icon: Activity, color: 'text-muted-foreground', bg: 'bg-muted/30' },
  security: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

const allNotifications: Notification[] = [
  { id: 'N-001', title: 'Berth B-02 Maintenance Overrun', message: 'Scheduled maintenance at Berth B-02 is 4 hours behind schedule. Vessel ETA in 3 hours — possible berth conflict.', severity: 'critical', category: 'berth', timestamp: '10 min ago', read: false, actionable: true, actionLabel: 'View Schedule' },
  { id: 'N-002', title: 'Customs Hold: OOLU789012', message: 'Container OOLU789012 (MSC ZOE) placed on customs hold. Documentation pending — hazmat declaration missing.', severity: 'warning', category: 'customs', timestamp: '25 min ago', read: false, actionable: true, actionLabel: 'Review Docs' },
  { id: 'N-003', title: 'Yard Utilization at 88%', message: 'Container yard D section is approaching capacity. Consider re-routing incoming empty containers to yard E.', severity: 'warning', category: 'cargo', timestamp: '1 hour ago', read: false, actionable: true, actionLabel: 'View Yard Map' },
  { id: 'N-004', title: 'Manifest Filed: MSC ZOE', message: 'Cargo manifest for MSC ZOE has been received and filed. 18 containers declared for transshipment to Tokyo.', severity: 'info', category: 'cargo', timestamp: '2 hours ago', read: false, actionable: false, actionLabel: null },
  { id: 'N-005', title: 'Invoice INV-2026-0421 Paid', message: 'Port charges invoice INV-2026-0421 (CMA CGM ALTAMIRA) has been paid in full. $10,380 received.', severity: 'success', category: 'finance', timestamp: '2 hours ago', read: false, actionable: false, actionLabel: null },
  { id: 'N-006', title: 'Vessel Arrival: CMA CGM ALTAMIRA', message: 'CMA CGM ALTAMIRA has arrived and is berthing at B-12. 34 containers for offload.', severity: 'info', category: 'vessel', timestamp: '3 hours ago', read: true, actionable: true, actionLabel: 'Track Vessel' },
  { id: 'N-007', title: 'ISPS Certificate Expiring', message: 'Security certificate for COSCO PRIDE (ISPS-2025-1123) expires in 7 days. Renewal required before next port call.', severity: 'warning', category: 'security', timestamp: '4 hours ago', read: true, actionable: true, actionLabel: 'View Certificate' },
  { id: 'N-008', title: 'Cargo Operation Completed', message: 'Offload of COSCO PRIDE completed. 67 containers transferred to yard. Operation duration: 12 hours.', severity: 'success', category: 'cargo', timestamp: '5 hours ago', read: true, actionable: false, actionLabel: null },
  { id: 'N-009', title: 'Pilot Requested: MAERSK GUJARAT', message: 'Pilot service requested for MAERSK GUJARAT arrival at 14:00. Berth C-03 assigned.', severity: 'info', category: 'vessel', timestamp: '6 hours ago', read: true, actionable: false, actionLabel: null },
  { id: 'N-010', title: 'System Maintenance: 0200-0400', message: 'Planned system maintenance for port management system on 15 May 0200-0400 hours. Brief downtime expected.', severity: 'info', category: 'system', timestamp: '8 hours ago', read: true, actionable: false, actionLabel: null },
  { id: 'N-011', title: 'Port Dues Overdue: MSC ZOE', message: 'Port charges for MSC ZOE (INV-2026-0423) are now 2 days overdue. Total outstanding: $6,200.', severity: 'critical', category: 'finance', timestamp: '1 day ago', read: true, actionable: true, actionLabel: 'Send Reminder' },
  { id: 'N-012', title: 'Gate Pass Expired: 5 Containers', message: '5 containers in yard have expired gate passes. Please arrange renewal or cargo pickup.', severity: 'warning', category: 'cargo', timestamp: '1 day ago', read: true, actionable: true, actionLabel: 'View List' },
];

export default function NotificationsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(allNotifications);

  const filtered = useMemo(() => {
    let result = [...notifications];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
    }
    if (filter === 'unread') result = result.filter(n => !n.read);
    if (filter === 'critical') result = result.filter(n => n.severity === 'critical');
    return result;
  }, [notifications, search, filter]);

  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    critical: notifications.filter(n => n.severity === 'critical').length,
    warnings: notifications.filter(n => n.severity === 'warning').length,
  }), [notifications]);

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <PageWrapper
      title="Notifications"
      description="Real-time port alerts, operational notifications, and system messages"
      actions={
        stats.unread > 0 ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 rounded-[9px]" onClick={markAllRead}>
              <CheckCircle2 className="w-4 h-4" />Mark All Read
            </Button>
            <Button className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:from-sky-600 hover:to-indigo-600 rounded-[10px] gap-2">
              <Bell className="w-4 h-4" />Configure Alerts
            </Button>
          </div>
        ) : (
          <Button className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:from-sky-600 hover:to-indigo-600 rounded-[10px] gap-2">
            <Bell className="w-4 h-4" />Configure Alerts
          </Button>
        )
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Notifications" value={stats.total} icon={<Bell className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Unread" value={stats.unread} icon={<Clock className="w-5 h-5" />} iconColor="amber" trend={stats.unread > 0 ? { value: stats.unread, isPositive: false } : undefined} />
        <KPICard title="Critical" value={stats.critical} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" />
        <KPICard title="Warnings" value={stats.warnings} icon={<AlertTriangle className="w-5 h-5" />} iconColor="indigo" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => { setSearch(e.target.value); setLoading(true); setTimeout(() => setLoading(false), 300); }} placeholder="Search notifications..." className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)] transition-all duration-200" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <div className="flex gap-1.5">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: stats.unread },
              { key: 'critical', label: 'Critical', count: stats.critical },
            ].map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key as typeof filter)}
                className={`px-3 py-1.5 rounded-full text-[0.70rem] font-bold border transition-all ${filter === tab.key ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'}`}>
                {tab.label} <span className="opacity-60">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
        {(search || filter !== 'all') && <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">{filtered.length} notification(s)</p>}
      </div>

      {loading ? <SkeletonLoader variant="list" count={5} /> : filtered.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center"><Bell className="w-7 h-7 text-muted-foreground/30" /></div>
          <p className="text-[0.88rem] font-semibold text-foreground">No notifications</p>
          <p className="text-[0.78rem] text-muted-foreground">{filter === 'unread' ? 'All caught up!' : 'No matching notifications found'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => {
            const meta = CATEGORY_META[n.category];
            const Icon = meta.icon;
            return (
              <div key={n.id} className={`group bg-card border border-border/60 rounded-xl shadow-soft p-4 transition-all duration-200 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)] ${!n.read ? 'border-l-2 border-l-primary' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center shrink-0 ${meta.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[0.88rem] font-semibold text-foreground">{n.title}</h3>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.55rem] font-bold border ${
                            n.severity === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                            n.severity === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            n.severity === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-sky-500/10 text-sky-400 border-sky-500/20'
                          }`}>{n.severity}</span>
                        </div>
                        <p className="text-[0.78rem] text-muted-foreground mt-1">{n.message}</p>
                      </div>
                      <span className="text-[0.65rem] text-muted-foreground shrink-0 whitespace-nowrap">{n.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className="text-[0.55rem] font-bold px-1.5 py-0 capitalize">{n.category}</Badge>
                      {n.actionable && n.actionLabel && (
                        <Button variant="ghost" size="sm" className="h-6 text-[0.70rem] gap-1 text-primary hover:text-primary/80 px-2 rounded-md">
                          {n.actionLabel} <ArrowRight className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {!n.read && (
                      <button onClick={() => markRead(n.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-150">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => deleteNotif(n.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-150">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}

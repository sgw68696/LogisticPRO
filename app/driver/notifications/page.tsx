'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KPICard } from '@/components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockNotifications } from '@/data/mockData';
import {
  Bell, AlertCircle, CheckCircle2, Clock,
  Truck, DollarSign, Wrench, Package,
  Search, X, RefreshCw, ArrowRight,
  CheckCheck, Power, Navigation,
} from 'lucide-react';

const NOTIF_TYPE_META: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  shipment_delayed: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  payment_overdue: { icon: DollarSign, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
  shipment_delivered: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  new_shipment: { icon: Package, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  dispatch_completed: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  driver_off_duty: { icon: Power, color: 'text-muted-foreground', bg: 'bg-muted/40', border: 'border-border/40' },
  maintenance_due: { icon: Wrench, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  driver_assigned: { icon: Navigation, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
};

export default function DriverNotificationsPage() {
  const [typeFilter, setTypeFilter] = useState('All');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');

  const notifications = useMemo(() => mockNotifications, []);

  const types = useMemo(() => {
    const t = new Set(notifications.map(n => n.type));
    return ['All', ...Array.from(t)];
  }, [notifications]);

  const filtered = useMemo(() => {
    let data = notifications;
    if (typeFilter !== 'All') data = data.filter(n => n.type === typeFilter);
    if (readFilter === 'unread') data = data.filter(n => !n.read);
    if (readFilter === 'read') data = data.filter(n => n.read);
    return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, typeFilter, readFilter]);

  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    important: notifications.filter(n => n.type === 'shipment_delayed' || n.type === 'maintenance_due').length,
  }), [notifications]);

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date(); const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <PageWrapper
      title="Notifications"
      description="Alerts and updates for your trips"
      actions={
        <div className="flex items-center gap-2">
          {stats.unread > 0 && (
            <Badge variant="default" className="text-[0.65rem] px-2 py-0.5 h-auto bg-primary/15 text-primary border-primary/20 gap-1">
              <Bell className="w-3 h-3" /> {stats.unread} new
            </Badge>
          )}
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8"><RefreshCw className="w-3.5 h-3.5" /> Refresh</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPICard title="Total" value={stats.total} icon={<Bell className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Unread" value={stats.unread} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Important" value={stats.important} icon={<AlertCircle className="w-5 h-5" />} iconColor="red" />
      </div>

      {/* Filter Bar */}
      <Card className="bg-card border border-border/60 shadow-soft mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              {(['all', 'unread', 'read'] as const).map(r => (
                <button key={r} onClick={() => setReadFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-[0.7rem] font-bold border transition-all ${readFilter === r ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'}`}
                >{r === 'all' ? 'All' : r === 'unread' ? 'Unread' : 'Read'}</button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {types.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold border transition-all ${typeFilter === t ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'}`}
                >{t === 'All' ? 'All Types' : t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map(n => {
            const meta = NOTIF_TYPE_META[n.type] || { icon: Bell, color: 'text-muted-foreground', bg: 'bg-muted/40', border: 'border-border/40' };
            const Icon = meta.icon;
            return (
              <div key={n.id}
                className={`bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden transition-all duration-300 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)] ${!n.read ? 'border-l-2 border-l-primary' : ''}`}
              >
                <div className="p-4">
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 border flex items-center justify-center ${meta.bg} ${meta.color} ${meta.border}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-[0.82rem] font-bold font-display text-foreground">{n.title}</h3>
                            <span className={`px-1.5 py-0.5 rounded text-[0.55rem] font-bold border ${meta.bg} ${meta.color} ${meta.border}`}>
                              {n.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-[0.72rem] text-muted-foreground mt-0.5">{n.message}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                      </div>
                      <div className="flex items-center gap-3 mt-2.5">
                        <span className="text-[0.6rem] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />{formatTimeAgo(n.timestamp)}
                        </span>
                        {n.actionUrl && (
                          <a href={n.actionUrl} className="text-[0.6rem] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5">
                            View Details <ArrowRight className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <Card className="bg-card border border-border/60 shadow-soft">
            <CardContent className="py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center mx-auto mb-4">
                <CheckCheck className="w-7 h-7 text-muted-foreground/30" />
              </div>
              <p className="text-[0.92rem] font-semibold text-foreground">All caught up!</p>
              <p className="text-[0.78rem] text-muted-foreground mt-1">No notifications match your filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}

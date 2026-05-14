'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import {
  Bell, CheckCheck, Trash2, Clock, AlertTriangle,
  Info, CheckCircle2, Ship, Truck, CreditCard,
  MessageSquare, Megaphone,
} from 'lucide-react';
import { portalMockNotifications } from '@/data/portal-mock-data';

const CATEGORY_META: Record<string, { bg: string; border: string; icon: any; label: string }> = {
  shipment: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Truck, label: 'Shipment' },
  invoice: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: CreditCard, label: 'Invoice' },
  payment: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2, label: 'Payment' },
  support: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: MessageSquare, label: 'Support' },
  general: { bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Megaphone, label: 'General' },
};

const TYPE_COLORS: Record<string, string> = {
  shipment_update: 'text-blue-400',
  billing: 'text-amber-400',
  support: 'text-purple-400',
  general: 'text-slate-400',
};

export default function PortalNotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const [notifications, setNotifications] = useState(portalMockNotifications);
  const [loading, setLoading] = useState(false);

  const sorted = useMemo(() => {
    return [...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications]);

  const filtered = useMemo(() => {
    if (filter === 'unread') return sorted.filter(n => !n.read);
    if (filter === 'critical') return sorted.filter(n => n.type === 'shipment_update' && !n.read);
    return sorted;
  }, [sorted, filter]);

  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    shipment: notifications.filter(n => n.category === 'shipment').length,
    billing: notifications.filter(n => n.category === 'invoice' || n.category === 'payment').length,
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
      description="Stay updated with your shipments, invoices, and support activity"
      actions={
        stats.unread > 0 && (
          <Button variant="outline" size="sm" className="rounded-[9px] text-xs gap-1.5" onClick={markAllRead}>
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All Read
          </Button>
        )
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Notifications" value={stats.total} icon={<Bell className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Unread" value={stats.unread} icon={<AlertTriangle className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Shipment Updates" value={stats.shipment} icon={<Truck className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Billing" value={stats.billing} icon={<CreditCard className="w-5 h-5" />} iconColor="green" />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        {[
          { label: 'All', value: 'all' as const, count: notifications.length },
          { label: 'Unread', value: 'unread' as const, count: stats.unread },
          { label: 'Shipment Alerts', value: 'critical' as const, count: notifications.filter(n => n.type === 'shipment_update' && !n.read).length },
        ].map(tab => (
          <button key={tab.value} onClick={() => setFilter(tab.value)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.7rem] font-bold border transition-all ${filter === tab.value ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'}`}>
            {tab.label}
            <span className="text-[0.6rem] opacity-60">{tab.count}</span>
          </button>
        ))}
      </div>

      {loading ? <SkeletonLoader variant="card" count={4} />
        : filtered.length === 0 ? (
          <div className="bg-card border border-border/60 rounded-xl shadow-soft py-16 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-muted/30 border border-border/50 flex items-center justify-center">
              <Bell className="w-7 h-7 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-semibold text-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground">{filter === 'unread' ? 'All caught up!' : 'No notifications to show'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(notif => {
              const meta = CATEGORY_META[notif.category] || CATEGORY_META.general;
              const Icon = meta.icon;
              return (
                <div key={notif.id} className={`group bg-card border ${notif.read ? 'border-border/60' : 'border-emerald-500/30'} rounded-xl shadow-soft p-4 hover:border-primary/25 transition-all duration-200`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg ${meta.bg} ${meta.border} border flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${TYPE_COLORS[notif.type] || 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">{notif.title}</h3>
                            {!notif.read && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notif.read && (
                            <button onClick={() => markRead(notif.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors" title="Mark read">
                              <CheckCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => deleteNotif(notif.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={`text-[0.55rem] px-1.5 py-0 ${meta.bg} ${meta.border} text-muted-foreground`}>{meta.label}</Badge>
                        <span className="text-[0.6rem] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {(() => {
                            const diff = Date.now() - new Date(notif.timestamp).getTime();
                            const hrs = Math.floor(diff / 3600000);
                            if (hrs < 1) return 'Just now';
                            if (hrs < 24) return `${hrs}h ago`;
                            const days = Math.floor(hrs / 24);
                            return `${days}d ago`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {notif.actionUrl && (
                    <div className="mt-3 pt-3 border-t border-border/40">
                      <Link href={notif.actionUrl}>
                        <Button variant="ghost" size="sm" className="text-xs text-primary h-7 px-2 rounded-[8px]">View Details</Button>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </PageWrapper>
  );
}

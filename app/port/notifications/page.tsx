'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { portService } from '@/services/port/portService';
import type { PortNotification, PortNotifType, PortNotifSeverity } from '@/types/port';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatDate } from '@/lib/utils';
import { exportToCSV } from '@/lib/export-utils';
import { toast } from 'sonner';
import { Bell, Search, X, CheckCheck, Trash2, Ship, Plane, Anchor, AlertTriangle, Clock, FileText, DollarSign, Info, Shield, Cloud, Mail, MailOpen, Filter, ArrowUpDown, Download } from 'lucide-react';

const severityColors: Record<string, string> = {
  Info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  Emergency: 'bg-red-600/10 text-red-500 border-red-600/20 animate-pulse',
};

function getNotifIcon(type: string) {
  switch (type) {
    case 'Vessel Arrival': return <Ship className="w-5 h-5 text-blue-400" />;
    case 'Departure': return <Plane className="w-5 h-5 text-indigo-400" />;
    case 'Delay': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    case 'Berth Assignment': return <Anchor className="w-5 h-5 text-cyan-400" />;
    case 'Cargo Exception': return <AlertTriangle className="w-5 h-5 text-red-400" />;
    case 'Customs Alert': return <Shield className="w-5 h-5 text-purple-400" />;
    case 'Document Ready': return <FileText className="w-5 h-5 text-green-400" />;
    case 'Invoice': return <DollarSign className="w-5 h-5 text-emerald-400" />;
    case 'System': return <Info className="w-5 h-5 text-gray-400" />;
    case 'Weather': return <Cloud className="w-5 h-5 text-sky-400" />;
    default: return <Bell className="w-5 h-5 text-muted-foreground" />;
  }
}

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'critical', label: 'Critical' },
  { key: 'warnings', label: 'Warnings' },
] as const;

type FilterKey = (typeof filterTabs)[number]['key'];

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<PortNotification[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<PortNotification | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingNotif, setDeletingNotif] = useState<PortNotification | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await portService.listNotifications();
        setNotifications(data);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleMarkRead = useCallback(async (id: string) => {
    try {
      await portService.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch { toast.error('Failed to mark notification as read'); }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    const ids = notifications.filter(n => !n.read).map(n => n.id);
    if (ids.length === 0) return;
    try {
      await portService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed to mark all as read'); }
  }, [notifications]);

  const handleDeleteConfirm = async () => {
    if (!deletingNotif) return;
    setNotifications(prev => prev.filter(n => n.id !== deletingNotif.id));
    setDeleteOpen(false);
    setDeletingNotif(null);
    toast.success('Notification deleted');
  };

  const openDetail = (notif: PortNotification) => {
    setSelectedNotif(notif);
    setDrawerOpen(true);
    if (!notif.read) handleMarkRead(notif.id);
  };

  const openDelete = (notif: PortNotification) => {
    setDeletingNotif(notif);
    setDeleteOpen(true);
  };

  const filtered = useMemo(() => {
    let result = notifications;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q) || n.module.toLowerCase().includes(q));
    }
    if (filter === 'unread') result = result.filter(n => !n.read);
    if (filter === 'critical') result = result.filter(n => n.severity === 'Critical' || n.severity === 'Emergency');
    if (filter === 'warnings') result = result.filter(n => n.severity === 'Warning');
    return result;
  }, [notifications, search, filter]);

  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    critical: notifications.filter(n => n.severity === 'Critical' || n.severity === 'Emergency').length,
    warnings: notifications.filter(n => n.severity === 'Warning').length,
  }), [notifications]);

  const handleExport = () => {
    const headers = [
      { key: 'id' as keyof PortNotification, label: 'ID' },
      { key: 'type' as keyof PortNotification, label: 'Type' },
      { key: 'severity' as keyof PortNotification, label: 'Severity' },
      { key: 'title' as keyof PortNotification, label: 'Title' },
      { key: 'message' as keyof PortNotification, label: 'Message' },
      { key: 'module' as keyof PortNotification, label: 'Module' },
      { key: 'timestamp' as keyof PortNotification, label: 'Timestamp' },
      { key: 'read' as keyof PortNotification, label: 'Read' },
    ];
    exportToCSV(filtered as unknown as Record<string, unknown>[], 'port-notifications', headers);
    toast.success('Notifications exported to CSV');
  };

  const hasActiveFilters = search || filter !== 'all';

  return (
    <PageWrapper
      title="Notifications"
      description="Live operational alerts and updates"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} size="sm" className="gap-2"><Download className="w-4 h-4" />Export CSV</Button>
          {stats.unread > 0 && <Button variant="outline" size="sm" className="gap-2" onClick={handleMarkAllRead}><CheckCheck className="w-4 h-4" />Mark All Read</Button>}
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Notifications" value={stats.total} icon={<Bell className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Unread" value={stats.unread} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Critical" value={stats.critical} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" />
        <KPICard title="Warnings" value={stats.warnings} icon={<AlertTriangle className="w-5 h-5" />} iconColor="amber" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notifications by title, message, or module..." className="w-full h-9 pl-9 pr-9 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all duration-200" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <div className="flex gap-1.5">
            {filterTabs.map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key)} className={cn('px-3 py-1.5 rounded-full text-[0.70rem] font-bold border transition-all', filter === tab.key ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground')}>
                {tab.label} <span className="opacity-60">{stats[tab.key === 'all' ? 'total' : tab.key]}</span>
              </button>
            ))}
          </div>
        </div>
        {hasActiveFilters && <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">{filtered.length} notification{filtered.length !== 1 ? 's' : ''}</p>}
      </div>

      {loading ? <LoadingState rows={5} message="Loading notifications..." /> : filtered.length === 0 ? (
        <EmptyState icon={<Bell className="w-8 h-8 text-muted-foreground" />} title="No notifications" description={hasActiveFilters ? 'No matching notifications found' : 'All caught up!'} />
      ) : (
        <div className="space-y-2">
          {filtered.map(notification => {
            const isRead = notification.read;
            return (
              <Card key={notification.id} className={cn('transition-all duration-200 cursor-pointer hover:border-primary/30', !isRead && 'border-l-2 border-l-primary')} onClick={() => openDetail(notification)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      {getNotifIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={cn('text-[0.88rem]', isRead ? 'font-medium text-foreground' : 'font-semibold text-foreground')}>{notification.title}</h3>
                            {!isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                            {isRead ? <MailOpen className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" /> : <Mail className="w-3.5 h-3.5 text-primary/60 shrink-0" />}
                          </div>
                          <p className="text-[0.78rem] text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[0.55rem] font-bold border', severityColors[notification.severity] || 'bg-gray-500/10 text-gray-400 border-gray-500/20')}>{notification.severity}</span>
                            <Badge variant="outline" className="text-[0.55rem] font-bold px-1.5 py-0">{notification.module}</Badge>
                            <span className="text-[0.65rem] text-muted-foreground">{formatDate(notification.timestamp, 'datetime')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      {!isRead && <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleMarkRead(notification.id)} title="Mark as read"><CheckCheck className="w-3.5 h-3.5" /></Button>}
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive" onClick={() => openDelete(notification)} title="Delete notification"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-w-md">
          <DrawerHeader><DrawerTitle>Notification Details</DrawerTitle><DrawerClose /></DrawerHeader>
          {selectedNotif && (
            <div className="px-6 pb-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  {getNotifIcon(selectedNotif.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">{selectedNotif.title}</h3>
                    {!selectedNotif.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] font-bold border', severityColors[selectedNotif.severity])}>{selectedNotif.severity}</span>
                    <span className="text-xs text-muted-foreground">{selectedNotif.type}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-foreground">{selectedNotif.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Module</p><p className="font-medium text-foreground">{selectedNotif.module}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Type</p><p className="font-medium text-foreground">{selectedNotif.type}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Timestamp</p><p className="font-medium text-foreground">{formatDate(selectedNotif.timestamp, 'datetime')}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Status</p><p className="font-medium text-foreground">{selectedNotif.read ? 'Read' : 'Unread'}</p></div>
                {selectedNotif.referenceId && <div className="p-3 bg-muted/20 rounded-lg col-span-2"><p className="text-xs text-muted-foreground">Reference ID</p><p className="font-medium text-foreground font-mono">{selectedNotif.referenceId}</p></div>}
                {selectedNotif.actionUrl && <div className="p-3 bg-muted/20 rounded-lg col-span-2"><p className="text-xs text-muted-foreground">Action URL</p><a href={selectedNotif.actionUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline text-xs">{selectedNotif.actionUrl}</a></div>}
              </div>

              {!selectedNotif.read && (
                <Button size="sm" variant="outline" className="gap-2" onClick={() => { handleMarkRead(selectedNotif.id); setDrawerOpen(false); }}>
                  <CheckCheck className="w-4 h-4" />Mark as Read
                </Button>
              )}
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Notification</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogDescription>Are you sure you want to delete this notification? This action cannot be undone.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}

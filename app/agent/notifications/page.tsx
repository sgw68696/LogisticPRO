'use client';

import { useState, useEffect, useCallback } from 'react';
import { warehouseService } from '@/services/warehouseService';
import type { WarehouseNotification } from '@/types/warehouse';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { cn, formatDate } from '@/lib/utils';
import { exportToCSV } from '@/lib/export-utils';
import { toast } from 'sonner';
import { Bell, Search, X, CheckCheck, Trash2, Package, Truck, AlertTriangle, Clock, FileText, DollarSign, Info, Shield, Box, Warehouse as WarehouseIcon, Filter, RefreshCw, ArrowUpDown, Download, RotateCcw } from 'lucide-react';

const severityColors: Record<string, string> = {
  Info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function getNotifIcon(type: string) {
  switch (type) {
    case 'Stock Alert': return <Package className="w-5 h-5 text-amber-400" />;
    case 'Shipment Alert': return <Truck className="w-5 h-5 text-blue-400" />;
    case 'Delayed Dispatch': return <Clock className="w-5 h-5 text-red-400" />;
    case 'Damage Alert': return <AlertTriangle className="w-5 h-5 text-red-400" />;
    case 'Assignment': return <Bell className="w-5 h-5 text-purple-400" />;
    case 'GRN Alert': return <FileText className="w-5 h-5 text-green-400" />;
    case 'GDN Alert': return <FileText className="w-5 h-5 text-cyan-400" />;
    case 'System': return <Info className="w-5 h-5 text-gray-400" />;
    default: return <Bell className="w-5 h-5 text-muted-foreground" />;
  }
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<WarehouseNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('All');
  const [selectedNotif, setSelectedNotif] = useState<WarehouseNotification | null>(null);
  const [deleteNotif, setDeleteNotif] = useState<WarehouseNotification | null>(null);

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await warehouseService.listNotifications();
      setNotifs(data as WarehouseNotification[]);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const filtered = notifs.filter(n => {
    const q = search.toLowerCase();
    if (q && !n.title.toLowerCase().includes(q) && !n.message.toLowerCase().includes(q) && !n.module.toLowerCase().includes(q)) return false;
    if (filterTab === 'Unread' && n.read) return false;
    if (filterTab === 'Critical' && n.severity !== 'Critical') return false;
    if (filterTab === 'Warnings' && n.severity !== 'Warning') return false;
    return true;
  });

  const stats = {
    total: notifs.length,
    unread: notifs.filter(n => !n.read).length,
    critical: notifs.filter(n => n.severity === 'Critical').length,
    warnings: notifs.filter(n => n.severity === 'Warning').length,
  };

  const handleMarkRead = async (notif: WarehouseNotification) => {
    if (notif.read) return;
    await warehouseService.markNotificationRead(notif.id);
    setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setSelectedNotif({ ...notif, read: true });
    toast.success('Notification marked as read');
  };

  const handleMarkAllRead = async () => {
    await warehouseService.markAllNotificationsRead();
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleDelete = async () => {
    if (!deleteNotif) return;
    setNotifs(prev => prev.filter(n => n.id !== deleteNotif.id));
    toast.success('Notification deleted');
    setDeleteNotif(null);
  };

  const handleExportCSV = () => {
    exportToCSV(
      filtered.map(n => ({
        Title: n.title, Message: n.message, Module: n.module,
        Severity: n.severity, Type: n.type, Read: n.read ? 'Yes' : 'No',
        Timestamp: formatDate(n.timestamp),
      })),
      'warehouse-notifications',
      [
        { key: 'Title', label: 'Title' },
        { key: 'Message', label: 'Message' },
        { key: 'Module', label: 'Module' },
        { key: 'Severity', label: 'Severity' },
        { key: 'Type', label: 'Type' },
        { key: 'Read', label: 'Read' },
        { key: 'Timestamp', label: 'Timestamp' },
      ]
    );
    toast.success('Notifications exported to CSV');
  };

  const filterTabs = [
    { key: 'All', label: 'All', count: notifs.length },
    { key: 'Unread', label: 'Unread', count: stats.unread },
    { key: 'Critical', label: 'Critical', count: stats.critical },
    { key: 'Warnings', label: 'Warnings', count: stats.warnings },
  ];

  if (loading) {
    return (
      <PageWrapper title="Notifications" description="View and manage warehouse notifications">
        <LoadingState rows={6} message="Loading notifications..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Notifications"
      description="View and manage warehouse notifications"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleMarkAllRead} disabled={stats.unread === 0}>
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={fetchNotifs}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total" value={stats.total} icon={<Bell className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Unread" value={stats.unread} icon={<Bell className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Critical" value={stats.critical} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" />
        <KPICard title="Warnings" value={stats.warnings} icon={<Shield className="w-5 h-5" />} iconColor="amber" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, message, or module..."
            className="pl-9 h-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filterTabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilterTab(key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold border transition-all',
                filterTab === key
                  ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                  : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'
              )}
            >
              {label}
              <span className="text-[0.6rem] opacity-60">({count})</span>
            </button>
          ))}
        </div>
        {(search || filterTab !== 'All') && (
          <p className="text-[0.65rem] text-muted-foreground mt-2 ml-1">{filtered.length} notification(s) found</p>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="No notifications found"
          description={search || filterTab !== 'All' ? 'No notifications match your current filters.' : 'You\'re all caught up! No notifications to display.'}
          action={(search || filterTab !== 'All') ? (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setSearch(''); setFilterTab('All'); }}>
              <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(notif => (
            <Card
              key={notif.id}
              className={cn(
                'cursor-pointer transition-all hover:border-primary/30 hover:shadow-[0_4px_16px_oklch(var(--primary)/0.06)]',
                !notif.read && 'border-l-[3px] border-l-blue-500'
              )}
              onClick={() => { handleMarkRead(notif); setSelectedNotif(notif); }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
                        <h4 className={cn('text-sm truncate', !notif.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground')}>
                          {notif.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className={cn('text-[0.55rem] font-bold px-1.5 py-0', severityColors[notif.severity] || '')}>
                          {notif.severity}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0 text-muted-foreground hover:text-red-400"
                          onClick={(e) => { e.stopPropagation(); setDeleteNotif(notif); }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className={cn('text-xs mt-1 line-clamp-2', notif.read ? 'text-muted-foreground/60' : 'text-muted-foreground')}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[0.6rem] text-muted-foreground/60">{notif.module}</span>
                      <span className="text-[0.6rem] text-muted-foreground/60">{formatDate(notif.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Drawer open={!!selectedNotif} onOpenChange={(o) => { if (!o) setSelectedNotif(null); }}>
        <DrawerContent className="sm:max-w-md">
          <DrawerHeader>
            <DrawerTitle>Notification Details</DrawerTitle>
          </DrawerHeader>
          {selectedNotif && (
            <div className="px-6 pb-6 space-y-5">
              <div className="flex items-center gap-3">
                {getNotifIcon(selectedNotif.type)}
                <div>
                  <h4 className="text-sm font-semibold">{selectedNotif.title}</h4>
                  <p className="text-xs text-muted-foreground">{selectedNotif.type}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{selectedNotif.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[0.6rem] text-muted-foreground">Severity</p>
                  <Badge variant="outline" className={cn('mt-1 text-[0.6rem] font-semibold', severityColors[selectedNotif.severity] || '')}>
                    {selectedNotif.severity}
                  </Badge>
                </div>
                <div>
                  <p className="text-[0.6rem] text-muted-foreground">Module</p>
                  <p className="text-xs text-foreground mt-1">{selectedNotif.module}</p>
                </div>
                <div>
                  <p className="text-[0.6rem] text-muted-foreground">Reference</p>
                  <p className="text-xs font-mono text-foreground mt-1">{selectedNotif.referenceId || '—'}</p>
                </div>
                <div>
                  <p className="text-[0.6rem] text-muted-foreground">Timestamp</p>
                  <p className="text-xs text-foreground mt-1">{formatDate(selectedNotif.timestamp)}</p>
                </div>
              </div>
              <div>
                <p className="text-[0.6rem] text-muted-foreground">Status</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={cn('w-2 h-2 rounded-full', selectedNotif.read ? 'bg-gray-500' : 'bg-blue-500')} />
                  <span className="text-xs text-muted-foreground">{selectedNotif.read ? 'Read' : 'Unread'}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleMarkAllRead}>
                  <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
                </Button>
                <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => { setSelectedNotif(null); setDeleteNotif(selectedNotif); }}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <AlertDialog open={!!deleteNotif} onOpenChange={(o) => { if (!o) setDeleteNotif(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}

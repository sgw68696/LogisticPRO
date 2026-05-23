'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bell,
  BellRing,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Info,
  Search,
  X,
  Filter,
  Eye,
  CheckCheck,
  Truck,
  FileText,
  Package,
  Shield,
  Clock,
} from 'lucide-react';
import { notificationService, type NotificationFilters } from '@/services/notificationService';
import { useCompany } from '@/hooks/use-company';
import { useDebounce } from '@/hooks/use-debounce';
import type { GlobalNotification } from '@/data/mock-db';
import type { PaginatedResponse } from '@/data/mock-db';
import { useAuth } from '@/context/AuthContext';

const formatDateTime = (value: string): string => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const getSeverityColor = (severity: string): string => {
  const map: Record<string, string> = {
    Critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };
  return map[severity] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
};

const getSeverityIcon = (severity: string) => {
  const map: Record<string, React.ReactNode> = {
    Critical: <XCircle className="w-3.5 h-3.5" />,
    High: <AlertTriangle className="w-3.5 h-3.5" />,
    Medium: <AlertCircle className="w-3.5 h-3.5" />,
    Low: <CheckCircle2 className="w-3.5 h-3.5" />,
    Info: <Info className="w-3.5 h-3.5" />,
  };
  return map[severity] || <Info className="w-3.5 h-3.5" />;
};

const getTypeIcon = (type: string) => {
  if (type.includes('shipment')) return <Truck className="w-4 h-4" />;
  if (type.includes('invoice') || type.includes('payment')) return <FileText className="w-4 h-4" />;
  if (type.includes('grn') || type.includes('gdn') || type.includes('stock')) return <Package className="w-4 h-4" />;
  if (type.includes('user')) return <Shield className="w-4 h-4" />;
  if (type.includes('sla')) return <Clock className="w-4 h-4" />;
  return <Bell className="w-4 h-4" />;
};

export function CompanyNotificationsPage() {
  const { effectiveCompanyId, userRole } = useCompany();
  const { user } = useAuth();
  const [pageData, setPageData] = useState<PaginatedResponse<GlobalNotification> | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  const fetchPage = useCallback(
    async (page: number, query: string, unread: boolean, severity: string, size: number) => {
      setLoading(true);
      try {
        const filters: NotificationFilters = {
          companyId: effectiveCompanyId,
          page,
          pageSize: size,
          search: query || undefined,
          unreadOnly: unread || undefined,
          severity: severity !== 'All' ? severity : undefined,
        };
        const result = await notificationService.list(effectiveCompanyId, userRole, filters);
        setPageData(result);
      } finally {
        setLoading(false);
      }
    },
    [effectiveCompanyId, userRole]
  );

  const refetchPage = useCallback(() => {
    fetchPage(currentPage, debouncedSearch, unreadOnly, severityFilter, pageSize);
  }, [currentPage, debouncedSearch, unreadOnly, severityFilter, pageSize, fetchPage]);

  useEffect(() => {
    notificationService.getUnreadCount(effectiveCompanyId, userRole).then((count) => {
      setUnreadCount(count);
      setStatsLoading(false);
    });
  }, [effectiveCompanyId, userRole]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, unreadOnly, severityFilter, pageSize]);

  useEffect(() => {
    fetchPage(currentPage, debouncedSearch, unreadOnly, severityFilter, pageSize);
  }, [currentPage, debouncedSearch, unreadOnly, severityFilter, pageSize, fetchPage]);

  const handleMarkAllRead = useCallback(async () => {
    setMarkingAllRead(true);
    try {
      await notificationService.markAllRead(effectiveCompanyId);
      setUnreadCount(0);
      refetchPage();
    } finally {
      setMarkingAllRead(false);
    }
  }, [effectiveCompanyId, refetchPage]);

  const handleMarkRead = useCallback(async (id: string) => {
    const success = await notificationService.markRead(id, user?.id);
    if (success) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
      refetchPage();
    }
  }, [user, refetchPage]);

  const severityOptions = ['All', 'Critical', 'High', 'Medium', 'Low', 'Info'];

  const columns: Column<GlobalNotification>[] = [
    {
      key: 'read',
      header: 'Status',
      render: (notif) => (
        <div className="flex items-center gap-1.5">
          {!notif.read ? (
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[0.6rem] gap-1">
              <BellRing className="w-3 h-3" />
              New
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[0.6rem] gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Read
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (notif) => (
        <Badge className={`text-[0.65rem] border gap-1 ${getSeverityColor(notif.severity)}`}>
          {getSeverityIcon(notif.severity)}
          {notif.severity}
        </Badge>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (notif) => (
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            {getTypeIcon(notif.type)}
          </div>
          <span className="text-xs text-muted-foreground capitalize">
            {notif.type.replace(/_/g, ' ')}
          </span>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Notification',
      render: (notif) => (
        <div className="max-w-xs">
          <p className={`text-xs ${!notif.read ? 'font-semibold text-foreground' : 'text-foreground'}`}>
            {notif.title}
          </p>
          <p className="text-[0.7rem] text-muted-foreground truncate mt-0.5">
            {notif.message}
          </p>
        </div>
      ),
    },
    {
      key: 'module',
      header: 'Module',
      render: (notif) => (
        <Badge variant="outline" className="text-[0.6rem]">
          {notif.module}
        </Badge>
      ),
    },
    {
      key: 'timestamp',
      header: 'Time',
      render: (notif) => (
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-[0.7rem] text-muted-foreground">
            {formatDateTime(notif.timestamp)}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (notif) => (
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          {!notif.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleMarkRead(notif.id)}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (statsLoading && unreadCount === 0 && !pageData) {
    return (
      <PageWrapper title="Notifications">
        <LoadingState rows={8} message="Loading notifications..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Notifications">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total"
          value={pageData?.total ?? 0}
          icon={<Bell className="w-5 h-5" />}
          iconColor="indigo"
        />
        <KPICard
          title="Unread"
          value={unreadCount}
          icon={<BellRing className="w-5 h-5" />}
          iconColor={unreadCount > 0 ? 'rose' : 'teal'}
        />
        <KPICard
          title="Read"
          value={(pageData?.total ?? 0) - unreadCount}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconColor="emerald"
        />
        <KPICard
          title="This Week"
          value={pageData?.total ?? 0}
          icon={<Clock className="w-5 h-5" />}
          iconColor="cyan"
        />
      </div>

      {/* Quick Actions */}
      <Card className="border-border/60 bg-gradient-to-r from-cyan-500/5 via-transparent to-rose-500/5 shadow-soft mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-[0.7rem] text-muted-foreground uppercase tracking-wide">
                Notification Center
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}.`
                  : 'All caught up! No unread notifications.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleMarkAllRead}
                disabled={markingAllRead || unreadCount === 0}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {markingAllRead ? 'Marking...' : 'Mark All Read'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters & Search */}
      <Card className="border-border/60 bg-card shadow-soft mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notifications by title or message..."
                className="w-full rounded-md border border-border bg-muted/30 pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={unreadOnly ? 'default' : 'outline'}
                onClick={() => setUnreadOnly(!unreadOnly)}
                className="gap-2 text-xs"
              >
                <BellRing className="w-3.5 h-3.5" />
                Unread Only
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-[0.6rem]">
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              {severityOptions.map((severity) => (
                <Button
                  key={severity}
                  variant={severityFilter === severity ? 'default' : 'outline'}
                  onClick={() => setSeverityFilter(severity)}
                  className="text-xs"
                  size="sm"
                >
                  {severity}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      {loading || !pageData ? (
        <Card className="border-border/60 bg-card shadow-soft">
          <CardContent className="pt-6">
            <DataTable
              data={[]}
              columns={columns}
              pageSize={pageSize}
              controlledPagination
              currentPage={1}
              totalPages={1}
              totalItems={0}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
              loading
            />
          </CardContent>
        </Card>
      ) : pageData.items.length === 0 ? (
        <Card className="border-border/60 bg-card shadow-soft">
          <CardContent>
            <EmptyState
              icon={<Bell className="w-8 h-8" />}
              title={unreadOnly ? 'No unread notifications' : 'No notifications found'}
              description={
                unreadOnly
                  ? 'You have no unread notifications. All caught up!'
                  : 'No notifications match your current search or filter criteria.'
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 bg-card shadow-soft">
          <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-500" />
              All Notifications
              <Badge variant="outline" className="text-[0.6rem]">
                {pageData.total}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <DataTable
              data={pageData.items}
              columns={columns}
              pageSize={pageSize}
              controlledPagination
              currentPage={pageData.page}
              totalPages={pageData.totalPages}
              totalItems={pageData.total}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
              loading={loading}
            />
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  );
}

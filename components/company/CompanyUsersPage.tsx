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
  Users,
  UserCheck,
  Shield,
  ShieldX,
  UserPlus,
  Search,
  X,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  Mail,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { userService, type UserFilters } from '@/services/userService';
import { useCompany } from '@/hooks/use-company';
import { useDebounce } from '@/hooks/use-debounce';
import type { User } from '@/types/user';
import type { PaginatedResponse } from '@/data/mock-db';

const formatDate = (value: string): string => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

const getRoleColor = (role: string): string => {
  const map: Record<string, string> = {
    CompanyAdmin: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    OperationsManager: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    LogisticsCoordinator: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    AuditorReadOnly: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    SuperAdmin: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    PortAgent: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };
  return map[role] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
};

const getRoleLabel = (role: string): string => {
  const map: Record<string, string> = {
    CompanyAdmin: 'Admin',
    OperationsManager: 'Operations',
    LogisticsCoordinator: 'Logistics',
    AuditorReadOnly: 'Auditor',
    SuperAdmin: 'Super Admin',
    PortAgent: 'Port Agent',
  };
  return map[role] || role;
};

export function CompanyUsersPage() {
  const { effectiveCompanyId } = useCompany();
  const [pageData, setPageData] = useState<PaginatedResponse<User> | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    inactive: number;
    byRole: { role: string; count: number }[];
    recentlyAdded: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  const fetchPage = useCallback(
    async (page: number, query: string, status: string, size: number) => {
      setLoading(true);
      try {
        const filters: UserFilters = {
          companyId: effectiveCompanyId,
          page,
          pageSize: size,
          search: query || undefined,
          status: status !== 'All' ? (status as any) : undefined,
          sortBy: 'createdAt',
          sortDir: 'desc',
        };
        const result = await userService.listPaginated(filters);
        setPageData(result);
      } finally {
        setLoading(false);
      }
    },
    [effectiveCompanyId]
  );

  useEffect(() => {
    userService.getStats(effectiveCompanyId).then((data) => {
      setStats(data);
      setStatsLoading(false);
    });
  }, [effectiveCompanyId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, pageSize]);

  useEffect(() => {
    fetchPage(currentPage, debouncedSearch, statusFilter, pageSize);
  }, [currentPage, debouncedSearch, statusFilter, pageSize, fetchPage]);

  const statusTabs = useMemo(() => {
    return [
      { label: 'All', value: 'All', count: stats?.total ?? 0 },
      { label: 'Active', value: 'Active', count: stats?.active ?? 0 },
      { label: 'Inactive', value: 'Inactive', count: stats?.inactive ?? 0 },
    ];
  }, [stats]);

  const columns: Column<User>[] = [
    {
      key: 'avatar',
      header: 'User',
      render: (usr) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-[0.7rem] font-semibold text-primary">
              {usr.avatar || usr.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <span className="text-xs text-foreground font-medium">{usr.name}</span>
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-muted-foreground" />
              <span className="text-[0.65rem] text-muted-foreground">{usr.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'username',
      header: 'Username',
      sortable: true,
      render: (usr) => (
        <span className="text-xs font-mono text-muted-foreground">@{usr.username}</span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (usr) => (
        <Badge className={`text-[0.65rem] border ${getRoleColor(usr.role)}`}>
          <Shield className="w-3 h-3 mr-1" />
          {getRoleLabel(usr.role)}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (usr) => <StatusBadge status={usr.status} />,
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (usr) => (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-500" />
          <span className="text-[0.7rem] text-muted-foreground">
            {usr.lastLogin ? formatDate(usr.lastLogin) : 'Never'}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (usr) => (
        <span className="text-[0.7rem] text-muted-foreground">
          {formatDate(usr.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (usr) => (
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Edit className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (statsLoading && !stats) {
    return (
      <PageWrapper title="Users">
        <LoadingState rows={8} message="Loading users..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Users">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Users"
          value={stats?.total ?? 0}
          icon={<Users className="w-5 h-5" />}
          iconColor="indigo"
        />
        <KPICard
          title="Active Users"
          value={stats?.active ?? 0}
          icon={<UserCheck className="w-5 h-5" />}
          iconColor="teal"
        />
        <KPICard
          title="Inactive Users"
          value={stats?.inactive ?? 0}
          icon={<ShieldX className="w-5 h-5" />}
          iconColor="rose"
        />
        <KPICard
          title="Recently Added"
          value={stats?.recentlyAdded ?? 0}
          icon={<TrendingUp className="w-5 h-5" />}
          iconColor="emerald"
        />
      </div>

      {/* Role Distribution */}
      {stats?.byRole && stats.byRole.length > 0 && (
        <Card className="border-border/60 bg-gradient-to-r from-slate-500/5 via-transparent to-indigo-500/5 shadow-soft mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-[0.7rem] text-muted-foreground uppercase tracking-wide">
                  Role Distribution
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Distribution of user roles within your company.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {stats.byRole.map((item) => (
                  <Badge
                    key={item.role}
                    className={`text-[0.7rem] px-3 py-1.5 border ${getRoleColor(item.role)}`}
                  >
                    <Shield className="w-3.5 h-3.5 mr-1.5" />
                    {getRoleLabel(item.role)}
                    <span className="ml-1.5 font-semibold text-[0.65rem] bg-foreground/10 px-1.5 rounded">
                      {item.count}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="border-border/60 bg-card shadow-soft mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-[0.7rem] text-muted-foreground uppercase tracking-wide">
                User Management
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Invite new users, manage roles, and control system access.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" size="sm" className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
                Invite User
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Shield className="w-3.5 h-3.5" />
                Manage Permissions
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
                placeholder="Search user name, email, or username..."
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

            <div className="flex flex-wrap gap-2">
              {statusTabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={statusFilter === tab.value ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(tab.value)}
                  className="gap-2 text-xs"
                >
                  {tab.label}
                  <Badge variant="secondary" className="text-[0.6rem]">
                    {tab.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
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
              icon={<Users className="w-8 h-8" />}
              title="No users found"
              description="No users match your current search or filter criteria."
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 bg-card shadow-soft">
          <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-slate-500" />
              All Users
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

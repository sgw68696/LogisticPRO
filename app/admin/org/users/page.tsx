'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { companyUserService, type CompanyUserItem } from '@/services/companyUserService';
import {
  Search, Plus, SlidersHorizontal, X, Users, Loader2,
  Eye, Edit, Trash2, Check, AlertCircle,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-success/10 text-success border border-success/20',
    inactive: 'bg-muted/60 text-muted-foreground border border-border/50',
    suspended: 'bg-destructive/10 text-destructive border border-destructive/20',
  };
  return map[status] ?? map.inactive;
};

const statusDot: Record<string, string> = {
  active: 'bg-success', inactive: 'bg-muted-foreground', suspended: 'bg-destructive',
};

const approvalBadge = (status: string) => {
  const map: Record<string, string> = {
    approved: 'bg-success/10 text-success border border-success/20',
    pending: 'bg-warning/10 text-warning border border-warning/20',
    rejected: 'bg-destructive/10 text-destructive border border-destructive/20',
    suspended: 'bg-muted/50 text-muted-foreground border border-border/40',
  };
  return map[status] ?? map.pending;
};

const APPROVAL_OPTIONS = ['all', 'pending', 'approved', 'rejected', 'suspended'];

export default function OrganizationUsersPage() {
  const [users, setUsers] = useState<CompanyUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await companyUserService.getCompanyUsers(page, 10, {
        search: searchQuery || undefined,
        approval_status: approvalFilter !== 'all' ? approvalFilter : undefined,
      });
      setUsers(result.companyUsers);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, approvalFilter, showToast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleApprove = async (id: number) => {
    try {
      const result = await companyUserService.approveCompanyUser(id);
      if (result.success) { showToast('User approved', 'success'); fetchUsers(); }
      else { showToast(result.message || 'Failed to approve', 'error'); }
    } catch { showToast('Failed to approve', 'error'); }
  };

  const handleReject = async (id: number) => {
    try {
      const result = await companyUserService.rejectCompanyUser(id);
      if (result.success) { showToast('User rejected', 'success'); fetchUsers(); }
      else { showToast(result.message || 'Failed to reject', 'error'); }
    } catch { showToast('Failed to reject', 'error'); }
  };

  const handleSuspend = async (id: number) => {
    try {
      const result = await companyUserService.suspendCompanyUser(id);
      if (result.success) { showToast('User suspended', 'success'); fetchUsers(); }
      else { showToast(result.message || 'Failed to suspend', 'error'); }
    } catch { showToast('Failed to suspend', 'error'); }
  };

  const handleReactivate = async (id: number) => {
    try {
      const result = await companyUserService.reactivateCompanyUser(id);
      if (result.success) { showToast('User reactivated', 'success'); fetchUsers(); }
      else { showToast(result.message || 'Failed to reactivate', 'error'); }
    } catch { showToast('Failed to reactivate', 'error'); }
  };

  const columns: Column<CompanyUserItem>[] = [
    {
      key: 'name', header: 'User', sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex-shrink-0 bg-primary/10 border border-primary/20 flex items-center justify-center text-[0.72rem] font-bold text-primary">
            {item.firstName[0]}{item.lastName[0]}
          </div>
          <div className="min-w-0">
            <p className="text-[0.84rem] font-semibold text-foreground leading-tight truncate">{item.firstName} {item.lastName}</p>
            <p className="text-[0.70rem] text-muted-foreground/50 mt-0.5">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'approvalStatus', header: 'Approval',
      render: (item) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.72rem] font-bold border ${approvalBadge(item.approvalStatus)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot[item.approvalStatus] || 'bg-warning'}`} />
          {item.approvalStatus.charAt(0).toUpperCase() + item.approvalStatus.slice(1)}
        </span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (item) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.72rem] font-bold border ${statusBadge(item.status)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot[item.status]}`} />
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      ),
    },
    {
      key: 'roleName', header: 'Role',
      render: (item) => (<span className="text-[0.82rem] text-muted-foreground">{item.roleName}</span>),
    },
    {
      key: 'companyName', header: 'Company',
      render: (item) => (<span className="text-[0.82rem] text-muted-foreground">{item.companyName || 'N/A'}</span>),
    },
    {
      key: 'actions', header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-0.5 justify-end">
          <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"><Eye className="w-3.5 h-3.5" /></button>
          <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
          <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          {item.approvalStatus === 'pending' && (
            <>
              <button onClick={() => handleApprove(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-success/10 hover:text-success transition-colors"><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleReject(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><X className="w-3.5 h-3.5" /></button>
            </>
          )}
          {item.approvalStatus === 'approved' && (
            <button onClick={() => handleSuspend(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-warning/10 hover:text-warning transition-colors"><AlertCircle className="w-3.5 h-3.5" /></button>
          )}
          {item.approvalStatus === 'suspended' && (
            <button onClick={() => handleReactivate(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-success/10 hover:text-success transition-colors"><Check className="w-3.5 h-3.5" /></button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Organization Users"
      description="Manage users across all organizations"
      actions={
        <button className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] cursor-pointer text-[0.82rem] font-bold text-white font-display transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
          <Plus size={14} />
          New User
        </button>
      }
    >
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span className="text-[0.82rem] font-medium">{toast.message}</span>
        </div>
      )}

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Search by name, email or username..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="nb-search w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[0.78rem] text-muted-foreground">
              <SlidersHorizontal size={13} />
              <span className="font-medium hidden sm:block">Filter:</span>
            </div>
            <Select value={approvalFilter} onValueChange={(v) => { setApprovalFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[170px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:border-primary/50 focus:ring-0">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                {APPROVAL_OPTIONS.map((s) => (<SelectItem key={s} value={s} className="text-[0.82rem] capitalize">{s === 'all' ? 'All Statuses' : s}</SelectItem>))}
              </SelectContent>
            </Select>
            {approvalFilter !== 'all' && (
              <button onClick={() => setApprovalFilter('all')} className="w-8 h-8 flex items-center justify-center bg-destructive/10 border border-destructive/20 rounded-[8px] text-destructive hover:bg-destructive/20 transition-colors duration-150"><X size={13} /></button>
            )}
          </div>
        </div>
        {(searchQuery || approvalFilter !== 'all') && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
            <span className="text-[0.72rem] text-muted-foreground font-medium uppercase tracking-wide">Active filters:</span>
            {approvalFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[0.72rem] font-semibold text-primary capitalize">
                {approvalFilter}
                <button onClick={() => setApprovalFilter('all')}><X size={10} /></button>
              </span>
            )}
            <span className="text-[0.72rem] text-muted-foreground ml-auto">{total} result{total !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : (
        <>
          <DataTable data={users} columns={columns} emptyMessage="No users found" />
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-[0.82rem] font-medium bg-muted/40 border border-border/60 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary transition-colors">Previous</button>
              <span className="text-[0.82rem] text-muted-foreground">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-[0.82rem] font-medium bg-muted/40 border border-border/60 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary transition-colors">Next</button>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
}

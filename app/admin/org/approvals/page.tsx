'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { approvalService, type ApprovalItem } from '@/services/approvalService';
import {
  Check, X, Eye, Clock, Building2,
  FileCheck, AlertCircle, CheckCircle, Loader2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const TYPE_STYLES: Record<string, string> = {
  'Company User Registration': 'bg-primary/10 text-primary border border-primary/20',
  'Organization User Registration': 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  'Company Registration': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  'Organization Registration': 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
};

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const result = await approvalService.getApprovals(page, 10);
      setItems(result.approvals);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch {
      showToast('Failed to load approvals', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, showToast]);

  useEffect(() => { fetchApprovals(); }, [fetchApprovals]);

  const pending = items.filter((i) => i.status === 'Pending');
  const approved = items.filter((i) => i.status === 'Approved');
  const rejected = items.filter((i) => i.status === 'Rejected');

  const handleApprove = async (id: number) => {
    setActionLoading(`approve-${id}`);
    try {
      const result = await approvalService.approveRequest(id);
      if (result.success) { showToast('Request approved successfully', 'success'); fetchApprovals(); }
      else { showToast(result.message || 'Failed to approve', 'error'); }
    } catch { showToast('Failed to approve', 'error'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!selectedId) return;
    setActionLoading(`reject-${selectedId}`);
    try {
      const result = await approvalService.rejectRequest(selectedId, rejectNotes || undefined);
      if (result.success) { showToast('Request rejected', 'success'); setShowRejectModal(false); setSelectedId(null); setRejectNotes(''); fetchApprovals(); }
      else { showToast(result.message || 'Failed to reject', 'error'); }
    } catch { showToast('Failed to reject', 'error'); }
    finally { setActionLoading(null); }
  };

  const handleSuspend = async (id: number) => {
    setActionLoading(`suspend-${id}`);
    try {
      const result = await approvalService.suspendRequest(id);
      if (result.success) { showToast('Request suspended', 'success'); fetchApprovals(); }
      else { showToast(result.message || 'Failed to suspend', 'error'); }
    } catch { showToast('Failed to suspend', 'error'); }
    finally { setActionLoading(null); }
  };

  const handleReactivate = async (id: number) => {
    setActionLoading(`reactivate-${id}`);
    try {
      const result = await approvalService.reactivateRequest(id);
      if (result.success) { showToast('Request reactivated', 'success'); fetchApprovals(); }
      else { showToast(result.message || 'Failed to reactivate', 'error'); }
    } catch { showToast('Failed to reactivate', 'error'); }
    finally { setActionLoading(null); }
  };

  const columns: Column<ApprovalItem>[] = [
    {
      key: 'company', header: 'Company', sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[0.84rem] font-semibold text-foreground leading-tight">{item.company}</p>
            <p className="text-[0.70rem] text-muted-foreground/60 mt-0.5">by {item.submittedBy}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type', header: 'Request Type',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[0.72rem] font-bold ${TYPE_STYLES[item.type] || 'bg-muted/60 text-muted-foreground border border-border/50'}`}>
            <FileCheck className="w-3 h-3" />
            {item.type}
          </span>
          {item.urgency === 'High' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 text-[0.65rem] font-bold">
              <AlertCircle className="w-2.5 h-2.5" />
              Urgent
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'date', header: 'Submitted', sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
          <span className="text-[0.78rem] text-muted-foreground">{formatDate(item.date)}</span>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (item) => {
        const map: Record<string, string> = {
          Pending: 'bg-warning/10 text-warning border-warning/20',
          Approved: 'bg-success/10 text-success border-success/20',
          Rejected: 'bg-destructive/10 text-destructive border-destructive/20',
          Suspended: 'bg-muted/50 text-muted-foreground border-border/40',
        };
        const dot: Record<string, string> = {
          Pending: 'bg-warning', Approved: 'bg-success', Rejected: 'bg-destructive', Suspended: 'bg-muted-foreground',
        };
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.72rem] font-bold border ${map[item.status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot[item.status]}`} />
            {item.status}
          </span>
        );
      },
    },
    {
      key: 'id', header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-1 justify-end">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-150">
            <Eye className="w-3.5 h-3.5" />
          </button>
          {item.status === 'Pending' && (
            <>
              <button
                onClick={() => handleApprove(item.id)}
                disabled={actionLoading === `approve-${item.id}`}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.72rem] font-bold bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors duration-150 disabled:opacity-50"
              >
                {actionLoading === `approve-${item.id}` ? <Loader2 size={12} className="animate-spin" /> : <Check className="w-3 h-3" />}
                Approve
              </button>
              <button
                onClick={() => { setSelectedId(item.id); setShowRejectModal(true); }}
                disabled={actionLoading !== null}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.72rem] font-bold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors duration-150 disabled:opacity-50"
              >
                <X className="w-3 h-3" />
                Reject
              </button>
            </>
          )}
          {item.status === 'Approved' && (
            <button
              onClick={() => handleSuspend(item.id)}
              disabled={actionLoading === `suspend-${item.id}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.72rem] font-bold bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-colors duration-150 disabled:opacity-50"
            >
              {actionLoading === `suspend-${item.id}` ? <Loader2 size={12} className="animate-spin" /> : <AlertCircle className="w-3 h-3" />}
              Suspend
            </button>
          )}
          {item.status === 'Suspended' && (
            <button
              onClick={() => handleReactivate(item.id)}
              disabled={actionLoading === `reactivate-${item.id}`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.72rem] font-bold bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors duration-150 disabled:opacity-50"
            >
              {actionLoading === `reactivate-${item.id}` ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle className="w-3 h-3" />}
              Reactivate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageWrapper title="Approvals" description="Review and approve pending requests">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span className="text-[0.82rem] font-medium">{toast.message}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Pending Review', count: pending.length, icon: Clock, pill: 'bg-warning/10 text-warning border border-warning/20', iconCls: 'text-warning bg-warning/10 border-warning/20' },
          { label: 'Approved', count: approved.length, icon: CheckCircle, pill: 'bg-success/10 text-success border border-success/20', iconCls: 'text-success bg-success/10 border-success/20' },
          { label: 'Rejected', count: rejected.length, icon: X, pill: 'bg-destructive/10 text-destructive border border-destructive/20', iconCls: 'text-destructive bg-destructive/10 border-destructive/20' },
        ].map(({ label, count, icon: Icon, pill, iconCls }) => (
          <div key={label} className="bg-card border border-border/60 rounded-xl px-5 py-4 shadow-soft flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex-shrink-0 border flex items-center justify-center ${iconCls}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-bold font-display text-foreground">{count}</span>
                <span className={`px-2 py-0.5 rounded-full text-[0.68rem] font-bold border ${pill}`}>
                  request{count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : (
        <>
          <DataTable data={items} columns={columns} emptyMessage="No approval requests found" />
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-[0.82rem] font-medium bg-muted/40 border border-border/60 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary transition-colors">Previous</button>
              <span className="text-[0.82rem] text-muted-foreground">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-[0.82rem] font-medium bg-muted/40 border border-border/60 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 hover:text-primary transition-colors">Next</button>
            </div>
          )}
        </>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}>
          <div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border/40">
              <h2 className="text-[1rem] font-bold font-display text-foreground">Reject Request</h2>
              <button onClick={() => setShowRejectModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[0.78rem] font-medium text-muted-foreground mb-1">Rejection Reason (optional)</label>
                <textarea value={rejectNotes} onChange={e => setRejectNotes(e.target.value)} rows={3} className="w-full px-3 py-2 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50 focus:bg-primary/5 resize-none" placeholder="Provide a reason for rejection..." />
              </div>
              <button onClick={handleReject} disabled={actionLoading !== null} className="w-full flex items-center justify-center gap-2 h-10 rounded-[10px] text-[0.84rem] font-bold text-white bg-destructive hover:bg-destructive/90 transition-colors disabled:opacity-50">
                {actionLoading && <Loader2 size={16} className="animate-spin" />}
                {actionLoading ? 'Processing...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

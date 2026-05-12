'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import {
  Check, X, Eye, Clock, Building2,
  FileCheck, AlertCircle, CheckCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
type RequestType    = 'Company Registration' | 'Plan Upgrade' | 'Organization Add' | 'Agent Limit Increase';

interface ApprovalItem {
  id: number;
  company: string;
  type: RequestType;
  submittedBy: string;
  date: string;
  status: ApprovalStatus;
  urgency: 'High' | 'Normal';
}

const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: 1,
    company: 'Global Express Cargo',
    type: 'Company Registration',
    submittedBy: 'Priya Sharma',
    date: '2025-01-14T09:30:00Z',
    status: 'Pending',
    urgency: 'High',
  },
  {
    id: 2,
    company: 'Sunrise Logistics',
    type: 'Plan Upgrade',
    submittedBy: 'Amit Patel',
    date: '2025-01-13T14:00:00Z',
    status: 'Pending',
    urgency: 'Normal',
  },
  {
    id: 3,
    company: 'Metro Freight Co.',
    type: 'Organization Add',
    submittedBy: 'Neha Tripathi',
    date: '2025-01-12T11:20:00Z',
    status: 'Pending',
    urgency: 'Normal',
  },
];

const TYPE_STYLES: Record<RequestType, string> = {
  'Company Registration':  'bg-primary/10 text-primary border border-primary/20',
  'Plan Upgrade':          'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  'Organization Add':      'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  'Agent Limit Increase':  'bg-violet-500/10 text-violet-400 border border-violet-500/20',
};

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>(INITIAL_APPROVALS);

  const pending  = items.filter((i) => i.status === 'Pending');
  const approved = items.filter((i) => i.status === 'Approved');
  const rejected = items.filter((i) => i.status === 'Rejected');

  const handleApprove = (id: number) =>
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: 'Approved' } : i));

  const handleReject = (id: number) =>
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: 'Rejected' } : i));

  const columns: Column<ApprovalItem>[] = [
    {
      key: 'company',
      header: 'Company',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="
            w-8 h-8 rounded-lg flex-shrink-0
            bg-primary/10 border border-primary/20
            flex items-center justify-center
          ">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[0.84rem] font-semibold text-foreground leading-tight">
              {item.company}
            </p>
            <p className="text-[0.70rem] text-muted-foreground/60 mt-0.5">
              by {item.submittedBy}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Request Type',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className={`
            inline-flex items-center gap-1.5
            px-2.5 py-0.5 rounded-md
            text-[0.72rem] font-bold
            ${TYPE_STYLES[item.type]}
          `}>
            <FileCheck className="w-3 h-3" />
            {item.type}
          </span>
          {item.urgency === 'High' && (
            <span className="
              inline-flex items-center gap-1
              px-2 py-0.5 rounded-full
              bg-destructive/10 text-destructive border border-destructive/20
              text-[0.65rem] font-bold
            ">
              <AlertCircle className="w-2.5 h-2.5" />
              Urgent
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Submitted',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
          <span className="text-[0.78rem] text-muted-foreground">
            {formatDate(item.date)}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const map = {
          Pending:  'bg-warning/10 text-warning border-warning/20',
          Approved: 'bg-success/10 text-success border-success/20',
          Rejected: 'bg-destructive/10 text-destructive border-destructive/20',
        };
        const dot = {
          Pending:  'bg-warning',
          Approved: 'bg-success',
          Rejected: 'bg-destructive',
        };
        return (
          <span className={`
            inline-flex items-center gap-1.5
            px-2.5 py-0.5 rounded-full
            text-[0.72rem] font-bold border
            ${map[item.status]}
          `}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot[item.status]}`} />
            {item.status}
          </span>
        );
      },
    },
    {
      key: 'id',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-1 justify-end">
          {/* View */}
          <button className="
            w-8 h-8 flex items-center justify-center rounded-lg
            text-muted-foreground
            hover:bg-primary/10 hover:text-primary
            transition-colors duration-150
          ">
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Approve — only if Pending */}
          {item.status === 'Pending' && (
            <button
              onClick={() => handleApprove(item.id)}
              className="
                flex items-center gap-1.5 px-2.5 py-1
                rounded-lg text-[0.72rem] font-bold
                bg-success/10 text-success border border-success/20
                hover:bg-success/20
                transition-colors duration-150
              "
            >
              <Check className="w-3 h-3" />
              Approve
            </button>
          )}

          {/* Reject — only if Pending */}
          {item.status === 'Pending' && (
            <button
              onClick={() => handleReject(item.id)}
              className="
                flex items-center gap-1.5 px-2.5 py-1
                rounded-lg text-[0.72rem] font-bold
                bg-destructive/10 text-destructive border border-destructive/20
                hover:bg-destructive/20
                transition-colors duration-150
              "
            >
              <X className="w-3 h-3" />
              Reject
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Approvals"
      description="Review and approve pending requests"
    >

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'Pending Review',
            count: pending.length,
            icon: Clock,
            pill: 'bg-warning/10 text-warning border border-warning/20',
            iconCls: 'text-warning bg-warning/10 border-warning/20',
          },
          {
            label: 'Approved',
            count: approved.length,
            icon: CheckCircle,
            pill: 'bg-success/10 text-success border border-success/20',
            iconCls: 'text-success bg-success/10 border-success/20',
          },
          {
            label: 'Rejected',
            count: rejected.length,
            icon: X,
            pill: 'bg-destructive/10 text-destructive border border-destructive/20',
            iconCls: 'text-destructive bg-destructive/10 border-destructive/20',
          },
        ].map(({ label, count, icon: Icon, pill, iconCls }) => (
          <div key={label} className="
            bg-card border border-border/60
            rounded-xl px-5 py-4 shadow-soft
            flex items-center gap-4
          ">
            <div className={`
              w-10 h-10 rounded-xl flex-shrink-0
              border flex items-center justify-center
              ${iconCls}
            `}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">
                {label}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-bold font-display text-foreground">
                  {count}
                </span>
                <span className={`
                  px-2 py-0.5 rounded-full
                  text-[0.68rem] font-bold border
                  ${pill}
                `}>
                  request{count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table — uses shared DataTable ── */}
      <DataTable
        data={items}
        columns={columns}
        emptyMessage="No approval requests found"
      />

    </PageWrapper>
  );
}
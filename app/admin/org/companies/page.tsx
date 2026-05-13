'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { mockCompanies } from '@/data/mockData';
import type { Company, CompanyStatus } from '@/data/mockData';
import {
  Search, Plus, SlidersHorizontal, X,
  Building2,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ── Badge helpers (same pattern as serviceTypeBadge in ShipmentsPage) ──

const statusBadge = (status: CompanyStatus) => {
  const map: Record<CompanyStatus, string> = {
    Active:    'bg-success/10    text-success       border border-success/20',
    Pending:   'bg-warning/10   text-warning        border border-warning/20',
    Suspended: 'bg-destructive/10 text-destructive  border border-destructive/20',
    Inactive:  'bg-muted/60     text-muted-foreground border border-border/50',
  };
  return map[status] ?? map.Inactive;
};

const statusDot: Record<CompanyStatus, string> = {
  Active:    'bg-success',
  Pending:   'bg-warning',
  Suspended: 'bg-destructive',
  Inactive:  'bg-muted-foreground',
};

const typeBadge = (type: string) => {
  const map: Record<string, string> = {
    Logistics: 'bg-primary/10  text-primary    border border-primary/20',
    Express:   'bg-sky-500/10  text-sky-400    border border-sky-500/20',
    Freight:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Courier:   'bg-violet-500/10 text-violet-400 border border-violet-500/20',
    Mixed:     'bg-teal-500/10  text-teal-400   border border-teal-500/20',
  };
  return map[type] ?? 'bg-muted/60 text-muted-foreground border border-border/50';
};

const planBadge = (plan: string) => {
  const map: Record<string, string> = {
    Enterprise:   'bg-primary/10  text-primary  border border-primary/20',
    Professional: 'bg-sky-500/10  text-sky-400  border border-sky-500/20',
    Starter:      'bg-muted/60    text-muted-foreground border border-border/50',
  };
  return map[plan] ?? map.Starter;
};

const STATUS_OPTIONS: CompanyStatus[] = ['Active', 'Pending', 'Suspended', 'Inactive'];

export default function CompaniesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = mockCompanies.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      c.contactPerson?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns: Column<Company>[] = [
    {
      key: 'name',
      header: 'Company Name',
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
          <div className="min-w-0">
            <p className="text-[0.84rem] font-semibold text-foreground leading-tight truncate">
              {item.name}
            </p>
            <p className="text-[0.70rem] text-muted-foreground/50 mt-0.5 font-mono">
              {item.taxId}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <span className={`
          inline-flex items-center gap-1.5
          px-2.5 py-0.5 rounded-full
          text-[0.72rem] font-bold
          ${statusBadge(item.status as CompanyStatus)}
        `}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot[item.status as CompanyStatus]}`} />
          {item.status}
        </span>
      ),
    },
    {
      key: 'businessType',
      header: 'Business Type',
      render: (item) => (
        <span className={`
          inline-flex items-center
          px-2.5 py-0.5 rounded-md
          text-[0.72rem] font-bold
          ${typeBadge(item.businessType)}
        `}>
          {item.businessType}
        </span>
      ),
    },
    {
      key: 'contactPerson',
      header: 'Contact Person',
      render: (item) => (
        <div>
          <p className="text-[0.82rem] font-medium text-foreground/80 leading-tight">
            {item.contactPerson}
          </p>
          <p className="text-[0.70rem] text-muted-foreground/50 mt-0.5">
            {item.contactPhone}
          </p>
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Location',
      render: (item) => (
        <span className="text-[0.82rem] text-muted-foreground">
          {item.city}, {item.state}
        </span>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (item) => (
        <span className={`
          inline-flex items-center
          px-2 py-0.5 rounded-md
          text-[0.70rem] font-bold
          ${planBadge(item.plan)}
        `}>
          {item.plan}
        </span>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Companies Management"
      description="Manage and track all companies on the platform"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => {/* export handler */}}
            className="
              flex items-center gap-2 px-3.5 py-2
              bg-muted/40 border border-border/60
              rounded-[10px] cursor-pointer
              text-[0.82rem] font-semibold text-muted-foreground
              transition-all duration-200
              hover:bg-primary/8 hover:border-primary/30 hover:text-foreground
              hover:-translate-y-px
            "
          >
            <Building2 size={14} />
            Export CSV
          </button>
          <button
            onClick={() => {/* open create modal */}}
            className="
              flex items-center gap-2 px-3.5 py-2
              rounded-[10px] cursor-pointer
              text-[0.82rem] font-bold text-white font-display
              transition-all duration-200
              hover:-translate-y-px
              hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]
            "
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
          >
            <Plus size={14} />
            New Company
          </button>
        </div>
      }
    >

      {/* ── Filter Bar — identical structure to ShipmentsPage ── */}
      <div className="
        bg-card border border-border/60
        rounded-xl p-4 mb-6 shadow-soft
      ">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="
              absolute left-3 top-1/2 -translate-y-1/2
              w-4 h-4 text-muted-foreground pointer-events-none
            " />
            <input
              type="text"
              placeholder="Search by name, contact or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                nb-search w-full h-9 pl-9 pr-3
                bg-muted/40 border border-border
                rounded-[9px] text-[0.84rem] text-foreground
                outline-none placeholder:text-muted-foreground
                focus:border-primary/50 focus:bg-primary/5
                focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]
              "
            />
          </div>

          {/* Status Filter — same Select pattern as ShipmentsPage */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[0.78rem] text-muted-foreground">
              <SlidersHorizontal size={13} />
              <span className="font-medium hidden sm:block">Filter:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="
                w-[170px] h-9 text-[0.82rem]
                bg-muted/40 border-border/60 rounded-[9px]
                focus:border-primary/50 focus:ring-0
              ">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all" className="text-[0.82rem]">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="text-[0.82rem]">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="
                  w-8 h-8 flex items-center justify-center
                  bg-destructive/10 border border-destructive/20
                  rounded-[8px] text-destructive
                  hover:bg-destructive/20 transition-colors duration-150
                "
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Active filter pill */}
        {(searchQuery || statusFilter !== 'all') && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
            <span className="text-[0.72rem] text-muted-foreground font-medium uppercase tracking-wide">
              Active filters:
            </span>
            {statusFilter !== 'all' && (
              <span className="
                inline-flex items-center gap-1.5 px-2.5 py-0.5
                bg-primary/10 border border-primary/20
                rounded-full text-[0.72rem] font-semibold text-primary
              ">
                {statusFilter}
                <button onClick={() => setStatusFilter('all')}>
                  <X size={10} />
                </button>
              </span>
            )}
            <span className="text-[0.72rem] text-muted-foreground ml-auto">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* ── Table — uses shared DataTable, same as ShipmentsPage ── */}
      <DataTable
        data={filtered}
        columns={columns}
        onRowClick={(c) => router.push(`/admin/companies/${c.id}`)}
        emptyMessage="No companies found"
      />

    </PageWrapper>
  );
}
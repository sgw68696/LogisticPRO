'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { mockUsers } from '@/data/mockData';
import type { User, UserRole } from '@/data/mockData';
import {
  Search, Plus, Eye, Edit, Trash2,
  SlidersHorizontal, X,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ── Role badge colors using your token palette ──
const ROLE_STYLES: Record<UserRole, string> = {
  SuperAdmin:   'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  CompanyAdmin: 'bg-primary/10   text-primary     border border-primary/20',
  Manager:      'bg-sky-500/10   text-sky-400      border border-sky-500/20',
  Dispatcher:   'bg-amber-500/10 text-amber-400   border border-amber-500/20',
  Agent:        'bg-teal-500/10  text-teal-400     border border-teal-500/20',
  Staff:        'bg-muted/50     text-muted-foreground border border-border/40',
  Operator:     'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  Admin:        'bg-rose-500/10  text-rose-400     border border-rose-500/20',
};

const ROLE_OPTIONS: UserRole[] = [
  'SuperAdmin', 'CompanyAdmin', 'Manager',
  'Dispatcher', 'Agent', 'Staff', 'Operator', 'Admin',
];

export default function UsersPage() {
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filtered = mockUsers.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q)  ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          {/* Avatar circle using initials */}
          <div className="
            w-8 h-8 rounded-full flex-shrink-0
            bg-primary/10 border border-primary/20
            flex items-center justify-center
            text-[0.70rem] font-bold text-primary
          ">
            {item.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-[0.84rem] font-semibold text-foreground leading-tight truncate">
              {item.name}
            </p>
            <p className="text-[0.70rem] text-muted-foreground/60 mt-0.5">
              @{item.username}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (item) => (
        <span className="text-[0.82rem] text-muted-foreground truncate max-w-[200px] block">
          {item.email}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (item) => (
        <span className={`
          inline-flex items-center
          px-2.5 py-0.5 rounded-md
          text-[0.72rem] font-bold
          ${ROLE_STYLES[item.role]}
        `}>
          {item.role}
        </span>
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
          text-[0.72rem] font-bold border
          ${item.status === 'Active'
            ? 'bg-success/10 text-success border-success/20'
            : 'bg-muted/50 text-muted-foreground border-border/40'}
        `}>
          <span className={`
            w-1.5 h-1.5 rounded-full
            ${item.status === 'Active' ? 'bg-success' : 'bg-muted-foreground'}
          `} />
          {item.status}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (item) => (
        <span className="text-[0.78rem] text-muted-foreground">
          {new Date(item.lastLogin).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-1 justify-end">
          <button className="
            w-8 h-8 flex items-center justify-center rounded-lg
            text-muted-foreground
            hover:bg-primary/10 hover:text-primary
            transition-colors duration-150
          ">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button className="
            w-8 h-8 flex items-center justify-center rounded-lg
            text-muted-foreground
            hover:bg-sky-500/10 hover:text-sky-400
            transition-colors duration-150
          ">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button className="
            w-8 h-8 flex items-center justify-center rounded-lg
            text-muted-foreground
            hover:bg-destructive/10 hover:text-destructive
            transition-colors duration-150
          ">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="User Management"
      description="Manage all platform users"
      actions={
        <button
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
          Add User
        </button>
      }
    >

      {/* ── Filter Bar ── */}
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
              placeholder="Search by name, email or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

          {/* Role filter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[0.78rem] text-muted-foreground">
              <SlidersHorizontal size={13} />
              <span className="font-medium hidden sm:block">Role:</span>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="
                w-[170px] h-9 text-[0.82rem]
                bg-muted/40 border-border/60 rounded-[9px]
                focus:border-primary/50 focus:ring-0
              ">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all" className="text-[0.82rem]">All Roles</SelectItem>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r} className="text-[0.82rem]">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {roleFilter !== 'all' && (
              <button
                onClick={() => setRoleFilter('all')}
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

        {/* Active filter pills */}
        {(search || roleFilter !== 'all') && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
            <span className="text-[0.72rem] text-muted-foreground font-medium uppercase tracking-wide">
              Active filters:
            </span>
            {roleFilter !== 'all' && (
              <span className="
                inline-flex items-center gap-1.5 px-2.5 py-0.5
                bg-primary/10 border border-primary/20
                rounded-full text-[0.72rem] font-semibold text-primary
              ">
                {roleFilter}
                <button onClick={() => setRoleFilter('all')}>
                  <X size={10} />
                </button>
              </span>
            )}
            <span className="text-[0.72rem] text-muted-foreground ml-auto">
              {filtered.length} user{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <DataTable
        data={filtered}
        columns={columns}
        emptyMessage="No users found"
      />

    </PageWrapper>
  );
}
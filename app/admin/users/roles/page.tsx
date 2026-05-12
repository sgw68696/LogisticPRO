'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import {
  Shield, Users, Eye, Edit,
  Check, Minus, ChevronDown, ChevronUp,
  ExternalLink,
} from 'lucide-react';
import type { UserRole, PermissionAction } from '@/data/mockData';
import { mockUsers } from '@/data/mockData';
import Link from 'next/link';

const ROLES: UserRole[] = [
  'SuperAdmin', 'CompanyAdmin', 'Manager',
  'Dispatcher', 'Agent', 'Staff', 'Operator', 'Admin',
];

const MODULES = [
  'companies', 'organizations', 'users', 'shipments',
  'orders', 'fleet', 'drivers', 'dispatch',
  'warehouse', 'customers', 'finance', 'invoices',
  'reports', 'settings', 'notifications',
];

const ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete'];

// Reuse same defaults from RBAC Matrix page
const buildDefaultPermissions = (role: UserRole): Record<string, Record<PermissionAction, boolean>> => {
  const base = MODULES.reduce<Record<string, Record<PermissionAction, boolean>>>((acc, mod) => {
    acc[mod] = {
      view:   role === 'SuperAdmin' || ['CompanyAdmin', 'Admin', 'Manager'].includes(role),
      create: role === 'SuperAdmin' || ['CompanyAdmin', 'Admin'].includes(role),
      edit:   role === 'SuperAdmin' || ['CompanyAdmin', 'Admin', 'Manager'].includes(role),
      delete: role === 'SuperAdmin' || role === 'CompanyAdmin',
    };
    return acc;
  }, {});

  // Granular overrides
  if (role === 'Dispatcher') {
    base['shipments'] = { view: true, create: true,  edit: true,  delete: false };
    base['orders']    = { view: true, create: false, edit: false, delete: false };
    base['fleet']     = { view: true, create: false, edit: false, delete: false };
  }
  if (role === 'Agent') {
    base['shipments'] = { view: true, create: false, edit: false, delete: false };
    base['orders']    = { view: true, create: false, edit: false, delete: false };
  }
  if (role === 'Staff') {
    base['shipments'] = { view: true, create: false, edit: false, delete: false };
  }
  if (role === 'Operator') {
    base['fleet']     = { view: true, create: false, edit: true,  delete: false };
    base['dispatch']  = { view: true, create: true,  edit: true,  delete: false };
  }
  return base;
};

const ROLE_META: Record<UserRole, {
  color: string; bg: string; border: string;
  description: string; scope: string;
}> = {
  SuperAdmin:   { color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', description: 'Full platform access. Manages all companies, users and system config.', scope: 'Platform-wide' },
  CompanyAdmin: { color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/20',    description: 'Full access within their company. Manages orgs, agents and billing.', scope: 'Company-wide' },
  Admin:        { color: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/20',   description: 'Administrative access within an organization scope.', scope: 'Organization' },
  Manager:      { color: 'text-sky-400',    bg: 'bg-sky-500/10',    border: 'border-sky-500/20',    description: 'Manages daily operations, shipments and team members.', scope: 'Organization' },
  Dispatcher:   { color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  description: 'Handles shipment dispatch, fleet assignment and order routing.', scope: 'Department' },
  Operator:     { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', description: 'Manages fleet operations and dispatch activities.', scope: 'Department' },
  Agent:        { color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/20',   description: 'Field agent with view access to shipments and orders.', scope: 'Organization' },
  Staff:        { color: 'text-muted-foreground', bg: 'bg-muted/40', border: 'border-border/40',    description: 'General staff with limited read-only access.', scope: 'Organization' },
};

const ACTION_COLORS: Record<PermissionAction, string> = {
  view:   'text-sky-400',
  create: 'text-success',
  edit:   'text-amber-400',
  delete: 'text-destructive',
};

export default function RolesPermissionsPage() {
  const [expanded, setExpanded] = useState<UserRole | null>(null);

  return (
    <PageWrapper
      title="Roles & Permissions"
      description="Overview of all roles and their access levels"
      actions={
        <Link
          href="/admin/rbac-matrix"
          className="
            flex items-center gap-2 px-3.5 py-2
            rounded-[10px] cursor-pointer
            text-[0.82rem] font-bold text-white font-display
            transition-all duration-200 no-underline
            hover:-translate-y-px
            hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]
          "
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Shield size={14} />
          Edit RBAC Matrix
        </Link>
      }
    >

      {/* ── Summary Strip ── */}
      <div className="
        bg-card border border-border/60
        rounded-xl px-5 py-3.5 mb-6 shadow-soft
        flex items-center gap-6 flex-wrap
      ">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">
            Total Roles
          </span>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[0.72rem] font-bold text-primary">
            {ROLES.length}
          </span>
        </div>
        <div className="w-px h-4 bg-border/50" />
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-success" />
          <span className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">
            Assigned Users
          </span>
          <span className="px-2 py-0.5 rounded-full bg-success/10 border border-success/20 text-[0.72rem] font-bold text-success">
            {mockUsers.length}
          </span>
        </div>
        <div className="w-px h-4 bg-border/50" />
        <div className="flex items-center gap-2">
          <span className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">
            Modules Protected
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[0.72rem] font-bold text-amber-400">
            {MODULES.length}
          </span>
        </div>
      </div>

      {/* ── Role Cards ── */}
      <div className="space-y-3">
        {ROLES.map((role) => {
          const meta  = ROLE_META[role];
          const perms = buildDefaultPermissions(role);
          const isOpen = expanded === role;

          const userCount = mockUsers.filter((u) => u.role === role).length;
          const totalAllowed = MODULES.reduce((sum, mod) =>
            sum + ACTIONS.filter((a) => perms[mod][a]).length, 0
          );
          const pct = Math.round((totalAllowed / (MODULES.length * ACTIONS.length)) * 100);

          return (
            <div
              key={role}
              className={`
                bg-card border rounded-xl shadow-soft
                transition-all duration-300
                ${isOpen
                  ? `${meta.border} shadow-[0_4px_24px_oklch(var(--primary)/0.08)]`
                  : 'border-border/60 hover:border-primary/20'}
              `}
            >
              {/* ── Card Header (always visible) ── */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
                onClick={() => setExpanded(isOpen ? null : role)}
              >
                {/* Role icon */}
                <div className={`
                  w-10 h-10 rounded-xl flex-shrink-0
                  border flex items-center justify-center
                  ${meta.bg} ${meta.border}
                `}>
                  <Shield className={`w-5 h-5 ${meta.color}`} />
                </div>

                {/* Role info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-0.5">
                    <span className="text-[0.88rem] font-bold font-display text-foreground">
                      {role}
                    </span>
                    <span className={`
                      px-2 py-0.5 rounded-full text-[0.65rem] font-bold border
                      ${meta.bg} ${meta.color} ${meta.border}
                    `}>
                      {meta.scope}
                    </span>
                    {userCount > 0 && (
                      <span className="
                        px-2 py-0.5 rounded-full
                        bg-muted/40 border border-border/40
                        text-[0.65rem] font-bold text-muted-foreground
                        flex items-center gap-1
                      ">
                        <Users className="w-2.5 h-2.5" />
                        {userCount} user{userCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-[0.75rem] text-muted-foreground truncate">
                    {meta.description}
                  </p>
                </div>

                {/* Coverage bar + chevron */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:block w-32">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[0.65rem] text-muted-foreground">Access</span>
                      <span className={`text-[0.65rem] font-bold ${meta.color}`}>{pct}%</span>
                    </div>
                    <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
                        }}
                      />
                    </div>
                  </div>

                  <button className="
                    w-7 h-7 flex items-center justify-center rounded-lg
                    bg-muted/30 border border-border/40
                    text-muted-foreground transition-colors duration-150
                    hover:bg-primary/10 hover:text-primary hover:border-primary/20
                  ">
                    {isOpen
                      ? <ChevronUp className="w-4 h-4" />
                      : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* ── Expanded Permission Grid ── */}
              {isOpen && (
                <div className="border-t border-border/40 px-5 pb-5 pt-4">

                  {/* Action legend */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide">
                      Permissions:
                    </span>
                    {ACTIONS.map((a) => (
                      <div key={a} className="flex items-center gap-1">
                        <Check className={`w-3 h-3 ${ACTION_COLORS[a]}`} strokeWidth={3} />
                        <span className={`text-[0.68rem] font-semibold capitalize ${ACTION_COLORS[a]}`}>{a}</span>
                      </div>
                    ))}
                  </div>

                  {/* Module permission pills grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {MODULES.map((mod) => {
                      const p = perms[mod];
                      const anyAllowed = ACTIONS.some((a) => p[a]);
                      return (
                        <div
                          key={mod}
                          className={`
                            flex items-center justify-between
                            px-3 py-2 rounded-lg border
                            ${anyAllowed
                              ? 'bg-muted/20 border-border/40'
                              : 'bg-muted/10 border-border/20 opacity-40'}
                          `}
                        >
                          <span className="text-[0.75rem] font-medium text-foreground/80 capitalize">
                            {mod}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {ACTIONS.map((a) => (
                              <span
                                key={a}
                                title={`${a}: ${p[a] ? 'allowed' : 'denied'}`}
                                className={`
                                  w-4 h-4 rounded flex items-center justify-center
                                  ${p[a]
                                    ? `${ACTION_COLORS[a]} bg-current/10`
                                    : 'text-muted-foreground/20'}
                                `}
                              >
                                {p[a]
                                  ? <Check className="w-2.5 h-2.5" strokeWidth={3} />
                                  : <Minus className="w-2.5 h-2.5" />}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/40">
                    <Link
                      href="/admin/rbac-matrix"
                      className="
                        flex items-center gap-1.5 px-3 py-1.5
                        rounded-lg text-[0.75rem] font-semibold
                        bg-primary/10 border border-primary/20 text-primary
                        hover:bg-primary/20 transition-colors duration-150
                        no-underline
                      "
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit in Matrix
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </Link>
                    <span className="text-[0.70rem] text-muted-foreground ml-auto">
                      {totalAllowed} of {MODULES.length * ACTIONS.length} permissions granted
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </PageWrapper>
  );
}
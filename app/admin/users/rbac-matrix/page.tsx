'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Check, Minus, Shield, Save, RotateCcw } from 'lucide-react';
import type { UserRole, PermissionAction } from '@/data/mockData';
import { toast } from 'sonner';

// All roles and modules from your mockData types
const ROLES: UserRole[] = [
  'SuperAdmin', 'CompanyAdmin', 'Manager',
  'Dispatcher', 'Agent', 'Staff', 'Operator', 'Admin',
];

const MODULES = [
  { key: 'companies',      label: 'Companies',       group: 'Organization' },
  { key: 'organizations',  label: 'Organizations',   group: 'Organization' },
  { key: 'users',          label: 'Users',           group: 'Organization' },
  { key: 'shipments',      label: 'Shipments',       group: 'Operations'   },
  { key: 'orders',         label: 'Orders',          group: 'Operations'   },
  { key: 'fleet',          label: 'Fleet',           group: 'Operations'   },
  { key: 'drivers',        label: 'Drivers',         group: 'Operations'   },
  { key: 'dispatch',       label: 'Dispatch',        group: 'Operations'   },
  { key: 'warehouse',      label: 'Warehouse',       group: 'Operations'   },
  { key: 'customers',      label: 'Customers',       group: 'CRM'          },
  { key: 'finance',        label: 'Finance',         group: 'Finance'      },
  { key: 'invoices',       label: 'Invoices',        group: 'Finance'      },
  { key: 'reports',        label: 'Reports',         group: 'Analytics'    },
  { key: 'settings',       label: 'Settings',        group: 'System'       },
  { key: 'notifications',  label: 'Notifications',   group: 'System'       },
];

const ACTIONS: PermissionAction[] = ['view', 'create', 'edit', 'delete'];

const ACTION_COLORS: Record<PermissionAction, string> = {
  view:   'text-sky-400   bg-sky-400',
  create: 'text-success   bg-success',
  edit:   'text-amber-400 bg-amber-400',
  delete: 'text-destructive bg-destructive',
};

// Default permission matrix — SuperAdmin gets all, others get sensible defaults
const buildDefaultMatrix = () => {
  const matrix: Record<string, Record<string, Record<PermissionAction, boolean>>> = {};
  for (const role of ROLES) {
    matrix[role] = {};
    for (const mod of MODULES) {
      matrix[role][mod.key] = {
        view:   role === 'SuperAdmin' || ['CompanyAdmin', 'Admin', 'Manager'].includes(role),
        create: role === 'SuperAdmin' || ['CompanyAdmin', 'Admin'].includes(role),
        edit:   role === 'SuperAdmin' || ['CompanyAdmin', 'Admin', 'Manager'].includes(role),
        delete: role === 'SuperAdmin' || role === 'CompanyAdmin',
      };
    }
  }
  // Granular overrides
  matrix['Dispatcher']['shipments']   = { view: true,  create: true,  edit: true,  delete: false };
  matrix['Dispatcher']['orders']      = { view: true,  create: false, edit: false, delete: false };
  matrix['Dispatcher']['fleet']       = { view: true,  create: false, edit: false, delete: false };
  matrix['Agent']['shipments']        = { view: true,  create: false, edit: false, delete: false };
  matrix['Agent']['orders']           = { view: true,  create: false, edit: false, delete: false };
  matrix['Staff']['shipments']        = { view: true,  create: false, edit: false, delete: false };
  matrix['Operator']['fleet']         = { view: true,  create: false, edit: true,  delete: false };
  matrix['Operator']['dispatch']      = { view: true,  create: true,  edit: true,  delete: false };
  return matrix;
};

const ROLE_STYLES: Record<UserRole, string> = {
  SuperAdmin:   'bg-violet-500/10 text-violet-400 border-violet-500/20',
  CompanyAdmin: 'bg-primary/10   text-primary     border-primary/20',
  Manager:      'bg-sky-500/10   text-sky-400      border-sky-500/20',
  Dispatcher:   'bg-amber-500/10 text-amber-400   border-amber-500/20',
  Agent:        'bg-teal-500/10  text-teal-400     border-teal-500/20',
  Staff:        'bg-muted/50     text-muted-foreground border-border/40',
  Operator:     'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Admin:        'bg-rose-500/10  text-rose-400     border-rose-500/20',
};

const GROUP_COLORS: Record<string, string> = {
  Organization: 'text-primary',
  Operations:   'text-amber-400',
  CRM:          'text-sky-400',
  Finance:      'text-success',
  Analytics:    'text-violet-400',
  System:       'text-muted-foreground',
};

export default function RBACMatrixPage() {
  const [matrix, setMatrix]         = useState(buildDefaultMatrix);
  const [savedMatrix, setSaved]     = useState(buildDefaultMatrix);
  const [activeRole, setActiveRole] = useState<UserRole>('SuperAdmin');
  const [dirty, setDirty]           = useState(false);

  const toggle = (module: string, action: PermissionAction) => {
    if (activeRole === 'SuperAdmin') return; // SuperAdmin always has all
    setMatrix((prev) => {
      const updated = {
        ...prev,
        [activeRole]: {
          ...prev[activeRole],
          [module]: {
            ...prev[activeRole][module],
            [action]: !prev[activeRole][module][action],
          },
        },
      };
      return updated;
    });
    setDirty(true);
  };

  const handleSave = () => {
    setSaved(matrix);
    setDirty(false);
    toast.success('RBAC matrix saved successfully');
  };

  const handleReset = () => {
    setMatrix(savedMatrix);
    setDirty(false);
    toast.info('Changes discarded');
  };

  // Group modules by their group key
  const groups = MODULES.reduce<Record<string, typeof MODULES>>((acc, mod) => {
    if (!acc[mod.group]) acc[mod.group] = [];
    acc[mod.group].push(mod);
    return acc;
  }, {});

  const currentPerms = matrix[activeRole];
  const totalAllowed = MODULES.reduce((sum, mod) =>
    sum + ACTIONS.filter((a) => currentPerms[mod.key][a]).length, 0
  );
  const totalPossible = MODULES.length * ACTIONS.length;

  return (
    <PageWrapper
      title="RBAC Matrix"
      description="Configure role-based access control permissions per module"
      actions={
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              onClick={handleReset}
              className="
                flex items-center gap-2 px-3.5 py-2
                rounded-[10px] cursor-pointer
                text-[0.82rem] font-semibold
                bg-muted/40 border border-border/60
                text-muted-foreground
                hover:text-foreground hover:bg-muted/70
                transition-all duration-200
              "
            >
              <RotateCcw size={14} />
              Discard
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty}
            className="
              flex items-center gap-2 px-3.5 py-2
              rounded-[10px] cursor-pointer
              text-[0.82rem] font-bold text-white font-display
              transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:enabled:-translate-y-px
              hover:enabled:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]
            "
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
          >
            <Save size={14} />
            Save Changes
          </button>
        </div>
      }
    >

      {/* ── Role Selector Tabs ── */}
      <div className="
        bg-card border border-border/60
        rounded-xl p-4 mb-6 shadow-soft
      ">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide mr-2">
            <Shield className="w-3.5 h-3.5" />
            Select Role:
          </div>
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`
                px-3 py-1.5 rounded-lg
                text-[0.75rem] font-bold border
                transition-all duration-200
                ${activeRole === role
                  ? ROLE_STYLES[role]
                  : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted/40'}
              `}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Permission coverage bar */}
        <div className="mt-4 pt-4 border-t border-border/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">
              Permission Coverage — {activeRole}
            </span>
            <span className="text-[0.72rem] font-bold text-foreground">
              {totalAllowed} / {totalPossible} ({Math.round((totalAllowed / totalPossible) * 100)}%)
            </span>
          </div>
          <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(totalAllowed / totalPossible) * 100}%`,
                background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Permission Matrix Table ── */}
      <div className="
        bg-card border border-border/60
        rounded-xl overflow-hidden shadow-soft
      ">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20">
                <th className="px-6 py-3.5 text-left text-[0.72rem] font-bold text-muted-foreground uppercase tracking-widest w-48">
                  Module
                </th>
                {ACTIONS.map((action) => {
                  const [textCls] = ACTION_COLORS[action].split(' ');
                  return (
                    <th
                      key={action}
                      className={`
                        px-4 py-3.5 text-center
                        text-[0.72rem] font-bold uppercase tracking-widest
                        ${textCls}
                      `}
                    >
                      {action}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {Object.entries(groups).map(([group, mods]) => (
                <>
                  {/* Group header row */}
                  <tr key={`group-${group}`} className="bg-muted/10 border-y border-border/30">
                    <td
                      colSpan={5}
                      className="px-6 py-2"
                    >
                      <span className={`
                        text-[0.68rem] font-bold uppercase tracking-widest
                        ${GROUP_COLORS[group] ?? 'text-muted-foreground'}
                      `}>
                        {group}
                      </span>
                    </td>
                  </tr>

                  {/* Module rows */}
                  {mods.map((mod) => (
                    <tr
                      key={mod.key}
                      className="border-b border-border/25 hover:bg-primary/[0.03] transition-colors duration-100"
                    >
                      <td className="px-6 py-3">
                        <span className="text-[0.82rem] font-medium text-foreground/80">
                          {mod.label}
                        </span>
                      </td>

                      {ACTIONS.map((action) => {
                        const allowed = currentPerms[mod.key][action];
                        const isLocked = activeRole === 'SuperAdmin';
                        const [textCls, bgCls] = ACTION_COLORS[action].split(' ');

                        return (
                          <td key={action} className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggle(mod.key, action)}
                              disabled={isLocked}
                              className={`
                                w-7 h-7 rounded-lg
                                flex items-center justify-center mx-auto
                                border transition-all duration-200
                                ${allowed
                                  ? `${bgCls}/15 ${textCls} border-current/30
                                     hover:enabled:${bgCls}/25`
                                  : `bg-muted/20 text-muted-foreground/30 border-border/30
                                     hover:enabled:bg-muted/40`
                                }
                                ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}
                              `}
                              title={isLocked ? 'SuperAdmin has all permissions' : `Toggle ${action} for ${mod.label}`}
                            >
                              {allowed
                                ? <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                : <Minus className="w-3 h-3" />
                              }
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend footer */}
        <div className="
          px-6 py-3.5 border-t border-border/40
          flex items-center gap-6 flex-wrap
          bg-muted/10
        ">
          <span className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-wide">
            Legend:
          </span>
          {ACTIONS.map((action) => {
            const [textCls, bgCls] = ACTION_COLORS[action].split(' ');
            return (
              <div key={action} className="flex items-center gap-1.5">
                <div className={`
                  w-5 h-5 rounded-md border
                  flex items-center justify-center
                  ${bgCls}/15 ${textCls} border-current/30
                `}>
                  <Check className="w-3 h-3" strokeWidth={3} />
                </div>
                <span className={`text-[0.72rem] font-semibold capitalize ${textCls}`}>
                  {action}
                </span>
              </div>
            );
          })}
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-5 h-5 rounded-md border bg-muted/20 border-border/30 flex items-center justify-center">
              <Minus className="w-3 h-3 text-muted-foreground/30" />
            </div>
            <span className="text-[0.72rem] font-semibold text-muted-foreground">No access</span>
          </div>
        </div>
      </div>

    </PageWrapper>
  );
}
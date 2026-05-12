'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import {
  Plus, Pencil, Trash2, Search,
  Truck, Plane, Ship, Globe,
  ShieldCheck, ShieldAlert, Info, X,
} from 'lucide-react';

type IncotermsGroup  = 'E' | 'F' | 'C' | 'D';
type TransportScope  = 'Any Mode' | 'Sea & Inland Waterway Only';

interface ResponsibilityMatrix {
  exportClearance:   'Seller' | 'Buyer' | 'Split';
  mainCarriage:      'Seller' | 'Buyer';
  insurance:         'Seller' | 'Buyer' | 'Optional';
  importClearance:   'Seller' | 'Buyer';
  riskTransferPoint: string;
}

interface Incoterm {
  id: string;
  code: string;           // EXW, FOB, CIF etc.
  name: string;
  group: IncotermsGroup;
  version: 2020 | 2010;
  scope: TransportScope;
  sellerObligation: 'Minimum' | 'Low' | 'Medium' | 'High' | 'Maximum';
  buyerObligation:  'Minimum' | 'Low' | 'Medium' | 'High' | 'Maximum';
  matrix: ResponsibilityMatrix;
  usageContext: string;
  status: 'Active' | 'Deprecated';
  usageCount: number;
}

const INCOTERMS: Incoterm[] = [
  {
    id: 'inc-001', code: 'EXW', name: 'Ex Works',
    group: 'E', version: 2020, scope: 'Any Mode',
    sellerObligation: 'Minimum', buyerObligation: 'Maximum',
    matrix: {
      exportClearance: 'Buyer', mainCarriage: 'Buyer',
      insurance: 'Buyer', importClearance: 'Buyer',
      riskTransferPoint: 'Seller\'s premises',
    },
    usageContext: 'Seller makes goods available at their premises. Buyer bears all costs and risks from that point.',
    status: 'Active', usageCount: 34,
  },
  {
    id: 'inc-002', code: 'FCA', name: 'Free Carrier',
    group: 'F', version: 2020, scope: 'Any Mode',
    sellerObligation: 'Low', buyerObligation: 'High',
    matrix: {
      exportClearance: 'Seller', mainCarriage: 'Buyer',
      insurance: 'Optional', importClearance: 'Buyer',
      riskTransferPoint: 'Named place / carrier handover',
    },
    usageContext: 'Seller delivers to named carrier. Updated in 2020 to allow on-board B/L for LC transactions.',
    status: 'Active', usageCount: 89,
  },
  {
    id: 'inc-003', code: 'CPT', name: 'Carriage Paid To',
    group: 'C', version: 2020, scope: 'Any Mode',
    sellerObligation: 'Medium', buyerObligation: 'Medium',
    matrix: {
      exportClearance: 'Seller', mainCarriage: 'Seller',
      insurance: 'Optional', importClearance: 'Buyer',
      riskTransferPoint: 'First carrier handover',
    },
    usageContext: 'Seller pays freight to destination but risk transfers at origin carrier handover.',
    status: 'Active', usageCount: 41,
  },
  {
    id: 'inc-004', code: 'CIP', name: 'Carriage & Insurance Paid To',
    group: 'C', version: 2020, scope: 'Any Mode',
    sellerObligation: 'High', buyerObligation: 'Low',
    matrix: {
      exportClearance: 'Seller', mainCarriage: 'Seller',
      insurance: 'Seller', importClearance: 'Buyer',
      riskTransferPoint: 'First carrier handover',
    },
    usageContext: 'Like CPT but seller must obtain Institute Cargo Clauses (A) — highest coverage. Preferred for high-value cargo.',
    status: 'Active', usageCount: 28,
  },
  {
    id: 'inc-005', code: 'DAP', name: 'Delivered at Place',
    group: 'D', version: 2020, scope: 'Any Mode',
    sellerObligation: 'High', buyerObligation: 'Low',
    matrix: {
      exportClearance: 'Seller', mainCarriage: 'Seller',
      insurance: 'Optional', importClearance: 'Buyer',
      riskTransferPoint: 'Named destination (unloaded)',
    },
    usageContext: 'Seller delivers to named destination ready for unloading. Buyer handles import duties.',
    status: 'Active', usageCount: 112,
  },
  {
    id: 'inc-006', code: 'DPU', name: 'Delivered at Place Unloaded',
    group: 'D', version: 2020, scope: 'Any Mode',
    sellerObligation: 'High', buyerObligation: 'Low',
    matrix: {
      exportClearance: 'Seller', mainCarriage: 'Seller',
      insurance: 'Optional', importClearance: 'Buyer',
      riskTransferPoint: 'Named place after unloading',
    },
    usageContext: 'Replaces DAT (2010). Seller bears cost and risk until goods are unloaded at destination.',
    status: 'Active', usageCount: 57,
  },
  {
    id: 'inc-007', code: 'DDP', name: 'Delivered Duty Paid',
    group: 'D', version: 2020, scope: 'Any Mode',
    sellerObligation: 'Maximum', buyerObligation: 'Minimum',
    matrix: {
      exportClearance: 'Seller', mainCarriage: 'Seller',
      insurance: 'Seller', importClearance: 'Seller',
      riskTransferPoint: 'Named destination (duty paid)',
    },
    usageContext: 'Maximum seller obligation — includes import clearance and duties. Commonly used in e-commerce cross-border.',
    status: 'Active', usageCount: 76,
  },
  {
    id: 'inc-008', code: 'FAS', name: 'Free Alongside Ship',
    group: 'F', version: 2020, scope: 'Sea & Inland Waterway Only',
    sellerObligation: 'Low', buyerObligation: 'High',
    matrix: {
      exportClearance: 'Seller', mainCarriage: 'Buyer',
      insurance: 'Buyer', importClearance: 'Buyer',
      riskTransferPoint: 'Alongside vessel at named port',
    },
    usageContext: 'Used for bulk/break-bulk cargo. Seller delivers alongside vessel at origin port.',
    status: 'Active', usageCount: 18,
  },
  {
    id: 'inc-009', code: 'FOB', name: 'Free on Board',
    group: 'F', version: 2020, scope: 'Sea & Inland Waterway Only',
    sellerObligation: 'Low', buyerObligation: 'High',
    matrix: {
      exportClearance: 'Seller', mainCarriage: 'Buyer',
      insurance: 'Buyer', importClearance: 'Buyer',
      riskTransferPoint: 'On board vessel at port of loading',
    },
    usageContext: 'Most widely used sea term. Risk transfers once goods are on board. Not suitable for containerised cargo (use FCA).',
    status: 'Active', usageCount: 198,
  },
  {
    id: 'inc-010', code: 'CFR', name: 'Cost and Freight',
    group: 'C', version: 2020, scope: 'Sea & Inland Waterway Only',
    sellerObligation: 'Medium', buyerObligation: 'Medium',
    matrix: {
      exportClearance: 'Seller', mainCarriage: 'Seller',
      insurance: 'Buyer', importClearance: 'Buyer',
      riskTransferPoint: 'On board vessel at port of loading',
    },
    usageContext: 'Seller pays freight but risk passes at loading port. Buyer must arrange own insurance.',
    status: 'Active', usageCount: 67,
  },
  {
    id: 'inc-011', code: 'CIF', name: 'Cost, Insurance & Freight',
    group: 'C', version: 2020, scope: 'Sea & Inland Waterway Only',
    sellerObligation: 'Medium', buyerObligation: 'Medium',
    matrix: {
      exportClearance: 'Seller', mainCarriage: 'Seller',
      insurance: 'Seller', importClearance: 'Buyer',
      riskTransferPoint: 'On board vessel at port of loading',
    },
    usageContext: 'Like CFR but seller provides minimum insurance (ICC-C). Common in commodity trade.',
    status: 'Active', usageCount: 143,
  },
  {
    id: 'inc-012', code: 'DAT', name: 'Delivered at Terminal',
    group: 'D', version: 2010, scope: 'Any Mode',
    sellerObligation: 'High', buyerObligation: 'Low',
    matrix: {
      exportClearance: 'Seller', mainCarriage: 'Seller',
      insurance: 'Optional', importClearance: 'Buyer',
      riskTransferPoint: 'Named terminal at destination',
    },
    usageContext: 'Superseded by DPU in Incoterms 2020. Still referenced in legacy contracts.',
    status: 'Deprecated', usageCount: 4,
  },
];

// ── Config maps ──
const GROUP_META: Record<IncotermsGroup, {
  label: string; color: string; bg: string; border: string; description: string;
}> = {
  E: { label: 'Group E — Departure',    color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  description: 'Minimum obligation for seller' },
  F: { label: 'Group F — Main Carriage Unpaid', color: 'text-sky-400',    bg: 'bg-sky-500/10',    border: 'border-sky-500/20',    description: 'Buyer arranges main carriage' },
  C: { label: 'Group C — Main Carriage Paid',   color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/20',    description: 'Seller pays freight, risk splits' },
  D: { label: 'Group D — Arrival',      color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', description: 'Maximum obligation for seller' },
};

const OBLIGATION_META: Record<Incoterm['sellerObligation'], { bar: string; width: string; label: string }> = {
  Minimum: { bar: 'bg-success',     width: 'w-[10%]',  label: 'Min'  },
  Low:     { bar: 'bg-sky-400',     width: 'w-[30%]',  label: 'Low'  },
  Medium:  { bar: 'bg-amber-400',   width: 'w-[55%]',  label: 'Med'  },
  High:    { bar: 'bg-orange-400',  width: 'w-[78%]',  label: 'High' },
  Maximum: { bar: 'bg-destructive', width: 'w-[100%]', label: 'Max'  },
};

const PARTY_STYLE = {
  Seller:   'bg-primary/10 text-primary border border-primary/20',
  Buyer:    'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Optional: 'bg-muted/40 text-muted-foreground border border-border/40',
  Split:    'bg-violet-500/10 text-violet-400 border border-violet-500/20',
};

const SCOPE_ICON: Record<TransportScope, typeof Globe> = {
  'Any Mode':                    Globe,
  'Sea & Inland Waterway Only':  Ship,
};

const GROUPS: IncotermsGroup[] = ['E', 'F', 'C', 'D'];

export default function IncotermsPage() {
  const [search, setSearch]         = useState('');
  const [groupFilter, setGroup]     = useState<IncotermsGroup | 'all'>('all');
  const [showDeprecated, setShowDep] = useState(false);

  const filtered = INCOTERMS.filter((t) => {
    const q = search.toLowerCase();
    const matchQ =
      t.code.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.usageContext.toLowerCase().includes(q);
    const matchGroup = groupFilter === 'all' || t.group === groupFilter;
    const matchDep   = showDeprecated || t.status !== 'Deprecated';
    return matchQ && matchGroup && matchDep;
  });

  const activeCount = INCOTERMS.filter((t) => t.status === 'Active').length;
  const totalUsage  = INCOTERMS.reduce((s, t) => s + t.usageCount, 0);

  return (
    <PageWrapper
      title="Incoterms"
      description="ICC trade terms defining risk and cost responsibilities"
      actions={
        <button
          className="
            flex items-center gap-2 px-3.5 py-2 rounded-[10px]
            text-[0.82rem] font-bold text-white font-display cursor-pointer
            transition-all duration-200 hover:-translate-y-px
            hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]
          "
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Plus size={14} />
          New Incoterm
        </button>
      }
    >

      {/* ── Stats Strip ── */}
      <div className="
        bg-card border border-border/60 rounded-xl
        px-5 py-3.5 mb-6 shadow-soft
        flex items-center gap-6 flex-wrap
      ">
        {[
          { label: 'Total Terms',  value: INCOTERMS.length, pill: 'bg-primary/10 text-primary border-primary/20'         },
          { label: 'Active',       value: activeCount,       pill: 'bg-success/10 text-success border-success/20'         },
          { label: 'Deprecated',   value: INCOTERMS.length - activeCount, pill: 'bg-muted/50 text-muted-foreground border-border/40' },
          { label: 'Times Used',   value: totalUsage,        pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20'  },
        ].map(({ label, value, pill }, i) => (
          <>
            {i > 0 && <div key={`d${i}`} className="w-px h-4 bg-border/50" />}
            <div key={label} className="flex items-center gap-2">
              <span className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">
                {label}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[0.72rem] font-bold border ${pill}`}>
                {value}
              </span>
            </div>
          </>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by code, name or context..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                nb-search w-full h-9 pl-9 pr-3
                bg-muted/40 border border-border rounded-[9px]
                text-[0.84rem] text-foreground outline-none
                placeholder:text-muted-foreground
                focus:border-primary/50 focus:bg-primary/5
                focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]
              "
            />
          </div>

          {/* Group filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setGroup('all')}
              className={`
                px-3 py-1.5 rounded-lg text-[0.75rem] font-bold border
                transition-all duration-200
                ${groupFilter === 'all'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted/20 text-muted-foreground border-border/40 hover:bg-muted/40 hover:text-foreground'}
              `}
            >All Groups</button>
            {GROUPS.map((g) => {
              const m = GROUP_META[g];
              return (
                <button
                  key={g}
                  onClick={() => setGroup(g)}
                  className={`
                    px-3 py-1.5 rounded-lg text-[0.75rem] font-bold border
                    transition-all duration-200
                    ${groupFilter === g
                      ? `${m.bg} ${m.color} ${m.border}`
                      : 'bg-muted/20 text-muted-foreground border-border/40 hover:bg-muted/40 hover:text-foreground'}
                  `}
                >Group {g}</button>
              );
            })}
            {groupFilter !== 'all' && (
              <button
                onClick={() => setGroup('all')}
                className="
                  w-7 h-7 flex items-center justify-center
                  bg-destructive/10 border border-destructive/20
                  rounded-lg text-destructive
                  hover:bg-destructive/20 transition-colors duration-150
                "
              ><X size={12} /></button>
            )}

            {/* Show deprecated toggle */}
            <button
              onClick={() => setShowDep((p) => !p)}
              className={`
                ml-2 px-3 py-1.5 rounded-lg text-[0.75rem] font-bold border
                transition-all duration-200
                ${showDeprecated
                  ? 'bg-muted/50 text-muted-foreground border-border/60'
                  : 'bg-muted/20 text-muted-foreground/60 border-border/30 hover:bg-muted/40 hover:text-muted-foreground'}
              `}
            >
              {showDeprecated ? '● Show Deprecated' : '○ Show Deprecated'}
            </button>
          </div>
        </div>

        {(search || groupFilter !== 'all') && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">
            {filtered.length} incoterm{filtered.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* ── Group sections ── */}
      {filtered.length > 0 ? (
        <div className="space-y-8">
          {GROUPS.filter((g) =>
            filtered.some((t) => t.group === g)
          ).map((group) => {
            const gm      = GROUP_META[group];
            const members = filtered.filter((t) => t.group === group);

            return (
              <div key={group}>
                {/* Group header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`
                    px-3 py-1 rounded-lg text-[0.75rem] font-bold border
                    ${gm.bg} ${gm.color} ${gm.border}
                  `}>
                    {gm.label}
                  </div>
                  <span className="text-[0.72rem] text-muted-foreground">
                    {gm.description}
                  </span>
                  <div className="flex-1 h-px bg-border/40" />
                  <span className="text-[0.70rem] text-muted-foreground/60">
                    {members.length} term{members.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {members.map((term) => {
                    const gStyle   = GROUP_META[term.group];
                    const ScopeIcon = SCOPE_ICON[term.scope];
                    const deprecated = term.status === 'Deprecated';

                    return (
                      <div
                        key={term.id}
                        className={`
                          group flex flex-col bg-card rounded-xl shadow-soft
                          border transition-all duration-300
                          hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]
                          hover:-translate-y-0.5
                          ${deprecated
                            ? 'border-border/30 opacity-55 hover:border-border/50'
                            : 'border-border/60 hover:border-primary/25'}
                        `}
                      >
                        {/* ── Card Header ── */}
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {/* Code box */}
                              <div className={`
                                w-12 h-12 rounded-xl flex-shrink-0 border
                                flex items-center justify-center
                                ${gStyle.bg} ${gStyle.border}
                              `}>
                                <span className={`text-[0.88rem] font-black font-mono ${gStyle.color}`}>
                                  {term.code}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-[0.86rem] font-bold font-display text-foreground leading-tight">
                                  {term.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  {/* Scope icon */}
                                  <span className="
                                    inline-flex items-center gap-1
                                    px-1.5 py-0.5 rounded text-[0.65rem] font-bold
                                    bg-muted/40 border border-border/40 text-muted-foreground
                                  ">
                                    <ScopeIcon className="w-2.5 h-2.5" />
                                    {term.scope === 'Any Mode' ? 'All modes' : 'Sea only'}
                                  </span>
                                  {/* Version */}
                                  <span className={`
                                    inline-flex items-center px-1.5 py-0.5 rounded
                                    text-[0.65rem] font-bold border
                                    ${term.version === 2020
                                      ? 'bg-success/10 text-success border-success/20'
                                      : 'bg-muted/40 text-muted-foreground border-border/40'}
                                  `}>
                                    {term.version}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="
                              flex items-center gap-0.5
                              opacity-0 group-hover:opacity-100
                              transition-opacity duration-200
                            ">
                              <button className="
                                w-7 h-7 flex items-center justify-center rounded-lg
                                text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400
                                transition-colors duration-150
                              "><Pencil className="w-3.5 h-3.5" /></button>
                              <button className="
                                w-7 h-7 flex items-center justify-center rounded-lg
                                text-muted-foreground hover:bg-destructive/10 hover:text-destructive
                                transition-colors duration-150
                              "><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>

                          {/* Context */}
                          <p className="text-[0.75rem] text-muted-foreground leading-relaxed mb-4">
                            {term.usageContext}
                          </p>

                          {/* ── Responsibility Matrix ── */}
                          <div className="space-y-2 mb-4">
                            <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-widest">
                              Responsibility Matrix
                            </p>
                            {[
                              { label: 'Export Clearance', value: term.matrix.exportClearance },
                              { label: 'Main Carriage',    value: term.matrix.mainCarriage    },
                              { label: 'Insurance',        value: term.matrix.insurance       },
                              { label: 'Import Clearance', value: term.matrix.importClearance },
                            ].map(({ label, value }) => (
                              <div key={label} className="flex items-center justify-between">
                                <span className="text-[0.72rem] text-muted-foreground/70">{label}</span>
                                <span className={`
                                  px-2 py-0.5 rounded text-[0.68rem] font-bold
                                  ${PARTY_STYLE[value as keyof typeof PARTY_STYLE]}
                                `}>
                                  {value}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Risk transfer point */}
                          <div className="
                            flex items-start gap-2 px-3 py-2
                            bg-muted/20 border border-border/30 rounded-lg
                          ">
                            <Info className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[0.65rem] font-bold text-muted-foreground/60 uppercase tracking-wide mb-0.5">
                                Risk Transfer Point
                              </p>
                              <p className="text-[0.75rem] text-foreground/80">
                                {term.matrix.riskTransferPoint}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ── Card Footer ── */}
                        <div className="
                          mt-auto border-t border-border/40 px-5 py-3
                          bg-muted/10 flex items-center justify-between gap-3
                        ">
                          {/* Seller obligation bar */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-3 h-3 text-muted-foreground/50" />
                                <span className="text-[0.65rem] text-muted-foreground/60 uppercase tracking-wide font-bold">
                                  Seller Load
                                </span>
                              </div>
                              <span className={`
                                text-[0.68rem] font-bold
                                ${OBLIGATION_META[term.sellerObligation].bar
                                  .replace('bg-', 'text-')
                                  .replace('-400', '-400')
                                  .replace('bg-destructive', 'text-destructive')
                                  .replace('bg-success', 'text-success')}
                              `}>
                                {OBLIGATION_META[term.sellerObligation].label}
                              </span>
                            </div>
                            <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                              <div className={`
                                h-full rounded-full transition-all duration-500
                                ${OBLIGATION_META[term.sellerObligation].bar}
                                ${OBLIGATION_META[term.sellerObligation].width}
                              `} />
                            </div>
                          </div>

                          {/* Usage count */}
                          <div className="
                            flex-shrink-0 flex items-center gap-1.5
                            px-2.5 py-1 rounded-lg
                            bg-muted/30 border border-border/40
                          ">
                            <ShieldAlert className="w-3 h-3 text-muted-foreground/50" />
                            <span className="text-[0.72rem] font-bold text-muted-foreground">
                              {term.usageCount}×
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="
          bg-card border border-border/60 rounded-xl shadow-soft
          py-20 flex flex-col items-center gap-3
        ">
          <div className="
            w-14 h-14 rounded-full bg-muted/40 border border-border/50
            flex items-center justify-center
          ">
            <Globe className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No incoterms found</p>
          <p className="text-[0.78rem] text-muted-foreground">
            Try adjusting your search or group filter
          </p>
        </div>
      )}

    </PageWrapper>
  );
}
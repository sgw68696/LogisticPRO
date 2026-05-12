'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import {
  Plus, Pencil, Trash2, Truck,
  Package, Warehouse, Zap, Globe,
} from 'lucide-react';

const COMPANY_TYPES = [
  {
    id: 1,
    name: 'Freight Forwarder',
    description: 'Company specializing in freight forwarding and cargo transport across regions.',
    icon: Truck,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    count: 12,
  },
  {
    id: 2,
    name: 'Courier',
    description: 'Company providing fast, door-to-door courier and parcel delivery services.',
    icon: Package,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
    count: 8,
  },
  {
    id: 3,
    name: 'Logistics Provider',
    description: 'End-to-end logistics solutions including fleet, warehousing, and last-mile delivery.',
    icon: Globe,
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/20',
    count: 5,
  },
  {
    id: 4,
    name: 'Express Delivery',
    description: 'Time-critical express delivery services with guaranteed SLA windows.',
    icon: Zap,
    color: 'text-success',
    bg: 'bg-success/10 border-success/20',
    count: 9,
  },
  {
    id: 5,
    name: 'Warehouse Operator',
    description: 'Warehouse management, bulk storage, and inventory handling services.',
    icon: Warehouse,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
    count: 4,
  },
];

export default function CompanyTypesPage() {
  const [types, setTypes] = useState(COMPANY_TYPES);

  const handleDelete = (id: number) =>
    setTypes((prev) => prev.filter((t) => t.id !== id));

  return (
    <PageWrapper
      title="Company Types"
      description="Define and manage company categories"
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
          New Company Type
        </button>
      }
    >
      {/* ── Stats strip ── */}
      <div className="
        bg-card border border-border/60
        rounded-xl px-5 py-3.5 mb-6 shadow-soft
        flex items-center gap-6
      ">
        <div className="flex items-center gap-2">
          <span className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">
            Total Types
          </span>
          <span className="
            px-2 py-0.5 rounded-full
            bg-primary/10 border border-primary/20
            text-[0.72rem] font-bold text-primary
          ">
            {types.length}
          </span>
        </div>
        <div className="w-px h-4 bg-border/50" />
        <div className="flex items-center gap-2">
          <span className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">
            Total Companies
          </span>
          <span className="
            px-2 py-0.5 rounded-full
            bg-success/10 border border-success/20
            text-[0.72rem] font-bold text-success
          ">
            {types.reduce((s, t) => s + t.count, 0)}
          </span>
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {types.map((type) => {
          const Icon = type.icon;
          return (
            <div
              key={type.id}
              className="
                group
                bg-card border border-border/60
                rounded-xl p-5 shadow-soft
                transition-all duration-300
                hover:border-primary/25
                hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]
                hover:-translate-y-0.5
              "
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-xl flex-shrink-0
                    border flex items-center justify-center
                    ${type.bg}
                  `}>
                    <Icon className={`w-5 h-5 ${type.color}`} />
                  </div>
                  <div>
                    <h3 className="text-[0.88rem] font-bold font-display text-foreground leading-tight">
                      {type.name}
                    </h3>
                    <span className="text-[0.70rem] text-muted-foreground/50 mt-0.5">
                      {type.count} compan{type.count !== 1 ? 'ies' : 'y'}
                    </span>
                  </div>
                </div>

                {/* Actions — fade in on hover */}
                <div className="
                  flex items-center gap-0.5
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-200
                ">
                  <button className="
                    w-7 h-7 flex items-center justify-center rounded-lg
                    text-muted-foreground
                    hover:bg-sky-500/10 hover:text-sky-400
                    transition-colors duration-150
                  ">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
                    className="
                      w-7 h-7 flex items-center justify-center rounded-lg
                      text-muted-foreground
                      hover:bg-destructive/10 hover:text-destructive
                      transition-colors duration-150
                    "
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-[0.78rem] text-muted-foreground leading-relaxed mb-4">
                {type.description}
              </p>

              {/* Footer bar */}
              <div className="
                border-t border-border/40 pt-3
                flex items-center justify-between
              ">
                <div className={`
                  h-1 flex-1 rounded-full overflow-hidden
                  bg-muted/40
                `}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${type.bg.split(' ')[0].replace('/10', '/40')}`}
                    style={{ width: `${Math.min((type.count / 15) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[0.70rem] text-muted-foreground/60 ml-3 flex-shrink-0">
                  {type.count} / 15 max
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Empty state ── */}
      {types.length === 0 && (
        <div className="
          bg-card border border-border/60
          rounded-xl shadow-soft
          py-20 flex flex-col items-center gap-3
        ">
          <div className="
            w-14 h-14 rounded-full
            bg-muted/40 border border-border/50
            flex items-center justify-center
          ">
            <Package className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No company types defined</p>
          <p className="text-[0.78rem] text-muted-foreground">
            Add your first company type to get started
          </p>
        </div>
      )}

    </PageWrapper>
  );
}
'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockOrganizations } from '@/data/mockData';
import type { Organization } from '@/data/mockData';
import {
  Plus, Eye, Edit, Trash2, Search,
  Building, MapPin, Users, GitBranch,
} from 'lucide-react';

// Maps Organization.type to badge colors using your tokens
const TYPE_STYLES: Record<Organization['type'], string> = {
  Regional:   'bg-primary/10   text-primary        border border-primary/20',
  Branch:     'bg-sky-500/10   text-sky-400         border border-sky-500/20',
  Department: 'bg-amber-500/10 text-amber-400       border border-amber-500/20',
  Division:   'bg-violet-500/10 text-violet-400     border border-violet-500/20',
};

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  Active:   { pill: 'bg-success/10 text-success border border-success/20',               dot: 'bg-success' },
  Pending:  { pill: 'bg-warning/10 text-warning border border-warning/20',               dot: 'bg-warning' },
  Inactive: { pill: 'bg-muted/50 text-muted-foreground border border-border/40',         dot: 'bg-muted-foreground' },
  Suspended:{ pill: 'bg-destructive/10 text-destructive border border-destructive/20',   dot: 'bg-destructive' },
};

export default function OrganizationsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockOrganizations.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.city.toLowerCase().includes(search.toLowerCase()) ||
    o.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper
      title="Organizations"
      description="Manage organizations across all companies"
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
          New Organization
        </button>
      }
    >

      {/* ── Search Bar ── */}
      <div className="
        bg-card border border-border/60
        rounded-xl p-4 mb-6 shadow-soft
      ">
        <div className="relative">
          <Search className="
            absolute left-3 top-1/2 -translate-y-1/2
            w-4 h-4 text-muted-foreground pointer-events-none
          " />
          <input
            type="text"
            placeholder="Search by name, city or type..."
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

        {search && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* ── Cards Grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((org) => {
            const typeStyle  = TYPE_STYLES[org.type]   ?? TYPE_STYLES.Branch;
            const statusMeta = STATUS_STYLES[org.status] ?? STATUS_STYLES.Inactive;

            return (
              <div
                key={org.id}
                className="
                  group relative
                  bg-card border border-border/60
                  rounded-xl p-5 shadow-soft
                  transition-all duration-300
                  hover:border-primary/25
                  hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]
                  hover:-translate-y-0.5
                "
              >
                {/* ── Card Header ── */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="
                      w-10 h-10 rounded-xl flex-shrink-0
                      bg-primary/10 border border-primary/20
                      flex items-center justify-center
                    ">
                      <Building className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="
                        text-[0.88rem] font-bold font-display
                        text-foreground leading-tight truncate
                      ">
                        {org.name}
                      </h3>
                      <p className="text-[0.70rem] text-muted-foreground/60 mt-0.5 font-mono">
                        {org.id}
                      </p>
                    </div>
                  </div>

                  {/* Status pill */}
                  <span className={`
                    inline-flex items-center gap-1.5 flex-shrink-0
                    px-2 py-0.5 rounded-full
                    text-[0.68rem] font-bold
                    ${statusMeta.pill}
                  `}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                    {org.status}
                  </span>
                </div>

                {/* ── Meta Info ── */}
                <div className="space-y-2 mb-4">
                  {/* Type */}
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                    <span className={`
                      inline-flex items-center
                      px-2 py-0.5 rounded-md
                      text-[0.70rem] font-semibold
                      ${typeStyle}
                    `}>
                      {org.type}
                    </span>
                  </div>

                  {/* City */}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                    <span className="text-[0.78rem] text-muted-foreground">
                      {org.city}, {org.state}
                    </span>
                  </div>

                  {/* Agent count */}
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                    <span className="text-[0.78rem] text-muted-foreground">
                      {org.agentCount} Agent{org.agentCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* ── Divider ── */}
                <div className="border-t border-border/40 pt-3">
                  <div className="flex items-center justify-between">
                    {/* Address snippet */}
                    <p className="text-[0.70rem] text-muted-foreground/50 truncate max-w-[55%]">
                      {org.address}
                    </p>

                    {/* Actions — fade in on hover */}
                    <div className="
                      flex items-center gap-0.5
                      opacity-50 group-hover:opacity-100
                      transition-opacity duration-200
                    ">
                      <button className="
                        w-7 h-7 flex items-center justify-center rounded-lg
                        text-muted-foreground
                        hover:bg-primary/10 hover:text-primary
                        transition-colors duration-150
                      ">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="
                        w-7 h-7 flex items-center justify-center rounded-lg
                        text-muted-foreground
                        hover:bg-sky-500/10 hover:text-sky-400
                        transition-colors duration-150
                      ">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button className="
                        w-7 h-7 flex items-center justify-center rounded-lg
                        text-muted-foreground
                        hover:bg-destructive/10 hover:text-destructive
                        transition-colors duration-150
                      ">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Empty State ── */
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
            <Building className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No organizations found</p>
          <p className="text-[0.78rem] text-muted-foreground">
            Try adjusting your search or add a new organization
          </p>
        </div>
      )}

    </PageWrapper>
  );
}
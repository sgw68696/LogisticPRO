'use client';

import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import {
  Plus, Pencil, Trash2, Package,
  Ruler, Weight, Thermometer,
  Layers, Search, X,
} from 'lucide-react';

type ContainerCategory = 'Dry' | 'Refrigerated' | 'Tank' | 'Flat Rack' | 'Open Top' | 'Bulk';
type TransportMode     = 'Land' | 'Air' | 'Water' | 'Multi-Modal';

interface ContainerType {
  id: string;
  code: string;                // ISO code e.g. 20GP
  name: string;
  category: ContainerCategory;
  modes: TransportMode[];
  lengthFt: number;
  widthFt: number;
  heightFt: number;
  teuEquivalent: number;       // 1 TEU, 2 TEU, 0.5 etc.
  maxPayloadKg: number;
  volumeCBM: number;
  tempRange: string | null;    // null for non-reefer
  status: 'Active' | 'Inactive';
  usageCount: number;          // how many active cargo units use this type
  description: string;
}

const CONTAINER_TYPES: ContainerType[] = [
  {
    id: 'ct-001', code: '20GP', name: '20ft General Purpose',
    category: 'Dry', modes: ['Water', 'Land'],
    lengthFt: 19.5, widthFt: 7.7, heightFt: 7.9,
    teuEquivalent: 1, maxPayloadKg: 28180, volumeCBM: 33.1,
    tempRange: null, status: 'Active', usageCount: 142,
    description: 'Standard 20-foot dry container. Most common unit in global freight.',
  },
  {
    id: 'ct-002', code: '40GP', name: '40ft General Purpose',
    category: 'Dry', modes: ['Water', 'Land'],
    lengthFt: 39.5, widthFt: 7.7, heightFt: 7.9,
    teuEquivalent: 2, maxPayloadKg: 26680, volumeCBM: 67.6,
    tempRange: null, status: 'Active', usageCount: 98,
    description: 'Double-length dry container for high-volume cargo.',
  },
  {
    id: 'ct-003', code: '40HC', name: '40ft High Cube',
    category: 'Dry', modes: ['Water', 'Land'],
    lengthFt: 39.5, widthFt: 7.7, heightFt: 8.9,
    teuEquivalent: 2, maxPayloadKg: 26330, volumeCBM: 76.3,
    tempRange: null, status: 'Active', usageCount: 74,
    description: 'Extra height (9.6ft) for voluminous lightweight cargo.',
  },
  {
    id: 'ct-004', code: '20RF', name: '20ft Refrigerated',
    category: 'Refrigerated', modes: ['Water', 'Land'],
    lengthFt: 17.7, widthFt: 7.5, heightFt: 7.5,
    teuEquivalent: 1, maxPayloadKg: 27400, volumeCBM: 28.3,
    tempRange: '-30°C to +30°C', status: 'Active', usageCount: 36,
    description: 'Temperature-controlled unit for perishables and pharma cargo.',
  },
  {
    id: 'ct-005', code: '40RF', name: '40ft Refrigerated',
    category: 'Refrigerated', modes: ['Water', 'Land'],
    lengthFt: 37.9, widthFt: 7.5, heightFt: 7.5,
    teuEquivalent: 2, maxPayloadKg: 29500, volumeCBM: 59.3,
    tempRange: '-30°C to +30°C', status: 'Active', usageCount: 18,
    description: 'Large reefer unit for high-volume cold-chain shipments.',
  },
  {
    id: 'ct-006', code: '20TK', name: '20ft Tank Container',
    category: 'Tank', modes: ['Water', 'Land'],
    lengthFt: 19.5, widthFt: 7.6, heightFt: 8.2,
    teuEquivalent: 1, maxPayloadKg: 26000, volumeCBM: 21.0,
    tempRange: null, status: 'Active', usageCount: 12,
    description: 'Cylindrical tank for bulk liquids, chemicals and gases.',
  },
  {
    id: 'ct-007', code: '20FR', name: '20ft Flat Rack',
    category: 'Flat Rack', modes: ['Water', 'Land'],
    lengthFt: 19.1, widthFt: 7.4, heightFt: 7.3,
    teuEquivalent: 1, maxPayloadKg: 35000, volumeCBM: 0,
    tempRange: null, status: 'Active', usageCount: 9,
    description: 'Open platform for oversized or heavy cargo like machinery.',
  },
  {
    id: 'ct-008', code: 'ULD-AKE', name: 'ULD Type AKE (Air)',
    category: 'Dry', modes: ['Air'],
    lengthFt: 3.9, widthFt: 4.9, heightFt: 4.0,
    teuEquivalent: 0, maxPayloadKg: 1587, volumeCBM: 4.3,
    tempRange: null, status: 'Active', usageCount: 28,
    description: 'Aviation Unit Load Device for narrow-body aircraft belly holds.',
  },
  {
    id: 'ct-009', code: 'BULK-20', name: '20ft Bulk Container',
    category: 'Bulk', modes: ['Water', 'Land'],
    lengthFt: 19.5, widthFt: 7.7, heightFt: 7.9,
    teuEquivalent: 1, maxPayloadKg: 27000, volumeCBM: 32.0,
    tempRange: null, status: 'Inactive', usageCount: 0,
    description: 'Top-loading container for grains, powders and dry bulk materials.',
  },
];

const CATEGORY_META: Record<ContainerCategory, {
  color: string; bg: string; border: string; icon: typeof Package;
}> = {
  'Dry':          { color: 'text-amber-400',  bg: 'bg-amber-500/10',   border: 'border-amber-500/20',  icon: Package     },
  'Refrigerated': { color: 'text-sky-400',    bg: 'bg-sky-500/10',     border: 'border-sky-500/20',    icon: Thermometer },
  'Tank':         { color: 'text-primary',    bg: 'bg-primary/10',     border: 'border-primary/20',    icon: Layers      },
  'Flat Rack':    { color: 'text-orange-400', bg: 'bg-orange-500/10',  border: 'border-orange-500/20', icon: Ruler       },
  'Open Top':     { color: 'text-violet-400', bg: 'bg-violet-500/10',  border: 'border-violet-500/20', icon: Package     },
  'Bulk':         { color: 'text-teal-400',   bg: 'bg-teal-500/10',    border: 'border-teal-500/20',   icon: Weight      },
};

const MODE_COLORS: Record<TransportMode, string> = {
  'Land':        'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Air':         'bg-sky-500/10   text-sky-400   border-sky-500/20',
  'Water':       'bg-primary/10  text-primary    border-primary/20',
  'Multi-Modal': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

const CATEGORIES: ContainerCategory[] = [
  'Dry', 'Refrigerated', 'Tank', 'Flat Rack', 'Open Top', 'Bulk',
];

export default function ContainerTypesPage() {
  const [types, setTypes]         = useState(CONTAINER_TYPES);
  const [search, setSearch]       = useState('');
  const [catFilter, setCat]       = useState<ContainerCategory | 'all'>('all');

  const filtered = types.filter((t) => {
    const q = search.toLowerCase();
    const matchQ   =
      t.name.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q);
    const matchCat = catFilter === 'all' || t.category === catFilter;
    return matchQ && matchCat;
  });

  const handleDelete = (id: string) =>
    setTypes((prev) => prev.filter((t) => t.id !== id));

  const activeCount = types.filter((t) => t.status === 'Active').length;
  const totalUsage  = types.reduce((s, t) => s + t.usageCount, 0);

  return (
    <PageWrapper
      title="Container Types"
      description="Define and manage cargo container specifications"
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
          New Container Type
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
          { label: 'Total Types',    value: types.length,  pill: 'bg-primary/10 text-primary border-primary/20' },
          { label: 'Active',         value: activeCount,   pill: 'bg-success/10 text-success border-success/20' },
          { label: 'In Use (cargo)', value: totalUsage,    pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
          { label: 'Categories',     value: CATEGORIES.length, pill: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
         ].map(({ label, value, pill }, i) => (
          <React.Fragment key={label}>
            {i > 0 && <div className="w-px h-4 bg-border/50" />}
            <div className="flex items-center gap-2">
              <span className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">
                {label}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[0.72rem] font-bold border ${pill}`}>
                {value}
              </span>
            </div>
          </React.Fragment>
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
              placeholder="Search by name, ISO code or category..."
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

          {/* Category pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setCat('all')}
              className={`
                px-3 py-1.5 rounded-lg text-[0.75rem] font-bold border
                transition-all duration-200
                ${catFilter === 'all'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted/40'}
              `}
            >All</button>
            {CATEGORIES.map((cat) => {
              const m = CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setCat(cat)}
                  className={`
                    px-3 py-1.5 rounded-lg text-[0.75rem] font-bold border
                    transition-all duration-200
                    ${catFilter === cat
                      ? `${m.bg} ${m.color} ${m.border}`
                      : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted/40'}
                  `}
                >{cat}</button>
              );
            })}
            {catFilter !== 'all' && (
              <button
                onClick={() => setCat('all')}
                className="
                  w-7 h-7 flex items-center justify-center
                  bg-destructive/10 border border-destructive/20
                  rounded-lg text-destructive
                  hover:bg-destructive/20 transition-colors duration-150
                "
              ><X size={12} /></button>
            )}
          </div>
        </div>

        {(search || catFilter !== 'all') && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">
            {filtered.length} type{filtered.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* ── Container Type Cards ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((type) => {
            const cat     = CATEGORY_META[type.category];
            const CatIcon = cat.icon;

            return (
              <div
                key={type.id}
                className={`
                  group flex flex-col
                  bg-card border rounded-xl shadow-soft
                  transition-all duration-300
                  hover:border-primary/25
                  hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]
                  hover:-translate-y-0.5
                  ${type.status === 'Inactive' ? 'opacity-60 border-border/40' : 'border-border/60'}
                `}
              >
                {/* ── Card Header ── */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-xl flex-shrink-0 border
                        flex items-center justify-center
                        ${cat.bg} ${cat.border}
                      `}>
                        <CatIcon className={`w-5 h-5 ${cat.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[0.86rem] font-bold font-display text-foreground leading-tight">
                            {type.name}
                          </h3>
                        </div>
                        <span className="
                          text-[0.68rem] font-bold font-mono
                          text-muted-foreground/70 mt-0.5 block
                        ">
                          ISO: {type.code}
                        </span>
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
                      <button
                        onClick={() => handleDelete(type.id)}
                        className="
                          w-7 h-7 flex items-center justify-center rounded-lg
                          text-muted-foreground hover:bg-destructive/10 hover:text-destructive
                          transition-colors duration-150
                        "
                      ><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[0.75rem] text-muted-foreground leading-relaxed mb-4">
                    {type.description}
                  </p>

                  {/* ── Spec Grid ── */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      {
                        icon: Ruler,
                        label: 'Dimensions',
                        value: `${type.lengthFt}×${type.widthFt}×${type.heightFt} ft`,
                      },
                      {
                        icon: Package,
                        label: 'Volume',
                        value: type.volumeCBM > 0 ? `${type.volumeCBM} CBM` : 'Open',
                      },
                      {
                        icon: Weight,
                        label: 'Max Payload',
                        value: `${(type.maxPayloadKg / 1000).toFixed(1)}T`,
                      },
                      {
                        icon: Layers,
                        label: 'TEU',
                        value: type.teuEquivalent > 0 ? `${type.teuEquivalent} TEU` : 'N/A',
                      },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="
                        flex items-center gap-2 px-3 py-2
                        bg-muted/20 border border-border/30 rounded-lg
                      ">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[0.65rem] text-muted-foreground/60 uppercase tracking-wide font-bold">
                            {label}
                          </p>
                          <p className="text-[0.78rem] font-bold text-foreground font-mono">
                            {value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Temp range — only for reefer */}
                  {type.tempRange && (
                    <div className="
                      flex items-center gap-2 px-3 py-2 mb-4
                      bg-sky-500/5 border border-sky-500/20 rounded-lg
                    ">
                      <Thermometer className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                      <span className="text-[0.75rem] font-semibold text-sky-400">
                        Temp Range: {type.tempRange}
                      </span>
                    </div>
                  )}

                  {/* Transport modes */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {type.modes.map((mode) => (
                      <span key={mode} className={`
                        px-2 py-0.5 rounded-md text-[0.68rem] font-bold border
                        ${MODE_COLORS[mode]}
                      `}>{mode}</span>
                    ))}
                  </div>
                </div>

                {/* ── Card Footer ── */}
                <div className="
                  mt-auto border-t border-border/40 px-5 py-3
                  bg-muted/10 flex items-center justify-between
                ">
                  {/* Usage bar */}
                  <div className="flex-1 mr-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[0.65rem] text-muted-foreground/60 uppercase tracking-wide font-bold">
                        Active Cargo Units
                      </span>
                      <span className={`text-[0.68rem] font-bold ${cat.color}`}>
                        {type.usageCount}
                      </span>
                    </div>
                    <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${cat.bg.replace('/10', '/60')}`}
                        style={{ width: `${Math.min((type.usageCount / 160) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Status pill */}
                  <span className={`
                    flex-shrink-0 inline-flex items-center gap-1.5
                    px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold border
                    ${type.status === 'Active'
                      ? 'bg-success/10 text-success border-success/20'
                      : 'bg-muted/50 text-muted-foreground border-border/40'}
                  `}>
                    <span className={`w-1.5 h-1.5 rounded-full ${type.status === 'Active' ? 'bg-success' : 'bg-muted-foreground'}`} />
                    {type.status}
                  </span>
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
            <Package className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No container types found</p>
          <p className="text-[0.78rem] text-muted-foreground">
            Try adjusting your search or add a new container type
          </p>
        </div>
      )}

    </PageWrapper>
  );
}
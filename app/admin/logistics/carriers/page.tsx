'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import {
  Plus, Search, Eye, Edit, Trash2,
  Truck, Plane, Ship, Globe,
  MapPin, Phone, Mail, Package,
  SlidersHorizontal, X,
} from 'lucide-react';
import { mockCompanies } from '@/data/mockData';
import type { Company } from '@/data/mockData';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';

type TransportMode = 'Land' | 'Air' | 'Water' | 'Multi-Modal';
type CarrierStatus = 'Active' | 'Pending' | 'Suspended' | 'Inactive';

interface Carrier {
  id: string;
  name: string;
  code: string;
  mode: TransportMode;
  status: CarrierStatus;
  country: string;
  city: string;
  contactPerson: string;
  phone: string;
  email: string;
  fleetSize: number;
  activeRoutes: number;
  totalShipments: number;
  companyId: string | null;
  licenseNumber: string;
  licenseExpiry: string;
}

const MOCK_CARRIERS: Carrier[] = [
  {
    id: 'car-001', name: 'TechLogistics Land Express', code: 'TLE',
    mode: 'Land', status: 'Active', country: 'India', city: 'Bangalore',
    contactPerson: 'Rajesh Kumar', phone: '+91 9876543210',
    email: 'ops@techlogistics.com', fleetSize: 48, activeRoutes: 12,
    totalShipments: 4320, companyId: 'cmp-001',
    licenseNumber: 'MH-TRK-2021-0012', licenseExpiry: '2026-12-31',
  },
  {
    id: 'car-002', name: 'SkyFreight India', code: 'SFI',
    mode: 'Air', status: 'Active', country: 'India', city: 'Delhi',
    contactPerson: 'Priya Sharma', phone: '+91 8765432109',
    email: 'cargo@skyfreight.in', fleetSize: 4, activeRoutes: 6,
    totalShipments: 1870, companyId: 'cmp-001',
    licenseNumber: 'DGCA-AIR-2020-0045', licenseExpiry: '2025-12-31',
  },
  {
    id: 'car-003', name: 'OceanRoute Carriers', code: 'ORC',
    mode: 'Water', status: 'Active', country: 'India', city: 'Mumbai',
    contactPerson: 'Amit Patel', phone: '+91 7654321098',
    email: 'fleet@oceanroute.com', fleetSize: 3, activeRoutes: 4,
    totalShipments: 920, companyId: 'cmp-001',
    licenseNumber: 'MMD-VES-2019-0078', licenseExpiry: '2027-06-30',
  },
  {
    id: 'car-004', name: 'Global Express Cargo', code: 'GEC',
    mode: 'Multi-Modal', status: 'Pending', country: 'India', city: 'Hyderabad',
    contactPerson: 'Sunita Reddy', phone: '+91 6543210987',
    email: 'contact@globalexpress.com', fleetSize: 22, activeRoutes: 0,
    totalShipments: 0, companyId: 'cmp-002',
    licenseNumber: 'AP-LOG-2024-0031', licenseExpiry: '2027-03-15',
  },
  {
    id: 'car-005', name: 'Indore Road Masters', code: 'IRM',
    mode: 'Land', status: 'Active', country: 'India', city: 'Indore',
    contactPerson: 'Vijay Verma', phone: '+91 5432109876',
    email: 'dispatch@roadmasters.in', fleetSize: 31, activeRoutes: 9,
    totalShipments: 2140, companyId: null,
    licenseNumber: 'MP-TRK-2022-0055', licenseExpiry: '2026-08-20',
  },
  {
    id: 'car-006', name: 'CoastalWave Shipping', code: 'CWS',
    mode: 'Water', status: 'Suspended', country: 'India', city: 'Chennai',
    contactPerson: 'Karthik Iyer', phone: '+91 4321098765',
    email: 'ops@coastalwave.com', fleetSize: 2, activeRoutes: 0,
    totalShipments: 340, companyId: null,
    licenseNumber: 'TN-VES-2018-0014', licenseExpiry: '2025-03-31',
  },
];

// ── Config maps ──
const MODE_META: Record<TransportMode, {
  icon: typeof Truck; color: string;
  bg: string; border: string; label: string;
}> = {
  'Land':        { icon: Truck,  color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  label: 'Land' },
  'Air':         { icon: Plane,  color: 'text-sky-400',    bg: 'bg-sky-500/10',    border: 'border-sky-500/20',    label: 'Air'  },
  'Water':       { icon: Ship,   color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/20',    label: 'Water' },
  'Multi-Modal': { icon: Globe,  color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', label: 'Multi' },
};

const STATUS_META: Record<CarrierStatus, { pill: string; dot: string }> = {
  Active:    { pill: 'bg-success/10 text-success border-success/20',               dot: 'bg-success'          },
  Pending:   { pill: 'bg-warning/10 text-warning border-warning/20',               dot: 'bg-warning'          },
  Suspended: { pill: 'bg-destructive/10 text-destructive border-destructive/20',   dot: 'bg-destructive'      },
  Inactive:  { pill: 'bg-muted/50 text-muted-foreground border-border/40',         dot: 'bg-muted-foreground' },
};

const isExpiringSoon = (dateStr: string) => {
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000; // within 90 days
};
const isExpired = (dateStr: string) => new Date(dateStr).getTime() < Date.now();

export default function CarriersPage() {
  const [search, setSearch]       = useState('');
  const [modeFilter, setMode]     = useState<TransportMode | 'all'>('all');
  const [statusFilter, setStatus] = useState<CarrierStatus | 'all'>('all');
  const [carriers, setCarriers]   = useState(MOCK_CARRIERS);

  const filtered = carriers.filter((c) => {
    const q = search.toLowerCase();
    const matchQ =
      c.name.toLowerCase().includes(q)  ||
      c.code.toLowerCase().includes(q)  ||
      c.city.toLowerCase().includes(q)  ||
      c.contactPerson.toLowerCase().includes(q);
    const matchMode   = modeFilter   === 'all' || c.mode   === modeFilter;
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchQ && matchMode && matchStatus;
  });

  const handleDelete = (id: string) =>
    setCarriers((prev) => prev.filter((c) => c.id !== id));

  const activeCount    = carriers.filter((c) => c.status === 'Active').length;
  const totalFleet     = carriers.reduce((s, c) => s + c.fleetSize, 0);
  const totalShipments = carriers.reduce((s, c) => s + c.totalShipments, 0);

  return (
    <PageWrapper
      title="Carriers"
      description="Manage transport carriers across all modes"
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
          Add Carrier
        </button>
      }
    >

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total Carriers', value: carriers.length,
            sub: `${activeCount} active`,
            icon: Globe, iconCls: 'text-primary bg-primary/10 border-primary/20',
            pill: 'bg-primary/10 text-primary border-primary/20',
          },
          {
            label: 'Total Fleet', value: totalFleet,
            sub: 'vehicles / vessels',
            icon: Truck, iconCls: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          },
          {
            label: 'Active Routes',
            value: carriers.reduce((s, c) => s + c.activeRoutes, 0),
            sub: 'currently running',
            icon: MapPin, iconCls: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
            pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          },
          {
            label: 'Total Shipments',
            value: totalShipments.toLocaleString(),
            sub: 'all time',
            icon: Package, iconCls: 'text-success bg-success/10 border-success/20',
            pill: 'bg-success/10 text-success border-success/20',
          },
        ].map(({ label, value, sub, icon: Icon, iconCls, pill }) => (
          <div key={label} className="
            bg-card border border-border/60 rounded-xl
            px-5 py-4 shadow-soft flex items-center gap-4
          ">
            <div className={`w-10 h-10 rounded-xl flex-shrink-0 border flex items-center justify-center ${iconCls}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">
                {label}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-bold font-display text-foreground">{value}</span>
                <span className={`px-2 py-0.5 rounded-full text-[0.68rem] font-bold border ${pill}`}>
                  {sub}
                </span>
              </div>
            </div>
          </div>
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
              placeholder="Search by name, code, city or contact..."
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

          {/* Mode filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={13} className="text-muted-foreground shrink-0" />
            <Select value={modeFilter} onValueChange={(v) => setMode(v as typeof modeFilter)}>
              <SelectTrigger className="w-[150px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0">
                <SelectValue placeholder="All Modes" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all"        className="text-[0.82rem]">All Modes</SelectItem>
                <SelectItem value="Land"       className="text-[0.82rem]">Land</SelectItem>
                <SelectItem value="Air"        className="text-[0.82rem]">Air</SelectItem>
                <SelectItem value="Water"      className="text-[0.82rem]">Water</SelectItem>
                <SelectItem value="Multi-Modal"className="text-[0.82rem]">Multi-Modal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatus(v as typeof statusFilter)}>
              <SelectTrigger className="w-[150px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all"       className="text-[0.82rem]">All Statuses</SelectItem>
                <SelectItem value="Active"    className="text-[0.82rem]">Active</SelectItem>
                <SelectItem value="Pending"   className="text-[0.82rem]">Pending</SelectItem>
                <SelectItem value="Suspended" className="text-[0.82rem]">Suspended</SelectItem>
                <SelectItem value="Inactive"  className="text-[0.82rem]">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {(modeFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => { setMode('all'); setStatus('all'); }}
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

        {/* Result count */}
        {(search || modeFilter !== 'all' || statusFilter !== 'all') && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">
            {filtered.length} carrier{filtered.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* ── Carrier Cards ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((carrier) => {
            const mode      = MODE_META[carrier.mode];
            const status    = STATUS_META[carrier.status];
            const ModeIcon  = mode.icon;
            const expired   = isExpired(carrier.licenseExpiry);
            const expiring  = !expired && isExpiringSoon(carrier.licenseExpiry);
            const company   = mockCompanies.find((c: Company) => c.id === carrier.companyId);

            return (
              <div
                key={carrier.id}
                className="
                  group bg-card border border-border/60
                  rounded-xl shadow-soft overflow-hidden
                  transition-all duration-300
                  hover:border-primary/25
                  hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]
                  hover:-translate-y-0.5
                "
              >
                {/* ── Header ── */}
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    {/* Mode icon */}
                    <div className={`
                      w-11 h-11 rounded-xl flex-shrink-0 border
                      flex items-center justify-center
                      ${mode.bg} ${mode.border}
                    `}>
                      <ModeIcon className={`w-5 h-5 ${mode.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[0.88rem] font-bold font-display text-foreground leading-tight truncate">
                              {carrier.name}
                            </h3>
                            <span className="
                              flex-shrink-0 px-1.5 py-0.5 rounded
                              bg-muted/40 border border-border/40
                              text-[0.65rem] font-bold font-mono text-muted-foreground
                            ">
                              {carrier.code}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <MapPin className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                            <span className="text-[0.75rem] text-muted-foreground">
                              {carrier.city}, {carrier.country}
                            </span>
                          </div>
                        </div>

                        {/* Status + hover actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`
                            inline-flex items-center gap-1.5
                            px-2.5 py-0.5 rounded-full
                            text-[0.70rem] font-bold border
                            ${status.pill}
                          `}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {carrier.status}
                          </span>

                          <div className="
                            flex items-center gap-0.5
                            opacity-0 group-hover:opacity-100
                            transition-opacity duration-200
                          ">
                            <button className="
                              w-7 h-7 flex items-center justify-center rounded-lg
                              text-muted-foreground hover:bg-primary/10 hover:text-primary
                              transition-colors duration-150
                            "><Eye className="w-3.5 h-3.5" /></button>
                            <button className="
                              w-7 h-7 flex items-center justify-center rounded-lg
                              text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400
                              transition-colors duration-150
                            "><Edit className="w-3.5 h-3.5" /></button>
                            <button
                              onClick={() => handleDelete(carrier.id)}
                              className="
                                w-7 h-7 flex items-center justify-center rounded-lg
                                text-muted-foreground hover:bg-destructive/10 hover:text-destructive
                                transition-colors duration-150
                              "
                            ><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>

                      {/* Mode + company badges */}
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <span className={`
                          inline-flex items-center gap-1
                          px-2 py-0.5 rounded-md text-[0.70rem] font-bold
                          ${mode.bg} ${mode.color} ${mode.border}
                        `}>
                          <ModeIcon className="w-3 h-3" />
                          {carrier.mode}
                        </span>
                        {company && (
                          <span className="
                            inline-flex items-center gap-1
                            px-2 py-0.5 rounded-md text-[0.70rem] font-semibold
                            bg-muted/40 border border-border/40 text-muted-foreground
                          ">
                            {company.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Stats row ── */}
                  <div className="
                    grid grid-cols-3 gap-3 mt-4
                    pt-4 border-t border-border/30
                  ">
                    {[
                      { label: 'Fleet Size',      value: carrier.fleetSize,                      color: mode.color   },
                      { label: 'Active Routes',   value: carrier.activeRoutes,                   color: 'text-success' },
                      { label: 'Total Shipments', value: carrier.totalShipments.toLocaleString(), color: 'text-foreground' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="text-center">
                        <p className={`text-[1.1rem] font-bold font-display ${color}`}>{value}</p>
                        <p className="text-[0.68rem] text-muted-foreground/60 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Footer: contact + license ── */}
                <div className="
                  border-t border-border/40 px-5 py-3
                  bg-muted/10 flex items-center justify-between gap-4
                ">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                        <span className="text-[0.72rem] text-muted-foreground truncate">
                          {carrier.contactPerson} · {carrier.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                        <span className="text-[0.72rem] text-muted-foreground truncate">
                          {carrier.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* License validity */}
                  <div className={`
                    flex-shrink-0 inline-flex items-center gap-1.5
                    px-2.5 py-1 rounded-lg text-[0.68rem] font-bold border
                    ${expired
                      ? 'bg-destructive/10 text-destructive border-destructive/20'
                      : expiring
                        ? 'bg-warning/10 text-warning border-warning/20'
                        : 'bg-muted/30 text-muted-foreground border-border/40'}
                  `}>
                    {expired ? '⚠ License Expired' : expiring ? '⚠ Expiring Soon' : '✓ Licensed'}
                    <span className="font-mono opacity-80">
                      {new Date(carrier.licenseExpiry).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: '2-digit',
                      })}
                    </span>
                  </div>
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
            <Truck className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-[0.88rem] font-semibold text-foreground">No carriers found</p>
          <p className="text-[0.78rem] text-muted-foreground">
            Try adjusting your filters or add a new carrier
          </p>
        </div>
      )}

    </PageWrapper>
  );
}
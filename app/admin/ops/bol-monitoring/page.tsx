'use client';

import { useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockCargo, mockShipments } from '@/data/mockData';
import {
  Search, Eye, Download, SlidersHorizontal,
  FileText, Ship, Truck, Plane,
  CheckCircle, Clock, AlertTriangle,
  XCircle, RotateCcw, X, Plus,
  Calendar, Hash, Building2, Stamp,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

type BOLStatus   = 'Draft' | 'Issued' | 'In Transit' | 'Surrendered' | 'Expired' | 'Disputed';
type BOLType     = 'Straight' | 'Order' | 'Bearer' | 'Seaway Bill';
type TransportMode = 'Land' | 'Air' | 'Water';

interface BOLRecord {
  id: string;
  bolNumber: string;
  type: BOLType;
  status: BOLStatus;
  mode: TransportMode;
  cargoId: string | null;
  shipmentId: string | null;
  shipper: string;
  consignee: string;
  notifyParty: string;
  portOfLoading: string;
  portOfDischarge: string;
  vessel: string;
  voyageNumber: string;
  issueDate: string;
  expiryDate: string | null;
  goodsDescription: string;
  grossWeightKg: number;
  packages: number;
  freightTerms: 'Prepaid' | 'Collect' | 'As Arranged';
  originalCopies: number;
  issuedBy: string;
  flags: { late: boolean; disputed: boolean; nearExpiry: boolean };
}

// ── Generate BOLs from mockCargo + mockShipments ──
const MOCK_BOLS: BOLRecord[] = [
  {
    id: 'bol-001', bolNumber: 'BOL-2025-MUM-0001',
    type: 'Order', status: 'In Transit', mode: 'Water',
    cargoId: 'cargo-001', shipmentId: null,
    shipper: 'Tech Exports Ltd',
    consignee: 'Global Tech Imports',
    notifyParty: 'Singapore Customs Authority',
    portOfLoading: 'Mumbai (INBOM)',
    portOfDischarge: 'Singapore (SGSIN)',
    vessel: 'TechCargo Express', voyageNumber: 'TCE-2025-004',
    issueDate: '2025-01-10', expiryDate: '2025-04-10',
    goodsDescription: 'Electronics — Laptops & Mobile Devices (250 pkgs)',
    grossWeightKg: 15000, packages: 250,
    freightTerms: 'Prepaid', originalCopies: 3,
    issuedBy: 'JNPA Shipping Agent',
    flags: { late: false, disputed: false, nearExpiry: false },
  },
  {
    id: 'bol-002', bolNumber: 'BOL-2025-BLR-0002',
    type: 'Straight', status: 'Issued', mode: 'Air',
    cargoId: 'cargo-002', shipmentId: null,
    shipper: 'Pharma Industries Ltd',
    consignee: 'Medical Supplies Co',
    notifyParty: 'Dubai Health Authority',
    portOfLoading: 'Bangalore Airport (INBLR)',
    portOfDischarge: 'Dubai Airport (OMDXB)',
    vessel: 'VT-ABC Boeing 737F', voyageNumber: 'SFI-2025-018',
    issueDate: '2025-01-12', expiryDate: '2025-02-12',
    goodsDescription: 'Pharmaceutical — Temperature Controlled Medicine (50 boxes)',
    grossWeightKg: 2500, packages: 50,
    freightTerms: 'Collect', originalCopies: 2,
    issuedBy: 'Bangalore Airport Cargo',
    flags: { late: false, disputed: false, nearExpiry: true },
  },
  {
    id: 'bol-003', bolNumber: 'BOL-2025-DEL-0003',
    type: 'Order', status: 'Surrendered', mode: 'Water',
    cargoId: null, shipmentId: mockShipments[0]?.id ?? null,
    shipper: 'TechLogistics India',
    consignee: 'Metro Supplies',
    notifyParty: 'N/A',
    portOfLoading: 'Delhi (INDEL)',
    portOfDischarge: 'Kolkata (INCCU)',
    vessel: 'IndianOcean Carrier', voyageNumber: 'IOC-2025-007',
    issueDate: '2025-01-05', expiryDate: null,
    goodsDescription: 'Bulk Consumer Goods — Mixed Cargo',
    grossWeightKg: 42000, packages: 1200,
    freightTerms: 'Prepaid', originalCopies: 3,
    issuedBy: 'Kolkata Dock Agent',
    flags: { late: false, disputed: false, nearExpiry: false },
  },
  {
    id: 'bol-004', bolNumber: 'BOL-2025-MUM-0004',
    type: 'Bearer', status: 'Disputed', mode: 'Water',
    cargoId: null, shipmentId: null,
    shipper: 'Global Express Cargo',
    consignee: 'Prime Distributors',
    notifyParty: 'State Bank of India',
    portOfLoading: 'Mumbai (INBOM)',
    portOfDischarge: 'Chennai (INMAA)',
    vessel: 'TechCargo Express', voyageNumber: 'TCE-2025-002',
    issueDate: '2024-12-20', expiryDate: '2025-03-20',
    goodsDescription: 'Automotive Parts — Steel Components',
    grossWeightKg: 28000, packages: 340,
    freightTerms: 'As Arranged', originalCopies: 3,
    issuedBy: 'Mumbai Freight Broker',
    flags: { late: true, disputed: true, nearExpiry: false },
  },
  {
    id: 'bol-005', bolNumber: 'BOL-2024-HYD-0005',
    type: 'Seaway Bill', status: 'Expired', mode: 'Air',
    cargoId: null, shipmentId: null,
    shipper: 'Pharma Industries Ltd',
    consignee: 'Gulf Medical Center',
    notifyParty: 'N/A',
    portOfLoading: 'Hyderabad Airport (INHYD)',
    portOfDischarge: 'Abu Dhabi (OMAUH)',
    vessel: 'VT-XYZ Airbus A330F', voyageNumber: 'SFI-2024-099',
    issueDate: '2024-10-01', expiryDate: '2024-12-31',
    goodsDescription: 'Medical Equipment — Diagnostic Devices',
    grossWeightKg: 1800, packages: 32,
    freightTerms: 'Prepaid', originalCopies: 1,
    issuedBy: 'Hyderabad Airport Cargo',
    flags: { late: true, disputed: false, nearExpiry: false },
  },
  {
    id: 'bol-006', bolNumber: 'BOL-2025-BLR-0006',
    type: 'Straight', status: 'Draft', mode: 'Land',
    cargoId: null, shipmentId: mockShipments[2]?.id ?? null,
    shipper: 'Sunrise Industries',
    consignee: 'City Mart',
    notifyParty: 'N/A',
    portOfLoading: 'Bangalore Depot',
    portOfDischarge: 'Pune Distribution Hub',
    vessel: 'MH 12 AB 1234 — Tata 407', voyageNumber: 'TLE-2025-031',
    issueDate: '2025-01-14', expiryDate: '2025-07-14',
    goodsDescription: 'Consumer Electronics — Mixed Retail Goods',
    grossWeightKg: 3200, packages: 88,
    freightTerms: 'Collect', originalCopies: 2,
    issuedBy: 'TechLogistics Road Ops',
    flags: { late: false, disputed: false, nearExpiry: false },
  },
];

// ── Config ──
const STATUS_META: Record<BOLStatus, { pill: string; dot: string; icon: typeof Clock }> = {
  Draft:       { pill: 'bg-muted/50 text-muted-foreground border-border/40',       dot: 'bg-muted-foreground', icon: FileText    },
  Issued:      { pill: 'bg-primary/10 text-primary border-primary/20',             dot: 'bg-primary',          icon: Stamp       },
  'In Transit':{ pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20',             dot: 'bg-sky-400',          icon: Clock       },
  Surrendered: { pill: 'bg-success/10 text-success border-success/20',             dot: 'bg-success',          icon: CheckCircle },
  Expired:     { pill: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive',      icon: XCircle     },
  Disputed:    { pill: 'bg-warning/10 text-warning border-warning/20',             dot: 'bg-warning',          icon: AlertTriangle},
};

const TYPE_META: Record<BOLType, string> = {
  'Straight':   'bg-primary/10 text-primary border-primary/20',
  'Order':      'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Bearer':     'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Seaway Bill':'bg-sky-500/10 text-sky-400 border-sky-500/20',
};

const MODE_META: Record<TransportMode, { icon: typeof Truck; color: string; bg: string; border: string }> = {
  Land:  { icon: Truck,  color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  Air:   { icon: Plane,  color: 'text-sky-400',   bg: 'bg-sky-500/10',   border: 'border-sky-500/20'   },
  Water: { icon: Ship,   color: 'text-primary',   bg: 'bg-primary/10',   border: 'border-primary/20'   },
};

const FREIGHT_STYLE: Record<string, string> = {
  Prepaid:      'bg-success/10 text-success border-success/20',
  Collect:      'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'As Arranged':'bg-muted/40 text-muted-foreground border-border/40',
};

const BOL_STATUSES: BOLStatus[] = ['Draft', 'Issued', 'In Transit', 'Surrendered', 'Expired', 'Disputed'];
const BOL_TYPES:    BOLType[]   = ['Straight', 'Order', 'Bearer', 'Seaway Bill'];

export default function BOLMonitoringPage() {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState<BOLStatus | 'all'>('all');
  const [typeFilter, setType]     = useState<BOLType   | 'all'>('all');
  const [modeFilter, setMode]     = useState<TransportMode | 'all'>('all');

  const kpi = useMemo(() => ({
    total:      MOCK_BOLS.length,
    issued:     MOCK_BOLS.filter((b) => b.status === 'Issued' || b.status === 'In Transit').length,
    surrendered:MOCK_BOLS.filter((b) => b.status === 'Surrendered').length,
    disputed:   MOCK_BOLS.filter((b) => b.status === 'Disputed').length,
    expired:    MOCK_BOLS.filter((b) => b.status === 'Expired').length,
  }), []);

  const filtered = useMemo(() => MOCK_BOLS.filter((b) => {
    const q = search.toLowerCase();
    const matchQ =
      b.bolNumber.toLowerCase().includes(q)       ||
      b.shipper.toLowerCase().includes(q)         ||
      b.consignee.toLowerCase().includes(q)       ||
      b.vessel.toLowerCase().includes(q)          ||
      b.portOfLoading.toLowerCase().includes(q)   ||
      b.portOfDischarge.toLowerCase().includes(q) ||
      b.goodsDescription.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchType   = typeFilter   === 'all' || b.type   === typeFilter;
    const matchMode   = modeFilter   === 'all' || b.mode   === modeFilter;
    return matchQ && matchStatus && matchType && matchMode;
  }), [search, statusFilter, typeFilter, modeFilter]);

  const hasFilters = search || statusFilter !== 'all' || typeFilter !== 'all' || modeFilter !== 'all';
  const clearFilters = () => { setSearch(''); setStatus('all'); setType('all'); setMode('all'); };

  return (
    <PageWrapper
      title="BOL Monitoring"
      description="Track and manage Bills of Lading across all shipments"
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
          New BOL
        </button>
      }
    >

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total BOLs',  value: kpi.total,       icon: FileText,      pill: 'bg-primary/10 text-primary border-primary/20'             },
          { label: 'Active',      value: kpi.issued,      icon: Clock,         pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20'             },
          { label: 'Surrendered', value: kpi.surrendered, icon: CheckCircle,   pill: 'bg-success/10 text-success border-success/20'             },
          { label: 'Disputed',    value: kpi.disputed,    icon: AlertTriangle, pill: 'bg-warning/10 text-warning border-warning/20'             },
          { label: 'Expired',     value: kpi.expired,     icon: XCircle,       pill: 'bg-destructive/10 text-destructive border-destructive/20' },
        ].map(({ label, value, icon: Icon, pill }) => (
          <div key={label} className="
            bg-card border border-border/60 rounded-xl
            px-4 py-3.5 shadow-soft flex items-center gap-3
          ">
            <div className={`w-9 h-9 rounded-lg flex-shrink-0 border flex items-center justify-center ${pill}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
              <p className="text-[1.3rem] font-black font-display text-foreground leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search BOL #, shipper, consignee, vessel or port..."
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

          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={13} className="text-muted-foreground shrink-0" />

            <Select value={statusFilter} onValueChange={(v) => setStatus(v as typeof statusFilter)}>
              <SelectTrigger className="w-[140px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all" className="text-[0.82rem]">All Statuses</SelectItem>
                {BOL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="text-[0.82rem]">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(v) => setType(v as typeof typeFilter)}>
              <SelectTrigger className="w-[140px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all" className="text-[0.82rem]">All Types</SelectItem>
                {BOL_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="text-[0.82rem]">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={modeFilter} onValueChange={(v) => setMode(v as typeof modeFilter)}>
              <SelectTrigger className="w-[120px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:ring-0">
                <SelectValue placeholder="All Modes" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all"   className="text-[0.82rem]">All Modes</SelectItem>
                <SelectItem value="Land"  className="text-[0.82rem]">Land</SelectItem>
                <SelectItem value="Air"   className="text-[0.82rem]">Air</SelectItem>
                <SelectItem value="Water" className="text-[0.82rem]">Water</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="
                  flex items-center gap-1.5 px-2.5 h-9
                  bg-destructive/10 border border-destructive/20
                  rounded-[9px] text-[0.78rem] font-semibold text-destructive
                  hover:bg-destructive/20 transition-colors duration-150
                "
              >
                <RotateCcw size={12} />
                Clear
              </button>
            )}
          </div>
        </div>

        {hasFilters && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">
            {filtered.length} of {MOCK_BOLS.length} BOL{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ── BOL Table ── */}
      <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20">
                {['BOL Number', 'Type / Mode', 'Parties', 'Route', 'Vessel', 'Issued', 'Freight', 'Status', ''].map((h, i) => (
                  <th
                    key={h || i}
                    className={`
                      px-4 py-3.5
                      text-[0.70rem] font-bold text-muted-foreground
                      uppercase tracking-widest whitespace-nowrap
                      ${i === 8 ? 'text-right pr-5' : 'text-left'}
                    `}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/25">
              {filtered.length > 0 ? filtered.map((bol) => {
                const statusMeta = STATUS_META[bol.status];
                const typeCls    = TYPE_META[bol.type];
                const modeMeta   = MODE_META[bol.mode];
                const ModeIcon   = modeMeta.icon;
                const StatusIcon = statusMeta.icon;

                return (
                  <tr
                    key={bol.id}
                    className={`
                      group transition-colors duration-150
                      hover:bg-primary/[0.03]
                      ${bol.flags.disputed ? 'bg-warning/[0.02]' :
                        bol.status === 'Expired' ? 'bg-destructive/[0.02]' : ''}
                    `}
                  >

                    {/* BOL Number */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-start gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[0.82rem] font-bold font-mono text-foreground">
                              {bol.bolNumber}
                            </span>
                            {bol.flags.disputed && (
                              <span className="
                                inline-flex items-center gap-0.5 px-1.5 py-0.5
                                bg-warning/10 text-warning border border-warning/20
                                rounded-full text-[0.60rem] font-bold
                              ">
                                <AlertTriangle className="w-2 h-2" />
                                Disputed
                              </span>
                            )}
                            {bol.flags.nearExpiry && (
                              <span className="
                                inline-flex items-center gap-0.5 px-1.5 py-0.5
                                bg-amber-500/10 text-amber-400 border border-amber-500/20
                                rounded-full text-[0.60rem] font-bold
                              ">
                                <Clock className="w-2 h-2" />
                                Expiring
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Hash className="w-2.5 h-2.5 text-muted-foreground/40" />
                            <span className="text-[0.68rem] text-muted-foreground/60 font-mono">
                              {bol.originalCopies} originals
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type / Mode */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1.5">
                        <span className={`
                          inline-flex items-center px-2 py-0.5
                          rounded-md text-[0.68rem] font-bold border
                          ${typeCls} w-fit
                        `}>
                          {bol.type}
                        </span>
                        <span className={`
                          inline-flex items-center gap-1 px-2 py-0.5
                          rounded-md text-[0.68rem] font-bold border w-fit
                          ${modeMeta.bg} ${modeMeta.color} ${modeMeta.border}
                        `}>
                          <ModeIcon className="w-2.5 h-2.5" />
                          {bol.mode}
                        </span>
                      </div>
                    </td>

                    {/* Parties */}
                    <td className="px-4 py-3.5 max-w-[160px]">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-2.5 h-2.5 text-muted-foreground/40 flex-shrink-0" />
                          <span className="text-[0.75rem] font-semibold text-foreground truncate">
                            {bol.shipper}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-2.5 flex-shrink-0" />
                          <span className="text-[0.70rem] text-muted-foreground truncate">
                            → {bol.consignee}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Route */}
                    <td className="px-4 py-3.5 max-w-[180px]">
                      <div className="flex items-center gap-1 text-[0.72rem] text-muted-foreground">
                        <span className="truncate max-w-[80px]">{bol.portOfLoading}</span>
                        <span className="text-muted-foreground/40 flex-shrink-0">→</span>
                        <span className="truncate max-w-[80px]">{bol.portOfDischarge}</span>
                      </div>
                    </td>

                    {/* Vessel */}
                    <td className="px-4 py-3.5 max-w-[160px]">
                      <p className="text-[0.75rem] text-foreground/80 truncate">{bol.vessel}</p>
                      <p className="text-[0.68rem] text-muted-foreground/60 font-mono mt-0.5">
                        {bol.voyageNumber}
                      </p>
                    </td>

                    {/* Issue / Expiry */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                        <span className="text-[0.75rem] text-muted-foreground">
                          {formatDate(bol.issueDate)}
                        </span>
                      </div>
                      {bol.expiryDate && (
                        <p className={`text-[0.68rem] mt-0.5 ${
                          bol.flags.nearExpiry ? 'text-amber-400 font-semibold' :
                          bol.status === 'Expired' ? 'text-destructive font-semibold' :
                          'text-muted-foreground/60'
                        }`}>
                          Exp: {formatDate(bol.expiryDate)}
                        </p>
                      )}
                    </td>

                    {/* Freight terms */}
                    <td className="px-4 py-3.5">
                      <span className={`
                        inline-flex items-center px-2 py-0.5
                        rounded-md text-[0.68rem] font-bold border
                        ${FREIGHT_STYLE[bol.freightTerms]}
                      `}>
                        {bol.freightTerms}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={`
                        inline-flex items-center gap-1.5
                        px-2.5 py-0.5 rounded-full
                        text-[0.70rem] font-bold border
                        ${statusMeta.pill}
                      `}>
                        <StatusIcon className="w-3 h-3" />
                        {bol.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 pr-5">
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
                          hover:bg-success/10 hover:text-success
                          transition-colors duration-150
                        ">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="
                        w-12 h-12 rounded-full bg-muted/40 border border-border/50
                        flex items-center justify-center
                      ">
                        <FileText className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                      <p className="text-[0.88rem] font-semibold text-foreground">No BOLs found</p>
                      <p className="text-[0.78rem] text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="
          px-5 py-3.5 border-t border-border/40
          flex items-center justify-between
          bg-muted/10
        ">
          <div className="flex items-center gap-4">
            {/* Legend */}
            {[
              { label: 'Disputed', cls: 'bg-warning/60' },
              { label: 'Expiring Soon', cls: 'bg-amber-400/60' },
              { label: 'Expired', cls: 'bg-destructive/60' },
            ].map(({ label, cls }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${cls}`} />
                <span className="text-[0.70rem] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
          <span className="text-[0.72rem] text-muted-foreground">
            {filtered.length} of {MOCK_BOLS.length} records
          </span>
        </div>
      </div>

    </PageWrapper>
  );
}
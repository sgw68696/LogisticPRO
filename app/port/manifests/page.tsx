'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  FileText, Search, Package, CheckCircle2, AlertTriangle, Clock,
  Eye, Edit, Trash2, X, Ship, Download, Upload, Printer, Shield,
  Anchor, Dock, ArrowRight, MapPin, CalendarDays, Layers,
} from 'lucide-react';

type ManifestStatus = 'Filed' | 'Pending' | 'Amended' | 'Approved' | 'Rejected';
type DeclarationType = 'Import' | 'Export' | 'Transshipment';

interface ManifestItem {
  id: string;
  manifest: string;
  vessel: string;
  voyage: string;
  type: DeclarationType;
  origin: string;
  destination: string;
  eta: string;
  containers: number;
  totalWeight: string;
  status: ManifestStatus;
  filedDate: string;
  filedBy: string;
  customsRef: string;
  hazmatCount: number;
  reeferCount: number;
  notes: string;
}

const STATUS_META: Record<ManifestStatus, { pill: string; dot: string }> = {
  Filed: { pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' },
  Pending: { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  Amended: { pill: 'bg-violet-500/10 text-violet-400 border-violet-500/20', dot: 'bg-violet-400' },
  Approved: { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  Rejected: { pill: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
};

const manifests: ManifestItem[] = [
  { id: 'MFT-001', manifest: 'MFT-2026-0421', vessel: 'CMA CGM ALTAMIRA', voyage: 'CNYTN-ALT-2026', type: 'Import', origin: 'Yantian, CN', destination: 'Le Havre, FR', eta: '13 May 08:15', containers: 34, totalWeight: '421,600 kg', status: 'Approved', filedDate: '10 May 2026', filedBy: 'Jean Dupont', customsRef: 'CUS-2026-8841', hazmatCount: 2, reeferCount: 4, notes: 'All docs verified' },
  { id: 'MFT-002', manifest: 'MFT-2026-0422', vessel: 'MAERSK GUJARAT', voyage: 'INMUM-SGSIN-2026', type: 'Export', origin: 'Mumbai, IN', destination: 'Singapore, SG', eta: '14 May 14:00', containers: 52, totalWeight: '678,300 kg', status: 'Filed', filedDate: '11 May 2026', filedBy: 'Rajesh Kumar', customsRef: 'CUS-2026-8842', hazmatCount: 5, reeferCount: 8, notes: 'Bonded cargo' },
  { id: 'MFT-003', manifest: 'MFT-2026-0423', vessel: 'MSC ZOE', voyage: 'LKCMB-JPTYO-2026', type: 'Transshipment', origin: 'Colombo, LK', destination: 'Tokyo, JP', eta: '13 May 22:45', containers: 18, totalWeight: '234,500 kg', status: 'Pending', filedDate: '12 May 2026', filedBy: 'Chen Wei', customsRef: 'CUS-2026-8843', hazmatCount: 0, reeferCount: 6, notes: 'Transship to JPSAK' },
  { id: 'MFT-004', manifest: 'MFT-2026-0424', vessel: 'OOCL HONG KONG', voyage: 'SGSIN-INNSA-2026', type: 'Import', origin: 'Singapore, SG', destination: 'Mumbai, IN', eta: '15 May 06:10', containers: 28, totalWeight: '367,200 kg', status: 'Pending', filedDate: '12 May 2026', filedBy: 'Li Ming', customsRef: 'CUS-2026-8844', hazmatCount: 1, reeferCount: 3, notes: 'Awaiting hazmat docs' },
  { id: 'MFT-005', manifest: 'MFT-2026-0425', vessel: 'EVERGREEN LOTUS', voyage: 'NLRTM-CNSHA-2026', type: 'Export', origin: 'Rotterdam, NL', destination: 'Shanghai, CN', eta: '15 May 14:30', containers: 45, totalWeight: '589,100 kg', status: 'Filed', filedDate: '13 May 2026', filedBy: 'Pieter van den Berg', customsRef: 'CUS-2026-8845', hazmatCount: 3, reeferCount: 7, notes: 'DG cargo class 3' },
  { id: 'MFT-006', manifest: 'MFT-2026-0426', vessel: 'COSCO PRIDE', voyage: 'CNSHA-USLAX-2026', type: 'Export', origin: 'Shanghai, CN', destination: 'Los Angeles, US', eta: '12 May 09:00', containers: 67, totalWeight: '874,500 kg', status: 'Approved', filedDate: '08 May 2026', filedBy: 'Zhang Wei', customsRef: 'CUS-2026-8846', hazmatCount: 8, reeferCount: 12, notes: 'Cleared for departure' },
  { id: 'MFT-007', manifest: 'MFT-2026-0427', vessel: 'MSC AURORA', voyage: 'DEHAM-CNSHA-2026', type: 'Import', origin: 'Hamburg, DE', destination: 'Shanghai, CN', eta: '16 May 11:20', containers: 31, totalWeight: '403,800 kg', status: 'Amended', filedDate: '09 May 2026', filedBy: 'Klaus Schmidt', customsRef: 'CUS-2026-8847', hazmatCount: 4, reeferCount: 5, notes: 'Amendment: added 2 containers' },
  { id: 'MFT-008', manifest: 'MFT-2026-0428', vessel: 'ONE APUS', voyage: 'USLAX-JPTYO-2026', type: 'Transshipment', origin: 'Los Angeles, US', destination: 'Tokyo, JP', eta: '14 May 07:45', containers: 22, totalWeight: '289,600 kg', status: 'Approved', filedDate: '10 May 2026', filedBy: 'Yuki Tanaka', customsRef: 'CUS-2026-8848', hazmatCount: 0, reeferCount: 2, notes: 'Transship to JPYOK' },
];

export default function ManifestsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let result = [...manifests];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        m.manifest.toLowerCase().includes(q) ||
        m.vessel.toLowerCase().includes(q) ||
        m.customsRef.toLowerCase().includes(q) ||
        m.filedBy.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') result = result.filter(m => m.status === statusFilter);
    if (typeFilter !== 'All') result = result.filter(m => m.type === typeFilter);
    return result;
  }, [search, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: manifests.length,
    approved: manifests.filter(m => m.status === 'Approved').length,
    pending: manifests.filter(m => m.status === 'Pending').length,
    filed: manifests.filter(m => m.status === 'Filed').length,
    totalContainers: manifests.reduce((s, m) => s + m.containers, 0),
    hazmatTotal: manifests.reduce((s, m) => s + m.hazmatCount, 0),
  }), []);

  const statusPills = [
    { label: 'All', count: manifests.length },
    { label: 'Approved', count: stats.approved },
    { label: 'Filed', count: stats.filed },
    { label: 'Pending', count: stats.pending },
  ];

  return (
    <PageWrapper
      title="Cargo Manifest"
      description="Manage cargo declarations, customs documentation, and shipment manifests for all vessels"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 rounded-[9px]"><Upload className="w-4 h-4" />Import</Button>
          <Button className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:from-sky-600 hover:to-indigo-600 rounded-[10px] gap-2">
            <FileText className="w-4 h-4" />Create Manifest
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <KPICard title="Total Manifests" value={stats.total} icon={<FileText className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Approved" value={stats.approved} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Filed" value={stats.filed} icon={<FileText className="w-5 h-5" />} iconColor="blue" />
        <KPICard title="Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Hazmat Shipments" value={stats.hazmatTotal} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" trend={stats.hazmatTotal > 0 ? { value: stats.hazmatTotal, isPositive: false } : undefined} />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => { setSearch(e.target.value); setLoading(true); setTimeout(() => setLoading(false), 300); }} placeholder="Search manifest, vessel, customs ref..." className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)] transition-all duration-200" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <Select value={typeFilter} onValueChange={t => setTypeFilter(t)}>
            <SelectTrigger className="w-[160px] h-9 bg-muted/40 border-border rounded-[9px] text-[0.84rem]"><SelectValue placeholder="Declaration Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Import">Import</SelectItem>
              <SelectItem value="Export">Export</SelectItem>
              <SelectItem value="Transshipment">Transshipment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusPills.map(pill => {
            const isActive = statusFilter === pill.label;
            const meta = pill.label !== 'All' ? STATUS_META[pill.label as ManifestStatus] : null;
            return (
              <button key={pill.label} onClick={() => setStatusFilter(pill.label)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.70rem] font-bold border transition-all ${isActive ? meta ? `${meta.pill} shadow-sm` : 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:border-border'}`}>
                {meta && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
                {pill.label} <span className="text-[0.65rem] opacity-60">{pill.count}</span>
              </button>
            );
          })}
        </div>
        {(search || statusFilter !== 'All' || typeFilter !== 'All') && (
          <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">{filtered.length} manifest(s) found</p>
        )}
      </div>

      {loading ? <SkeletonLoader variant="card" count={4} /> : filtered.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center"><FileText className="w-7 h-7 text-muted-foreground/30" /></div>
          <p className="text-[0.88rem] font-semibold text-foreground">No manifests found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 px-4 py-2 mb-4 bg-card border border-border/60 rounded-lg shadow-soft text-[0.78rem] text-muted-foreground">
            <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />{filtered.length} manifests</span>
            <span className="w-px h-3 bg-border/50" />
            <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" />{filtered.reduce((s, m) => s + m.containers, 0)} containers</span>
          </div>
          <div className="space-y-3">
            {filtered.map(manifest => {
              const meta = STATUS_META[manifest.status];
              return (
                <div key={manifest.id} className="group bg-card border border-border/60 rounded-xl shadow-soft p-4 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-amber-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-[0.88rem] font-semibold text-foreground font-mono">{manifest.manifest}</h3>
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.65rem] font-bold border ${meta.pill}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{manifest.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-[0.72rem] text-muted-foreground">
                              <span>{manifest.vessel}</span>
                              <span className="w-px h-3 bg-border/40" />
                              <span className="font-mono">{manifest.voyage}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[0.65rem] font-bold px-2 py-0.5 ${
                          manifest.type === 'Import' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          manifest.type === 'Export' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                          'bg-violet-500/10 text-violet-400 border-violet-500/20'
                        }`}>{manifest.type}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Route</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {manifest.origin.split(',')[0]}
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            {manifest.destination.split(',')[0]}
                          </p>
                          <p className="text-[0.70rem] text-muted-foreground">ETA: {manifest.eta}</p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Containers</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5">{manifest.containers} units</p>
                          <p className="text-[0.70rem] text-muted-foreground">{manifest.totalWeight}</p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Filed</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5">{manifest.filedDate}</p>
                          <p className="text-[0.70rem] text-muted-foreground">by {manifest.filedBy}</p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">Special Cargo</p>
                          <p className="text-[0.82rem] font-medium text-foreground mt-0.5">
                            <span className="text-destructive">{manifest.hazmatCount} Hazmat</span>
                            <span className="text-muted-foreground mx-1">|</span>
                            <span className="text-sky-400">{manifest.reeferCount} Reefer</span>
                          </p>
                          <p className="text-[0.70rem] text-muted-foreground font-mono">{manifest.customsRef}</p>
                        </div>
                      </div>
                      {manifest.notes && (
                        <p className="text-[0.72rem] text-muted-foreground mt-2 italic">{manifest.notes}</p>
                      )}
                    </div>
                    <div className="flex lg:flex-col items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400"><Download className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </PageWrapper>
  );
}

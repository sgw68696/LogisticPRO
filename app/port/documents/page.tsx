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
  Folder, Search, FileText, CheckCircle2, AlertTriangle, Clock,
  Eye, Edit, Trash2, X, Download, Upload, Printer, Shield,
  Ship, File, FileImage, FileSpreadsheet, FileArchive,
  CalendarDays, ArrowRight, User, Filter, Lock,
} from 'lucide-react';
import { UploadDocumentModal } from './UploadDocumentModal';
import { NewFolderModal } from './NewFolderModal';

type DocStatus = 'Approved' | 'Pending' | 'Rejected' | 'Expired' | 'Draft';
type DocCategory = 'Clearance' | 'Manifest' | 'Certificate' | 'Permit' | 'Report' | 'Invoice' | 'Customs' | 'Other';

interface PortDocument {
  id: string;
  title: string;
  type: string;
  category: DocCategory;
  status: DocStatus;
  vessel: string | null;
  refNo: string;
  issuedDate: string;
  expiryDate: string | null;
  uploadedBy: string;
  uploadDate: string;
  size: string;
  pages: number;
  sensitive: boolean;
  notes: string;
}

const STATUS_META: Record<DocStatus, { pill: string; dot: string }> = {
  Approved: { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  Pending: { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  Rejected: { pill: 'bg-destructive/10 text-destructive border-destructive/20', dot: 'bg-destructive' },
  Expired: { pill: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' },
  Draft: { pill: 'bg-muted/50 text-muted-foreground border-border/40', dot: 'bg-muted-foreground' },
};

const documents: PortDocument[] = [
  { id: 'DOC-001', title: 'Cargo Manifest - CMA CGM ALTAMIRA', type: 'PDF', category: 'Manifest', status: 'Approved', vessel: 'CMA CGM ALTAMIRA', refNo: 'MFT-2026-0421', issuedDate: '10 May 2026', expiryDate: null, uploadedBy: 'Jean Dupont', uploadDate: '10 May 2026', size: '2.4 MB', pages: 34, sensitive: false, notes: 'All cargo declared' },
  { id: 'DOC-002', title: 'Customs Clearance - MAEU123456', type: 'PDF', category: 'Customs', status: 'Approved', vessel: 'CMA CGM ALTAMIRA', refNo: 'CUS-2026-8841', issuedDate: '11 May 2026', expiryDate: null, uploadedBy: 'Customs Officer', uploadDate: '11 May 2026', size: '1.1 MB', pages: 8, sensitive: true, notes: 'Export clearance granted' },
  { id: 'DOC-003', title: 'Berth Allocation Permit - B-12', type: 'PDF', category: 'Permit', status: 'Approved', vessel: 'CMA CGM ALTAMIRA', refNo: 'BTH-2026-0513', issuedDate: '12 May 2026', expiryDate: '13 May 2026', uploadedBy: 'Port Authority', uploadDate: '12 May 2026', size: '0.8 MB', pages: 3, sensitive: false, notes: 'Berth assignment confirmed' },
  { id: 'DOC-004', title: 'Hazmat Declaration - MSC AURORA', type: 'PDF', category: 'Clearance', status: 'Pending', vessel: 'MSC AURORA', refNo: 'DG-2026-0425', issuedDate: '13 May 2026', expiryDate: null, uploadedBy: 'Klaus Schmidt', uploadDate: '13 May 2026', size: '3.2 MB', pages: 12, sensitive: true, notes: 'Awaiting safety officer review' },
  { id: 'DOC-005', title: 'Port Service Invoice - INV-2026-0421', type: 'PDF', category: 'Invoice', status: 'Approved', vessel: 'CMA CGM ALTAMIRA', refNo: 'INV-2026-0421', issuedDate: '13 May 2026', expiryDate: '20 May 2026', uploadedBy: 'Finance Dept', uploadDate: '13 May 2026', size: '0.5 MB', pages: 2, sensitive: true, notes: 'Paid in full' },
  { id: 'DOC-006', title: 'Vessel Security Declaration', type: 'PDF', category: 'Certificate', status: 'Expired', vessel: 'COSCO PRIDE', refNo: 'ISPS-2025-1123', issuedDate: '15 Nov 2025', expiryDate: '14 May 2026', uploadedBy: 'Ship Security Officer', uploadDate: '15 Nov 2025', size: '1.8 MB', pages: 6, sensitive: false, notes: 'EXPIRED - renewal required' },
  { id: 'DOC-007', title: 'Cargo Stowage Plan - MAERSK GUJARAT', type: 'PDF', category: 'Manifest', status: 'Draft', vessel: 'MAERSK GUJARAT', refNo: 'STW-2026-0422', issuedDate: '14 May 2026', expiryDate: null, uploadedBy: 'Rajesh Kumar', uploadDate: '14 May 2026', size: '4.1 MB', pages: 22, sensitive: false, notes: 'Draft - not yet finalized' },
  { id: 'DOC-008', title: 'Terminal Operations Report - May', type: 'XLSX', category: 'Report', status: 'Pending', vessel: null, refNo: 'RPT-2026-05', issuedDate: '14 May 2026', expiryDate: null, uploadedBy: 'Ops Manager', uploadDate: '14 May 2026', size: '0.9 MB', pages: 0, sensitive: false, notes: 'Monthly ops summary' },
  { id: 'DOC-009', title: 'Port Dues Calculation Sheet', type: 'XLSX', category: 'Invoice', status: 'Approved', vessel: null, refNo: 'FIN-2026-05', issuedDate: '01 May 2026', expiryDate: '31 May 2026', uploadedBy: 'Finance Dept', uploadDate: '01 May 2026', size: '0.3 MB', pages: 0, sensitive: true, notes: 'Monthly dues template' },
  { id: 'DOC-010', title: 'Safety Inspection Certificate - Crane #3', type: 'PDF', category: 'Certificate', status: 'Approved', vessel: null, refNo: 'SFT-CRN-003', issuedDate: '01 Jan 2026', expiryDate: '31 Dec 2026', uploadedBy: 'Safety Officer', uploadDate: '01 Jan 2026', size: '1.5 MB', pages: 10, sensitive: false, notes: 'Annual crane cert' },
];

const typeIcon = (type: string) => {
  if (type === 'PDF') return <FileText className="w-4 h-4" />;
  if (type === 'XLSX') return <FileSpreadsheet className="w-4 h-4" />;
  if (type === 'ZIP') return <FileArchive className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
};

const typeColor = (type: string) => {
  if (type === 'PDF') return 'text-red-400';
  if (type === 'XLSX') return 'text-emerald-400';
  if (type === 'ZIP') return 'text-amber-400';
  return 'text-muted-foreground';
};

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const categories = useMemo(() => [...new Set(documents.map(d => d.category))], []);
  const [docs, setDocs] = useState<PortDocument[]>(documents);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...docs];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d => d.title.toLowerCase().includes(q) || d.refNo.toLowerCase().includes(q) || (d.vessel && d.vessel.toLowerCase().includes(q)) || d.uploadedBy.toLowerCase().includes(q));
    }
    if (statusFilter !== 'All') result = result.filter(d => d.status === statusFilter);
    if (categoryFilter !== 'All') result = result.filter(d => d.category === categoryFilter);
    return result;
  }, [search, statusFilter, categoryFilter, docs]);

  const stats = useMemo(() => ({
    total: docs.length,
    approved: docs.filter(d => d.status === 'Approved').length,
    pending: docs.filter(d => d.status === 'Pending').length,
    expired: docs.filter(d => d.status === 'Expired').length,
    sensitive: docs.filter(d => d.sensitive).length,
  }), [docs]);

  const statusPills = [
    { label: 'All', count: documents.length },
    { label: 'Approved', count: stats.approved },
    { label: 'Pending', count: stats.pending },
    { label: 'Expired', count: stats.expired },
  ];

  return (
    <PageWrapper
      title="Port Documents"
      description="Central document repository for manifests, certificates, permits, customs clearance, and reports"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 rounded-[9px]" onClick={() => setUploadOpen(true)}>
            <Upload className="w-4 h-4" />Upload
          </Button>
          <Button
            className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg rounded-[10px] gap-2"
            onClick={() => setFolderOpen(true)}
          >
            <Folder className="w-4 h-4" />New Folder
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <KPICard title="Total Documents" value={stats.total} icon={<Folder className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Approved" value={stats.approved} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Pending Review" value={stats.pending} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Expired" value={stats.expired} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" />
        <KPICard title="Confidential" value={stats.sensitive} icon={<Lock className="w-5 h-5" />} iconColor="indigo" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => { setSearch(e.target.value); setLoading(true); setTimeout(() => setLoading(false), 300); }} placeholder="Search documents, vessel, ref number..." className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)] transition-all duration-200" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[170px] h-9 bg-muted/40 border-border rounded-[9px] text-[0.84rem]"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusPills.map(pill => {
            const isActive = statusFilter === pill.label;
            const meta = pill.label !== 'All' ? STATUS_META[pill.label as DocStatus] : null;
            return (
              <button key={pill.label} onClick={() => setStatusFilter(pill.label)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.70rem] font-bold border transition-all ${isActive ? meta ? `${meta.pill} shadow-sm` : 'bg-primary/10 text-primary border-primary/30 shadow-sm' : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:border-border'}`}>
                {meta && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
                {pill.label} <span className="text-[0.65rem] opacity-60">{pill.count}</span>
              </button>
            );
          })}
        </div>
        {(search || statusFilter !== 'All' || categoryFilter !== 'All') && <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">{filtered.length} document(s) found</p>}
      </div>

      {loading ? <SkeletonLoader variant="card" count={4} /> : filtered.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center"><Folder className="w-7 h-7 text-muted-foreground/30" /></div>
          <p className="text-[0.88rem] font-semibold text-foreground">No documents found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 px-4 py-2 mb-4 bg-card border border-border/60 rounded-lg shadow-soft text-[0.78rem] text-muted-foreground">
            <span className="flex items-center gap-1.5"><Folder className="w-3.5 h-3.5" />{filtered.length} documents</span>
            <span className="w-px h-3 bg-border/50" />
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-amber-400" />{filtered.filter(d => d.sensitive).length} confidential</span>
          </div>
          <div className="space-y-3">
            {filtered.map(doc => {
              const meta = STATUS_META[doc.status];
              return (
                <div key={doc.id} className="group bg-card border border-border/60 rounded-xl shadow-soft p-4 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center shrink-0 ${typeColor(doc.type)}`}>
                      {typeIcon(doc.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[0.88rem] font-semibold text-foreground">{doc.title}</h3>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.65rem] font-bold border ${meta.pill}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{doc.status}
                            </span>
                            {doc.sensitive && <Lock className="w-3 h-3 text-amber-400" />}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-[0.72rem] text-muted-foreground flex-wrap">
                            <span className="font-mono">{doc.refNo}</span>
                            {doc.vessel && <><span className="w-px h-3 bg-border/40" /><span>{doc.vessel}</span></>}
                            <span className="w-px h-3 bg-border/40" />
                            <span>by {doc.uploadedBy}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[0.70rem] text-muted-foreground shrink-0">
                          <span>{doc.type}</span>
                          <span className="w-px h-3 bg-border/40" />
                          <span>{doc.size}</span>
                          {doc.pages > 0 && <><span className="w-px h-3 bg-border/40" /><span>{doc.pages}p</span></>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-[0.70rem] text-muted-foreground">
                        <span>Issued: {doc.issuedDate}</span>
                        {doc.expiryDate && <span className={doc.status === 'Expired' ? 'text-destructive font-semibold' : ''}>Expires: {doc.expiryDate}</span>}
                      </div>
                      {doc.notes && <p className="text-[0.70rem] text-muted-foreground mt-1 italic">{doc.notes}</p>}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
      <UploadDocumentModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={(doc) => setDocs(prev => [doc, ...prev])}
      />

      <NewFolderModal
        open={folderOpen}
        onClose={() => setFolderOpen(false)}
        onCreated={(folder) => console.log('Folder created:', folder)}
      />
    </PageWrapper>
  );
}

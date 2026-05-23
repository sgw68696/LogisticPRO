'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import {
  FileText, Search, X, Download, Eye,
  File, FileSpreadsheet, FileArchive,
  Clock, CheckCircle2, AlertTriangle,
  Filter, Tag,
} from 'lucide-react';
import type { PortalDocumentType } from '@/types/portal';
import { portalMockDocuments } from '@/data/portal-mock-data';

const TYPE_ICONS: Record<string, any> = {
  'Bill of Lading': FileText, 'Invoice': FileSpreadsheet,
  'Proof of Delivery': FileText, 'Packing List': FileSpreadsheet,
  'Insurance Certificate': FileArchive, 'Customs Doc': FileText,
  'Other': File,
};

const STATUS_META: Record<string, { pill: string; dot: string }> = {
  Available: { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  Pending: { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  Expired: { pill: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' },
};

const DOC_TYPES: { label: string; value: PortalDocumentType | 'All' }[] = [
  { label: 'All Types', value: 'All' },
  ...['Bill of Lading', 'Invoice', 'Proof of Delivery', 'Packing List', 'Insurance Certificate', 'Customs Doc', 'Other'].map(t => ({ label: t, value: t as PortalDocumentType })),
];

export default function PortalDocumentsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let r = [...portalMockDocuments];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(d => d.title.toLowerCase().includes(q) || d.docRef.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.bookingRef?.toLowerCase().includes(q));
    }
    if (typeFilter !== 'All') r = r.filter(d => d.type === typeFilter);
    if (statusFilter !== 'All') r = r.filter(d => d.status === statusFilter);
    return r;
  }, [search, typeFilter, statusFilter]);

  return (
    <PageWrapper title="My Documents" description="Access your bills of lading, invoices, PODs, and more">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Documents" value={portalMockDocuments.length} icon={<FileText className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Available" value={portalMockDocuments.filter(d => d.status === 'Available').length} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Pending" value={portalMockDocuments.filter(d => d.status === 'Pending').length} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Expired" value={portalMockDocuments.filter(d => d.status === 'Expired').length} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => { setSearch(e.target.value); setLoading(true); setTimeout(() => setLoading(false), 300); }}
              placeholder="Search documents by title, ref, or booking..." className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] h-9 bg-muted/40 border-border rounded-[9px] text-xs">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {DOC_TYPES.map(t => <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 bg-muted/40 border-border rounded-[9px] text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              {['All', 'Available', 'Pending', 'Expired'].map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {(search || typeFilter !== 'All' || statusFilter !== 'All') && <p className="text-[0.65rem] text-muted-foreground mt-2 ml-1">{filtered.length} document(s) found</p>}
      </div>

      {loading ? <SkeletonLoader variant="card" count={4} />
        : filtered.length === 0 ? (
          <div className="bg-card border border-border/60 rounded-xl shadow-soft py-16 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-muted/30 border border-border/50 flex items-center justify-center">
              <FileText className="w-7 h-7 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-semibold text-foreground">No documents found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(doc => {
              const DocIcon = TYPE_ICONS[doc.type] || File;
              const meta = STATUS_META[doc.status];
              return (
                <div key={doc.id} className="group bg-card border border-border/60 rounded-xl shadow-soft p-4 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <DocIcon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <Badge variant="outline" className={`text-[0.55rem] px-1.5 py-0 border shrink-0 ${meta?.pill || ''}`}>
                      <span className={`w-1 h-1 rounded-full ${meta?.dot || ''} mr-1`} />{doc.status}
                    </Badge>
                  </div>
                  <h3 className="text-xs font-semibold text-foreground mt-3">{doc.title}</h3>
                  <p className="text-[0.65rem] text-muted-foreground mt-0.5 line-clamp-2">{doc.description}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className="text-[0.55rem] px-1.5 py-0 bg-muted/20 text-muted-foreground border-border/40">{doc.type}</Badge>
                    <span className="text-[0.55rem] text-muted-foreground">{doc.fileSize}</span>
                  </div>
                  {doc.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      <Tag className="w-2.5 h-2.5 text-muted-foreground" />
                      {doc.tags.map(tag => <span key={tag} className="text-[0.5rem] px-1.5 py-0.5 rounded-full bg-muted/20 text-muted-foreground border border-border/30">{tag}</span>)}
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 h-7 inline-flex items-center justify-center gap-1 rounded-lg text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"><Eye className="w-3 h-3" /> View</button>
                    <button className="flex-1 h-7 inline-flex items-center justify-center gap-1 rounded-lg text-xs text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors"><Download className="w-3 h-3" /> Download</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </PageWrapper>
  );
}

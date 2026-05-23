'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { portService } from '@/services/port/portService';
import type { PortDocument, PortDocCategory, PortDocStatus } from '@/types/port';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, formatDate } from '@/lib/utils';
import { exportToCSV } from '@/lib/export-utils';
import { toast } from 'sonner';
import { UploadDocumentModal } from './UploadDocumentModal';
import { NewFolderModal } from './NewFolderModal';
import { FileText, Search, X, RotateCcw, Plus, FolderPlus, Download, Eye, Trash2, File, FileSpreadsheet, FileImage, Archive, Lock, Clock, CheckCircle, AlertTriangle, Upload, FileSignature, History, Tag } from 'lucide-react';

const docStatusColors: Record<string, string> = {
  Draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Pending Review': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  Expired: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Archived: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const docCategoryColors: Record<string, string> = {
  'Arrival Notice': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Cargo Manifest': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  BOL: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  AWB: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Port Clearance': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Customs Decl': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Inspection Report': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Survey Report': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  Certificate: 'bg-green-500/10 text-green-400 border-green-500/20',
  Correspondence: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Other: 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20',
};

const categoryOptions: PortDocCategory[] = ['Arrival Notice', 'Cargo Manifest', 'BOL', 'AWB', 'Port Clearance', 'Customs Decl', 'Inspection Report', 'Survey Report', 'Certificate', 'Correspondence', 'Other'];
const statusOptions: PortDocStatus[] = ['Draft', 'Approved', 'Pending Review', 'Rejected', 'Expired', 'Archived'];

function getDocTypeIcon(type: string) {
  switch (type) {
    case 'PDF': return <FileText className="w-4 h-4 text-blue-400" />;
    case 'XLSX': return <FileSpreadsheet className="w-4 h-4 text-green-400" />;
    case 'DOCX': return <File className="w-4 h-4 text-orange-400" />;
    case 'ZIP': return <Archive className="w-4 h-4 text-purple-400" />;
    case 'Image': return <FileImage className="w-4 h-4 text-pink-400" />;
    default: return <FileText className="w-4 h-4" />;
  }
}

const docTypeColors: Record<string, string> = {
  PDF: 'text-blue-400', XLSX: 'text-green-400', DOCX: 'text-orange-400', ZIP: 'text-purple-400', Image: 'text-pink-400',
};

function StatusPill({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  const colors = label !== 'All' ? docStatusColors[label] : '';
  const dot: Record<string, string> = { Draft: 'bg-gray-400', Approved: 'bg-emerald-400', 'Pending Review': 'bg-amber-400', Rejected: 'bg-red-400', Expired: 'bg-gray-400', Archived: 'bg-blue-400' };
  return (
    <button onClick={onClick} className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.70rem] font-bold border transition-all', active && colors ? `${colors} shadow-sm` : '', active && !colors ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : '', !active ? 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:border-border' : '')}>
      {label !== 'All' && <span className={cn('w-1.5 h-1.5 rounded-full', dot[label] || 'bg-muted-foreground')} />}
      {label}<span className={cn('text-[0.65rem]', active ? 'opacity-80' : 'text-muted-foreground/60')}>{count}</span>
    </button>
  );
}

export default function DocumentsPage() {
  const [data, setData] = useState<PortDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<PortDocument | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<PortDocument | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await portService.listDocuments({ search: search || undefined, category: categoryFilter !== 'All' ? categoryFilter : undefined, status: statusFilter !== 'All' ? statusFilter : undefined });
      setData(result);
    } catch { setError('Failed to load documents'); }
    finally { setLoading(false); }
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    let result = [...data];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d => d.title.toLowerCase().includes(q) || d.referenceNumber.toLowerCase().includes(q) || d.vessel.toLowerCase().includes(q) || d.uploadedBy.toLowerCase().includes(q));
    }
    if (statusFilter !== 'All') result = result.filter(d => d.status === statusFilter);
    if (categoryFilter !== 'All') result = result.filter(d => d.category === categoryFilter);
    return result;
  }, [data, search, statusFilter, categoryFilter]);

  const stats = useMemo(() => ({
    total: data.length,
    approved: data.filter(d => d.status === 'Approved').length,
    pending: data.filter(d => d.status === 'Pending Review').length,
    expired: data.filter(d => d.status === 'Expired').length,
    confidential: data.filter(d => d.confidential).length,
  }), [data]);

  const statusPills = useMemo(() => {
    const counts: Record<string, number> = { All: data.length };
    data.forEach(d => { counts[d.status] = (counts[d.status] || 0) + 1; });
    return ['All', 'Draft', 'Approved', 'Pending Review', 'Rejected', 'Expired', 'Archived'].map(label => ({ label, count: counts[label] || 0 }));
  }, [data]);

  const openDetail = (doc: PortDocument) => { setSelectedDoc(doc); setDrawerOpen(true); };
  const openDelete = (doc: PortDocument) => { setDeletingDoc(doc); setDeleteOpen(true); };

  const handleUploaded = useCallback((doc: PortDocument) => {
    setData(prev => [doc, ...prev]);
    toast.success('Document uploaded successfully');
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingDoc) return;
    try {
      await portService.deleteDocument(deletingDoc.id);
      setData(prev => prev.filter(d => d.id !== deletingDoc.id));
      toast.success('Document deleted successfully');
      setDeleteOpen(false);
      setDeletingDoc(null);
    } catch { toast.error('Failed to delete document'); }
  };

  const handleStatusUpdate = async (doc: PortDocument, newStatus: PortDocStatus) => {
    try {
      const updated = await portService.updateDocument(doc.id, { status: newStatus });
      setData(prev => prev.map(d => d.id === doc.id ? updated : d));
      toast.success(`Document ${newStatus === 'Approved' ? 'approved' : newStatus === 'Pending Review' ? 'marked for review' : newStatus === 'Rejected' ? 'rejected' : newStatus === 'Archived' ? 'archived' : 'updated'} successfully`);
    } catch { toast.error('Failed to update document status'); }
  };

  const handleDownload = (doc: PortDocument) => {
    toast.success(`Downloading ${doc.title}...`);
  };

  const handleExport = () => {
    const headers = [
      { key: 'title' as keyof PortDocument, label: 'Title' },
      { key: 'documentId' as keyof PortDocument, label: 'Document ID' },
      { key: 'category' as keyof PortDocument, label: 'Category' },
      { key: 'type' as keyof PortDocument, label: 'Type' },
      { key: 'referenceNumber' as keyof PortDocument, label: 'Reference' },
      { key: 'vessel' as keyof PortDocument, label: 'Vessel' },
      { key: 'status' as keyof PortDocument, label: 'Status' },
      { key: 'uploadedBy' as keyof PortDocument, label: 'Uploaded By' },
      { key: 'fileSize' as keyof PortDocument, label: 'File Size' },
      { key: 'pageCount' as keyof PortDocument, label: 'Pages' },
      { key: 'version' as keyof PortDocument, label: 'Version' },
      { key: 'confidential' as keyof PortDocument, label: 'Confidential' },
      { key: 'expiryDate' as keyof PortDocument, label: 'Expiry Date' },
    ];
    exportToCSV(filtered as unknown as Record<string, unknown>[], 'port-documents', headers);
    toast.success('Documents exported to CSV');
  };

  const columns: Column<PortDocument>[] = [
    {
      key: 'title', header: 'Title', sortable: true,
      render: (d) => (
        <button onClick={() => openDetail(d)} className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80">
          <div className={cn('w-8 h-8 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-center shrink-0', docTypeColors[d.type] || 'text-muted-foreground')}>
            {getDocTypeIcon(d.type)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
            <p className="text-xs font-mono text-muted-foreground">{d.referenceNumber}</p>
          </div>
        </button>
      ),
    },
    {
      key: 'category', header: 'Category', sortable: true,
      render: (d) => (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold border', docCategoryColors[d.category] || 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20')}>
          {d.category}
        </span>
      ),
    },
    {
      key: 'referenceNumber', header: 'Reference#',
      render: (d) => <span className="text-xs font-mono text-muted-foreground">{d.referenceNumber}</span>,
    },
    {
      key: 'vessel', header: 'Vessel', sortable: true,
      render: (d) => <span className="text-sm text-foreground">{d.vessel || <span className="text-muted-foreground">\u2014</span>}</span>,
    },
    {
      key: 'uploadedBy', header: 'Uploaded By / Date',
      render: (d) => (
        <div className="min-w-0">
          <p className="text-sm text-foreground truncate">{d.uploadedBy}</p>
          <p className="text-xs text-muted-foreground">{formatDate(d.uploadedAt || d.createdAt, 'short')}</p>
        </div>
      ),
    },
    {
      key: 'fileSize', header: 'Size / Pages',
      render: (d) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {d.fileSize}{d.pageCount > 0 ? ` \u00B7 ${d.pageCount}p` : ''}
        </span>
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (d) => (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border', docStatusColors[d.status] || '')}>
          <span className={cn('w-1.5 h-1.5 rounded-full', d.status === 'Draft' ? 'bg-gray-400' : d.status === 'Approved' ? 'bg-emerald-400' : d.status === 'Pending Review' ? 'bg-amber-400' : d.status === 'Rejected' ? 'bg-red-400' : d.status === 'Expired' ? 'bg-gray-400' : 'bg-blue-400')} />
          {d.status}
        </span>
      ),
    },
    {
      key: 'confidential', header: '',
      render: (d) => d.confidential ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : null,
    },
    {
      key: 'expiryDate', header: 'Expiry',
      render: (d) => (
        <span className={cn('text-xs whitespace-nowrap', d.expiryDate && new Date(d.expiryDate) < new Date() ? 'text-red-400 font-semibold' : 'text-muted-foreground')}>
          {d.expiryDate ? formatDate(d.expiryDate, 'short') : '\u2014'}
        </span>
      ),
    },
    {
      key: 'id', header: '', className: 'w-[160px] text-right',
      render: (d) => (
        <div className="flex items-center justify-end gap-0.5">
          <button onClick={() => openDetail(d)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-150" title="View"><Eye className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleDownload(d)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors duration-150" title="Download"><Download className="w-3.5 h-3.5" /></button>
          <div className="relative group">
            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-amber-500/10 hover:text-amber-400 transition-colors duration-150" title="Update Status"><FileSignature className="w-3.5 h-3.5" /></button>
            <div className="absolute right-0 top-full mt-1 z-50 hidden group-hover:block bg-card border border-border/60 rounded-lg shadow-xl py-1 min-w-[160px]">
              {statusOptions.filter(s => s !== d.status).map(s => (
                <button key={s} onClick={() => handleStatusUpdate(d, s)} className="w-full text-left px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors">
                  {s === 'Approved' ? 'Approve' : s === 'Pending Review' ? 'Mark Pending Review' : s === 'Rejected' ? 'Reject' : s === 'Archived' ? 'Archive' : s}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => openDelete(d)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-150" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <PageWrapper title="Port Documents" description="Arrival notices, cargo manifests, BOLs, AWB and port clearances">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center"><AlertTriangle className="w-8 h-8 text-red-400" /></div>
          <h3 className="text-lg font-medium text-foreground">Failed to load documents</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">{error}</p>
          <Button variant="outline" onClick={fetchData} className="gap-2"><RotateCcw className="w-4 h-4" />Retry</Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Port Documents"
      description="Arrival notices, cargo manifests, BOLs, AWB and port clearances"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2 rounded-[9px]"><Download className="w-4 h-4" />Export CSV</Button>
          <Button variant="outline" className="gap-2 rounded-[9px]" onClick={() => setUploadOpen(true)}><Plus className="w-4 h-4" />Upload Document</Button>
          <Button className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg rounded-[10px] gap-2" onClick={() => setFolderOpen(true)}><FolderPlus className="w-4 h-4" />New Folder</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <KPICard title="Total Documents" value={stats.total} icon={<FileText className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Approved" value={stats.approved} icon={<CheckCircle className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Pending Review" value={stats.pending} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Expired" value={stats.expired} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" />
        <KPICard title="Confidential" value={stats.confidential} icon={<Lock className="w-5 h-5" />} iconColor="indigo" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents, vessel, ref number..." className="w-full h-9 pl-9 pr-9 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)] transition-all duration-200" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-[180px] h-9 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50 px-3">
            <option value="All">All Categories</option>
            {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusPills.map(pill => <StatusPill key={pill.label} label={pill.label} count={pill.count} active={statusFilter === pill.label} onClick={() => setStatusFilter(pill.label)} />)}
        </div>
        {(search || statusFilter !== 'All' || categoryFilter !== 'All') && <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">{filtered.length} document(s) found</p>}
      </div>

      {loading ? <LoadingState rows={6} message="Loading documents..." /> : filtered.length === 0 ? (
        <EmptyState icon={<FileText className="w-8 h-8 text-muted-foreground" />} title="No documents found" description={search || statusFilter !== 'All' || categoryFilter !== 'All' ? 'Try adjusting your search or filter criteria' : 'No documents in the repository yet'} />
      ) : <DataTable<PortDocument> data={filtered} columns={columns} pageSize={10} emptyMessage="No documents match your criteria" />}

      <UploadDocumentModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={handleUploaded} />
      <NewFolderModal open={folderOpen} onClose={() => setFolderOpen(false)} onCreated={(folder) => { toast.success(`Folder "${folder.name}" created`); }} />

      {/* Detail Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-w-md">
          <DrawerHeader><DrawerTitle>Document Details</DrawerTitle><DrawerClose /></DrawerHeader>
          {selectedDoc && (
            <div className="px-6 pb-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-center shrink-0', docTypeColors[selectedDoc.type] || 'text-muted-foreground')}>
                  {getDocTypeIcon(selectedDoc.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold text-foreground truncate">{selectedDoc.title}</p>
                  <p className="text-xs font-mono text-muted-foreground">{selectedDoc.referenceNumber}</p>
                </div>
                {selectedDoc.confidential && <Lock className="w-4 h-4 text-amber-400 shrink-0" />}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Category</p><p className="font-medium text-foreground">{selectedDoc.category}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Type</p><p className="font-medium text-foreground">{selectedDoc.type}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Status</p><p className={cn('font-medium inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border mt-1', docStatusColors[selectedDoc.status])}>{selectedDoc.status}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Version</p><p className="font-medium text-foreground">v{selectedDoc.version}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Vessel</p><p className="font-medium text-foreground">{selectedDoc.vessel || '\u2014'}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">File Size</p><p className="font-medium text-foreground">{selectedDoc.fileSize} {selectedDoc.pageCount > 0 ? `\u00B7 ${selectedDoc.pageCount} pages` : ''}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Uploaded By</p><p className="font-medium text-foreground">{selectedDoc.uploadedBy}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Uploaded At</p><p className="font-medium text-foreground">{formatDate(selectedDoc.uploadedAt || selectedDoc.createdAt, 'short')}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Issue Date</p><p className="font-medium text-foreground">{selectedDoc.issueDate ? formatDate(selectedDoc.issueDate, 'short') : '\u2014'}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Expiry Date</p><p className={cn('font-medium', selectedDoc.expiryDate && new Date(selectedDoc.expiryDate) < new Date() ? 'text-red-400' : 'text-foreground')}>{selectedDoc.expiryDate ? formatDate(selectedDoc.expiryDate, 'short') : '\u2014'}</p></div>
              </div>

              {selectedDoc.tags && selectedDoc.tags.length > 0 && (
                <div className="p-3 bg-muted/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Tag className="w-3 h-3" /> Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDoc.tags.map((tag, i) => <Badge key={i} variant="outline" className="text-[0.6rem] font-mono">{tag}</Badge>)}
                  </div>
                </div>
              )}

              {selectedDoc.notes && (
                <div className="p-3 bg-muted/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-foreground">{selectedDoc.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2 flex-wrap">
                <Button size="sm" variant="outline" className="text-xs" onClick={() => handleDownload(selectedDoc)}><Download className="w-3 h-3 mr-1" />Download</Button>
                {statusOptions.filter(s => s !== selectedDoc.status).map(s => (
                  <Button key={s} size="sm" variant="outline" className="text-xs" onClick={() => { handleStatusUpdate(selectedDoc, s); setDrawerOpen(false); }}>
                    {s === 'Approved' ? 'Approve' : s === 'Pending Review' ? 'Mark Pending Review' : s === 'Rejected' ? 'Reject' : s === 'Archived' ? 'Archive' : s}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Document</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogDescription>Are you sure you want to delete <strong>{deletingDoc?.title}</strong>? This action cannot be undone.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { warehouseService } from '@/services/warehouseService';
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
import { FileText, Search, X, RotateCcw, Plus, Download, Eye, Trash2, File, FileSpreadsheet, FileImage, Archive, Clock, CheckCircle, AlertTriangle, Upload, FileSignature, History, Tag, Filter } from 'lucide-react';

interface WarehouseDoc {
  id: string;
  title: string;
  type: string;
  category: string;
  reference: string;
  fileSize: string;
  uploadedDate: string;
  tags: string[];
  status: string;
}

const docTypes = ['PDF', 'PDF', 'PDF', 'XLSX', 'XLSX', 'PDF', 'ZIP', 'Image'] as const;
const docCategories = ['GRN', 'GDN', 'GRN', 'Stock Report', 'Packing List', 'Damage Report', 'Label', 'Label'] as const;
const docTitles = [
  'GRN-2025-1001 - Goods Received Note',
  'GDN-2025-1001 - Goods Dispatch Note',
  'GRN-2025-1002 - Inbound Shipment',
  'Monthly Stock Report - May 2025',
  'Packing List - GDN-2025-1002',
  'Damage Report DMR-2025-101',
  'Warehouse Labels - Zone A',
  'Bin Location Photos - Zone C',
];
const fileSizes = ['2.4 MB', '1.8 MB', '3.1 MB', '856 KB', '1.2 MB', '4.5 MB', '12.8 MB', '8.3 MB'];
const docTags = [['GRN', 'Inbound'], ['GDN', 'Outbound'], ['GRN', 'Inbound'], ['Report', 'Monthly'], ['Packing', 'GDN'], ['Damage', 'Report'], ['Labels', 'Zones'], ['Photos', 'Locations']];
const docStatuses = ['Final', 'Final', 'Draft', 'Final', 'Final', 'Final', 'Final', 'Final'];

function getDocIcon(type: string) {
  switch (type) {
    case 'PDF': return <FileText className="w-4 h-4 text-red-400" />;
    case 'XLSX': return <FileSpreadsheet className="w-4 h-4 text-green-400" />;
    case 'DOCX': return <File className="w-4 h-4 text-blue-400" />;
    case 'ZIP': return <Archive className="w-4 h-4 text-purple-400" />;
    case 'Image': return <FileImage className="w-4 h-4 text-pink-400" />;
    default: return <FileText className="w-4 h-4" />;
  }
}

const categoryColors: Record<string, string> = {
  'GRN': 'bg-green-500/10 text-green-400 border-green-500/20',
  'GDN': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Packing List': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Stock Report': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Damage Report': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Label': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Other': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

function generateMockDocs(): WarehouseDoc[] {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `doc-${i + 1}`,
    title: docTitles[i],
    type: docTypes[i],
    category: docCategories[i],
    reference: i < 2 ? `REF-${1001 + i}` : i < 4 ? `SR-${2025001 + i}` : `DMR-${101 + i}`,
    fileSize: fileSizes[i],
    uploadedDate: new Date(Date.now() - (i * 86400000 * 3)).toISOString(),
    tags: [...docTags[i]],
    status: docStatuses[i],
  }));
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<WarehouseDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<WarehouseDoc | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<WarehouseDoc | null>(null);
  const [formData, setFormData] = useState({ title: '', type: 'PDF', category: 'GRN', reference: '' });

  useEffect(() => {
    const data = generateMockDocs();
    setDocs(data);
    setLoading(false);
  }, []);

  const filtered = docs.filter(d => {
    const q = search.toLowerCase();
    if (q && !d.title.toLowerCase().includes(q) && !d.type.toLowerCase().includes(q) && !d.reference.toLowerCase().includes(q)) return false;
    if (typeFilter !== 'All' && d.type !== typeFilter) return false;
    if (categoryFilter !== 'All' && d.category !== categoryFilter) return false;
    return true;
  });

  const stats = {
    total: docs.length,
    grn: docs.filter(d => d.category === 'GRN').length,
    gdn: docs.filter(d => d.category === 'GDN').length,
    reports: docs.filter(d => ['Stock Report', 'Damage Report', 'Packing List'].includes(d.category)).length,
    other: docs.filter(d => !['GRN', 'GDN', 'Stock Report', 'Damage Report', 'Packing List'].includes(d.category)).length,
  };

  const typeOptions = ['All', 'PDF', 'XLSX', 'DOCX', 'ZIP', 'Image'];
  const categoryOptions = ['All', 'GRN', 'GDN', 'Packing List', 'Stock Report', 'Damage Report', 'Label', 'Other'];

  const handleCreate = () => {
    const newDoc: WarehouseDoc = {
      id: `doc-${docs.length + 1}`,
      title: formData.title || `New ${formData.category} Document`,
      type: formData.type,
      category: formData.category,
      reference: formData.reference || `REF-${String(2000 + docs.length)}`,
      fileSize: '0 KB',
      uploadedDate: new Date().toISOString(),
      tags: [formData.category],
      status: 'Draft',
    };
    setDocs(prev => [newDoc, ...prev]);
    setCreateOpen(false);
    setFormData({ title: '', type: 'PDF', category: 'GRN', reference: '' });
    toast.success(`Document "${newDoc.title}" created`);
  };

  const handleDownload = (doc: WarehouseDoc) => {
    toast.success(`Downloading ${doc.title}...`);
  };

  const handleDelete = () => {
    if (!deleteDoc) return;
    setDocs(prev => prev.filter(d => d.id !== deleteDoc.id));
    toast.success(`Document "${deleteDoc.title}" deleted`);
    setDeleteDoc(null);
  };

  const handleExportCSV = () => {
    exportToCSV(
      filtered.map(d => ({
        Title: d.title, Type: d.type, Category: d.category, Reference: d.reference,
        'File Size': d.fileSize, 'Uploaded Date': formatDate(d.uploadedDate), Status: d.status,
      })),
      'warehouse-documents',
      [
        { key: 'Title', label: 'Title' },
        { key: 'Type', label: 'Type' },
        { key: 'Category', label: 'Category' },
        { key: 'Reference', label: 'Reference' },
        { key: 'File Size', label: 'File Size' },
        { key: 'Uploaded Date', label: 'Uploaded Date' },
        { key: 'Status', label: 'Status' },
      ]
    );
    toast.success('Documents exported to CSV');
  };

  const columns: Column<WarehouseDoc>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (d) => (
        <div className="flex items-center gap-3">
          {getDocIcon(d.type)}
          <div>
            <span className="text-sm font-medium text-foreground">{d.title}</span>
            <p className="text-[0.6rem] text-muted-foreground">{d.type}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (d) => (
        <Badge variant="outline" className={cn('text-[0.65rem] font-semibold', categoryColors[d.category] || categoryColors.Other)}>
          {d.category}
        </Badge>
      ),
    },
    {
      key: 'reference',
      header: 'Reference #',
      render: (d) => <span className="text-xs font-mono text-muted-foreground">{d.reference}</span>,
    },
    {
      key: 'fileSize',
      header: 'File Size',
      sortable: true,
      render: (d) => <span className="text-xs text-muted-foreground">{d.fileSize}</span>,
    },
    {
      key: 'uploadedDate',
      header: 'Uploaded Date',
      sortable: true,
      render: (d) => <span className="text-xs text-muted-foreground">{formatDate(d.uploadedDate)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-[120px] text-right',
      render: (d) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" className="w-7 h-7 p-0" onClick={(e) => { e.stopPropagation(); setViewDoc(d); }}>
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-7 h-7 p-0" onClick={(e) => { e.stopPropagation(); handleDownload(d); }}>
            <Download className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-7 h-7 p-0 text-red-400 hover:text-red-300" onClick={(e) => { e.stopPropagation(); setDeleteDoc(d); }}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <PageWrapper title="Documents" description="Manage warehouse documents">
        <LoadingState rows={6} message="Loading documents..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Documents"
      description="Manage warehouse documents"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Button variant="default" size="sm" className="gap-1.5 text-xs" onClick={() => setCreateOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> Upload
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Documents" value={stats.total} icon={<FileText className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="GRN Docs" value={stats.grn} icon={<Upload className="w-5 h-5" />} iconColor="green" />
        <KPICard title="GDN Docs" value={stats.gdn} icon={<FileSignature className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Reports" value={stats.reports} icon={<History className="w-5 h-5" />} iconColor="amber" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, type, or reference..."
              className="pl-9 h-9"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[100px] h-9 text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(t => (
                  <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[120px] h-9 text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(c => (
                  <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {(search || typeFilter !== 'All' || categoryFilter !== 'All') && (
          <p className="text-[0.65rem] text-muted-foreground mt-2 ml-1">{filtered.length} document(s) found</p>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No documents found"
          description="No documents match your search or filter criteria."
          action={
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setSearch(''); setTypeFilter('All'); setCategoryFilter('All'); }}>
              <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
            </Button>
          }
        />
      ) : (
        <DataTable data={filtered} columns={columns} pageSize={10} />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Document title"
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['PDF', 'XLSX', 'DOCX', 'ZIP', 'Image'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['GRN', 'GDN', 'Packing List', 'Stock Report', 'Damage Report', 'Label', 'Other'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Reference</Label>
              <Input
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="e.g. REF-2001"
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">File</Label>
              <div className="border border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors">
                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Click or drag file to upload</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/60">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button size="sm" onClick={handleCreate}>Upload</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Drawer open={!!viewDoc} onOpenChange={(o) => { if (!o) setViewDoc(null); }}>
        <DrawerContent className="sm:max-w-md">
          <DrawerHeader>
            <DrawerTitle>Document Details</DrawerTitle>
          </DrawerHeader>
          {viewDoc && (
            <div className="px-6 pb-6 space-y-5">
              <div className="flex items-center gap-3">
                {getDocIcon(viewDoc.type)}
                <div>
                  <h4 className="text-sm font-semibold">{viewDoc.title}</h4>
                  <p className="text-xs text-muted-foreground">{viewDoc.type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[0.6rem] text-muted-foreground">Category</Label>
                  <Badge variant="outline" className={cn('mt-1 text-[0.65rem] font-semibold', categoryColors[viewDoc.category] || categoryColors.Other)}>
                    {viewDoc.category}
                  </Badge>
                </div>
                <div>
                  <Label className="text-[0.6rem] text-muted-foreground">Reference</Label>
                  <p className="text-xs font-mono text-foreground mt-1">{viewDoc.reference}</p>
                </div>
                <div>
                  <Label className="text-[0.6rem] text-muted-foreground">File Size</Label>
                  <p className="text-xs text-foreground mt-1">{viewDoc.fileSize}</p>
                </div>
                <div>
                  <Label className="text-[0.6rem] text-muted-foreground">Uploaded</Label>
                  <p className="text-xs text-foreground mt-1">{formatDate(viewDoc.uploadedDate)}</p>
                </div>
              </div>
              <div>
                <Label className="text-[0.6rem] text-muted-foreground">Tags</Label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {viewDoc.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[0.6rem]">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-[0.6rem] text-muted-foreground">Status</Label>
                <p className="text-xs text-foreground mt-1">{viewDoc.status}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleDownload(viewDoc)}>
                  <Download className="w-3.5 h-3.5" /> Download
                </Button>
                <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => { setViewDoc(null); setDeleteDoc(viewDoc); }}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <AlertDialog open={!!deleteDoc} onOpenChange={(o) => { if (!o) setDeleteDoc(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDoc?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}

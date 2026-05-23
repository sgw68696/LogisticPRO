'use client';

import { useState, useEffect, useCallback } from 'react';
import { warehouseService } from '@/services/warehouseService';
import type { GoodsReceivedNote, GRNItem, GRNStatus } from '@/types/warehouse';
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
import { PackagePlus, Search, X, RotateCcw, Plus, Eye, Pencil, Trash2, Download, ArrowUpDown, Truck, Warehouse as WarehouseIcon, User, Phone, CalendarDays, FileText, CheckCircle, Clock, AlertTriangle, Box, ClipboardList } from 'lucide-react';

const grnStatusColors: Record<string, string> = {
  Draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Expected: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Received: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'In Inspection': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Putaway: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusFlow: Record<GRNStatus, GRNStatus | null> = {
  Draft: 'Expected',
  Expected: 'Received',
  Received: 'In Inspection',
  'In Inspection': 'Putaway',
  Putaway: 'Completed',
  Completed: null,
  Cancelled: null,
};

const statuses = ['All', 'Draft', 'Expected', 'Received', 'In Inspection', 'Putaway', 'Completed', 'Cancelled'];

const conditionColors: Record<string, string> = {
  Good: 'text-emerald-400 bg-emerald-500/10',
  Damaged: 'text-red-400 bg-red-500/10',
  Partial: 'text-amber-400 bg-amber-500/10',
};

export default function InboundPage() {
  const [grns, setGrns] = useState<GoodsReceivedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<GRNStatus | 'All'>('All');

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingGrn, setEditingGrn] = useState<GoodsReceivedNote | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailGrn, setDetailGrn] = useState<GoodsReceivedNote | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receivingGrn, setReceivingGrn] = useState<GoodsReceivedNote | null>(null);
  const [receiveItems, setReceiveItems] = useState<GRNItem[]>([]);

  const [form, setForm] = useState({
    poReference: '',
    vendor: '',
    vendorContact: '',
    warehouseId: '',
    dock: '',
    receivedDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const fetchGRNs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await warehouseService.listGRNs({ status: statusFilter === 'All' ? undefined : statusFilter, search: search || undefined });
      setGrns(data);
    } catch {
      toast.error('Failed to load GRNs');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchGRNs(); }, [fetchGRNs]);

  const resetForm = () => setForm({ poReference: '', vendor: '', vendorContact: '', warehouseId: '', dock: '', receivedDate: new Date().toISOString().split('T')[0], notes: '' });

  const handleCreate = async () => {
    if (!form.poReference || !form.vendor) { toast.error('PO Reference and Vendor are required'); return; }
    try {
      await warehouseService.createGRN({
        companyId: 'cmp-001',
        poReference: form.poReference,
        vendor: form.vendor,
        vendorContact: form.vendorContact,
        warehouseId: form.warehouseId || undefined,
        dock: form.dock,
        receivedDate: new Date(form.receivedDate).toISOString(),
        notes: form.notes,
        status: 'Draft',
        items: [],
        totalItems: 0,
        totalQuantity: 0,
        receivedBy: 'Current User',
        timeline: [{
          id: `tl-${Date.now()}`,
          type: 'created',
          title: 'GRN Created',
          description: 'Goods Received Note created',
          entityType: 'GRN',
          entityId: '',
          userId: 'user-001',
          userName: 'Current User',
          timestamp: new Date().toISOString(),
        }],
      });
      toast.success('GRN created');
      setCreateOpen(false);
      resetForm();
      fetchGRNs();
    } catch { toast.error('Failed to create GRN'); }
  };

  const handleEdit = async () => {
    if (!editingGrn) return;
    try {
      await warehouseService.updateGRN(editingGrn.id, {
        poReference: form.poReference,
        vendor: form.vendor,
        vendorContact: form.vendorContact,
        warehouseId: form.warehouseId || undefined,
        dock: form.dock,
        receivedDate: new Date(form.receivedDate).toISOString(),
        notes: form.notes,
      });
      toast.success('GRN updated');
      setEditOpen(false);
      setEditingGrn(null);
      fetchGRNs();
    } catch { toast.error('Failed to update GRN'); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await warehouseService.deleteGRN(deletingId);
      toast.success('GRN deleted');
      setDeleteOpen(false);
      setDeletingId(null);
      fetchGRNs();
    } catch { toast.error('Failed to delete GRN'); }
  };

  const openEdit = (grn: GoodsReceivedNote) => {
    setEditingGrn(grn);
    setForm({
      poReference: grn.poReference,
      vendor: grn.vendor,
      vendorContact: grn.vendorContact,
      warehouseId: grn.warehouseId,
      dock: grn.dock,
      receivedDate: grn.receivedDate ? grn.receivedDate.split('T')[0] : '',
      notes: grn.notes || '',
    });
    setEditOpen(true);
  };

  const openDetail = (grn: GoodsReceivedNote) => {
    setDetailGrn(grn);
    setDetailOpen(true);
  };

  const advanceStatus = async (grn: GoodsReceivedNote) => {
    const next = statusFlow[grn.status];
    if (!next) return;
    try {
      await warehouseService.updateGRN(grn.id, {
        status: next,
        timeline: [...(grn.timeline || []), {
          id: `tl-${Date.now()}`,
          type: next.toLowerCase().replace(/\s+/g, '_'),
          title: `Status → ${next}`,
          description: `GRN advanced to ${next}`,
          entityType: 'GRN',
          entityId: grn.id,
          userId: 'user-001',
          userName: 'Current User',
          timestamp: new Date().toISOString(),
        }],
      });
      toast.success(`GRN advanced to ${next}`);
      fetchGRNs();
    } catch { toast.error('Failed to advance status'); }
  };

  const openReceive = (grn: GoodsReceivedNote) => {
    setReceivingGrn(grn);
    setReceiveItems(grn.items.map(item => ({ ...item, receivedQuantity: item.expectedQuantity, acceptedQuantity: item.expectedQuantity, rejectedQuantity: 0 })));
    setReceiveOpen(true);
  };

  const handleReceiveItemChange = (index: number, field: keyof GRNItem, value: number | string) => {
    setReceiveItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'receivedQuantity' || field === 'acceptedQuantity' || field === 'rejectedQuantity') {
        const item = updated[index];
        const received = Number(item.receivedQuantity);
        const accepted = Number(item.acceptedQuantity);
        const rejected = Number(item.rejectedQuantity);
        if (accepted + rejected > received) {
          updated[index] = { ...updated[index], rejectedQuantity: received - accepted };
        }
      }
      return updated;
    });
  };

  const handleReceiveConfirm = async () => {
    if (!receivingGrn) return;
    try {
      await warehouseService.updateGRN(receivingGrn.id, {
        items: receiveItems,
        status: 'Received',
        totalQuantity: receiveItems.reduce((s, i) => s + Number(i.receivedQuantity), 0),
        timeline: [...(receivingGrn.timeline || []), {
          id: `tl-${Date.now()}`,
          type: 'received',
          title: 'Goods Received',
          description: `${receiveItems.length} items received`,
          entityType: 'GRN',
          entityId: receivingGrn.id,
          userId: 'user-001',
          userName: 'Current User',
          timestamp: new Date().toISOString(),
        }],
      });
      toast.success('Goods received successfully');
      setReceiveOpen(false);
      setReceivingGrn(null);
      fetchGRNs();
    } catch { toast.error('Failed to receive goods'); }
  };

  const cancelGRN = async (grn: GoodsReceivedNote) => {
    try {
      await warehouseService.updateGRN(grn.id, {
        status: 'Cancelled',
        timeline: [...(grn.timeline || []), {
          id: `tl-${Date.now()}`,
          type: 'cancelled',
          title: 'GRN Cancelled',
          description: 'Goods Received Note cancelled',
          entityType: 'GRN',
          entityId: grn.id,
          userId: 'user-001',
          userName: 'Current User',
          timestamp: new Date().toISOString(),
        }],
      });
      toast.success('GRN cancelled');
      fetchGRNs();
    } catch { toast.error('Failed to cancel GRN'); }
  };

  const handleExport = () => {
    const data = grns.map(g => ({
      'GRN #': g.grnId,
      'PO Reference': g.poReference,
      Vendor: g.vendor,
      Warehouse: g.warehouseName,
      'Total Items': g.totalItems,
      'Total Qty': g.totalQuantity,
      Status: g.status,
      'Received By': g.receivedBy,
      'Received Date': formatDate(g.receivedDate),
    }));
    exportToCSV(data, `inbound-grns-${new Date().toISOString().split('T')[0]}`, Object.keys(data[0] || {}).map(k => ({ key: k as keyof typeof data[0], label: k })));
    toast.success('CSV exported');
  };

  const kpis = [
    { title: 'Total GRNs', value: grns.length, icon: <ClipboardList className="w-5 h-5" />, iconColor: 'indigo' as const },
    { title: 'Completed', value: grns.filter(g => g.status === 'Completed').length, icon: <CheckCircle className="w-5 h-5" />, iconColor: 'green' as const },
    { title: 'In Progress', value: grns.filter(g => g.status !== 'Completed' && g.status !== 'Cancelled' && g.status !== 'Draft').length, icon: <Clock className="w-5 h-5" />, iconColor: 'cyan' as const },
    { title: 'Pending', value: grns.filter(g => g.status === 'Draft').length, icon: <AlertTriangle className="w-5 h-5" />, iconColor: 'amber' as const },
    { title: 'Cancelled', value: grns.filter(g => g.status === 'Cancelled').length, icon: <X className="w-5 h-5" />, iconColor: 'red' as const },
  ];

  const columns: Column<GoodsReceivedNote>[] = [
    {
      key: 'grnId', header: 'GRN #', sortable: true,
      render: (g) => <span className="font-mono text-xs font-semibold text-cyan-400">{g.grnId}</span>,
    },
    {
      key: 'poReference', header: 'PO Ref', sortable: true,
      render: (g) => <span className="text-xs text-muted-foreground">{g.poReference}</span>,
    },
    {
      key: 'vendor', header: 'Vendor', sortable: true,
      render: (g) => <span className="font-semibold text-sm">{g.vendor}</span>,
    },
    { key: 'warehouseName', header: 'Warehouse', sortable: true },
    {
      key: 'totalQuantity', header: 'Items/Qty', sortable: true,
      render: (g) => <span className="text-xs text-muted-foreground">{g.totalItems} items / {g.totalQuantity} qty</span>,
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (g) => (
        <Badge className={cn('border text-[0.7rem] font-semibold px-2 py-0.5', grnStatusColors[g.status])} variant="outline">
          {g.status}
        </Badge>
      ),
    },
    {
      key: 'receivedBy', header: 'Received By', sortable: true,
      render: (g) => (
        <div className="flex flex-col">
          <span className="text-xs">{g.receivedBy}</span>
          <span className="text-[0.65rem] text-muted-foreground">{formatDate(g.receivedDate)}</span>
        </div>
      ),
    },
    {
      key: 'actions', header: 'Actions',
      render: (g) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); openDetail(g); }} title="View Details"><Eye className="w-3.5 h-3.5" /></Button>
          {(g.status === 'Draft' || g.status === 'Expected') && (
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); openEdit(g); }} title="Edit"><Pencil className="w-3.5 h-3.5" /></Button>
          )}
          {g.status === 'Draft' && (
            <Button variant="ghost" size="icon" className="w-7 h-7 text-red-400 hover:text-red-300" onClick={(e) => { e.stopPropagation(); setDeletingId(g.id); setDeleteOpen(true); }} title="Delete"><Trash2 className="w-3.5 h-3.5" /></Button>
          )}
          {statusFlow[g.status] && g.status !== 'Cancelled' && (
            <Button variant="ghost" size="icon" className="w-7 h-7 text-emerald-400 hover:text-emerald-300" onClick={(e) => { e.stopPropagation(); if (g.status === 'Expected') openReceive(g); else advanceStatus(g); }} title={`Advance to ${statusFlow[g.status]}`}>
              <ArrowUpDown className="w-3.5 h-3.5" />
            </Button>
          )}
          {g.status !== 'Cancelled' && g.status !== 'Completed' && (
            <Button variant="ghost" size="icon" className="w-7 h-7 text-red-400 hover:text-red-300" onClick={(e) => { e.stopPropagation(); cancelGRN(g); }} title="Cancel"><X className="w-3.5 h-3.5" /></Button>
          )}
        </div>
      ),
    },
  ];

  const filteredGRNs = grns;

  return (
    <PageWrapper title="Inbound (GRN)">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {kpis.map((kpi, i) => (
            <KPICard key={i} title={kpi.title} value={kpi.value} icon={kpi.icon} iconColor={kpi.iconColor} />
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search GRN, PO, vendor, warehouse..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-xs" />
              {search && <X className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => setSearch('')} />}
            </div>
            <div className="flex gap-1 flex-wrap">
              {statuses.map(s => (
                <button key={s} onClick={() => setStatusFilter(s as GRNStatus | 'All')} className={cn('px-2.5 py-1 rounded-full text-[0.7rem] font-medium transition-colors border', statusFilter === s ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-transparent text-muted-foreground border-border hover:border-cyan-500/30 hover:text-cyan-300')}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 text-xs" onClick={handleExport}><Download className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
            <Button size="sm" className="h-9 text-xs" onClick={() => { resetForm(); setCreateOpen(true); }}><Plus className="w-3.5 h-3.5 mr-1" />Create GRN</Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingState rows={6} message="Loading GRNs..." />
        ) : filteredGRNs.length === 0 ? (
          <EmptyState icon={<Truck className="w-8 h-8" />} title="No GRNs found" description={search || statusFilter !== 'All' ? 'Try adjusting your search or filters' : 'Create your first Goods Received Note'} action={<Button size="sm" onClick={() => { resetForm(); setCreateOpen(true); }}><Plus className="w-4 h-4 mr-1" />Create GRN</Button>} />
        ) : (
          <DataTable data={filteredGRNs} columns={columns} pageSize={10} onRowClick={openDetail} />
        )}

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Create GRN</DialogTitle></DialogHeader>
            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">PO Reference *</Label>
                  <Input value={form.poReference} onChange={e => setForm(p => ({ ...p, poReference: e.target.value }))} placeholder="PO-2025-..." className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Vendor *</Label>
                  <Input value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} placeholder="Vendor name" className="h-9 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Vendor Contact</Label>
                  <Input value={form.vendorContact} onChange={e => setForm(p => ({ ...p, vendorContact: e.target.value }))} placeholder="Phone" className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Warehouse</Label>
                  <Input value={form.warehouseId} onChange={e => setForm(p => ({ ...p, warehouseId: e.target.value }))} placeholder="Warehouse ID" className="h-9 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Dock</Label>
                  <Input value={form.dock} onChange={e => setForm(p => ({ ...p, dock: e.target.value }))} placeholder="Dock-A-1" className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Received Date</Label>
                  <Input type="date" value={form.receivedDate} onChange={e => setForm(p => ({ ...p, receivedDate: e.target.value }))} className="h-9 text-xs" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" className="h-9 text-xs" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
              <DialogClose asChild><Button variant="outline" size="sm" className="h-9 text-xs">Cancel</Button></DialogClose>
              <Button size="sm" className="h-9 text-xs" onClick={handleCreate}>Create GRN</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Edit GRN</DialogTitle></DialogHeader>
            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">PO Reference *</Label>
                  <Input value={form.poReference} onChange={e => setForm(p => ({ ...p, poReference: e.target.value }))} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Vendor *</Label>
                  <Input value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} className="h-9 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Vendor Contact</Label>
                  <Input value={form.vendorContact} onChange={e => setForm(p => ({ ...p, vendorContact: e.target.value }))} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Warehouse</Label>
                  <Input value={form.warehouseId} onChange={e => setForm(p => ({ ...p, warehouseId: e.target.value }))} className="h-9 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Dock</Label>
                  <Input value={form.dock} onChange={e => setForm(p => ({ ...p, dock: e.target.value }))} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Received Date</Label>
                  <Input type="date" value={form.receivedDate} onChange={e => setForm(p => ({ ...p, receivedDate: e.target.value }))} className="h-9 text-xs" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="h-9 text-xs" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
              <DialogClose asChild><Button variant="outline" size="sm" className="h-9 text-xs">Cancel</Button></DialogClose>
              <Button size="sm" className="h-9 text-xs" onClick={handleEdit}>Update GRN</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Detail Drawer */}
        <Drawer direction="right" open={detailOpen} onOpenChange={setDetailOpen}>
          <DrawerContent className="sm:max-w-lg">
            <DrawerHeader className="border-b border-border">
              <DrawerTitle>GRN Details</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 w-7 h-7"><X className="w-3.5 h-3.5" /></Button>
              </DrawerClose>
            </DrawerHeader>
            {detailGrn && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-mono text-lg font-bold text-cyan-400">{detailGrn.grnId}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{detailGrn.poReference}</p>
                  </div>
                  <Badge className={cn('border text-xs font-semibold px-3 py-1', grnStatusColors[detailGrn.status])} variant="outline">{detailGrn.status}</Badge>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Vendor</Label>
                      <p className="text-sm font-semibold mt-0.5">{detailGrn.vendor}</p>
                    </div>
                    <div>
                      <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Contact</Label>
                      <p className="text-sm mt-0.5">{detailGrn.vendorContact}</p>
                    </div>
                    <div>
                      <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Warehouse</Label>
                      <p className="text-sm mt-0.5">{detailGrn.warehouseName}</p>
                    </div>
                    <div>
                      <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Dock</Label>
                      <p className="text-sm mt-0.5">{detailGrn.dock}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Received By</Label>
                      <p className="text-sm mt-0.5">{detailGrn.receivedBy}</p>
                    </div>
                    <div>
                      <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Received Date</Label>
                      <p className="text-sm mt-0.5">{formatDate(detailGrn.receivedDate, 'datetime')}</p>
                    </div>
                    <div>
                      <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Created</Label>
                      <p className="text-sm mt-0.5">{formatDate(detailGrn.createdAt, 'datetime')}</p>
                    </div>
                    {detailGrn.notes && (
                      <div>
                        <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Notes</Label>
                        <p className="text-sm mt-0.5">{detailGrn.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider mb-2 block">Items ({detailGrn.totalItems})</Label>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left px-3 py-2 font-semibold text-muted-foreground">SKU</th>
                          <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Product</th>
                          <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Expected</th>
                          <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Received</th>
                          <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Accepted</th>
                          <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Rejected</th>
                          <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Condition</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailGrn.items.map((item, idx) => (
                          <tr key={item.id || idx} className="border-t border-border hover:bg-muted/30">
                            <td className="px-3 py-2 font-mono font-semibold">{item.sku}</td>
                            <td className="px-3 py-2">{item.productName}</td>
                            <td className="px-3 py-2 text-center">{item.expectedQuantity}</td>
                            <td className="px-3 py-2 text-center">{item.receivedQuantity}</td>
                            <td className="px-3 py-2 text-center text-emerald-400">{item.acceptedQuantity}</td>
                            <td className="px-3 py-2 text-center text-red-400">{item.rejectedQuantity}</td>
                            <td className="px-3 py-2 text-center">
                              <Badge className={cn('border text-[0.6rem]', conditionColors[item.condition] || 'text-muted-foreground')} variant="outline">{item.condition}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider mb-2 block">Timeline</Label>
                  <div className="space-y-3">
                    {(detailGrn.timeline || []).slice().reverse().map((event, idx) => (
                      <div key={event.id || idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-cyan-400/70 mt-1.5" />
                          {idx < (detailGrn.timeline?.length || 1) - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                        </div>
                        <div className="flex-1 pb-3">
                          <p className="text-xs font-semibold">{event.title}</p>
                          <p className="text-[0.65rem] text-muted-foreground">{event.description}</p>
                          <p className="text-[0.6rem] text-muted-foreground mt-0.5">{event.userName} · {formatDate(event.timestamp, 'datetime')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DrawerContent>
        </Drawer>

        {/* Delete Confirm */}
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete GRN</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to delete this Goods Received Note? This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Receive Items Dialog */}
        <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader><DialogTitle>Receive Items — {receivingGrn?.grnId}</DialogTitle></DialogHeader>
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">SKU</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Product</th>
                      <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Expected</th>
                      <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Received</th>
                      <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Accepted</th>
                      <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Rejected</th>
                      <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiveItems.map((item, idx) => (
                      <tr key={item.id || idx} className="border-t border-border">
                        <td className="px-3 py-2 font-mono font-semibold">{item.sku}</td>
                        <td className="px-3 py-2">{item.productName}</td>
                        <td className="px-3 py-2 text-center">{item.expectedQuantity}</td>
                        <td className="px-3 py-2">
                          <Input type="number" min={0} value={item.receivedQuantity} onChange={e => handleReceiveItemChange(idx, 'receivedQuantity', Number(e.target.value))} className="h-8 text-xs w-20 text-center mx-auto" />
                        </td>
                        <td className="px-3 py-2">
                          <Input type="number" min={0} value={item.acceptedQuantity} onChange={e => handleReceiveItemChange(idx, 'acceptedQuantity', Number(e.target.value))} className="h-8 text-xs w-20 text-center mx-auto" />
                        </td>
                        <td className="px-3 py-2">
                          <Input type="number" min={0} value={item.rejectedQuantity} onChange={e => handleReceiveItemChange(idx, 'rejectedQuantity', Number(e.target.value))} className="h-8 text-xs w-20 text-center mx-auto" />
                        </td>
                        <td className="px-3 py-2">
                          <Select value={item.condition} onValueChange={v => handleReceiveItemChange(idx, 'condition', v)}>
                            <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Good">Good</SelectItem>
                              <SelectItem value="Damaged">Damaged</SelectItem>
                              <SelectItem value="Partial">Partial</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
              <DialogClose asChild><Button variant="outline" size="sm" className="h-9 text-xs">Cancel</Button></DialogClose>
              <Button size="sm" className="h-9 text-xs" onClick={handleReceiveConfirm}>Confirm Receipt</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
}

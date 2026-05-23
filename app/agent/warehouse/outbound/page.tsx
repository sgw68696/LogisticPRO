'use client';

import { useState, useEffect, useCallback } from 'react';
import { warehouseService } from '@/services/warehouseService';
import type { GoodsDispatchNote, GDNItem, GDNStatus } from '@/types/warehouse';
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
import { PackageMinus, Search, X, RotateCcw, Plus, Eye, Pencil, Trash2, Download, ArrowUpDown, Truck, Warehouse as WarehouseIcon, User, Phone, CalendarDays, FileText, CheckCircle, Clock, AlertTriangle, Box, ClipboardList, MapPin, Package } from 'lucide-react';

const gdnStatusColors: Record<string, string> = {
  Draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Picking: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Packed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Loading: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Dispatched: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusFlow: Record<GDNStatus, GDNStatus | null> = {
  Draft: 'Picking',
  Picking: 'Packed',
  Packed: 'Loading',
  Loading: 'Dispatched',
  Dispatched: 'Delivered',
  Delivered: null,
  Cancelled: null,
};

const statuses = ['All', 'Draft', 'Picking', 'Packed', 'Loading', 'Dispatched', 'Delivered', 'Cancelled'];

export default function OutboundPage() {
  const [gdns, setGdns] = useState<GoodsDispatchNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<GDNStatus | 'All'>('All');

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingGdn, setEditingGdn] = useState<GoodsDispatchNote | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailGdn, setDetailGdn] = useState<GoodsDispatchNote | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [dispatchingGdn, setDispatchingGdn] = useState<GoodsDispatchNote | null>(null);
  const [dispatchForm, setDispatchForm] = useState({ vehicleNo: '', driverName: '', driverContact: '' });

  const [form, setForm] = useState({
    orderRef: '',
    customer: '',
    customerContact: '',
    warehouseId: '',
    dock: '',
    notes: '',
  });

  const fetchGDNs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await warehouseService.listGDNs({ status: statusFilter === 'All' ? undefined : statusFilter, search: search || undefined });
      setGdns(data);
    } catch {
      toast.error('Failed to load GDNs');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchGDNs(); }, [fetchGDNs]);

  const resetForm = () => setForm({ orderRef: '', customer: '', customerContact: '', warehouseId: '', dock: '', notes: '' });

  const handleCreate = async () => {
    if (!form.orderRef || !form.customer) { toast.error('Order Reference and Customer are required'); return; }
    try {
      await warehouseService.createGDN({
        companyId: 'cmp-001',
        orderRef: form.orderRef,
        customer: form.customer,
        customerContact: form.customerContact,
        warehouseId: form.warehouseId || undefined,
        dock: form.dock,
        notes: form.notes,
        status: 'Draft',
        items: [],
        totalItems: 0,
        totalQuantity: 0,
        timeline: [{
          id: `tl-${Date.now()}`,
          type: 'created',
          title: 'GDN Created',
          description: 'Goods Dispatch Note created',
          entityType: 'GDN',
          entityId: '',
          userId: 'user-001',
          userName: 'Current User',
          timestamp: new Date().toISOString(),
        }],
      });
      toast.success('GDN created');
      setCreateOpen(false);
      resetForm();
      fetchGDNs();
    } catch { toast.error('Failed to create GDN'); }
  };

  const handleEdit = async () => {
    if (!editingGdn) return;
    try {
      await warehouseService.updateGDN(editingGdn.id, {
        orderRef: form.orderRef,
        customer: form.customer,
        customerContact: form.customerContact,
        warehouseId: form.warehouseId || undefined,
        dock: form.dock,
        notes: form.notes,
      });
      toast.success('GDN updated');
      setEditOpen(false);
      setEditingGdn(null);
      fetchGDNs();
    } catch { toast.error('Failed to update GDN'); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await warehouseService.deleteGDN(deletingId);
      toast.success('GDN deleted');
      setDeleteOpen(false);
      setDeletingId(null);
      fetchGDNs();
    } catch { toast.error('Failed to delete GDN'); }
  };

  const openEdit = (gdn: GoodsDispatchNote) => {
    setEditingGdn(gdn);
    setForm({
      orderRef: gdn.orderRef,
      customer: gdn.customer,
      customerContact: gdn.customerContact,
      warehouseId: gdn.warehouseId,
      dock: gdn.dock,
      notes: gdn.notes || '',
    });
    setEditOpen(true);
  };

  const openDetail = (gdn: GoodsDispatchNote) => {
    setDetailGdn(gdn);
    setDetailOpen(true);
  };

  const advanceStatus = async (gdn: GoodsDispatchNote) => {
    const next = statusFlow[gdn.status];
    if (!next) return;
    try {
      const updates: Partial<GoodsDispatchNote> = {
        status: next,
        timeline: [...(gdn.timeline || []), {
          id: `tl-${Date.now()}`,
          type: next.toLowerCase().replace(/\s+/g, '_'),
          title: `Status → ${next}`,
          description: `GDN advanced to ${next}`,
          entityType: 'GDN',
          entityId: gdn.id,
          userId: 'user-001',
          userName: 'Current User',
          timestamp: new Date().toISOString(),
        }],
      };
      if (next === 'Packed') updates.packedBy = 'Current User';
      if (next === 'Picking') updates.pickedBy = 'Current User';
      await warehouseService.updateGDN(gdn.id, updates);
      toast.success(`GDN advanced to ${next}`);
      fetchGDNs();
    } catch { toast.error('Failed to advance status'); }
  };

  const openDispatch = (gdn: GoodsDispatchNote) => {
    setDispatchingGdn(gdn);
    setDispatchForm({ vehicleNo: gdn.vehicleNo || '', driverName: gdn.driverName || '', driverContact: gdn.driverContact || '' });
    setDispatchOpen(true);
  };

  const handleDispatchConfirm = async () => {
    if (!dispatchingGdn) return;
    if (!dispatchForm.vehicleNo || !dispatchForm.driverName) { toast.error('Vehicle # and Driver Name are required'); return; }
    try {
      await warehouseService.updateGDN(dispatchingGdn.id, {
        status: 'Dispatched',
        vehicleNo: dispatchForm.vehicleNo,
        driverName: dispatchForm.driverName,
        driverContact: dispatchForm.driverContact,
        dispatchDate: new Date().toISOString(),
        timeline: [...(dispatchingGdn.timeline || []), {
          id: `tl-${Date.now()}`,
          type: 'dispatched',
          title: 'Goods Dispatched',
          description: `Vehicle ${dispatchForm.vehicleNo} · Driver: ${dispatchForm.driverName}`,
          entityType: 'GDN',
          entityId: dispatchingGdn.id,
          userId: 'user-001',
          userName: 'Current User',
          timestamp: new Date().toISOString(),
        }],
      });
      toast.success('GDN dispatched');
      setDispatchOpen(false);
      setDispatchingGdn(null);
      fetchGDNs();
    } catch { toast.error('Failed to dispatch GDN'); }
  };

  const cancelGDN = async (gdn: GoodsDispatchNote) => {
    try {
      await warehouseService.updateGDN(gdn.id, {
        status: 'Cancelled',
        timeline: [...(gdn.timeline || []), {
          id: `tl-${Date.now()}`,
          type: 'cancelled',
          title: 'GDN Cancelled',
          description: 'Goods Dispatch Note cancelled',
          entityType: 'GDN',
          entityId: gdn.id,
          userId: 'user-001',
          userName: 'Current User',
          timestamp: new Date().toISOString(),
        }],
      });
      toast.success('GDN cancelled');
      fetchGDNs();
    } catch { toast.error('Failed to cancel GDN'); }
  };

  const handleExport = () => {
    const data = gdns.map(g => ({
      'GDN #': g.gdnId,
      'Order Ref': g.orderRef,
      Customer: g.customer,
      Warehouse: g.warehouseName,
      'Total Items': g.totalItems,
      'Total Qty': g.totalQuantity,
      Status: g.status,
      'Vehicle #': g.vehicleNo || '-',
      'Picked By': g.pickedBy || '-',
      'Packed By': g.packedBy || '-',
    }));
    exportToCSV(data, `outbound-gdns-${new Date().toISOString().split('T')[0]}`, Object.keys(data[0] || {}).map(k => ({ key: k as keyof typeof data[0], label: k })));
    toast.success('CSV exported');
  };

  const kpis = [
    { title: 'Total GDNs', value: gdns.length, icon: <ClipboardList className="w-5 h-5" />, iconColor: 'indigo' as const },
    { title: 'Delivered', value: gdns.filter(g => g.status === 'Delivered').length, icon: <CheckCircle className="w-5 h-5" />, iconColor: 'green' as const },
    { title: 'Dispatched', value: gdns.filter(g => g.status === 'Dispatched').length, icon: <Truck className="w-5 h-5" />, iconColor: 'cyan' as const },
    { title: 'Packing', value: gdns.filter(g => g.status === 'Picking' || g.status === 'Packed' || g.status === 'Loading').length, icon: <Package className="w-5 h-5" />, iconColor: 'amber' as const },
    { title: 'Pending', value: gdns.filter(g => g.status === 'Draft').length, icon: <Clock className="w-5 h-5" />, iconColor: 'teal' as const },
  ];

  const columns: Column<GoodsDispatchNote>[] = [
    {
      key: 'gdnId', header: 'GDN #', sortable: true,
      render: (g) => <span className="font-mono text-xs font-semibold text-cyan-400">{g.gdnId}</span>,
    },
    {
      key: 'orderRef', header: 'Order Ref', sortable: true,
      render: (g) => <span className="text-xs text-muted-foreground">{g.orderRef}</span>,
    },
    {
      key: 'customer', header: 'Customer', sortable: true,
      render: (g) => <span className="font-semibold text-sm">{g.customer}</span>,
    },
    { key: 'warehouseName', header: 'Warehouse', sortable: true },
    {
      key: 'totalQuantity', header: 'Items/Qty', sortable: true,
      render: (g) => <span className="text-xs text-muted-foreground">{g.totalItems} items / {g.totalQuantity} qty</span>,
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (g) => (
        <Badge className={cn('border text-[0.7rem] font-semibold px-2 py-0.5', gdnStatusColors[g.status])} variant="outline">
          {g.status}
        </Badge>
      ),
    },
    {
      key: 'vehicleNo', header: 'Vehicle #', sortable: true,
      render: (g) => <span className="text-xs font-mono">{g.vehicleNo || '-'}</span>,
    },
    {
      key: 'pickedBy', header: 'Picked/Packed By', sortable: true,
      render: (g) => (
        <div className="flex flex-col text-[0.65rem]">
          <span>Pick: {g.pickedBy || '-'}</span>
          <span>Pack: {g.packedBy || '-'}</span>
        </div>
      ),
    },
    {
      key: 'actions', header: 'Actions',
      render: (g) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); openDetail(g); }} title="View Details"><Eye className="w-3.5 h-3.5" /></Button>
          {g.status === 'Draft' && (
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); openEdit(g); }} title="Edit"><Pencil className="w-3.5 h-3.5" /></Button>
          )}
          {g.status === 'Draft' && (
            <Button variant="ghost" size="icon" className="w-7 h-7 text-red-400 hover:text-red-300" onClick={(e) => { e.stopPropagation(); setDeletingId(g.id); setDeleteOpen(true); }} title="Delete"><Trash2 className="w-3.5 h-3.5" /></Button>
          )}
          {statusFlow[g.status] && g.status !== 'Cancelled' && g.status !== 'Dispatched' && (
            <Button variant="ghost" size="icon" className="w-7 h-7 text-emerald-400 hover:text-emerald-300" onClick={(e) => { e.stopPropagation(); advanceStatus(g); }} title={`Advance to ${statusFlow[g.status]}`}>
              <ArrowUpDown className="w-3.5 h-3.5" />
            </Button>
          )}
          {g.status === 'Loading' && (
            <Button variant="ghost" size="icon" className="w-7 h-7 text-cyan-400 hover:text-cyan-300" onClick={(e) => { e.stopPropagation(); openDispatch(g); }} title="Dispatch"><Truck className="w-3.5 h-3.5" /></Button>
          )}
          {g.status !== 'Cancelled' && g.status !== 'Delivered' && (
            <Button variant="ghost" size="icon" className="w-7 h-7 text-red-400 hover:text-red-300" onClick={(e) => { e.stopPropagation(); cancelGDN(g); }} title="Cancel"><X className="w-3.5 h-3.5" /></Button>
          )}
        </div>
      ),
    },
  ];

  const filteredGDNs = gdns;

  const getStatusActionLabel = (status: GDNStatus): string => {
    const labels: Record<string, string> = {
      Draft: 'Start Picking',
      Picking: 'Pack Items',
      Packed: 'Load Vehicle',
      Loading: 'Dispatch',
      Dispatched: 'Confirm Delivery',
    };
    return labels[status] || '';
  };

  return (
    <PageWrapper title="Outbound (GDN)">
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
              <Input placeholder="Search GDN, order, customer, warehouse..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-xs" />
              {search && <X className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => setSearch('')} />}
            </div>
            <div className="flex gap-1 flex-wrap">
              {statuses.map(s => (
                <button key={s} onClick={() => setStatusFilter(s as GDNStatus | 'All')} className={cn('px-2.5 py-1 rounded-full text-[0.7rem] font-medium transition-colors border', statusFilter === s ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-transparent text-muted-foreground border-border hover:border-cyan-500/30 hover:text-cyan-300')}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 text-xs" onClick={handleExport}><Download className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
            <Button size="sm" className="h-9 text-xs" onClick={() => { resetForm(); setCreateOpen(true); }}><Plus className="w-3.5 h-3.5 mr-1" />Create GDN</Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingState rows={6} message="Loading GDNs..." />
        ) : filteredGDNs.length === 0 ? (
          <EmptyState icon={<Package className="w-8 h-8" />} title="No GDNs found" description={search || statusFilter !== 'All' ? 'Try adjusting your search or filters' : 'Create your first Goods Dispatch Note'} action={<Button size="sm" onClick={() => { resetForm(); setCreateOpen(true); }}><Plus className="w-4 h-4 mr-1" />Create GDN</Button>} />
        ) : (
          <DataTable data={filteredGDNs} columns={columns} pageSize={10} onRowClick={openDetail} />
        )}

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Create GDN</DialogTitle></DialogHeader>
            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Order Reference *</Label>
                  <Input value={form.orderRef} onChange={e => setForm(p => ({ ...p, orderRef: e.target.value }))} placeholder="ORD-2025-..." className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Customer *</Label>
                  <Input value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))} placeholder="Customer name" className="h-9 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Customer Contact</Label>
                  <Input value={form.customerContact} onChange={e => setForm(p => ({ ...p, customerContact: e.target.value }))} placeholder="Phone" className="h-9 text-xs" />
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
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" className="h-9 text-xs" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
              <DialogClose asChild><Button variant="outline" size="sm" className="h-9 text-xs">Cancel</Button></DialogClose>
              <Button size="sm" className="h-9 text-xs" onClick={handleCreate}>Create GDN</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Edit GDN</DialogTitle></DialogHeader>
            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Order Reference *</Label>
                  <Input value={form.orderRef} onChange={e => setForm(p => ({ ...p, orderRef: e.target.value }))} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Customer *</Label>
                  <Input value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))} className="h-9 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Customer Contact</Label>
                  <Input value={form.customerContact} onChange={e => setForm(p => ({ ...p, customerContact: e.target.value }))} className="h-9 text-xs" />
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
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="h-9 text-xs" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
              <DialogClose asChild><Button variant="outline" size="sm" className="h-9 text-xs">Cancel</Button></DialogClose>
              <Button size="sm" className="h-9 text-xs" onClick={handleEdit}>Update GDN</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Detail Drawer */}
        <Drawer direction="right" open={detailOpen} onOpenChange={setDetailOpen}>
          <DrawerContent className="sm:max-w-lg">
            <DrawerHeader className="border-b border-border">
              <DrawerTitle>GDN Details</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 w-7 h-7"><X className="w-3.5 h-3.5" /></Button>
              </DrawerClose>
            </DrawerHeader>
            {detailGdn && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-mono text-lg font-bold text-cyan-400">{detailGdn.gdnId}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{detailGdn.orderRef}</p>
                  </div>
                  <Badge className={cn('border text-xs font-semibold px-3 py-1', gdnStatusColors[detailGdn.status])} variant="outline">{detailGdn.status}</Badge>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Customer</Label>
                      <p className="text-sm font-semibold mt-0.5">{detailGdn.customer}</p>
                    </div>
                    <div>
                      <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Contact</Label>
                      <p className="text-sm mt-0.5">{detailGdn.customerContact}</p>
                    </div>
                    <div>
                      <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Warehouse</Label>
                      <p className="text-sm mt-0.5">{detailGdn.warehouseName}</p>
                    </div>
                    <div>
                      <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Dock</Label>
                      <p className="text-sm mt-0.5">{detailGdn.dock}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Dispatch Date</Label>
                      <p className="text-sm mt-0.5">{formatDate(detailGdn.dispatchDate, 'datetime')}</p>
                    </div>
                    <div>
                      <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Picked By</Label>
                      <p className="text-sm mt-0.5">{detailGdn.pickedBy || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Packed By</Label>
                      <p className="text-sm mt-0.5">{detailGdn.packedBy || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Created</Label>
                      <p className="text-sm mt-0.5">{formatDate(detailGdn.createdAt, 'datetime')}</p>
                    </div>
                    {detailGdn.notes && (
                      <div>
                        <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Notes</Label>
                        <p className="text-sm mt-0.5">{detailGdn.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vehicle/Driver Info (if dispatched) */}
                {(detailGdn.status === 'Dispatched' || detailGdn.status === 'Delivered') && (
                  <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4 space-y-2">
                    <Label className="text-[0.65rem] text-cyan-400 uppercase tracking-wider block">Dispatch Info</Label>
                    <div className="flex items-center gap-2 text-sm"><Truck className="w-4 h-4 text-cyan-400" /> {detailGdn.vehicleNo}</div>
                    <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-cyan-400" /> {detailGdn.driverName}</div>
                    <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-cyan-400" /> {detailGdn.driverContact}</div>
                  </div>
                )}

                {/* Items Table */}
                <div>
                  <Label className="text-[0.65rem] text-muted-foreground uppercase tracking-wider mb-2 block">Items ({detailGdn.totalItems})</Label>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left px-3 py-2 font-semibold text-muted-foreground">SKU</th>
                          <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Product</th>
                          <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Requested</th>
                          <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Picked</th>
                          <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Packed</th>
                          <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailGdn.items.map((item, idx) => (
                          <tr key={item.id || idx} className="border-t border-border hover:bg-muted/30">
                            <td className="px-3 py-2 font-mono font-semibold">{item.sku}</td>
                            <td className="px-3 py-2">{item.productName}</td>
                            <td className="px-3 py-2 text-center">{item.requestedQuantity}</td>
                            <td className="px-3 py-2 text-center">{item.pickedQuantity}</td>
                            <td className="px-3 py-2 text-center">{item.packedQuantity}</td>
                            <td className="px-3 py-2 text-center text-[0.6rem] font-mono">{item.locationName || item.locationId}</td>
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
                    {(detailGdn.timeline || []).slice().reverse().map((event, idx) => (
                      <div key={event.id || idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-cyan-400/70 mt-1.5" />
                          {idx < (detailGdn.timeline?.length || 1) - 1 && <div className="w-px flex-1 bg-border mt-1" />}
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
              <AlertDialogTitle>Delete GDN</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to delete this Goods Dispatch Note? This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dispatch Dialog */}
        <Dialog open={dispatchOpen} onOpenChange={setDispatchOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Dispatch GDN — {dispatchingGdn?.gdnId}</DialogTitle></DialogHeader>
            <div className="px-6 py-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Vehicle # *</Label>
                <Input value={dispatchForm.vehicleNo} onChange={e => setDispatchForm(p => ({ ...p, vehicleNo: e.target.value }))} placeholder="MH-01-AB-1234" className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Driver Name *</Label>
                <Input value={dispatchForm.driverName} onChange={e => setDispatchForm(p => ({ ...p, driverName: e.target.value }))} placeholder="Driver name" className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Driver Contact</Label>
                <Input value={dispatchForm.driverContact} onChange={e => setDispatchForm(p => ({ ...p, driverContact: e.target.value }))} placeholder="Phone number" className="h-9 text-xs" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
              <DialogClose asChild><Button variant="outline" size="sm" className="h-9 text-xs">Cancel</Button></DialogClose>
              <Button size="sm" className="h-9 text-xs" onClick={handleDispatchConfirm}>Confirm Dispatch</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
}

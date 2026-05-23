'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { warehouseService } from '@/services/warehouseService';
import type { GoodsDispatchNote } from '@/types/warehouse';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, formatDate } from '@/lib/utils';
import { exportToCSV } from '@/lib/export-utils';
import { toast } from 'sonner';
import {
  ClipboardList, Package, Search, X, RotateCcw, Plus, Eye, Pencil, Trash2,
  Download, ArrowUpDown, Truck, MapPin, Clock, CheckCircle2, AlertTriangle,
  User, Phone, Warehouse as WarehouseIcon, ShoppingCart
} from 'lucide-react';

const gdnStatusColors: Record<string, string> = {
  Draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Picking: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Packed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Loading: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Dispatched: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusFilters = ['All', 'Draft', 'Picking', 'Packed', 'Loading', 'Dispatched', 'Delivered', 'Cancelled'];

const statusFlow: Record<string, string> = {
  Draft: 'Picking',
  Picking: 'Packed',
  Packed: 'Loading',
  Loading: 'Dispatched',
  Dispatched: 'Delivered',
};

const statusFlowLabels: Record<string, string> = {
  Draft: 'Start Picking',
  Picking: 'Mark Packed',
  Packed: 'Load',
  Loading: 'Dispatch',
  Dispatched: 'Deliver',
};

const statusFlowIcons: Record<string, typeof Package> = {
  Draft: Package,
  Picking: Package,
  Packed: Package,
  Loading: Truck,
  Dispatched: Truck,
};

export default function AgentOrdersPage() {
  const [orders, setOrders] = useState<GoodsDispatchNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<GoodsDispatchNote | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<GoodsDispatchNote | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<GoodsDispatchNote | null>(null);
  const [formData, setFormData] = useState({
    orderRef: '',
    customer: '',
    customerContact: '',
    warehouseId: '',
    warehouseName: '',
    dock: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await warehouseService.listGDNs({
        status: statusFilter === 'All' ? undefined : statusFilter,
        search: search || undefined,
      });
      setOrders(data as GoodsDispatchNote[]);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const stats = useMemo(() => ({
    total: orders.length,
    picking: orders.filter((o) => o.status === 'Picking').length,
    packed: orders.filter((o) => o.status === 'Packed').length,
    dispatched: orders.filter((o) => o.status === 'Dispatched').length,
    delivered: orders.filter((o) => o.status === 'Delivered').length,
  }), [orders]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: orders.length };
    statusFilters.slice(1).forEach((st) => { counts[st] = orders.filter((o) => o.status === st).length; });
    return counts;
  }, [orders]);

  const openCreateDialog = () => {
    setEditingOrder(null);
    setFormData({ orderRef: '', customer: '', customerContact: '', warehouseId: '', warehouseName: '', dock: '', notes: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (order: GoodsDispatchNote) => {
    setEditingOrder(order);
    setFormData({
      orderRef: order.orderRef || '',
      customer: order.customer || '',
      customerContact: order.customerContact || '',
      warehouseId: order.warehouseId || '',
      warehouseName: order.warehouseName || '',
      dock: order.dock || '',
      notes: order.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.orderRef || !formData.customer) {
      toast.error('Order Reference and Customer are required');
      return;
    }
    setSaving(true);
    try {
      if (editingOrder) {
        await warehouseService.updateGDN(editingOrder.id, formData);
        toast.success('Order updated');
      } else {
        await warehouseService.createGDN(formData);
        toast.success('Order created');
      }
      setDialogOpen(false);
      fetchOrders();
    } catch {
      toast.error('Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;
    try {
      await warehouseService.deleteGDN(orderToDelete.id);
      toast.success('Order deleted');
      setDeleteConfirmOpen(false);
      setOrderToDelete(null);
      if (selectedOrder?.id === orderToDelete.id) {
        setSelectedOrder(null);
        setDrawerOpen(false);
      }
      fetchOrders();
    } catch {
      toast.error('Failed to delete order');
    }
  };

  const handleStatusFlow = async (order: GoodsDispatchNote) => {
    const nextStatus = statusFlow[order.status];
    if (!nextStatus) return;
    const updates: Partial<GoodsDispatchNote> = { status: nextStatus as any };
    if (nextStatus === 'Picking') updates.pickedBy = 'Agent';
    if (nextStatus === 'Packed') updates.packedBy = 'Agent';
    try {
      await warehouseService.updateGDN(order.id, updates);
      toast.success(`Order moved to ${nextStatus}`);
      fetchOrders();
      if (selectedOrder?.id === order.id) {
        setSelectedOrder((prev) => prev ? { ...prev, ...updates } : null);
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleView = (order: GoodsDispatchNote) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.error('No data to export');
      return;
    }
    exportToCSV(
      orders.map((o) => ({
        gdnId: o.gdnId,
        orderRef: o.orderRef,
        customer: o.customer,
        warehouse: o.warehouseName,
        items: o.totalItems,
        status: o.status,
        pickedBy: o.pickedBy || '',
        packedBy: o.packedBy || '',
        dispatchDate: o.dispatchDate ? formatDate(o.dispatchDate) : '',
      })),
      'warehouse-orders',
      [
        { key: 'gdnId', label: 'GDN ID' },
        { key: 'orderRef', label: 'Order Ref' },
        { key: 'customer', label: 'Customer' },
        { key: 'warehouse', label: 'Warehouse' },
        { key: 'items', label: 'Items' },
        { key: 'status', label: 'Status' },
        { key: 'pickedBy', label: 'Picked By' },
        { key: 'packedBy', label: 'Packed By' },
        { key: 'dispatchDate', label: 'Dispatch Date' },
      ]
    );
    toast.success('Orders exported');
  };

  const columns: Column<GoodsDispatchNote>[] = [
    {
      key: 'orderRef',
      header: 'Order Ref #',
      sortable: true,
      render: (o) => (
        <div>
          <span className="text-xs font-semibold text-foreground">{o.orderRef || o.gdnId}</span>
          <p className="text-[0.6rem] text-muted-foreground mt-0.5">{o.gdnId}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      sortable: true,
      render: (o) => (
        <div>
          <p className="text-xs font-semibold text-foreground">{o.customer}</p>
          {o.customerContact && <p className="text-[0.6rem] text-muted-foreground">{o.customerContact}</p>}
        </div>
      ),
    },
    {
      key: 'warehouseName',
      header: 'Warehouse',
      sortable: true,
      render: (o) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <WarehouseIcon className="w-3 h-3" />
          <span className="truncate max-w-[120px]">{o.warehouseName}</span>
        </div>
      ),
    },
    {
      key: 'totalItems',
      header: 'Items',
      sortable: true,
      render: (o) => <span className="text-xs text-muted-foreground">{o.totalItems}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (o) => (
        <Badge className={cn('text-[0.65rem] font-semibold', gdnStatusColors[o.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20')}>
          {o.status}
        </Badge>
      ),
    },
    {
      key: 'pickedBy',
      header: 'Picked By',
      render: (o) => <span className="text-xs text-muted-foreground">{o.pickedBy || '-'}</span>,
    },
    {
      key: 'dispatchDate',
      header: 'Dispatch Date',
      sortable: true,
      render: (o) => (
        <span className="text-xs text-muted-foreground">{o.dispatchDate ? formatDate(o.dispatchDate) : '-'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (o) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); handleView(o); }} title="View">
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); openEditDialog(o); }} title="Edit">
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setOrderToDelete(o); setDeleteConfirmOpen(true); }} title="Delete">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Orders"
      description="Manage goods dispatch notes"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportCSV} disabled={orders.length === 0}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
          <Button size="sm" className="gap-1.5" onClick={openCreateDialog}>
            <Plus className="w-3.5 h-3.5" /> New Order
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <KPICard title="Total Orders" value={stats.total} icon={<ClipboardList className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Picking" value={stats.picking} icon={<Package className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Packed" value={stats.packed} icon={<Package className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Dispatched" value={stats.dispatched} icon={<Truck className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Delivered" value={stats.delivered} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="green" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by GDN ID, Order Ref, Customer, or Warehouse..."
              className="pl-9 h-9 text-xs"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusFilters.map((st) => {
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold border transition-all',
                  isActive
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                    : 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground'
                )}
              >
                {st}
                <span className="text-[0.6rem] opacity-60">({statusCounts[st] || 0})</span>
              </button>
            );
          })}
        </div>
        {(search || statusFilter !== 'All') && (
          <p className="text-[0.65rem] text-muted-foreground mt-2 ml-1">{orders.length} order(s) found</p>
        )}
      </div>

      {loading ? (
        <LoadingState rows={8} message="Loading orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-8 h-8" />}
          title="No orders found"
          description={search || statusFilter !== 'All' ? 'No orders match your search or filter criteria.' : 'Create your first order to get started.'}
          action={
            search || statusFilter !== 'All' ? (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setSearch(''); setStatusFilter('All'); }}>
                <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
              </Button>
            ) : (
              <Button size="sm" className="gap-1.5" onClick={openCreateDialog}>
                <Plus className="w-3.5 h-3.5" /> Create Order
              </Button>
            )
          }
        />
      ) : (
        <DataTable
          data={orders}
          columns={columns}
          pageSize={15}
          onRowClick={handleView}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingOrder ? 'Edit Order' : 'New Order'}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="orderRef" className="text-xs">Order Reference</Label>
                <Input id="orderRef" value={formData.orderRef} onChange={(e) => setFormData((p) => ({ ...p, orderRef: e.target.value }))} placeholder="ORD-2025-..." className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customer" className="text-xs">Customer</Label>
                <Input id="customer" value={formData.customer} onChange={(e) => setFormData((p) => ({ ...p, customer: e.target.value }))} placeholder="Customer name" className="h-9 text-xs" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerContact" className="text-xs">Customer Contact</Label>
              <Input id="customerContact" value={formData.customerContact} onChange={(e) => setFormData((p) => ({ ...p, customerContact: e.target.value }))} placeholder="Phone or email" className="h-9 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="warehouseName" className="text-xs">Warehouse</Label>
                <Input id="warehouseName" value={formData.warehouseName} onChange={(e) => setFormData((p) => ({ ...p, warehouseName: e.target.value }))} placeholder="Warehouse name" className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dock" className="text-xs">Dock</Label>
                <Input id="dock" value={formData.dock} onChange={(e) => setFormData((p) => ({ ...p, dock: e.target.value }))} placeholder="Dock #" className="h-9 text-xs" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs">Notes</Label>
              <Input id="notes" value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" className="h-9 text-xs" />
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingOrder ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader className="border-b border-border/40 px-5 py-4">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-sm font-semibold flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                {selectedOrder?.gdnId || 'Order Details'}
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon-sm"><X className="w-4 h-4" /></Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="overflow-y-auto max-h-[70vh] p-5 space-y-5">
            {selectedOrder && (
              <>
                <div className="flex items-center justify-between">
                  <Badge className={cn('text-xs font-semibold', gdnStatusColors[selectedOrder.status])}>{selectedOrder.status}</Badge>
                  <span className="text-[0.65rem] text-muted-foreground">
                    Created {formatDate(selectedOrder.createdAt, 'datetime')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[0.6rem] font-semibold text-muted-foreground uppercase tracking-wider">Order Ref</p>
                    <p className="text-sm font-medium text-foreground">{selectedOrder.orderRef || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[0.6rem] font-semibold text-muted-foreground uppercase tracking-wider">GDN ID</p>
                    <p className="text-sm font-medium text-foreground">{selectedOrder.gdnId}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</h4>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-foreground">{selectedOrder.customer}</p>
                    {selectedOrder.customerContact && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" /> {selectedOrder.customerContact}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[0.6rem] font-semibold text-muted-foreground uppercase tracking-wider">Warehouse</p>
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                      <WarehouseIcon className="w-3 h-3 text-muted-foreground" />
                      {selectedOrder.warehouseName || '-'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[0.6rem] font-semibold text-muted-foreground uppercase tracking-wider">Dock</p>
                    <p className="text-xs text-foreground">{selectedOrder.dock || '-'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items ({selectedOrder.totalItems})</h4>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="divide-y divide-border/40 border border-border/40 rounded-lg">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={item.id || idx} className="flex items-center justify-between px-3 py-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground truncate">{item.productName}</p>
                            <p className="text-[0.6rem] text-muted-foreground">{item.sku} &middot; {item.category}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-3">
                            {item.requestedQuantity} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No items</p>
                  )}
                </div>

                {(selectedOrder.vehicleNo || selectedOrder.driverName) && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vehicle & Driver</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedOrder.vehicleNo && (
                        <div className="space-y-1">
                          <p className="text-[0.6rem] text-muted-foreground">Vehicle</p>
                          <p className="text-xs font-medium text-foreground">{selectedOrder.vehicleNo}</p>
                        </div>
                      )}
                      {selectedOrder.driverName && (
                        <div className="space-y-1">
                          <p className="text-[0.6rem] text-muted-foreground">Driver</p>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs font-medium text-foreground">{selectedOrder.driverName}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedOrder.driverContact && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" /> {selectedOrder.driverContact}
                      </div>
                    )}
                  </div>
                )}

                {selectedOrder.pickedBy && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/20 rounded-lg p-2.5 text-center border border-border/40">
                      <p className="text-xs font-semibold text-foreground">{selectedOrder.pickedBy}</p>
                      <p className="text-[0.55rem] text-muted-foreground mt-0.5">Picked By</p>
                    </div>
                    {selectedOrder.packedBy && (
                      <div className="bg-muted/20 rounded-lg p-2.5 text-center border border-border/40">
                        <p className="text-xs font-semibold text-foreground">{selectedOrder.packedBy}</p>
                        <p className="text-[0.55rem] text-muted-foreground mt-0.5">Packed By</p>
                      </div>
                    )}
                    {selectedOrder.checkedBy && (
                      <div className="bg-muted/20 rounded-lg p-2.5 text-center border border-border/40">
                        <p className="text-xs font-semibold text-foreground">{selectedOrder.checkedBy}</p>
                        <p className="text-[0.55rem] text-muted-foreground mt-0.5">Checked By</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedOrder.notes && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</h4>
                    <p className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-3 border border-border/40">{selectedOrder.notes}</p>
                  </div>
                )}

                {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</h4>
                    <div className="space-y-0">
                      {selectedOrder.timeline.map((event, idx) => (
                        <div key={event.id || idx} className="flex gap-3 pb-3 relative">
                          {idx < selectedOrder.timeline.length - 1 && (
                            <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border" />
                          )}
                          <div className={cn(
                            'w-3.5 h-3.5 rounded-full border-2 mt-0.5 shrink-0',
                            'bg-card border-muted-foreground/30'
                          )} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground">{event.title || event.type}</p>
                            <p className="text-[0.55rem] text-muted-foreground">{event.userName} &middot; {formatDate(event.timestamp, 'datetime')}</p>
                            {event.description && <p className="text-[0.55rem] text-muted-foreground/60 mt-0.5">{event.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {statusFlow[selectedOrder.status] && (
                  <div className="pt-2">
                    <Button
                      className="w-full gap-1.5"
                      size="sm"
                      onClick={() => handleStatusFlow(selectedOrder)}
                    >
                      <Package className="w-4 h-4" />
                      {statusFlowLabels[selectedOrder.status]}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">Delete Order</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete {orderToDelete?.gdnId}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction className="text-xs bg-red-500 hover:bg-red-600" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}

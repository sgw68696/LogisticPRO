'use client';

import { useState, useEffect, useCallback } from 'react';
import { warehouseService } from '@/services/warehouseService';
import type { InventoryItem, StockMovement } from '@/types/warehouse';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatDate } from '@/lib/utils';
import { exportToCSV } from '@/lib/export-utils';
import { toast } from 'sonner';
import { LayoutGrid, Package, Search, X, RotateCcw, Plus, Eye, Pencil, Trash2, Download, ArrowUpDown, AlertTriangle, Box, ClipboardList, Clock, TrendingUp, TrendingDown, BarChart3, RefreshCw, Filter } from 'lucide-react';

const categoryColors: Record<string, string> = {
  Electronics: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Clothing: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Food: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Automotive: 'bg-red-500/10 text-red-400 border-red-500/20',
  'Home & Garden': 'bg-green-500/10 text-green-400 border-green-500/20',
};

const movementTypeIcons: Record<string, React.ReactNode> = {
  Inbound: <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />,
  Outbound: <TrendingUp className="w-3.5 h-3.5 text-red-400" />,
  Transfer: <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />,
  Adjustment: <BarChart3 className="w-3.5 h-3.5 text-amber-400" />,
  Damage: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
};

export default function StockPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustNotes, setAdjustNotes] = useState('');

  const [movementDrawerOpen, setMovementDrawerOpen] = useState(false);
  const [movementItem, setMovementItem] = useState<InventoryItem | null>(null);
  const [itemMovements, setItemMovements] = useState<StockMovement[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, mov] = await Promise.all([
        warehouseService.listInventory({ category: categoryFilter === 'All' ? undefined : categoryFilter, search: search || undefined, lowStock: lowStockOnly || undefined }),
        warehouseService.listStockMovements(),
      ]);
      setInventory(inv);
      setMovements(mov);
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, search, lowStockOnly]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const categories = ['All', ...new Set(inventory.map(i => i.category))];

  const openAdjust = (item: InventoryItem) => {
    setAdjustingItem(item);
    setAdjustQty(item.quantity);
    setAdjustNotes('');
    setAdjustOpen(true);
  };

  const handleAdjust = async () => {
    if (!adjustingItem) return;
    if (adjustQty < 0) { toast.error('Quantity cannot be negative'); return; }
    try {
      await warehouseService.adjustInventory(adjustingItem.id, adjustQty);
      toast.success('Stock adjusted');
      setAdjustOpen(false);
      setAdjustingItem(null);
      fetchData();
    } catch { toast.error('Failed to adjust stock'); }
  };

  const openMovements = async (item: InventoryItem) => {
    setMovementItem(item);
    try {
      const allMovements = await warehouseService.listStockMovements();
      const filtered = allMovements.filter(m => m.sku === item.sku);
      setItemMovements(filtered);
      setMovementDrawerOpen(true);
    } catch {
      toast.error('Failed to load movements');
    }
  };

  const handleExport = () => {
    const data = inventory.map(i => ({
      SKU: i.sku,
      'Product Name': i.productName,
      Category: i.category,
      Quantity: i.quantity,
      Unit: i.unit,
      Location: i.location,
      'Batch #': i.batchNo || '-',
      'Expiry Date': i.expiryDate ? formatDate(i.expiryDate) : '-',
      'Last Updated': formatDate(i.lastUpdated, 'datetime'),
    }));
    exportToCSV(data, `stock-inventory-${new Date().toISOString().split('T')[0]}`, Object.keys(data[0] || {}).map(k => ({ key: k as keyof typeof data[0], label: k })));
    toast.success('CSV exported');
  };

  const totalSKUs = inventory.length;
  const totalUnits = inventory.reduce((s, i) => s + i.quantity, 0);
  const lowStockCount = inventory.filter(i => i.quantity < 20).length;
  const categoryCount = new Set(inventory.map(i => i.category)).size;

  const kpis = [
    { title: 'Total SKUs', value: totalSKUs, icon: <Box className="w-5 h-5" />, iconColor: 'indigo' as const },
    { title: 'Total Units', value: totalUnits.toLocaleString(), icon: <Package className="w-5 h-5" />, iconColor: 'cyan' as const },
    { title: 'Low Stock Items', value: lowStockCount, icon: <AlertTriangle className="w-5 h-5" />, iconColor: 'amber' as const },
    { title: 'Categories', value: categoryCount, icon: <LayoutGrid className="w-5 h-5" />, iconColor: 'teal' as const },
  ];

  const columns: Column<InventoryItem>[] = [
    {
      key: 'sku', header: 'SKU', sortable: true,
      render: (i) => <span className="font-mono font-bold text-xs">{i.sku}</span>,
    },
    {
      key: 'productName', header: 'Product Name', sortable: true,
      render: (i) => <span className="text-sm font-medium">{i.productName}</span>,
    },
    {
      key: 'category', header: 'Category', sortable: true,
      render: (i) => (
        <Badge className={cn('border text-[0.6rem] font-semibold px-2 py-0.5', categoryColors[i.category] || 'bg-gray-500/10 text-gray-400 border-gray-500/20')} variant="outline">
          {i.category}
        </Badge>
      ),
    },
    {
      key: 'quantity', header: 'Quantity', sortable: true,
      render: (i) => (
        <span className={cn('text-sm font-bold font-mono', i.quantity < 20 ? 'text-red-400 bg-red-500/10 px-2 py-0.5 rounded' : '')}>
          {i.quantity}
        </span>
      ),
    },
    { key: 'unit', header: 'Unit', sortable: true },
    { key: 'location', header: 'Location', sortable: true, render: (i) => <span className="text-xs font-mono">{i.location}</span> },
    {
      key: 'batchNo', header: 'Batch #', sortable: true,
      render: (i) => <span className="text-xs font-mono text-muted-foreground">{i.batchNo || '-'}</span>,
    },
    {
      key: 'expiryDate', header: 'Expiry Date', sortable: true,
      render: (i) => <span className="text-xs text-muted-foreground">{i.expiryDate ? formatDate(i.expiryDate) : '-'}</span>,
    },
    {
      key: 'lastUpdated', header: 'Last Updated', sortable: true,
      render: (i) => <span className="text-[0.65rem] text-muted-foreground">{formatDate(i.lastUpdated, 'datetime')}</span>,
    },
    {
      key: 'actions', header: 'Actions',
      render: (i) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); openAdjust(i); }} title="Adjust Stock"><Pencil className="w-3.5 h-3.5" /></Button>
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); openMovements(i); }} title="View Movements"><Clock className="w-3.5 h-3.5" /></Button>
        </div>
      ),
    },
  ];

  const filteredInventory = inventory;

  const recentMovements = movements.slice(0, 10);

  return (
    <PageWrapper title="Stock Positions">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <KPICard key={i} title={kpi.title} value={kpi.value} icon={kpi.icon} iconColor={kpi.iconColor} />
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search SKU, product, location..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-xs" />
              {search && <X className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => setSearch('')} />}
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 text-xs w-36"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <button onClick={() => setLowStockOnly(!lowStockOnly)} className={cn('px-2.5 py-1.5 rounded-full text-[0.7rem] font-medium transition-colors border flex items-center gap-1', lowStockOnly ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-transparent text-muted-foreground border-border hover:border-red-500/30 hover:text-red-300')}>
              <AlertTriangle className="w-3 h-3" />Low Stock Only
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 text-xs" onClick={handleExport}><Download className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingState rows={6} message="Loading inventory..." />
        ) : filteredInventory.length === 0 ? (
          <EmptyState icon={<Package className="w-8 h-8" />} title="No stock found" description={search || categoryFilter !== 'All' || lowStockOnly ? 'Try adjusting your search or filters' : 'No inventory items available'} />
        ) : (
          <DataTable data={filteredInventory} columns={columns} pageSize={10} />
        )}

        {/* Recent Movements */}
        <Card>
          <CardHeader className="px-5 py-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-cyan-400" />Recent Stock Movements</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="rounded-lg border border-border overflow-hidden mx-4 mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Type</th>
                    <th className="text-left px-3 py-2 font-semibold text-muted-foreground">SKU</th>
                    <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Product</th>
                    <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Qty</th>
                    <th className="text-left px-3 py-2 font-semibold text-muted-foreground">From → To</th>
                    <th className="text-left px-3 py-2 font-semibold text-muted-foreground">By</th>
                    <th className="text-left px-3 py-2 font-semibold text-muted-foreground">When</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-6 text-muted-foreground">No recent movements</td></tr>
                  ) : (
                    recentMovements.map((m, idx) => (
                      <tr key={m.id || idx} className="border-t border-border hover:bg-muted/30">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            {movementTypeIcons[m.type] || <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />}
                            <span className="font-medium">{m.type}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 font-mono font-semibold">{m.sku}</td>
                        <td className="px-3 py-2">{m.productName}</td>
                        <td className={cn('px-3 py-2 text-center font-mono font-bold', m.quantity > 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                        </td>
                        <td className="px-3 py-2 text-[0.6rem] font-mono text-muted-foreground">
                          {m.fromLocation} → {m.toLocation}
                        </td>
                        <td className="px-3 py-2">{m.userName}</td>
                        <td className="px-3 py-2 text-muted-foreground">{formatDate(m.timestamp, 'datetime')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Adjust Stock Dialog */}
        <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Adjust Stock</DialogTitle></DialogHeader>
            {adjustingItem && (
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{adjustingItem.productName}</p>
                    <p className="text-xs font-mono text-muted-foreground">{adjustingItem.sku}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{adjustingItem.location}</p>
                  </div>
                  <div className="text-right">
                    <Label className="text-[0.6rem] text-muted-foreground uppercase">Current Qty</Label>
                    <p className={cn('text-lg font-bold font-mono', adjustingItem.quantity < 20 ? 'text-red-400' : 'text-foreground')}>{adjustingItem.quantity}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">New Quantity</Label>
                  <Input type="number" min={0} value={adjustQty} onChange={e => setAdjustQty(Number(e.target.value))} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Notes</Label>
                  <Input value={adjustNotes} onChange={e => setAdjustNotes(e.target.value)} placeholder="Reason for adjustment" className="h-9 text-xs" />
                </div>
              </div>
            )}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
              <DialogClose asChild><Button variant="outline" size="sm" className="h-9 text-xs">Cancel</Button></DialogClose>
              <Button size="sm" className="h-9 text-xs" onClick={handleAdjust}>Confirm Adjustment</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Movement History Drawer */}
        <Drawer direction="right" open={movementDrawerOpen} onOpenChange={setMovementDrawerOpen}>
          <DrawerContent className="sm:max-w-md">
            <DrawerHeader className="border-b border-border">
              <DrawerTitle>Stock Movement History</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 w-7 h-7"><X className="w-3.5 h-3.5" /></Button>
              </DrawerClose>
            </DrawerHeader>
            {movementItem && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{movementItem.productName}</p>
                    <p className="text-xs font-mono text-muted-foreground">{movementItem.sku}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Current: <span className={cn('font-bold font-mono', movementItem.quantity < 20 ? 'text-red-400' : 'text-foreground')}>{movementItem.quantity}</span> {movementItem.unit}</p>
                  </div>
                </div>
                {itemMovements.length === 0 ? (
                  <EmptyState icon={<Clock className="w-8 h-8" />} title="No movements" description="No stock movements recorded for this item" />
                ) : (
                  <div className="space-y-3">
                    {itemMovements.slice().reverse().map((m, idx) => (
                      <div key={m.id || idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                            {movementTypeIcons[m.type] || <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />}
                          </div>
                          {idx < itemMovements.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold">{m.type}</p>
                            <span className={cn('text-xs font-bold font-mono', m.quantity > 0 ? 'text-emerald-400' : 'text-red-400')}>
                              {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                            </span>
                          </div>
                          <p className="text-[0.65rem] text-muted-foreground">{m.fromLocation} → {m.toLocation}</p>
                          <p className="text-[0.65rem] text-muted-foreground">{m.notes}</p>
                          <p className="text-[0.6rem] text-muted-foreground mt-0.5">{m.userName} · {formatDate(m.timestamp, 'datetime')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </DrawerContent>
        </Drawer>
      </div>
    </PageWrapper>
  );
}

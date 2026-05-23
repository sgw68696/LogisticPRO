'use client';
import { useState, useEffect, useCallback } from 'react';
import { warehouseService } from '@/services/warehouseService';
import type { WarehouseLocation } from '@/types/warehouse';
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
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatDate } from '@/lib/utils';
import { exportToCSV } from '@/lib/export-utils';
import { toast } from 'sonner';
import { MapPin, Search, X, RotateCcw, Plus, Eye, Pencil, Trash2, Download, ArrowUpDown, Box, ClipboardList, Archive, Layers, Grid, CheckCircle, Clock, AlertTriangle, RefreshCw, Filter } from 'lucide-react';

const locStatusColors: Record<string, string> = {
  Available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Occupied: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Reserved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Maintenance: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const locTypeColors: Record<string, string> = {
  Pallet: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Case: 'bg-green-500/10 text-green-400 border-green-500/20',
  Bulk: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Overflow: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Hazmat: 'bg-red-500/10 text-red-400 border-red-500/20',
  Reefer: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const zones = ['All', 'A', 'B', 'C', 'D', 'E'];
const statusFilters = ['All', 'Available', 'Occupied', 'Reserved', 'Maintenance'];

export default function LocationsPage() {
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<WarehouseLocation | null>(null);
  const [editForm, setEditForm] = useState({ capacity: 0, status: 'Available' as WarehouseLocation['status'], notes: '' });
  const [statusActionDialog, setStatusActionDialog] = useState<{ open: boolean; location: WarehouseLocation | null; newStatus: string }>({ open: false, location: null, newStatus: '' });

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await warehouseService.listLocations({
        zone: zoneFilter,
        status: statusFilter,
        search: search || undefined,
      });
      setLocations(data);
    } catch {
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  }, [zoneFilter, statusFilter, search]);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  const kpis = [
    { title: 'Total Locations', value: locations.length, icon: <Layers className="w-5 h-5" />, iconColor: 'indigo' as const },
    { title: 'Occupied', value: locations.filter(l => l.status === 'Occupied').length, icon: <Box className="w-5 h-5" />, iconColor: 'amber' as const },
    { title: 'Available', value: locations.filter(l => l.status === 'Available').length, icon: <CheckCircle className="w-5 h-5" />, iconColor: 'green' as const },
    { title: 'Maintenance', value: locations.filter(l => l.status === 'Maintenance').length, icon: <AlertTriangle className="w-5 h-5" />, iconColor: 'red' as const },
  ];

  const handleEdit = (loc: WarehouseLocation) => {
    setSelectedLocation(loc);
    setEditForm({ capacity: loc.capacity, status: loc.status, notes: '' });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedLocation) return;
    try {
      const updated = await warehouseService.updateLocation(selectedLocation.id, {
        capacity: editForm.capacity,
        status: editForm.status,
      });
      setLocations(prev => prev.map(l => l.id === updated.id ? updated : l));
      toast.success('Location updated');
      setEditDialogOpen(false);
    } catch { toast.error('Failed to update location'); }
  };

  const handleStatusAction = async (location: WarehouseLocation, newStatus: string) => {
    try {
      const updated = await warehouseService.updateLocation(location.id, { status: newStatus as WarehouseLocation['status'] });
      setLocations(prev => prev.map(l => l.id === updated.id ? updated : l));
      toast.success(`Location marked as ${newStatus}`);
      setStatusActionDialog({ open: false, location: null, newStatus: '' });
    } catch { toast.error('Failed to update status'); }
  };

  const handleExport = () => {
    exportToCSV(
      locations.map(l => ({
        locationId: l.locationId, zone: l.zone, aisle: l.aisle, rack: l.rack, shelf: l.shelf, bin: l.bin, type: l.type,
        status: l.status, capacity: l.capacity, usedCapacity: l.usedCapacity, currentSku: l.currentSku || '',
        currentProduct: l.currentProduct || '', lastUpdated: l.lastUpdated,
      })),
      'warehouse-locations',
      [
        { key: 'locationId', label: 'Location ID' }, { key: 'zone', label: 'Zone' },
        { key: 'aisle', label: 'Aisle' }, { key: 'rack', label: 'Rack' },
        { key: 'shelf', label: 'Shelf' }, { key: 'bin', label: 'Bin' },
        { key: 'type', label: 'Type' }, { key: 'status', label: 'Status' },
        { key: 'capacity', label: 'Capacity' }, { key: 'usedCapacity', label: 'Used Capacity' },
        { key: 'currentSku', label: 'Current SKU' }, { key: 'currentProduct', label: 'Current Product' },
        { key: 'lastUpdated', label: 'Last Updated' },
      ],
    );
    toast.success('Locations exported');
  };

  const columns: Column<WarehouseLocation>[] = [
    { key: 'locationId', header: 'Location', sortable: true, render: l => <span className="font-mono text-xs">{l.locationId}</span> },
    { key: 'zone', header: 'Zone', sortable: true, render: l => <Badge variant="outline" className="text-xs">{l.zone}</Badge> },
    {
      key: 'aisle', header: 'Aisle/Rack/Shelf/Bin', render: l => (
        <span className="text-xs text-muted-foreground">{l.aisle}/{l.rack}/{l.shelf}/{l.bin}</span>
      ),
    },
    {
      key: 'type', header: 'Type', render: l => (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', locTypeColors[l.type] || '')}>{l.type}</span>
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true, render: l => (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', locStatusColors[l.status] || '')}>{l.status}</span>
      ),
    },
    {
      key: 'capacity', header: 'Capacity/Used', render: l => {
        const pct = l.capacity > 0 ? Math.round((l.usedCapacity / l.capacity) * 100) : 0;
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all', pct > 80 ? 'bg-amber-500' : pct > 50 ? 'bg-blue-500' : 'bg-emerald-500')} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{l.usedCapacity}/{l.capacity}</span>
          </div>
        );
      },
    },
    {
      key: 'currentProduct', header: 'Current Product/SKU', render: l => (
        <div className="flex flex-col">
          {l.currentProduct ? <span className="text-xs font-medium">{l.currentProduct}</span> : <span className="text-xs text-muted-foreground">-</span>}
          {l.currentSku && <span className="text-[10px] text-muted-foreground font-mono">{l.currentSku}</span>}
        </div>
      ),
    },
    { key: 'lastUpdated', header: 'Last Updated', sortable: true, render: l => <span className="text-xs text-muted-foreground">{formatDate(l.lastUpdated)}</span> },
    {
      key: 'actions', header: 'Actions', render: l => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); setSelectedLocation(l); setDetailDrawerOpen(true); }}>
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); handleEdit(l); }}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          {l.status !== 'Maintenance' && (
            <Button variant="ghost" size="icon" className="w-7 h-7 text-purple-400" onClick={(e) => { e.stopPropagation(); setStatusActionDialog({ open: true, location: l, newStatus: 'Maintenance' }); }}>
              <AlertTriangle className="w-3.5 h-3.5" />
            </Button>
          )}
          {l.status !== 'Available' && (
            <Button variant="ghost" size="icon" className="w-7 h-7 text-emerald-400" onClick={(e) => { e.stopPropagation(); setStatusActionDialog({ open: true, location: l, newStatus: 'Available' }); }}>
              <CheckCircle className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageWrapper title="Bin / Rack Locations">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <KPICard key={i} title={kpi.title} value={kpi.value} icon={kpi.icon} iconColor={kpi.iconColor} />
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search location, barcode, SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 w-[260px] h-9 text-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {zones.map(z => (
                <button key={z} onClick={() => setZoneFilter(z)} className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-colors', zoneFilter === z ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                  {z}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-3.5 h-3.5 mr-1.5" />Export</Button>
            <Button variant="outline" size="sm" onClick={fetchLocations}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2">
          {statusFilters.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-colors', statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:bg-muted/80')}>
              {s === 'All' ? 'All Status' : s}
            </button>
          ))}
        </div>

        {/* Data */}
        {loading ? (
          <LoadingState rows={8} message="Loading locations..." />
        ) : locations.length === 0 ? (
          <EmptyState icon={<MapPin className="w-8 h-8" />} title="No locations found" description="Try adjusting your search or filters" />
        ) : (
          <DataTable data={locations} columns={columns} searchKey={undefined} pageSize={25} />
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Location</DialogTitle></DialogHeader>
          <div className="px-6 py-4 space-y-4">
            {selectedLocation && (
              <>
                <p className="text-sm text-muted-foreground font-mono">{selectedLocation.locationId} — {selectedLocation.zone}/{selectedLocation.aisle}/{selectedLocation.rack}/{selectedLocation.shelf}/{selectedLocation.bin}</p>
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input type="number" value={editForm.capacity} onChange={e => setEditForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select value={editForm.status} onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value as 'Available' | 'Occupied' | 'Reserved' | 'Maintenance' }))} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none">
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
            <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
            <Button size="sm" onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Drawer */}
      <Drawer open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen} direction="right">
        <DrawerContent className="max-w-md">
          <DrawerHeader className="border-b border-border">
            <DrawerTitle>Location Details</DrawerTitle>
            <DrawerClose className="absolute right-4 top-4"><X className="w-4 h-4" /></DrawerClose>
          </DrawerHeader>
          {selectedLocation && (
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm">{selectedLocation.locationId}</p>
                  <p className="text-xs text-muted-foreground">{selectedLocation.barcode}</p>
                </div>
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', locStatusColors[selectedLocation.status])}>
                  {selectedLocation.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs text-muted-foreground">Zone</Label><p className="text-sm font-medium">{selectedLocation.zone}</p></div>
                <div><Label className="text-xs text-muted-foreground">Aisle</Label><p className="text-sm font-medium">{selectedLocation.aisle}</p></div>
                <div><Label className="text-xs text-muted-foreground">Rack</Label><p className="text-sm font-medium">{selectedLocation.rack}</p></div>
                <div><Label className="text-xs text-muted-foreground">Shelf</Label><p className="text-sm font-medium">{selectedLocation.shelf}</p></div>
                <div><Label className="text-xs text-muted-foreground">Bin</Label><p className="text-sm font-medium">{selectedLocation.bin}</p></div>
                <div><Label className="text-xs text-muted-foreground">Type</Label><p className={cn('text-sm font-medium', locTypeColors[selectedLocation.type])}>{selectedLocation.type}</p></div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Capacity Utilization</Label>
                <div className="mt-1.5">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{selectedLocation.usedCapacity} used</span>
                    <span>{selectedLocation.capacity} total</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', (selectedLocation.usedCapacity / selectedLocation.capacity) > 0.8 ? 'bg-amber-500' : (selectedLocation.usedCapacity / selectedLocation.capacity) > 0.5 ? 'bg-blue-500' : 'bg-emerald-500')} style={{ width: `${Math.min(100, (selectedLocation.usedCapacity / selectedLocation.capacity) * 100)}%` }} />
                  </div>
                </div>
              </div>

              {selectedLocation.currentProduct && (
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <Label className="text-xs text-muted-foreground">Current Product</Label>
                  <p className="text-sm font-medium">{selectedLocation.currentProduct}</p>
                  <p className="text-xs font-mono text-muted-foreground">SKU: {selectedLocation.currentSku}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div><Label className="text-xs">Created</Label><p>{formatDate(selectedLocation.createdAt)}</p></div>
                <div><Label className="text-xs">Last Updated</Label><p>{formatDate(selectedLocation.updatedAt)}</p></div>
              </div>

              <div className="flex gap-2 pt-2">
                {selectedLocation.status !== 'Maintenance' && (
                  <Button size="sm" variant="outline" className="text-purple-400 border-purple-500/20" onClick={() => { setDetailDrawerOpen(false); setStatusActionDialog({ open: true, location: selectedLocation, newStatus: 'Maintenance' }); }}>
                    <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />Mark Maintenance
                  </Button>
                )}
                {selectedLocation.status !== 'Available' && (
                  <Button size="sm" variant="outline" className="text-emerald-400 border-emerald-500/20" onClick={() => { setDetailDrawerOpen(false); setStatusActionDialog({ open: true, location: selectedLocation, newStatus: 'Available' }); }}>
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />Mark Available
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => { handleEdit(selectedLocation); setDetailDrawerOpen(false); }}>
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />Edit
                </Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* Status Action Confirm */}
      <AlertDialog open={statusActionDialog.open} onOpenChange={open => setStatusActionDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark location <strong>{statusActionDialog.location?.locationId}</strong> as <strong>{statusActionDialog.newStatus}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => statusActionDialog.location && handleStatusAction(statusActionDialog.location, statusActionDialog.newStatus)}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}

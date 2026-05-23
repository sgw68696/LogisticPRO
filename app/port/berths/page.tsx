'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { portService } from '@/services/port/portService';
import type { Berth, BerthStatus } from '@/types/port';
import type { Vessel } from '@/types/port';
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
import { Anchor, Waves, Wrench, CheckCircle, Ship, Clock, Search, X, RotateCcw, Plus, Eye, Pencil, Trash2, Download, ArrowUpDown, Ruler, Drill, Container, Dock } from 'lucide-react';

const berthStatusColors: Record<string, string> = {
  Available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Occupied: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Reserved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Maintenance: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Out of Service': 'bg-red-500/10 text-red-400 border-red-500/20',
};

const berthStatusDot: Record<string, string> = {
  Available: 'bg-emerald-400', Occupied: 'bg-amber-400',
  Reserved: 'bg-blue-400', Maintenance: 'bg-purple-400', 'Out of Service': 'bg-red-400',
};

const berthTypeColors: Record<string, string> = {
  Container: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Bulk: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Liquid: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  General: 'bg-green-500/10 text-green-400 border-green-500/20',
  Passenger: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Repair: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusPillsOrder = [
  'All', 'Available', 'Occupied', 'Reserved', 'Maintenance', 'Out of Service',
] as const;

const berthTypeOptions = ['Container', 'Bulk', 'Liquid', 'General', 'Passenger', 'Repair'] as const;

const statusOptions: BerthStatus[] = ['Available', 'Occupied', 'Reserved', 'Maintenance', 'Out of Service'];

interface BerthFormData {
  name: string; type: typeof berthTypeOptions[number];
  depth: number; length: number; maxDraft: number;
  maxVesselLength: number; maxVesselBeam: number;
  craneCapacity: string; craneCount: number;
  operator: string; equipment: string; services: string; notes: string;
}

const defaultFormData: BerthFormData = {
  name: '', type: 'Container',
  depth: 12, length: 300, maxDraft: 14,
  maxVesselLength: 320, maxVesselBeam: 45,
  craneCapacity: '50T', craneCount: 2,
  operator: 'Port Authority', equipment: '', services: '', notes: '',
};

function OccupancyBar({ rate }: { rate: number }) {
  const color = rate > 85 ? 'bg-red-400' : rate > 65 ? 'bg-amber-400' : 'bg-emerald-400';
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${rate}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums w-10 text-right">{rate}%</span>
    </div>
  );
}

export default function BerthAllocationPage() {
  const [data, setData] = useState<Berth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [vessels, setVessels] = useState<Vessel[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBerth, setEditingBerth] = useState<Berth | null>(null);
  const [formData, setFormData] = useState<BerthFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBerth, setSelectedBerth] = useState<Berth | null>(null);

  const [deletingBerth, setDeletingBerth] = useState<Berth | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [allocateOpen, setAllocateOpen] = useState(false);
  const [allocateVesselName, setAllocateVesselName] = useState('');
  const [allocateVesselId, setAllocateVesselId] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await portService.listBerths({
        search: search || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        type: typeFilter !== 'All' ? typeFilter : undefined,
      });
      setData(result);
    } catch {
      setError('Failed to load berth data');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  const fetchVessels = useCallback(async () => {
    try {
      const result = await portService.listVessels({});
      setVessels(result);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = data.length;
    const occupied = data.filter(b => b.status === 'Occupied').length;
    const available = data.filter(b => b.status === 'Available').length;
    const maintenance = data.filter(b => b.status === 'Maintenance').length;
    return { total, occupied, available, maintenance };
  }, [data]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.operator.toLowerCase().includes(q) ||
      (b.currentVessel && b.currentVessel.toLowerCase().includes(q))
    );
  }, [data, search]);

  const resetForm = useCallback((berth?: Berth | null) => {
    if (berth) {
      setFormData({
        name: berth.name, type: berth.type,
        depth: berth.depth, length: berth.length,
        maxDraft: berth.maxDraft, maxVesselLength: berth.maxVesselLength,
        maxVesselBeam: berth.maxVesselBeam,
        craneCapacity: berth.craneCapacity, craneCount: berth.craneCount,
        operator: berth.operator,
        equipment: berth.equipment.join(', '),
        services: berth.services.join(', '),
        notes: berth.notes,
      });
    } else {
      setFormData(defaultFormData);
    }
  }, []);

  const openCreate = useCallback(() => {
    setEditingBerth(null);
    resetForm(null);
    setDialogOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((berth: Berth) => {
    setEditingBerth(berth);
    resetForm(berth);
    setDialogOpen(true);
  }, [resetForm]);

  const openDrawer = useCallback((berth: Berth) => {
    setSelectedBerth(berth);
    setDrawerOpen(true);
  }, []);

  const openAllocate = useCallback((berth: Berth) => {
    setSelectedBerth(berth);
    setAllocateVesselName('');
    setAllocateVesselId('');
    fetchVessels();
    setAllocateOpen(true);
  }, [fetchVessels]);

  const handleFormChange = useCallback((field: keyof BerthFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        depth: Number(formData.depth), length: Number(formData.length),
        maxDraft: Number(formData.maxDraft),
        maxVesselLength: Number(formData.maxVesselLength),
        maxVesselBeam: Number(formData.maxVesselBeam),
        craneCount: Number(formData.craneCount),
        equipment: formData.equipment.split(',').map(s => s.trim()).filter(Boolean),
        services: formData.services.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (editingBerth) {
        const updated = await portService.updateBerth(editingBerth.id, payload);
        setData(prev => prev.map(b => b.id === editingBerth.id ? { ...b, ...payload, updatedAt: new Date().toISOString() } as Berth : b));
        toast.success('Berth updated successfully');
      } else {
        const created = await portService.createBerth(payload);
        setData(prev => [...prev, created]);
        toast.success('Berth created successfully');
      }
      setDialogOpen(false);
    } catch {
      toast.error('Failed to save berth');
    } finally {
      setSaving(false);
    }
  }, [formData, editingBerth]);

  const handleDelete = useCallback(async () => {
    if (!deletingBerth) return;
    try {
      await portService.deleteBerth(deletingBerth.id);
      setData(prev => prev.filter(b => b.id !== deletingBerth.id));
      toast.success('Berth deleted');
      setDeleteOpen(false);
      setDeletingBerth(null);
    } catch {
      toast.error('Failed to delete berth');
    }
  }, [deletingBerth]);

  const handleAllocate = useCallback(async () => {
    if (!selectedBerth || !allocateVesselName) return;
    try {
      await portService.updateBerth(selectedBerth.id, {
        status: 'Occupied',
        currentVessel: allocateVesselName,
        currentVesselId: allocateVesselId || undefined,
        occupancyStart: new Date().toISOString(),
        occupancyEnd: null,
        occupancyRate: 100,
      });
      setData(prev => prev.map(b => b.id === selectedBerth.id ? {
        ...b, status: 'Occupied' as BerthStatus,
        currentVessel: allocateVesselName,
        currentVesselId: allocateVesselId || null,
        occupancyStart: new Date().toISOString(),
        occupancyEnd: null, occupancyRate: 100,
      } as Berth : b));
      if (selectedBerth.id === selectedBerth.id) {
        setSelectedBerth(prev => prev ? { ...prev, status: 'Occupied', currentVessel: allocateVesselName, occupancyRate: 100 } : null);
      }
      toast.success(`Berth allocated to ${allocateVesselName}`);
      setAllocateOpen(false);
    } catch {
      toast.error('Failed to allocate berth');
    }
  }, [selectedBerth, allocateVesselName, allocateVesselId]);

  const handleRelease = useCallback(async (berth: Berth) => {
    try {
      await portService.updateBerth(berth.id, {
        status: 'Available',
        currentVessel: null,
        currentVesselId: null,
        occupancyEnd: new Date().toISOString(),
        occupancyRate: 0,
      });
      setData(prev => prev.map(b => b.id === berth.id ? {
        ...b, status: 'Available' as BerthStatus,
        currentVessel: null, currentVesselId: null,
        occupancyEnd: new Date().toISOString(), occupancyRate: 0,
      } as Berth : b));
      if (selectedBerth?.id === berth.id) {
        setSelectedBerth(prev => prev ? { ...prev, status: 'Available', currentVessel: null, occupancyRate: 0 } : null);
      }
      toast.success('Berth released');
    } catch {
      toast.error('Failed to release berth');
    }
  }, [selectedBerth]);

  const handleExportCSV = useCallback(() => {
    if (filtered.length === 0) { toast.error('No data to export'); return; }
    exportToCSV(
      filtered.map(b => ({
        name: b.name, type: b.type, status: b.status,
        depth: b.depth, length: b.length,
        maxDraft: b.maxDraft, maxVesselLength: b.maxVesselLength,
        maxVesselBeam: b.maxVesselBeam,
        craneCapacity: b.craneCapacity, craneCount: b.craneCount,
        operator: b.operator, currentVessel: b.currentVessel || '',
        occupancyRate: b.occupancyRate,
      })),
      'berths-export',
      [
        { key: 'name', label: 'Berth Name' },
        { key: 'type', label: 'Type' },
        { key: 'status', label: 'Status' },
        { key: 'depth', label: 'Depth (m)' },
        { key: 'length', label: 'Length (m)' },
        { key: 'maxDraft', label: 'Max Draft (m)' },
        { key: 'maxVesselLength', label: 'Max Vessel Length (m)' },
        { key: 'maxVesselBeam', label: 'Max Vessel Beam (m)' },
        { key: 'craneCapacity', label: 'Crane Capacity' },
        { key: 'craneCount', label: 'Crane Count' },
        { key: 'operator', label: 'Operator' },
        { key: 'currentVessel', label: 'Current Vessel' },
        { key: 'occupancyRate', label: 'Occupancy Rate (%)' },
      ]
    );
    toast.success('Berths exported to CSV');
  }, [filtered]);

  const statusPills = useMemo(() => {
    const counts: Record<string, number> = { All: data.length };
    data.forEach(b => { counts[b.status] = (counts[b.status] || 0) + 1; });
    return statusPillsOrder.map(label => ({ label, count: counts[label] || 0 }));
  }, [data]);

  const columns: Column<Berth>[] = useMemo(() => [
    {
      key: 'name', header: 'Berth Name', sortable: true,
      render: (b) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Dock className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{b.name}</p>
            <p className="text-xs text-muted-foreground">{b.operator}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type', header: 'Type', sortable: true,
      render: (b) => (
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold border', berthTypeColors[b.type] || '')}>
          {b.type}
        </span>
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (b) => (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border', berthStatusColors[b.status])}>
          <span className={cn('w-1.5 h-1.5 rounded-full', berthStatusDot[b.status] || 'bg-muted-foreground')} />
          {b.status}
        </span>
      ),
    },
    {
      key: 'depth', header: 'Specs',
      render: (b) => (
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          <p>Depth: {b.depth}m</p>
          <p>Length: {b.length}m</p>
        </div>
      ),
    },
    {
      key: 'currentVessel', header: 'Current Vessel', sortable: true,
      render: (b) => (
        <span className="text-sm">
          {b.currentVessel ? (
            <span className="flex items-center gap-1.5">
              <Ship className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              {b.currentVessel}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </span>
      ),
    },
    {
      key: 'occupancyRate', header: 'Occupancy', sortable: true,
      render: (b) => <OccupancyBar rate={b.occupancyRate} />,
    },
    {
      key: 'craneCount', header: 'Cranes',
      render: (b) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {b.craneCount} × {b.craneCapacity}
        </span>
      ),
    },
    {
      key: 'id', header: '', className: 'w-[120px] text-right',
      render: (b) => (
        <div className="flex items-center justify-end gap-0.5" onClick={e => e.stopPropagation()}>
          <button onClick={() => openDrawer(b)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" title="View">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => openEdit(b)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors" title="Edit">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {b.status === 'Available' && (
            <button onClick={() => openAllocate(b)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors" title="Allocate">
              <Anchor className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => { setDeletingBerth(b); setDeleteOpen(true); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ], [openEdit, openDrawer, openAllocate]);

  return (
    <PageWrapper
      title="Berth Allocation"
      description="Manage berth assignments, occupancy, and vessel allocation"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Berth
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Berths" value={stats.total} icon={<Waves className="w-5 h-5" />} iconColor="cyan" description="All berths in port" />
        <KPICard title="Occupied" value={stats.occupied} icon={<Ship className="w-5 h-5" />} iconColor="amber" description="Currently in use" />
        <KPICard title="Available" value={stats.available} icon={<CheckCircle className="w-5 h-5" />} iconColor="green" description="Ready for allocation" />
        <KPICard title="In Maintenance" value={stats.maintenance} icon={<Wrench className="w-5 h-5" />} iconColor="red" description="Out of service" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search berths by name, operator, or vessel..."
              className="w-full h-10 pl-9 pr-9 bg-muted/40 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-[160px] h-10 bg-muted/40 border border-border rounded-lg text-sm text-foreground outline-none focus:border-primary/50 px-3"
          >
            <option value="All">All Types</option>
            {berthTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusPills.map(pill => (
            <button
              key={pill.label}
              onClick={() => setStatusFilter(pill.label)}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                statusFilter === pill.label && pill.label !== 'All' ? berthStatusColors[pill.label] : '',
                statusFilter === pill.label && pill.label === 'All' ? 'bg-primary/10 text-primary border-primary/30' : '',
                statusFilter !== pill.label ? 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:border-border' : '',
              )}
            >
              {pill.label !== 'All' && <span className={cn('w-1.5 h-1.5 rounded-full', berthStatusDot[pill.label] || 'bg-muted-foreground')} />}
              {pill.label}
              <span className={cn('text-[0.65rem]', statusFilter === pill.label ? 'opacity-80' : 'text-muted-foreground/60')}>{pill.count}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState rows={5} message="Loading berths..." />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Waves className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Failed to load berths</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">{error}</p>
          <Button variant="outline" onClick={fetchData} className="gap-2"><RotateCcw className="w-4 h-4" /> Retry</Button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Waves className="w-8 h-8 text-muted-foreground" />}
          title="No berths found"
          description={search || statusFilter !== 'All' || typeFilter !== 'All' ? 'Try adjusting your search or filter' : 'No berths configured yet'}
          action={<Button onClick={openCreate} size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" />Add Berth</Button>}
        />
      ) : (
        <DataTable<Berth>
          data={filtered}
          columns={columns}
          pageSize={10}
          pageSizeOptions={[10, 25, 50, 100]}
          onRowClick={openDrawer}
          emptyMessage="No berths match your criteria"
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBerth ? 'Edit Berth' : 'Add New Berth'}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Berth Name</Label>
                <Input value={formData.name} onChange={e => handleFormChange('name', e.target.value)} placeholder="e.g. Berth 1A" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</Label>
                <Select value={formData.type} onValueChange={v => handleFormChange('type', v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {berthTypeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Depth (m)</Label>
                <Input type="number" value={formData.depth} onChange={e => handleFormChange('depth', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Length (m)</Label>
                <Input type="number" value={formData.length} onChange={e => handleFormChange('length', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Draft (m)</Label>
                <Input type="number" value={formData.maxDraft} onChange={e => handleFormChange('maxDraft', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Vessel Length (m)</Label>
                <Input type="number" value={formData.maxVesselLength} onChange={e => handleFormChange('maxVesselLength', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Vessel Beam (m)</Label>
                <Input type="number" value={formData.maxVesselBeam} onChange={e => handleFormChange('maxVesselBeam', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Crane Capacity</Label>
                <Input value={formData.craneCapacity} onChange={e => handleFormChange('craneCapacity', e.target.value)} placeholder="e.g. 50T" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Crane Count</Label>
                <Input type="number" value={formData.craneCount} onChange={e => handleFormChange('craneCount', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operator</Label>
                <Input value={formData.operator} onChange={e => handleFormChange('operator', e.target.value)} placeholder="e.g. Port Authority" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Equipment (comma separated)</Label>
                <Input value={formData.equipment} onChange={e => handleFormChange('equipment', e.target.value)} placeholder="e.g. Gantry Crane, Forklift" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Services (comma separated)</Label>
                <Input value={formData.services} onChange={e => handleFormChange('services', e.target.value)} placeholder="e.g. Bunkering, Fresh Water" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</Label>
              <textarea
                value={formData.notes}
                onChange={e => handleFormChange('notes', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all resize-none"
                placeholder="Additional notes..."
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? 'Saving...' : editingBerth ? 'Update Berth' : 'Create Berth'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={allocateOpen} onOpenChange={setAllocateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Allocate Berth</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Allocating <strong>{selectedBerth?.name}</strong> to a vessel
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vessel Name</Label>
              <Input
                value={allocateVesselName}
                onChange={e => setAllocateVesselName(e.target.value)}
                placeholder="Enter vessel name"
                list="vessel-list"
              />
              <datalist id="vessel-list">
                {vessels.filter(v => v.status !== 'Departed').map(v => (
                  <option key={v.id} value={v.name} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vessel ID (optional)</Label>
              <Input
                value={allocateVesselId}
                onChange={e => setAllocateVesselId(e.target.value)}
                placeholder="e.g. ves-001"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This will mark the berth as Occupied and set the occupancy rate to 100%.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setAllocateOpen(false)}>Cancel</Button>
              <Button onClick={handleAllocate} disabled={!allocateVesselName} className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                <Anchor className="w-4 h-4" /> Allocate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Drawer direction="right" open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader className="border-b border-border/60">
            <DrawerTitle className="flex items-center gap-2">
              <Dock className="w-4 h-4 text-primary" />
              {selectedBerth?.name || 'Berth Details'}
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {selectedBerth && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{selectedBerth.berthId}</p>
                    <p className="text-xs text-muted-foreground">Operator: {selectedBerth.operator}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold border', berthTypeColors[selectedBerth.type])}>
                      {selectedBerth.type}
                    </span>
                    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border', berthStatusColors[selectedBerth.status])}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', berthStatusDot[selectedBerth.status])} />
                      {selectedBerth.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-muted/20 rounded-lg p-4 border border-border/40">
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Depth</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedBerth.depth}m</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Length</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedBerth.length}m</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Max Draft</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedBerth.maxDraft}m</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Max Vessel Length</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedBerth.maxVesselLength}m</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Max Vessel Beam</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedBerth.maxVesselBeam}m</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Cranes</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedBerth.craneCount} × {selectedBerth.craneCapacity}</p>
                  </div>
                  {selectedBerth.currentVessel && (
                    <>
                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Current Vessel</p>
                        <p className="text-sm font-medium text-foreground mt-0.5">{selectedBerth.currentVessel}</p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Vessel ID</p>
                        <p className="text-sm font-medium text-foreground mt-0.5">{selectedBerth.currentVesselId || '—'}</p>
                      </div>
                    </>
                  )}
                  <div className="col-span-2">
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider mb-1.5">Occupancy Rate</p>
                    <OccupancyBar rate={selectedBerth.occupancyRate} />
                  </div>
                  {selectedBerth.occupancyStart && (
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Occupied Since</p>
                      <p className="text-sm font-medium text-foreground mt-0.5">{formatDate(selectedBerth.occupancyStart, 'datetime')}</p>
                    </div>
                  )}
                  {selectedBerth.occupancyEnd && (
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Released At</p>
                      <p className="text-sm font-medium text-foreground mt-0.5">{formatDate(selectedBerth.occupancyEnd, 'datetime')}</p>
                    </div>
                  )}
                </div>

                {selectedBerth.equipment && selectedBerth.equipment.length > 0 && (
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider mb-2">Equipment</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBerth.equipment.map((eq, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-medium bg-muted/40 border border-border/60 text-muted-foreground">
                          <Drill className="w-3 h-3" /> {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedBerth.services && selectedBerth.services.length > 0 && (
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider mb-2">Services</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBerth.services.map((svc, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-medium bg-muted/40 border border-border/60 text-muted-foreground">
                          <Wrench className="w-3 h-3" /> {svc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedBerth.notes && (
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-foreground bg-muted/20 rounded-lg p-3 border border-border/40">{selectedBerth.notes}</p>
                  </div>
                )}

                <div>
                  <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider mb-2">Berth Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBerth.status === 'Available' && (
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openAllocate(selectedBerth)}>
                        <Anchor className="w-3.5 h-3.5" /> Allocate
                      </Button>
                    )}
                    {selectedBerth.status === 'Occupied' && (
                      <Button size="sm" variant="outline" className="gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10" onClick={() => handleRelease(selectedBerth)}>
                        <CheckCircle className="w-3.5 h-3.5" /> Release
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openEdit(selectedBerth)}>
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Berth</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingBerth?.name}</strong> ({deletingBerth?.type})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingBerth(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}

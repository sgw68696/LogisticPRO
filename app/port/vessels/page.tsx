'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { portService } from '@/services/port/portService';
import type { Vessel, VesselStatus, VesselTimelineEvent } from '@/types/port';
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
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { exportToCSV } from '@/lib/export-utils';
import { toast } from 'sonner';
import { Ship, Anchor, Clock, Sailboat, Waves, Search, X, RotateCcw, Plus, Eye, Pencil, Trash2, Download, CalendarClock, MapPin, User, Flag, Gauge, ArrowUpDown, History } from 'lucide-react';

const vesselStatusColors: Record<string, string> = {
  Expected: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Arrived: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Berthing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Docked: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Loading: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Unloading: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Sailing: 'bg-green-500/10 text-green-400 border-green-500/20',
  Departed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Delayed: 'bg-red-500/10 text-red-400 border-red-500/20',
  Anchored: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const statusPills = [
  'All', 'Expected', 'Arrived', 'Berthing', 'Docked', 'Loading',
  'Unloading', 'Sailing', 'Departed', 'Delayed', 'Anchored',
] as const;

const vesselTypeOptions: Vessel['vesselType'][] = [
  'Container Ship', 'Bulk Carrier', 'Tanker', 'Ro-Ro', 'General Cargo', 'Reefer',
];

const statusOptions: VesselStatus[] = [
  'Expected', 'Arrived', 'Berthing', 'Docked', 'Loading',
  'Unloading', 'Sailing', 'Departed', 'Delayed', 'Anchored',
];

interface VesselFormData {
  name: string; imo: string; flag: string; vesselType: Vessel['vesselType'];
  voyage: string; carrier: string; captain: string; crewCount: number;
  port: string; status: VesselStatus; eta: string;
  cargoCapacity: number; cargoLoaded: number;
  grossTonnage: number; deadweight: number; length: number; beam: number;
  lastPort: string; nextPort: string; notes: string;
}

const defaultFormData: VesselFormData = {
  name: '', imo: '', flag: '', vesselType: 'Container Ship',
  voyage: '', carrier: '', captain: '', crewCount: 0,
  port: '', status: 'Expected', eta: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
  cargoCapacity: 0, cargoLoaded: 0,
  grossTonnage: 0, deadweight: 0, length: 0, beam: 0,
  lastPort: '', nextPort: '', notes: '',
};

export default function PortVesselsPage() {
  const [data, setData] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [formData, setFormData] = useState<VesselFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);

  const [deletingVessel, setDeletingVessel] = useState<Vessel | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await portService.listVessels({
        search: search || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      setData(result);
    } catch {
      setError('Failed to load vessel data');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = data.length;
    const arrivedDocked = data.filter(v => v.status === 'Arrived' || v.status === 'Docked').length;
    const departed = data.filter(v => v.status === 'Departed' || v.status === 'Sailing').length;
    const delayed = data.filter(v => v.status === 'Delayed').length;
    return { total, arrivedDocked, departed, delayed };
  }, [data]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.imo.toLowerCase().includes(q) ||
      v.voyage.toLowerCase().includes(q) ||
      v.carrier.toLowerCase().includes(q) ||
      v.port.toLowerCase().includes(q)
    );
  }, [data, search]);

  const resetForm = useCallback((vessel?: Vessel | null) => {
    if (vessel) {
      setFormData({
        name: vessel.name, imo: vessel.imo, flag: vessel.flag,
        vesselType: vessel.vesselType, voyage: vessel.voyage,
        carrier: vessel.carrier, captain: vessel.captain,
        crewCount: vessel.crewCount, port: vessel.port,
        status: vessel.status, eta: vessel.eta.slice(0, 16),
        cargoCapacity: vessel.cargoCapacity, cargoLoaded: vessel.cargoLoaded,
        grossTonnage: vessel.grossTonnage, deadweight: vessel.deadweight,
        length: vessel.length, beam: vessel.beam,
        lastPort: vessel.lastPort, nextPort: vessel.nextPort,
        notes: vessel.notes,
      });
    } else {
      setFormData(defaultFormData);
    }
  }, []);

  const openCreate = useCallback(() => {
    setEditingVessel(null);
    resetForm(null);
    setDialogOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((vessel: Vessel) => {
    setEditingVessel(vessel);
    resetForm(vessel);
    setDialogOpen(true);
  }, [resetForm]);

  const openDrawer = useCallback((vessel: Vessel) => {
    setSelectedVessel(vessel);
    setDrawerOpen(true);
  }, []);

  const handleFormChange = useCallback((field: keyof VesselFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        crewCount: Number(formData.crewCount),
        cargoCapacity: Number(formData.cargoCapacity),
        cargoLoaded: Number(formData.cargoLoaded),
        grossTonnage: Number(formData.grossTonnage),
        deadweight: Number(formData.deadweight),
        length: Number(formData.length),
        beam: Number(formData.beam),
      };
      if (editingVessel) {
        await portService.updateVessel(editingVessel.id, payload);
        setData(prev => prev.map(v => v.id === editingVessel.id ? { ...v, ...payload, updatedAt: new Date().toISOString() } as Vessel : v));
        toast.success('Vessel updated successfully');
      } else {
        const created = await portService.createVessel(payload);
        setData(prev => [...prev, created]);
        toast.success('Vessel created successfully');
      }
      setDialogOpen(false);
    } catch {
      toast.error('Failed to save vessel');
    } finally {
      setSaving(false);
    }
  }, [formData, editingVessel]);

  const handleDelete = useCallback(async () => {
    if (!deletingVessel) return;
    try {
      await portService.deleteVessel(deletingVessel.id);
      setData(prev => prev.filter(v => v.id !== deletingVessel.id));
      toast.success('Vessel deleted');
      setDeleteOpen(false);
      setDeletingVessel(null);
    } catch {
      toast.error('Failed to delete vessel');
    }
  }, [deletingVessel]);

  const handleStatusUpdate = useCallback(async (vessel: Vessel, newStatus: VesselStatus) => {
    const location = vessel.port;
    try {
      await portService.updateVessel(vessel.id, { status: newStatus });
      await portService.addVesselTimelineEvent(vessel.id, {
        status: newStatus,
        location,
        notes: `Status changed from ${vessel.status} to ${newStatus}`,
      });
      setData(prev => prev.map(v => v.id === vessel.id ? { ...v, status: newStatus, updatedAt: new Date().toISOString() } as Vessel : v));
      if (selectedVessel?.id === vessel.id) {
        setSelectedVessel(prev => prev ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() } : null);
      }
      toast.success(`Vessel status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  }, [selectedVessel]);

  const handleExportCSV = useCallback(() => {
    if (filtered.length === 0) {
      toast.error('No data to export');
      return;
    }
    exportToCSV(
      filtered.map(v => ({
        name: v.name, imo: v.imo, vesselType: v.vesselType,
        voyage: v.voyage, carrier: v.carrier, status: v.status,
        port: v.port, berth: v.berth || '', eta: v.eta,
        cargoLoaded: v.cargoLoaded, cargoCapacity: v.cargoCapacity,
        grossTonnage: v.grossTonnage, deadweight: v.deadweight,
        length: v.length, beam: v.beam, flag: v.flag,
      })),
      'vessels-export',
      [
        { key: 'name', label: 'Vessel Name' },
        { key: 'imo', label: 'IMO' },
        { key: 'vesselType', label: 'Type' },
        { key: 'voyage', label: 'Voyage' },
        { key: 'carrier', label: 'Carrier' },
        { key: 'status', label: 'Status' },
        { key: 'port', label: 'Port' },
        { key: 'berth', label: 'Berth' },
        { key: 'eta', label: 'ETA' },
        { key: 'cargoLoaded', label: 'Cargo Loaded' },
        { key: 'cargoCapacity', label: 'Cargo Capacity' },
        { key: 'grossTonnage', label: 'Gross Tonnage' },
        { key: 'deadweight', label: 'Deadweight' },
        { key: 'length', label: 'Length' },
        { key: 'beam', label: 'Beam' },
        { key: 'flag', label: 'Flag' },
      ]
    );
    toast.success('Vessels exported to CSV');
  }, [filtered]);

  const getAvailableStatusActions = useCallback((status: string) => {
    const actions: { label: string; target: VesselStatus; icon: React.ReactNode }[] = [];
    switch (status) {
      case 'Expected': case 'Anchored': case 'Delayed':
        actions.push({ label: 'Arrive', target: 'Arrived', icon: <Anchor className="w-3.5 h-3.5" /> });
        break;
      case 'Arrived':
        actions.push({ label: 'Berth', target: 'Berthing', icon: <Ship className="w-3.5 h-3.5" /> });
        actions.push({ label: 'Dock', target: 'Docked', icon: <Anchor className="w-3.5 h-3.5" /> });
        break;
      case 'Berthing':
        actions.push({ label: 'Dock', target: 'Docked', icon: <Anchor className="w-3.5 h-3.5" /> });
        break;
      case 'Docked':
        actions.push({ label: 'Start Loading', target: 'Loading', icon: <ArrowUpDown className="w-3.5 h-3.5" /> });
        actions.push({ label: 'Start Unloading', target: 'Unloading', icon: <ArrowUpDown className="w-3.5 h-3.5" /> });
        break;
      case 'Loading':
        actions.push({ label: 'Complete', target: 'Sailing', icon: <Sailboat className="w-3.5 h-3.5" /> });
        break;
      case 'Unloading':
        actions.push({ label: 'Complete', target: 'Sailing', icon: <Sailboat className="w-3.5 h-3.5" /> });
        break;
      case 'Sailing':
        actions.push({ label: 'Depart', target: 'Departed', icon: <Sailboat className="w-3.5 h-3.5" /> });
        break;
    }
    if (!['Departed', 'Delayed', 'Anchored'].includes(status)) {
      actions.push({ label: 'Delay', target: 'Delayed', icon: <Clock className="w-3.5 h-3.5" /> });
    }
    if (!['Docked', 'Departed', 'Sailing'].includes(status)) {
      actions.push({ label: 'Anchor', target: 'Anchored', icon: <Waves className="w-3.5 h-3.5" /> });
    }
    return actions;
  }, []);

  const columns: Column<Vessel>[] = useMemo(() => [
    {
      key: 'name', header: 'Name / IMO', sortable: true,
      render: (v) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Ship className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{v.name}</p>
            <p className="text-xs font-mono text-muted-foreground">IMO {v.imo}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'voyage', header: 'Voyage / Carrier', sortable: true,
      render: (v) => (
        <div className="min-w-0">
          <p className="text-sm text-foreground truncate">{v.voyage}</p>
          <p className="text-xs text-muted-foreground">{v.carrier}</p>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (v) => (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border', vesselStatusColors[v.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20')}>
          <span className={cn('w-1.5 h-1.5 rounded-full', {
            'bg-blue-400': v.status === 'Expected', 'bg-emerald-400': v.status === 'Arrived',
            'bg-amber-400': v.status === 'Berthing', 'bg-indigo-400': v.status === 'Docked',
            'bg-cyan-400': v.status === 'Loading', 'bg-purple-400': v.status === 'Unloading',
            'bg-green-400': v.status === 'Sailing', 'bg-gray-400': v.status === 'Departed',
            'bg-red-400': v.status === 'Delayed', 'bg-orange-400': v.status === 'Anchored',
          })} />
          {v.status}
        </span>
      ),
    },
    {
      key: 'port', header: 'Port / Berth', sortable: true,
      render: (v) => (
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-foreground truncate">{v.port}</p>
            {v.berth && <p className="text-xs text-muted-foreground">Berth {v.berth}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'eta', header: 'ETA', sortable: true,
      render: (v) => (
        <div className="flex items-center gap-1.5">
          <CalendarClock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm text-foreground whitespace-nowrap">{formatDate(v.eta, 'datetime')}</span>
        </div>
      ),
    },
    {
      key: 'cargoLoaded', header: 'Cargo', sortable: true,
      render: (v) => {
        const pct = v.cargoCapacity > 0 ? Math.round((v.cargoLoaded / v.cargoCapacity) * 100) : 0;
        return (
          <div className="min-w-[100px]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-foreground font-medium tabular-nums">{v.cargoLoaded}/{v.cargoCapacity}</span>
              <span className="text-muted-foreground">{v.cargoUnit}</span>
            </div>
            <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', pct >= 90 ? 'bg-red-400' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-400')}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'id', header: '', className: 'w-[100px] text-right',
      render: (v) => (
        <div className="flex items-center justify-end gap-0.5" onClick={e => e.stopPropagation()}>
          <button onClick={() => openDrawer(v)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" title="View">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => openEdit(v)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors" title="Edit">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { setDeletingVessel(v); setDeleteOpen(true); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ], [openEdit, openDrawer]);

  return (
    <PageWrapper
      title="Vessel Schedule"
      description="Track vessel arrivals, departures, and berth assignments"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            New Vessel
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Vessels" value={stats.total} icon={<Ship className="w-5 h-5" />} iconColor="indigo" description="All vessels in port" />
        <KPICard title="Arrived / Docked" value={stats.arrivedDocked} icon={<Anchor className="w-5 h-5" />} iconColor="green" description="Currently in port" />
        <KPICard title="Departed / Sailing" value={stats.departed} icon={<Sailboat className="w-5 h-5" />} iconColor="cyan" description="En route or departed" />
        <KPICard title="Delayed" value={stats.delayed} icon={<Clock className="w-5 h-5" />} iconColor="red" description="Behind schedule" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, IMO, voyage, carrier or port..."
            className="w-full h-10 pl-9 pr-9 bg-muted/40 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusPills.map(pill => {
            const isActive = statusFilter === pill;
            const count = pill === 'All' ? data.length : data.filter(v => v.status === pill).length;
            return (
              <button
                key={pill}
                onClick={() => setStatusFilter(pill)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                  isActive && pill !== 'All' ? vesselStatusColors[pill] : '',
                  isActive && pill === 'All' ? 'bg-primary/10 text-primary border-primary/30' : '',
                  !isActive ? 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:border-border' : '',
                )}
              >
                {pill}
                <span className={cn('text-[0.65rem]', isActive ? 'opacity-80' : 'text-muted-foreground/60')}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <LoadingState rows={6} message="Loading vessels..." />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Waves className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Failed to load vessels</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">{error}</p>
          <Button variant="outline" onClick={fetchData} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Ship className="w-8 h-8 text-muted-foreground" />}
          title="No vessels found"
          description={search || statusFilter !== 'All' ? 'Try adjusting your search or filter' : 'No vessels in the schedule yet'}
          action={<Button onClick={openCreate} size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" />Add Vessel</Button>}
        />
      ) : (
        <DataTable<Vessel>
          data={filtered}
          columns={columns}
          pageSize={10}
          pageSizeOptions={[10, 25, 50, 100]}
          onRowClick={openDrawer}
          emptyMessage="No vessels match your criteria"
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingVessel ? 'Edit Vessel' : 'Register New Vessel'}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vessel Name</Label>
                <Input value={formData.name} onChange={e => handleFormChange('name', e.target.value)} placeholder="e.g. MV Blue Horizon" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">IMO Number</Label>
                <Input value={formData.imo} onChange={e => handleFormChange('imo', e.target.value)} placeholder="e.g. 9876543" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Flag</Label>
                <Input value={formData.flag} onChange={e => handleFormChange('flag', e.target.value)} placeholder="e.g. Panama" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vessel Type</Label>
                <Select value={formData.vesselType} onValueChange={v => handleFormChange('vesselType', v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {vesselTypeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Voyage</Label>
                <Input value={formData.voyage} onChange={e => handleFormChange('voyage', e.target.value)} placeholder="e.g. V-2024-001" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Carrier</Label>
                <Input value={formData.carrier} onChange={e => handleFormChange('carrier', e.target.value)} placeholder="e.g. Maersk Line" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Captain</Label>
                <Input value={formData.captain} onChange={e => handleFormChange('captain', e.target.value)} placeholder="e.g. Capt. Smith" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Crew Count</Label>
                <Input type="number" value={formData.crewCount} onChange={e => handleFormChange('crewCount', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Port</Label>
                <Input value={formData.port} onChange={e => handleFormChange('port', e.target.value)} placeholder="e.g. Singapore" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</Label>
                <Select value={formData.status} onValueChange={v => handleFormChange('status', v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ETA</Label>
                <Input type="datetime-local" value={formData.eta} onChange={e => handleFormChange('eta', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Port</Label>
                <Input value={formData.lastPort} onChange={e => handleFormChange('lastPort', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Next Port</Label>
                <Input value={formData.nextPort} onChange={e => handleFormChange('nextPort', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cargo Capacity</Label>
                <Input type="number" value={formData.cargoCapacity} onChange={e => handleFormChange('cargoCapacity', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cargo Loaded</Label>
                <Input type="number" value={formData.cargoLoaded} onChange={e => handleFormChange('cargoLoaded', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gross Tonnage</Label>
                <Input type="number" value={formData.grossTonnage} onChange={e => handleFormChange('grossTonnage', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deadweight</Label>
                <Input type="number" value={formData.deadweight} onChange={e => handleFormChange('deadweight', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Length (m)</Label>
                <Input type="number" value={formData.length} onChange={e => handleFormChange('length', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Beam (m)</Label>
                <Input type="number" value={formData.beam} onChange={e => handleFormChange('beam', Number(e.target.value))} />
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
                {saving ? 'Saving...' : editingVessel ? 'Update Vessel' : 'Create Vessel'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Drawer direction="right" open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader className="border-b border-border/60">
            <DrawerTitle className="flex items-center gap-2">
              <Ship className="w-4 h-4 text-primary" />
              {selectedVessel?.name || 'Vessel Details'}
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {selectedVessel && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">IMO {selectedVessel.imo}</p>
                    <p className="text-xs text-muted-foreground">{selectedVessel.vesselType} · {selectedVessel.flag}</p>
                  </div>
                  <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border', vesselStatusColors[selectedVessel.status])}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', {
                      'bg-blue-400': selectedVessel.status === 'Expected', 'bg-emerald-400': selectedVessel.status === 'Arrived',
                      'bg-amber-400': selectedVessel.status === 'Berthing', 'bg-indigo-400': selectedVessel.status === 'Docked',
                      'bg-cyan-400': selectedVessel.status === 'Loading', 'bg-purple-400': selectedVessel.status === 'Unloading',
                      'bg-green-400': selectedVessel.status === 'Sailing', 'bg-gray-400': selectedVessel.status === 'Departed',
                      'bg-red-400': selectedVessel.status === 'Delayed', 'bg-orange-400': selectedVessel.status === 'Anchored',
                    })} />
                    {selectedVessel.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-muted/20 rounded-lg p-4 border border-border/40">
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Voyage</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedVessel.voyage}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Carrier</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedVessel.carrier}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Port</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedVessel.port}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Berth</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedVessel.berth || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">ETA</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{formatDate(selectedVessel.eta, 'datetime')}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">ETD</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedVessel.etd ? formatDate(selectedVessel.etd, 'datetime') : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Captain</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedVessel.captain}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Crew</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedVessel.crewCount}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Last Port</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedVessel.lastPort || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Next Port</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedVessel.nextPort || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Length / Beam</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedVessel.length}m / {selectedVessel.beam}m</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">GT / DWT</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedVessel.grossTonnage} / {selectedVessel.deadweight}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Cargo</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {selectedVessel.cargoLoaded} / {selectedVessel.cargoCapacity} {selectedVessel.cargoUnit}
                      {selectedVessel.cargoCapacity > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({Math.round((selectedVessel.cargoLoaded / selectedVessel.cargoCapacity) * 100)}% full)
                        </span>
                      )}
                    </p>
                    <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={cn('h-full rounded-full', (selectedVessel.cargoLoaded / selectedVessel.cargoCapacity) >= 0.9 ? 'bg-red-400' : (selectedVessel.cargoLoaded / selectedVessel.cargoCapacity) >= 0.6 ? 'bg-amber-400' : 'bg-emerald-400')}
                        style={{ width: `${selectedVessel.cargoCapacity > 0 ? Math.min(100, (selectedVessel.cargoLoaded / selectedVessel.cargoCapacity) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {selectedVessel.notes && (
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-foreground bg-muted/20 rounded-lg p-3 border border-border/40">{selectedVessel.notes}</p>
                  </div>
                )}

                <div>
                  <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider mb-2">Status Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableStatusActions(selectedVessel.status).map(action => (
                      <Button
                        key={action.target}
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        onClick={() => handleStatusUpdate(selectedVessel, action.target)}
                      >
                        {action.icon}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider mb-3 flex items-center gap-1.5">
                    <History className="w-3 h-3" /> Activity Timeline
                  </p>
                  {selectedVessel.timeline && selectedVessel.timeline.length > 0 ? (
                    <div className="space-y-0">
                      {[...selectedVessel.timeline].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((event, idx) => (
                        <div key={event.id || idx} className="relative pl-5 pb-4 last:pb-0">
                          <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-primary/60 border-2 border-background" />
                          {idx < selectedVessel.timeline.length - 1 && (
                            <div className="absolute left-[3px] top-3 bottom-0 w-px bg-border" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[0.6rem] font-bold border', vesselStatusColors[event.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20')}>
                                {event.status}
                              </span>
                              <span className="text-[0.6rem] text-muted-foreground">{formatDate(event.timestamp, 'datetime')}</span>
                            </div>
                            {event.location && <p className="text-xs text-muted-foreground mt-0.5">{event.location}</p>}
                            {event.notes && <p className="text-xs text-foreground mt-0.5">{event.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No timeline events recorded</p>
                  )}
                </div>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vessel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingVessel?.name}</strong> (IMO {deletingVessel?.imo})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingVessel(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}

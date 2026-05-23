'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { portService } from '@/services/port/portService';
import { mockContainers } from '@/data/shipments/container-data';
import type { Container } from '@/types/container';
import { PageWrapper } from '@/components/layout/PageWrapper';
import type { Column } from '@/components/shared/DataTable';
import { DataTable } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatDate } from '@/lib/utils';
import { getStatusStyle } from '@/config/statusConfig';
import { exportToCSV } from '@/lib/export-utils';
import { toast } from 'sonner';
import { Container as ContainerIcon, Package, Search, X, RotateCcw, Plus, Eye, Pencil, Trash2, Download, ArrowUpDown, Box, Ship, Truck, Thermometer, Shield, AlertTriangle, Weight, Ruler, History } from 'lucide-react';

const containerSizes = ['20ft', '20ft HC', '40ft', '40ft HC', '45ft'] as const;
const containerTypes = ['Dry Van', 'Reefer', 'Open Top', 'Flat Rack', 'Tank', 'Pallet Wide'] as const;
const containerStatusList = ['Stuffed', 'Loaded', 'Unloading', 'Empty', 'On Hold', 'Released', 'Damaged'] as const;

const statusTransitions: Record<string, string[]> = {
  Stuffed: ['Loaded', 'On Hold', 'Damaged'],
  Loaded: ['Unloading', 'On Hold', 'Damaged'],
  Unloading: ['Empty', 'On Hold', 'Damaged'],
  Empty: ['Stuffed', 'Released'],
  'On Hold': ['Released', 'Damaged', 'Empty'],
  Released: ['Stuffed', 'Empty'],
  Damaged: ['Empty', 'On Hold'],
};

function ContainerStatusBadge({ status }: { status: string }) {
  const style = getStatusStyle(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} ${style.border} border`}>
      {style.label}
    </span>
  );
}

function StatusPill({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.70rem] font-bold border transition-all',
      active && label === 'All' ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : '',
      active && label !== 'All' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-sm' : '',
      !active ? 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:border-border' : ''
    )}>
      {label} <span className={cn('text-[0.65rem]', active ? 'opacity-80' : 'text-muted-foreground/60')}>{count}</span>
    </button>
  );
}

interface ContainerFormData {
  containerId: string; size: string; type: string; status: string;
  vessel: string; yard: string; weight: number; sealNumber: string;
  temperature: number; position: string; isCustomsHold: boolean;
  isDamaged: boolean; damageReport: string; notes: string;
}

const defaultForm: ContainerFormData = {
  containerId: '', size: '20ft', type: 'Dry Van', status: 'Empty',
  vessel: '', yard: '', weight: 0, sealNumber: '',
  temperature: 0, position: '', isCustomsHold: false,
  isDamaged: false, damageReport: '', notes: '',
};

function deriveTimeline(c: Container) {
  const events: { id: string; type: string; timestamp: string; location: string; notes: string }[] = [];
  if (c.gateIn) {
    events.push({ id: `${c.id}-tl-1`, type: 'Gate In', timestamp: c.gateIn, location: c.yard, notes: 'Container entered yard' });
  }
  if (c.lastInspection) {
    events.push({ id: `${c.id}-tl-2`, type: 'Inspection', timestamp: c.lastInspection, location: c.yard, notes: 'Routine inspection performed' });
  }
  if (c.status === 'Stuffed' || c.status === 'Loaded' || c.status === 'Unloading') {
    events.push({ id: `${c.id}-tl-3`, type: c.status === 'Unloading' ? 'Unloaded' : 'Stuffed', timestamp: c.gateIn, location: c.yard, notes: `Container ${c.status.toLowerCase()}` });
  }
  if (c.gateOut) {
    events.push({ id: `${c.id}-tl-4`, type: 'Gate Out', timestamp: c.gateOut, location: c.yard, notes: 'Container exited yard' });
  }
  return events;
}

export default function ContainersPage() {
  const [data, setData] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState<Container | null>(null);
  const [form, setForm] = useState<ContainerFormData>(defaultForm);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingContainer, setDeletingContainer] = useState<Container | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await portService.listContainers({
        search: search || undefined,
        size: sizeFilter !== 'All' ? sizeFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      setData(result);
    } catch {
      toast.error('Failed to load containers');
    } finally {
      setLoading(false);
    }
  }, [search, sizeFilter, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = data.length;
    const loaded = data.filter(c => c.status === 'Loaded').length;
    const empty = data.filter(c => c.status === 'Empty').length;
    const onHold = data.filter(c => c.customsHold).length;
    const damaged = data.filter(c => c.damage).length;
    return { total, loaded, empty, onHold, damaged };
  }, [data]);

  const statusPills = useMemo(() => {
    const counts: Record<string, number> = { All: data.length };
    data.forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return ['All', ...containerStatusList].map(l => ({ label: l, count: counts[l] || 0 }));
  }, [data]);

  const openCreate = () => {
    setEditingContainer(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (c: Container) => {
    setEditingContainer(c);
    setForm({
      containerId: c.containerId, size: c.size, type: c.type, status: c.status,
      vessel: c.vessel, yard: c.yard, weight: c.weight, sealNumber: c.sealNumber,
      temperature: 0, position: c.yard, isCustomsHold: c.customsHold,
      isDamaged: c.damage, damageReport: c.damage ? 'Reported damage' : '', notes: '',
    });
    setDialogOpen(true);
  };

  const openDetail = (c: Container) => {
    setSelectedContainer(c);
    setDrawerOpen(true);
  };

  const openDelete = (c: Container) => {
    setDeletingContainer(c);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.containerId.trim()) { toast.error('Container ID is required'); return; }
    if (editingContainer) {
      const idx = mockContainers.findIndex(c => c.id === editingContainer.id);
      if (idx !== -1) {
        mockContainers[idx] = {
          ...mockContainers[idx],
          containerId: form.containerId, size: form.size as Container['size'],
          type: form.type as Container['type'], status: form.status as Container['status'],
          vessel: form.vessel, yard: form.yard, weight: form.weight,
          sealNumber: form.sealNumber,
          customsHold: form.isCustomsHold, damage: form.isDamaged,
        };
        toast.success('Container updated');
      }
    } else {
      const newContainer: Container = {
        id: `ctr-${String(Date.now())}`,
        containerId: form.containerId,
        size: form.size as Container['size'],
        type: form.type as Container['type'],
        status: form.status as Container['status'],
        vessel: form.vessel, voyage: '', origin: '', destination: '',
        yard: form.yard, operator: '', gateIn: new Date().toISOString(),
        gateOut: null, customsHold: form.isCustomsHold, damage: form.isDamaged,
        sealNumber: form.sealNumber, weight: form.weight,
        lastInspection: new Date().toISOString(),
      };
      mockContainers.unshift(newContainer);
      toast.success('Container created');
    }
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = () => {
    if (!deletingContainer) return;
    const idx = mockContainers.findIndex(c => c.id === deletingContainer.id);
    if (idx !== -1) { mockContainers.splice(idx, 1); toast.success('Container deleted'); }
    setDeleteDialogOpen(false);
    setDeletingContainer(null);
    fetchData();
  };

  const updateStatus = (container: Container, newStatus: string) => {
    const idx = mockContainers.findIndex(c => c.id === container.id);
    if (idx !== -1) {
      (mockContainers[idx] as any).status = newStatus;
      if (newStatus === 'Released' || newStatus === 'Empty') {
        (mockContainers[idx] as any).gateOut = new Date().toISOString();
      }
      toast.success(`Status updated to ${newStatus}`);
      fetchData();
    }
  };

  const handleExport = () => {
    const exportData = data.map(c => ({
      containerId: c.containerId, size: c.size, type: c.type, status: c.status,
      vessel: c.vessel, voyage: c.voyage, yard: c.yard, weight: c.weight,
      sealNumber: c.sealNumber, customsHold: c.customsHold ? 'Yes' : 'No',
      damage: c.damage ? 'Yes' : 'No',
    }));
    exportToCSV(exportData, `containers-${new Date().toISOString().slice(0, 10)}`, [
      { key: 'containerId', label: 'Container ID' },
      { key: 'size', label: 'Size' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'vessel', label: 'Vessel' },
      { key: 'voyage', label: 'Voyage' },
      { key: 'yard', label: 'Yard' },
      { key: 'weight', label: 'Weight' },
      { key: 'sealNumber', label: 'Seal Number' },
      { key: 'customsHold', label: 'Customs Hold' },
      { key: 'damage', label: 'Damage' },
    ]);
    toast.success('Containers exported to CSV');
  };

  const columns: Column<Container>[] = [
    {
      key: 'containerId', header: 'Container#', sortable: true,
      render: (c) => <span className="font-bold font-mono text-[0.82rem]">{c.containerId}</span>,
    },
    {
      key: 'size', header: 'Size', sortable: true,
      render: (c) => <Badge variant="outline" className="text-[0.65rem] font-bold px-1.5 py-0 border-cyan-500/30 text-cyan-400 bg-cyan-500/10">{c.size}</Badge>,
    },
    {
      key: 'type', header: 'Type',
      render: (c) => <Badge variant="outline" className="text-[0.65rem] font-bold px-1.5 py-0">{c.type}</Badge>,
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (c) => <ContainerStatusBadge status={c.status} />,
    },
    {
      key: 'vessel', header: 'Vessel', sortable: true,
      render: (c) => <span className="text-[0.80rem]">{c.vessel}</span>,
    },
    {
      key: 'weight', header: 'Weight/Yard', sortable: true,
      render: (c) => (
        <div>
          <p className="text-[0.80rem] tabular-nums">{c.weight.toLocaleString()} kg</p>
          <p className="text-[0.68rem] text-muted-foreground">{c.yard}</p>
        </div>
      ),
    },
    {
      key: 'sealNumber', header: 'Seal#',
      render: (c) => <span className="font-mono text-[0.78rem] text-muted-foreground">{c.sealNumber}</span>,
    },
    {
      key: 'temperature', header: 'Temperature',
      render: (c) => (
        <span className="text-[0.80rem]">{c.type === 'Reefer' ? <span className="text-cyan-400">R: -18°C</span> : '—'}</span>
      ),
    },
    {
      key: 'customsHold', header: 'Customs',
      render: (c) => c.customsHold ? <Shield className="w-4 h-4 text-red-400" /> : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'damage', header: 'Damage',
      render: (c) => c.damage ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'actions', header: '', className: 'w-[140px]',
      render: (c) => (
        <div className="flex items-center gap-0.5">
          <button onClick={(e) => { e.stopPropagation(); openDetail(c); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"><Eye className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); openDelete(c); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Container List"
      description="Container lifecycle and movement tracking"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2 rounded-[9px]"><Download className="w-4 h-4" />Export CSV</Button>
          <Button onClick={openCreate} className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:from-sky-600 hover:to-indigo-600 rounded-[10px] gap-2"><Plus className="w-4 h-4" />Register Container</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <KPICard title="Total Containers" value={stats.total} icon={<ContainerIcon className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Loaded" value={stats.loaded} icon={<Ship className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Empty" value={stats.empty} icon={<Box className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="On Hold" value={stats.onHold} icon={<Shield className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Damaged" value={stats.damaged} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search container, seal, vessel, or yard..." className="w-full h-9 pl-9 pr-8 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)] transition-all duration-200" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <select value={sizeFilter} onChange={e => setSizeFilter(e.target.value)} className="h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50">
            <option value="All">All Sizes</option>
            {containerSizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusPills.map(pill => (
            <StatusPill key={pill.label} label={pill.label} count={pill.count} active={statusFilter === pill.label} onClick={() => setStatusFilter(pill.label)} />
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState rows={6} message="Loading containers..." />
      ) : data.length === 0 ? (
        <EmptyState icon={<ContainerIcon className="w-8 h-8" />} title="No containers found" description={search || sizeFilter !== 'All' || statusFilter !== 'All' ? 'Try adjusting your search or filter criteria' : 'No containers available'} action={<Button variant="outline" className="gap-2 rounded-[9px]" onClick={() => { setSearch(''); setSizeFilter('All'); setStatusFilter('All'); }}><RotateCcw className="w-4 h-4" />Reset Filters</Button>} />
      ) : (
        <DataTable<Container> data={data} columns={columns} pageSize={10} emptyMessage="No containers match your criteria" />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingContainer ? 'Edit Container' : 'Register New Container'}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Container ID</Label>
                <Input value={form.containerId} onChange={e => setForm(p => ({ ...p, containerId: e.target.value }))} placeholder="e.g. MAEU1234567" />
              </div>
              <div className="space-y-2">
                <Label>Size</Label>
                <Select value={form.size} onValueChange={v => setForm(p => ({ ...p, size: v }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{containerSizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{containerTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{containerStatusList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vessel</Label>
                <Input value={form.vessel} onChange={e => setForm(p => ({ ...p, vessel: e.target.value }))} placeholder="Vessel name" />
              </div>
              <div className="space-y-2">
                <Label>Yard / Position</Label>
                <Input value={form.yard} onChange={e => setForm(p => ({ ...p, yard: e.target.value }))} placeholder="e.g. Yard-A-01" />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Seal Number</Label>
                <Input value={form.sealNumber} onChange={e => setForm(p => ({ ...p, sealNumber: e.target.value }))} placeholder="e.g. SL123456" />
              </div>
              {form.type === 'Reefer' && (
                <div className="space-y-2">
                  <Label>Temperature (°C)</Label>
                  <Input type="number" value={form.temperature} onChange={e => setForm(p => ({ ...p, temperature: Number(e.target.value) }))} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Yard Slot</Label>
                <Input value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} placeholder="e.g. A-01-05" />
              </div>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.isCustomsHold} onCheckedChange={(v) => setForm(p => ({ ...p, isCustomsHold: v === true }))} />
                <span className="text-sm text-muted-foreground">Customs Hold</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.isDamaged} onCheckedChange={(v) => setForm(p => ({ ...p, isDamaged: v === true }))} />
                <span className="text-sm text-muted-foreground">Damaged</span>
              </label>
            </div>
            {form.isDamaged && (
              <div className="space-y-2">
                <Label>Damage Report</Label>
                <Textarea value={form.damageReport} onChange={e => setForm(p => ({ ...p, damageReport: e.target.value }))} placeholder="Describe damage details..." />
              </div>
            )}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Additional notes..." />
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave}>{editingContainer ? 'Update Container' : 'Create Container'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Container Details</DrawerTitle>
          </DrawerHeader>
          {selectedContainer && (
            <div className="px-6 pb-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-xl">
                <div><Label className="text-[0.70rem] text-muted-foreground">Container ID</Label><p className="font-mono font-bold text-sm">{selectedContainer.containerId}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Size</Label><p>{selectedContainer.size}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Type</Label><p>{selectedContainer.type}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Status</Label><ContainerStatusBadge status={selectedContainer.status} /></div>
                <div className="col-span-2"><Label className="text-[0.70rem] text-muted-foreground">Vessel</Label><p>{selectedContainer.vessel}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Voyage</Label><p className="font-mono text-sm">{selectedContainer.voyage || '—'}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Weight</Label><p className="tabular-nums">{selectedContainer.weight.toLocaleString()} kg</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Seal Number</Label><p className="font-mono text-sm">{selectedContainer.sealNumber}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Route</Label><p>{selectedContainer.origin} → {selectedContainer.destination}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Yard</Label><p>{selectedContainer.yard}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Gateway In</Label><p>{formatDate(selectedContainer.gateIn, 'datetime')}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Gateway Out</Label><p>{selectedContainer.gateOut ? formatDate(selectedContainer.gateOut, 'datetime') : '—'}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Operator</Label><p>{selectedContainer.operator || '—'}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Last Inspection</Label><p>{formatDate(selectedContainer.lastInspection, 'datetime')}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Customs Hold</Label><p>{selectedContainer.customsHold ? <Shield className="w-4 h-4 text-red-400 inline" /> : 'No'}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Damage</Label><p>{selectedContainer.damage ? <AlertTriangle className="w-4 h-4 text-amber-400 inline" /> : 'No'}</p></div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3"><History className="w-4 h-4 text-muted-foreground" /><h4 className="text-sm font-semibold">Movement History</h4></div>
                <div className="space-y-0">
                  {deriveTimeline(selectedContainer).map((evt, i) => (
                    <div key={evt.id} className="flex gap-3 pb-3 relative">
                      {i < deriveTimeline(selectedContainer).length - 1 && <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border" />}
                      <div className="w-4 h-4 rounded-full border-2 border-primary/40 bg-background mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{evt.type}</p>
                          <span className="text-[0.65rem] text-muted-foreground shrink-0">{formatDate(evt.timestamp, 'datetime')}</span>
                        </div>
                        <p className="text-[0.75rem] text-muted-foreground">{evt.location}</p>
                        <p className="text-[0.70rem] text-muted-foreground">{evt.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Status Transitions</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(statusTransitions[selectedContainer.status] || []).map(nextStatus => (
                    <Button key={nextStatus} size="sm" variant="outline" className="text-[0.70rem] h-7 gap-1" onClick={() => { updateStatus(selectedContainer, nextStatus); setSelectedContainer(prev => prev ? { ...prev, status: nextStatus as Container['status'] } : prev); }}>
                      <ArrowUpDown className="w-3 h-3" />{nextStatus}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Container</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete container {deletingContainer?.containerId}? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}

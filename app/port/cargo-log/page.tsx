'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { portService } from '@/services/port/portService';
import type { CargoOperation, CargoOpType, CargoOpStatus, CargoOpTimelineEvent } from '@/types/port';
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
import { Textarea } from '@/components/ui/textarea';
import { cn, formatDate } from '@/lib/utils';
import { exportToCSV } from '@/lib/export-utils';
import { toast } from 'sonner';
import { ClipboardList, Package, Truck, CheckCircle, Clock, AlertTriangle, Search, X, RotateCcw, Plus, Eye, Pencil, Trash2, Download, ArrowUpDown, Ship, Anchor, Wrench, Weight, Ruler, BarChart3, History, Play, Pause, XCircle } from 'lucide-react';

const opStatusColors: Record<string, string> = {
  Scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Paused: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  'On Hold': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const opTypeColors: Record<string, string> = {
  Offload: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Load: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Transfer: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Inspection: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Lashing: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Unlashing: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Shifting: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Stuffing: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

const opTypes: CargoOpType[] = ['Offload', 'Load', 'Transfer', 'Inspection', 'Lashing', 'Unlashing', 'Shifting', 'Stuffing'];
const opStatuses: CargoOpStatus[] = ['Scheduled', 'In Progress', 'Completed', 'Paused', 'Cancelled', 'On Hold'];

const statusTransitions: Record<string, CargoOpStatus[]> = {
  Scheduled: ['In Progress', 'Cancelled'],
  'In Progress': ['Completed', 'Paused', 'Cancelled', 'On Hold'],
  Completed: [],
  Paused: ['In Progress', 'Cancelled'],
  Cancelled: [],
  'On Hold': ['In Progress', 'Cancelled'],
};

function OpStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border', opStatusColors[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20')}>
      {status}
    </span>
  );
}

function OpTypeBadge({ type }: { type: string }) {
  return (
    <Badge variant="outline" className={cn('text-[0.65rem] font-bold px-2 py-0.5', opTypeColors[type] || '')}>
      {type}
    </Badge>
  );
}

function StatusPill({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  const colors = label !== 'All' && label !== 'Scheduled' ? opStatusColors[label] : '';
  return (
    <button onClick={onClick} className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.70rem] font-bold border transition-all',
      active && colors ? `${colors} shadow-sm` : '',
      active && !colors ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : '',
      !active ? 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:border-border' : ''
    )}>
      {label} <span className={cn('text-[0.65rem]', active ? 'opacity-80' : 'text-muted-foreground/60')}>{count}</span>
    </button>
  );
}

interface CargoOpFormData {
  type: string; vessel: string; vesselId: string; berth: string; berthId: string;
  cargoType: string; cargoWeight: number; cargoVolume: number; quantity: number;
  unit: string; operator: string; supervisor: string; equipment: string; notes: string;
}

const defaultForm: CargoOpFormData = {
  type: 'Load', vessel: '', vesselId: '', berth: '', berthId: '',
  cargoType: 'General Cargo', cargoWeight: 0, cargoVolume: 0, quantity: 0,
  unit: 'TEU', operator: '', supervisor: '', equipment: '', notes: '',
};

export default function CargoLogPage() {
  const [data, setData] = useState<CargoOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOp, setEditingOp] = useState<CargoOperation | null>(null);
  const [form, setForm] = useState<CargoOpFormData>(defaultForm);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOp, setSelectedOp] = useState<CargoOperation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingOp, setDeletingOp] = useState<CargoOperation | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await portService.listCargoOps({
        search: search || undefined,
        type: typeFilter !== 'All' ? typeFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      setData(result);
    } catch {
      toast.error('Failed to load cargo operations');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = data.length;
    const inProgress = data.filter(o => o.status === 'In Progress').length;
    const completed = data.filter(o => o.status === 'Completed').length;
    const scheduled = data.filter(o => o.status === 'Scheduled').length;
    return { total, inProgress, completed, scheduled };
  }, [data]);

  const statusPills = useMemo(() => {
    const counts: Record<string, number> = { All: data.length };
    data.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return ['All', ...opStatuses].map(l => ({ label: l, count: counts[l] || 0 }));
  }, [data]);

  const openCreate = () => {
    setEditingOp(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (o: CargoOperation) => {
    setEditingOp(o);
    setForm({
      type: o.type, vessel: o.vessel, vesselId: o.vesselId,
      berth: o.berth, berthId: o.berthId,
      cargoType: o.cargoType, cargoWeight: o.cargoWeight,
      cargoVolume: o.cargoVolume, quantity: o.quantity,
      unit: o.unit, operator: o.operator, supervisor: o.supervisor,
      equipment: o.equipment.join(', '), notes: o.notes,
    });
    setDialogOpen(true);
  };

  const openDetail = (o: CargoOperation) => {
    setSelectedOp(o);
    setDrawerOpen(true);
  };

  const openDelete = (o: CargoOperation) => {
    setDeletingOp(o);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.vessel.trim()) { toast.error('Vessel name is required'); return; }
    try {
      const payload = {
        type: form.type as CargoOpType,
        vessel: form.vessel, vesselId: form.vesselId,
        berth: form.berth, berthId: form.berthId,
        cargoType: form.cargoType, cargoWeight: form.cargoWeight,
        cargoVolume: form.cargoVolume, quantity: form.quantity,
        unit: form.unit as CargoOperation['unit'],
        operator: form.operator, supervisor: form.supervisor,
        equipment: form.equipment.split(',').map(s => s.trim()).filter(Boolean),
        notes: form.notes,
      };
      if (editingOp) {
        await portService.updateCargoOp(editingOp.id, payload);
        toast.success('Operation updated');
      } else {
        await portService.createCargoOp(payload);
        toast.success('Operation created');
      }
      setDialogOpen(false);
      fetchData();
    } catch { toast.error('Failed to save operation'); }
  };

  const handleDelete = async () => {
    if (!deletingOp) return;
    try {
      await portService.deleteCargoOp(deletingOp.id);
      toast.success('Operation deleted');
      setDeleteDialogOpen(false);
      setDeletingOp(null);
      fetchData();
    } catch { toast.error('Failed to delete operation'); }
  };

  const updateStatus = async (op: CargoOperation, newStatus: CargoOpStatus) => {
    try {
      const updates: Partial<CargoOperation> = { status: newStatus };
      if (newStatus === 'In Progress' && !op.startTime) {
        updates.startTime = new Date().toISOString();
      }
      if (newStatus === 'Completed') {
        const endTime = new Date().toISOString();
        const start = op.startTime ? new Date(op.startTime).getTime() : 0;
        const duration = start ? Math.round((new Date().getTime() - start) / 3600000) : 0;
        updates.endTime = endTime;
        updates.duration = duration;
      }
      await portService.updateCargoOp(op.id, updates);
      await portService.addCargoOpTimelineEvent(op.id, { status: newStatus, notes: `Status changed to ${newStatus}` });
      toast.success(`Status updated to ${newStatus}`);
      fetchData();
    } catch { toast.error('Failed to update status'); }
  };

  const handleExport = () => {
    const exportData = data.map(o => ({
      operationId: o.operationId, type: o.type, status: o.status,
      vessel: o.vessel, berth: o.berth, cargoType: o.cargoType,
      cargoWeight: o.cargoWeight, cargoVolume: o.cargoVolume,
      quantity: o.quantity, unit: o.unit,
      operator: o.operator, supervisor: o.supervisor,
      equipment: o.equipment.join('; '), duration: o.duration ?? 0,
    }));
    exportToCSV(exportData, `cargo-ops-${new Date().toISOString().slice(0, 10)}`, [
      { key: 'operationId', label: 'Operation ID' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'vessel', label: 'Vessel' },
      { key: 'berth', label: 'Berth' },
      { key: 'cargoType', label: 'Cargo Type' },
      { key: 'cargoWeight', label: 'Cargo Weight' },
      { key: 'cargoVolume', label: 'Cargo Volume' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'unit', label: 'Unit' },
      { key: 'operator', label: 'Operator' },
      { key: 'supervisor', label: 'Supervisor' },
      { key: 'equipment', label: 'Equipment' },
      { key: 'duration', label: 'Duration (hrs)' },
    ]);
    toast.success('Operations exported to CSV');
  };

  const columns: Column<CargoOperation>[] = [
    {
      key: 'operationId', header: 'Operation#', sortable: true,
      render: (o) => <span className="font-mono font-bold text-[0.80rem]">{o.operationId}</span>,
    },
    {
      key: 'type', header: 'Type', sortable: true,
      render: (o) => <OpTypeBadge type={o.type} />,
    },
    {
      key: 'vessel', header: 'Vessel / Berth', sortable: true,
      render: (o) => (
        <div><p className="text-[0.80rem] font-medium">{o.vessel}</p><p className="text-[0.68rem] text-muted-foreground">{o.berth}</p></div>
      ),
    },
    {
      key: 'cargoType', header: 'Cargo', sortable: true,
      render: (o) => (
        <div><p className="text-[0.80rem]">{o.cargoType}</p><p className="text-[0.68rem] text-muted-foreground tabular-nums">{o.cargoWeight.toLocaleString()} {o.unit == 'TEU' ? 'TEU' : o.unit == 'Tons' ? 't' : o.unit == 'CBM' ? 'cbm' : 'u'}</p></div>
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (o) => <OpStatusBadge status={o.status} />,
    },
    {
      key: 'duration', header: 'Duration', sortable: true,
      render: (o) => <span className="tabular-nums text-[0.80rem]">{o.duration != null ? `${o.duration}h` : '-'}</span>,
    },
    {
      key: 'operator', header: 'Operator', sortable: true,
      render: (o) => <span className="text-[0.80rem]">{o.operator}</span>,
    },
    {
      key: 'supervisor', header: 'Supervisor', sortable: true,
      render: (o) => <span className="text-[0.80rem]">{o.supervisor}</span>,
    },
    {
      key: 'equipment', header: 'Equipment',
      render: (o) => <span className="text-[0.70rem] text-muted-foreground">{o.equipment.slice(0, 2).join(', ')}{o.equipment.length > 2 ? ` +${o.equipment.length - 2}` : ''}</span>,
    },
    {
      key: 'actions', header: '', className: 'w-[140px]',
      render: (o) => (
        <div className="flex items-center gap-0.5">
          <button onClick={(e) => { e.stopPropagation(); openDetail(o); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"><Eye className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); openEdit(o); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); openDelete(o); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Cargo Operations Log"
      description="Load, offload, transfer, and inspection operations"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2 rounded-[9px]"><Download className="w-4 h-4" />Export CSV</Button>
          <Button onClick={openCreate} className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:from-sky-600 hover:to-indigo-600 rounded-[10px] gap-2"><Plus className="w-4 h-4" />New Operation</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Operations" value={stats.total} icon={<ClipboardList className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="In Progress" value={stats.inProgress} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Completed" value={stats.completed} icon={<CheckCircle className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Scheduled" value={stats.scheduled} icon={<Package className="w-5 h-5" />} iconColor="indigo" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search operation ID, vessel, berth, operator, or cargo type..." className="w-full h-9 pl-9 pr-8 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)] transition-all duration-200" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-[160px] h-9 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50 px-3">
            <option value="All">All Types</option>
            {opTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusPills.map(pill => (
            <StatusPill key={pill.label} label={pill.label} count={pill.count} active={statusFilter === pill.label} onClick={() => setStatusFilter(pill.label)} />
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState rows={6} message="Loading cargo operations..." />
      ) : data.length === 0 ? (
        <EmptyState icon={<ClipboardList className="w-8 h-8" />} title="No operations found" description={search || typeFilter !== 'All' || statusFilter !== 'All' ? 'Try adjusting your search or filter criteria' : 'No cargo operations recorded yet'} action={<Button variant="outline" className="gap-2 rounded-[9px]" onClick={() => { setSearch(''); setTypeFilter('All'); setStatusFilter('All'); }}><RotateCcw className="w-4 h-4" />Reset Filters</Button>} />
      ) : (
        <DataTable<CargoOperation> data={data} columns={columns} pageSize={10} emptyMessage="No operations match your criteria" />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOp ? 'Edit Operation' : 'New Cargo Operation'}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{opTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={v => setForm(p => ({ ...p, unit: v }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEU">TEU</SelectItem>
                    <SelectItem value="Tons">Tons</SelectItem>
                    <SelectItem value="Units">Units</SelectItem>
                    <SelectItem value="CBM">CBM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vessel</Label>
                <Input value={form.vessel} onChange={e => setForm(p => ({ ...p, vessel: e.target.value }))} placeholder="Vessel name" />
              </div>
              <div className="space-y-2">
                <Label>Vessel ID</Label>
                <Input value={form.vesselId} onChange={e => setForm(p => ({ ...p, vesselId: e.target.value }))} placeholder="Vessel ID" />
              </div>
              <div className="space-y-2">
                <Label>Berth</Label>
                <Input value={form.berth} onChange={e => setForm(p => ({ ...p, berth: e.target.value }))} placeholder="Berth name" />
              </div>
              <div className="space-y-2">
                <Label>Berth ID</Label>
                <Input value={form.berthId} onChange={e => setForm(p => ({ ...p, berthId: e.target.value }))} placeholder="Berth ID" />
              </div>
              <div className="space-y-2">
                <Label>Cargo Type</Label>
                <Input value={form.cargoType} onChange={e => setForm(p => ({ ...p, cargoType: e.target.value }))} placeholder="e.g. General Cargo" />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" value={form.quantity || ''} onChange={e => setForm(p => ({ ...p, quantity: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Cargo Weight ({form.unit})</Label>
                <Input type="number" value={form.cargoWeight || ''} onChange={e => setForm(p => ({ ...p, cargoWeight: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Cargo Volume (cbm)</Label>
                <Input type="number" value={form.cargoVolume || ''} onChange={e => setForm(p => ({ ...p, cargoVolume: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Operator</Label>
                <Input value={form.operator} onChange={e => setForm(p => ({ ...p, operator: e.target.value }))} placeholder="Operator name" />
              </div>
              <div className="space-y-2">
                <Label>Supervisor</Label>
                <Input value={form.supervisor} onChange={e => setForm(p => ({ ...p, supervisor: e.target.value }))} placeholder="Supervisor name" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Equipment (comma separated)</Label>
                <Input value={form.equipment} onChange={e => setForm(p => ({ ...p, equipment: e.target.value }))} placeholder="e.g. Crane-1, Forklift-3" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Additional notes..." />
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave}>{editingOp ? 'Update Operation' : 'Create Operation'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Operation Details</DrawerTitle>
          </DrawerHeader>
          {selectedOp && (
            <div className="px-6 pb-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-xl">
                <div><Label className="text-[0.70rem] text-muted-foreground">Operation ID</Label><p className="font-mono font-bold text-sm">{selectedOp.operationId}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Type</Label><OpTypeBadge type={selectedOp.type} /></div>
                <div className="col-span-2"><Label className="text-[0.70rem] text-muted-foreground">Vessel</Label><p className="font-medium">{selectedOp.vessel}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Berth</Label><p>{selectedOp.berth}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Status</Label><OpStatusBadge status={selectedOp.status} /></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Cargo Type</Label><p>{selectedOp.cargoType}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Weight</Label><p className="tabular-nums">{selectedOp.cargoWeight.toLocaleString()} {selectedOp.unit}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Volume</Label><p className="tabular-nums">{selectedOp.cargoVolume.toLocaleString()} cbm</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Quantity</Label><p className="tabular-nums">{selectedOp.quantity}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Duration</Label><p>{selectedOp.duration != null ? `${selectedOp.duration}h` : '—'}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Operator</Label><p>{selectedOp.operator}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Supervisor</Label><p>{selectedOp.supervisor}</p></div>
                <div className="col-span-2"><Label className="text-[0.70rem] text-muted-foreground">Equipment</Label><p className="text-sm">{selectedOp.equipment.join(', ') || '—'}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Start Time</Label><p>{selectedOp.startTime ? formatDate(selectedOp.startTime, 'datetime') : '—'}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">End Time</Label><p>{selectedOp.endTime ? formatDate(selectedOp.endTime, 'datetime') : '—'}</p></div>
              </div>

              {selectedOp.notes && (
                <div><h4 className="text-sm font-semibold mb-2">Notes</h4><p className="text-sm text-muted-foreground">{selectedOp.notes}</p></div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3"><History className="w-4 h-4 text-muted-foreground" /><h4 className="text-sm font-semibold">Activity Timeline</h4></div>
                <div className="space-y-0">
                  {(selectedOp.timeline || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No timeline events recorded</p>
                  ) : (
                    [...(selectedOp.timeline || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((evt, i, arr) => (
                      <div key={evt.id} className="flex gap-3 pb-3 relative">
                        {i < arr.length - 1 && <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border" />}
                        <div className="w-4 h-4 rounded-full border-2 border-primary/40 bg-background mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">{evt.status}</p>
                            <span className="text-[0.65rem] text-muted-foreground shrink-0">{formatDate(evt.timestamp, 'datetime')}</span>
                          </div>
                          <p className="text-[0.70rem] text-muted-foreground">{evt.notes}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Status Transitions</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(statusTransitions[selectedOp.status] || []).map(nextStatus => {
                    let icon = <ArrowUpDown className="w-3 h-3" />;
                    if (nextStatus === 'In Progress') icon = <Play className="w-3 h-3" />;
                    else if (nextStatus === 'Paused') icon = <Pause className="w-3 h-3" />;
                    else if (nextStatus === 'Cancelled') icon = <XCircle className="w-3 h-3" />;
                    return (
                      <Button
                        key={nextStatus}
                        size="sm"
                        variant="outline"
                        className={cn('text-[0.70rem] h-7 gap-1', nextStatus === 'Cancelled' ? 'text-red-400 border-red-500/20 hover:bg-red-500/10' : nextStatus === 'Completed' ? 'text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10' : '')}
                        onClick={() => { updateStatus(selectedOp, nextStatus); setSelectedOp(prev => prev ? { ...prev, status: nextStatus } : prev); }}
                      >
                        {icon}{nextStatus}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cargo Operation</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete operation {deletingOp?.operationId}? This action cannot be undone.</AlertDialogDescription>
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

'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { portService } from '@/services/port/portService';
import type { PortManifest, ManifestStatus } from '@/types/port';
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
import { FileText, FileCheck, FileX, Clock, AlertTriangle, Search, X, RotateCcw, Plus, Eye, Pencil, Trash2, Download, ArrowUpDown, Ship, Anchor, Box, Shield, Weight, FileSpreadsheet, History, Archive } from 'lucide-react';

const manifestTypeColors: Record<string, string> = {
  Import: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Export: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Transshipment: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const manifestStatusColors: Record<string, string> = {
  Draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Filed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Amended: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  Archived: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const manifestTypes = ['Import', 'Export', 'Transshipment'] as const;
const manifestStatuses: ManifestStatus[] = ['Draft', 'Filed', 'Approved', 'Amended', 'Rejected', 'Archived'];

const statusTransitions: Record<string, ManifestStatus[]> = {
  Draft: ['Filed'],
  Filed: ['Approved', 'Rejected', 'Amended'],
  Approved: ['Amended', 'Archived'],
  Amended: ['Filed', 'Archived'],
  Rejected: ['Draft', 'Archived'],
  Archived: [],
};

function ManifestStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border', manifestStatusColors[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20')}>
      {status}
    </span>
  );
}

function ManifestTypeBadge({ type }: { type: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold border', manifestTypeColors[type] || '')}>
      {type}
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

interface ManifestFormData {
  type: string; vessel: string; voyage: string; carrier: string;
  portOfLoading: string; portOfDischarge: string; filedBy: string; notes: string;
}

const defaultForm: ManifestFormData = {
  type: 'Import', vessel: '', voyage: '', carrier: '',
  portOfLoading: '', portOfDischarge: '', filedBy: '', notes: '',
};

export default function ManifestsPage() {
  const [data, setData] = useState<PortManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingManifest, setEditingManifest] = useState<PortManifest | null>(null);
  const [form, setForm] = useState<ManifestFormData>(defaultForm);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedManifest, setSelectedManifest] = useState<PortManifest | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingManifest, setDeletingManifest] = useState<PortManifest | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await portService.listManifests({
        search: search || undefined,
        type: typeFilter !== 'All' ? typeFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      setData(result);
    } catch {
      toast.error('Failed to load manifests');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = data.length;
    const approved = data.filter(m => m.status === 'Approved').length;
    const filed = data.filter(m => m.status === 'Filed').length;
    const pending = data.filter(m => m.status === 'Draft' || m.status === 'Amended').length;
    const hazmat = data.reduce((s, m) => s + m.hazmatCount, 0);
    return { total, approved, filed, pending, hazmat };
  }, [data]);

  const statusPills = useMemo(() => {
    const counts: Record<string, number> = { All: data.length };
    data.forEach(m => { counts[m.status] = (counts[m.status] || 0) + 1; });
    return ['All', ...manifestStatuses].map(l => ({ label: l, count: counts[l] || 0 }));
  }, [data]);

  const openCreate = () => {
    setEditingManifest(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (m: PortManifest) => {
    setEditingManifest(m);
    setForm({
      type: m.type, vessel: m.vessel, voyage: m.voyage, carrier: m.carrier,
      portOfLoading: m.portOfLoading, portOfDischarge: m.portOfDischarge,
      filedBy: m.filedBy, notes: m.notes,
    });
    setDialogOpen(true);
  };

  const openDetail = (m: PortManifest) => {
    setSelectedManifest(m);
    setDrawerOpen(true);
  };

  const openDelete = (m: PortManifest) => {
    setDeletingManifest(m);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.vessel.trim()) { toast.error('Vessel name is required'); return; }
    try {
      if (editingManifest) {
        const idx = await portService.updateManifest(editingManifest.id, {
          type: form.type as PortManifest['type'],
          vessel: form.vessel, voyage: form.voyage, carrier: form.carrier,
          portOfLoading: form.portOfLoading, portOfDischarge: form.portOfDischarge,
          filedBy: form.filedBy, notes: form.notes,
        });
        toast.success('Manifest updated');
      } else {
        await portService.createManifest({
          type: form.type as PortManifest['type'],
          vessel: form.vessel, voyage: form.voyage, carrier: form.carrier,
          portOfLoading: form.portOfLoading, portOfDischarge: form.portOfDischarge,
          filedBy: form.filedBy, notes: form.notes,
        });
        toast.success('Manifest created');
      }
      setDialogOpen(false);
      fetchData();
    } catch { toast.error('Failed to save manifest'); }
  };

  const handleDelete = async () => {
    if (!deletingManifest) return;
    try {
      await portService.deleteManifest(deletingManifest.id);
      toast.success('Manifest deleted');
      setDeleteDialogOpen(false);
      setDeletingManifest(null);
      fetchData();
    } catch { toast.error('Failed to delete manifest'); }
  };

  const updateStatus = async (manifest: PortManifest, newStatus: ManifestStatus) => {
    try {
      await portService.updateManifest(manifest.id, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchData();
    } catch { toast.error('Failed to update status'); }
  };

  const handleExport = () => {
    const exportData = data.map(m => ({
      manifestId: m.manifestId, type: m.type, status: m.status,
      vessel: m.vessel, voyage: m.voyage, carrier: m.carrier,
      portOfLoading: m.portOfLoading, portOfDischarge: m.portOfDischarge,
      containerCount: m.containerCount, totalWeight: m.totalWeight,
      hazmatCount: m.hazmatCount, reeferCount: m.reeferCount,
      customsReference: m.customsReference, filedBy: m.filedBy,
    }));
    exportToCSV(exportData, `manifests-${new Date().toISOString().slice(0, 10)}`, [
      { key: 'manifestId', label: 'Manifest ID' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'vessel', label: 'Vessel' },
      { key: 'voyage', label: 'Voyage' },
      { key: 'carrier', label: 'Carrier' },
      { key: 'portOfLoading', label: 'Port of Loading' },
      { key: 'portOfDischarge', label: 'Port of Discharge' },
      { key: 'containerCount', label: 'Container Count' },
      { key: 'totalWeight', label: 'Total Weight' },
      { key: 'hazmatCount', label: 'Hazmat Count' },
      { key: 'reeferCount', label: 'Reefer Count' },
      { key: 'customsReference', label: 'Customs Reference' },
      { key: 'filedBy', label: 'Filed By' },
    ]);
    toast.success('Manifests exported to CSV');
  };

  const columns: Column<PortManifest>[] = [
    {
      key: 'manifestId', header: 'Manifest#', sortable: true,
      render: (m) => <span className="font-mono font-bold text-[0.80rem]">{m.manifestId}</span>,
    },
    {
      key: 'type', header: 'Type', sortable: true,
      render: (m) => <ManifestTypeBadge type={m.type} />,
    },
    {
      key: 'vessel', header: 'Vessel / Voyage', sortable: true,
      render: (m) => (
        <div><p className="text-[0.80rem] font-medium">{m.vessel}</p><p className="text-[0.68rem] font-mono text-muted-foreground">{m.voyage}</p></div>
      ),
    },
    {
      key: 'route', header: 'Route',
      render: (m) => (
        <div className="flex items-center gap-1 text-[0.78rem]">
          <span className="font-medium">{m.portOfLoading.split(',')[0]}</span>
          <span className="text-muted-foreground">→</span>
          <span className="font-medium">{m.portOfDischarge.split(',')[0]}</span>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (m) => <ManifestStatusBadge status={m.status} />,
    },
    {
      key: 'containerCount', header: 'Containers', sortable: true,
      render: (m) => <span className="tabular-nums text-[0.80rem]">{m.containerCount} ctr</span>,
    },
    {
      key: 'totalWeight', header: 'Weight', sortable: true,
      render: (m) => <span className="tabular-nums text-[0.80rem]">{(m.totalWeight / 1000).toFixed(1)}t</span>,
    },
    {
      key: 'specialCargo', header: 'Haz/Reefer',
      render: (m) => (
        <div className="flex items-center gap-1.5">
          {m.hazmatCount > 0 && <Badge variant="outline" className="gap-1 text-[0.60rem] px-1.5 py-0 border-red-500/20 bg-red-500/10 text-red-400"><AlertTriangle className="w-3 h-3" />{m.hazmatCount}</Badge>}
          {m.reeferCount > 0 && <Badge variant="outline" className="gap-1 text-[0.60rem] px-1.5 py-0 border-blue-500/20 bg-blue-500/10 text-blue-400"><Shield className="w-3 h-3" />{m.reeferCount}</Badge>}
        </div>
      ),
    },
    {
      key: 'filedDate', header: 'Filed By / Date', sortable: true,
      render: (m) => (
        <div><p className="text-[0.80rem]">{m.filedBy}</p><p className="text-[0.68rem] text-muted-foreground">{formatDate(m.filedDate)}</p></div>
      ),
    },
    {
      key: 'actions', header: '', className: 'w-[140px]',
      render: (m) => (
        <div className="flex items-center gap-0.5">
          <button onClick={(e) => { e.stopPropagation(); openDetail(m); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"><Eye className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); openEdit(m); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); openDelete(m); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Cargo Manifests"
      description="Import, export and transshipment cargo manifests"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2 rounded-[9px]"><Download className="w-4 h-4" />Export CSV</Button>
          <Button onClick={openCreate} className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:from-sky-600 hover:to-indigo-600 rounded-[10px] gap-2"><Plus className="w-4 h-4" />Create Manifest</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <KPICard title="Total Manifests" value={stats.total} icon={<FileText className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Approved" value={stats.approved} icon={<FileCheck className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Filed" value={stats.filed} icon={<FileText className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Hazmat Shipments" value={stats.hazmat} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search manifest, vessel, voyage, carrier, or customs ref..." className="w-full h-9 pl-9 pr-8 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)] transition-all duration-200" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-9 px-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50">
            <option value="All">All Types</option>
            {manifestTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusPills.map(pill => (
            <StatusPill key={pill.label} label={pill.label} count={pill.count} active={statusFilter === pill.label} onClick={() => setStatusFilter(pill.label)} />
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState rows={6} message="Loading manifests..." />
      ) : data.length === 0 ? (
        <EmptyState icon={<FileText className="w-8 h-8" />} title="No manifests found" description={search || typeFilter !== 'All' || statusFilter !== 'All' ? 'Try adjusting your search or filter criteria' : 'No manifests available'} action={<Button variant="outline" className="gap-2 rounded-[9px]" onClick={() => { setSearch(''); setTypeFilter('All'); setStatusFilter('All'); }}><RotateCcw className="w-4 h-4" />Reset Filters</Button>} />
      ) : (
        <DataTable<PortManifest> data={data} columns={columns} pageSize={10} emptyMessage="No manifests match your criteria" />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingManifest ? 'Edit Manifest' : 'Create New Manifest'}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{manifestTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vessel</Label>
                <Input value={form.vessel} onChange={e => setForm(p => ({ ...p, vessel: e.target.value }))} placeholder="Vessel name" />
              </div>
              <div className="space-y-2">
                <Label>Voyage</Label>
                <Input value={form.voyage} onChange={e => setForm(p => ({ ...p, voyage: e.target.value }))} placeholder="e.g. CNYTN-ALT-2026" />
              </div>
              <div className="space-y-2">
                <Label>Carrier</Label>
                <Input value={form.carrier} onChange={e => setForm(p => ({ ...p, carrier: e.target.value }))} placeholder="Carrier name" />
              </div>
              <div className="space-y-2">
                <Label>Port of Loading</Label>
                <Input value={form.portOfLoading} onChange={e => setForm(p => ({ ...p, portOfLoading: e.target.value }))} placeholder="e.g. Shanghai, CN" />
              </div>
              <div className="space-y-2">
                <Label>Port of Discharge</Label>
                <Input value={form.portOfDischarge} onChange={e => setForm(p => ({ ...p, portOfDischarge: e.target.value }))} placeholder="e.g. Hamburg, DE" />
              </div>
              <div className="space-y-2">
                <Label>Filed By</Label>
                <Input value={form.filedBy} onChange={e => setForm(p => ({ ...p, filedBy: e.target.value }))} placeholder="Name of filer" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Additional notes..." />
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave}>{editingManifest ? 'Update Manifest' : 'Create Manifest'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Manifest Details</DrawerTitle>
          </DrawerHeader>
          {selectedManifest && (
            <div className="px-6 pb-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-xl">
                <div><Label className="text-[0.70rem] text-muted-foreground">Manifest ID</Label><p className="font-mono font-bold text-sm">{selectedManifest.manifestId}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Type</Label><ManifestTypeBadge type={selectedManifest.type} /></div>
                <div className="col-span-2"><Label className="text-[0.70rem] text-muted-foreground">Vessel</Label><p className="font-medium">{selectedManifest.vessel}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Voyage</Label><p className="font-mono text-sm">{selectedManifest.voyage}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Carrier</Label><p>{selectedManifest.carrier}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Route</Label><p>{selectedManifest.portOfLoading} → {selectedManifest.portOfDischarge}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Status</Label><ManifestStatusBadge status={selectedManifest.status} /></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Containers</Label><p className="tabular-nums">{selectedManifest.containerCount} units</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Total Weight</Label><p className="tabular-nums">{selectedManifest.totalWeight.toLocaleString()} {selectedManifest.weightUnit}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Hazmat</Label><p>{selectedManifest.hazmatCount} shipments</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Reefer</Label><p>{selectedManifest.reeferCount} containers</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Filed By</Label><p>{selectedManifest.filedBy}</p></div>
                <div><Label className="text-[0.70rem] text-muted-foreground">Filed Date</Label><p>{formatDate(selectedManifest.filedDate, 'datetime')}</p></div>
                {selectedManifest.approvedDate && <div><Label className="text-[0.70rem] text-muted-foreground">Approved Date</Label><p>{formatDate(selectedManifest.approvedDate, 'datetime')}</p></div>}
                <div className="col-span-2"><Label className="text-[0.70rem] text-muted-foreground">Customs Reference</Label><p className="font-mono text-sm">{selectedManifest.customsReference || '—'}</p></div>
              </div>

              {selectedManifest.notes && (
                <div><h4 className="text-sm font-semibold mb-2">Notes</h4><p className="text-sm text-muted-foreground">{selectedManifest.notes}</p></div>
              )}

              <div>
                <h4 className="text-sm font-semibold mb-2">Containers ({selectedManifest.containers.length})</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedManifest.containers.map(cid => (
                    <Badge key={cid} variant="outline" className="font-mono text-[0.65rem]">{cid}</Badge>
                  ))}
                  {selectedManifest.containers.length === 0 && <p className="text-sm text-muted-foreground">No containers listed</p>}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Shipments ({selectedManifest.shipmentIds.length})</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedManifest.shipmentIds.map(sid => (
                    <Badge key={sid} variant="outline" className="font-mono text-[0.65rem]">{sid}</Badge>
                  ))}
                  {selectedManifest.shipmentIds.length === 0 && <p className="text-sm text-muted-foreground">No shipments linked</p>}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Status Transitions</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(statusTransitions[selectedManifest.status] || []).map(nextStatus => (
                    <Button key={nextStatus} size="sm" variant="outline" className="text-[0.70rem] h-7 gap-1" onClick={() => { updateStatus(selectedManifest, nextStatus); setSelectedManifest(prev => prev ? { ...prev, status: nextStatus } : prev); }}>
                      <ArrowUpDown className="w-3 h-3" />{nextStatus}
                    </Button>
                  ))}
                  {selectedManifest.status !== 'Archived' && (
                    <Button size="sm" variant="outline" className="text-[0.70rem] h-7 gap-1 text-purple-400 border-purple-500/20 hover:bg-purple-500/10" onClick={() => { updateStatus(selectedManifest, 'Archived'); setSelectedManifest(prev => prev ? { ...prev, status: 'Archived' } : prev); }}>
                      <Archive className="w-3 h-3" />Archive
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Manifest</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete manifest {deletingManifest?.manifestId}? This action cannot be undone.</AlertDialogDescription>
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

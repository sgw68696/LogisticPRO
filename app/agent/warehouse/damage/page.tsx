'use client';
import { useState, useEffect, useCallback } from 'react';
import { warehouseService } from '@/services/warehouseService';
import type { DamageReport, DamageSeverity, DamageStatus } from '@/types/warehouse';
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
import { cn, formatDate } from '@/lib/utils';
import { exportToCSV } from '@/lib/export-utils';
import { toast } from 'sonner';
import { AlertTriangle, Search, X, RotateCcw, Plus, Eye, Pencil, Trash2, Download, ArrowUpDown, Shield, CheckCircle, Clock, FileText, User, CalendarDays, Flag, Camera, ThumbsUp, ThumbsDown, Trash as TrashIcon, RefreshCw } from 'lucide-react';

const severityColors: Record<string, string> = {
  Minor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Moderate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Severe: 'bg-red-500/10 text-red-400 border-red-500/20',
  Critical: 'bg-purple-600/10 text-purple-500 border-purple-600/20',
};

const damageStatusColors: Record<string, string> = {
  Reported: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Inspected: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Rejected: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Disposed: 'bg-red-500/10 text-red-400 border-red-500/20',
  Compensated: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const statusFilters = ['All', 'Reported', 'Inspected', 'Approved', 'Rejected', 'Disposed', 'Compensated'];
const severityFilters = ['All', 'Minor', 'Moderate', 'Severe', 'Critical'];

const defaultForm = {
  sku: '', productName: '', category: '', quantity: 1, unit: 'pcs',
  location: '', locationId: '', warehouseId: '', warehouseName: '',
  severity: 'Minor' as DamageSeverity, cause: '', description: '', notes: '',
};

type FlowStatus = 'Reported' | 'Inspected' | 'Approved' | 'Rejected' | 'Disposed' | 'Compensated';

const statusFlow: Record<FlowStatus, FlowStatus[]> = {
  Reported: ['Inspected'],
  Inspected: ['Approved', 'Rejected'],
  Approved: ['Disposed', 'Compensated'],
  Rejected: [],
  Disposed: [],
  Compensated: [],
};

export default function DamagePage() {
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<DamageReport | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);
  const [statusActionDialog, setStatusActionDialog] = useState<{ open: boolean; report: DamageReport | null; nextStatus: FlowStatus }>({ open: false, report: null, nextStatus: 'Inspected' });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await warehouseService.listDamageReports({
        status: statusFilter,
        severity: severityFilter,
        search: search || undefined,
      });
      setReports(data);
    } catch {
      toast.error('Failed to load damage reports');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter, search]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const kpis = [
    { title: 'Total Reports', value: reports.length, icon: <AlertTriangle className="w-5 h-5" />, iconColor: 'indigo' as const },
    { title: 'Critical', value: reports.filter(r => r.severity === 'Critical').length, icon: <Shield className="w-5 h-5" />, iconColor: 'red' as const },
    { title: 'Moderate', value: reports.filter(r => r.severity === 'Moderate').length, icon: <Flag className="w-5 h-5" />, iconColor: 'amber' as const },
    { title: 'Approved', value: reports.filter(r => r.status === 'Approved' || r.status === 'Compensated').length, icon: <CheckCircle className="w-5 h-5" />, iconColor: 'green' as const },
  ];

  const handleCreate = () => {
    setEditingReport(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const handleEdit = (report: DamageReport) => {
    setEditingReport(report);
    setForm({
      sku: report.sku, productName: report.productName, category: report.category,
      quantity: report.quantity, unit: report.unit, location: report.location,
      locationId: report.locationId, warehouseId: report.warehouseId,
      warehouseName: report.warehouseName,
      severity: report.severity, cause: report.cause,
      description: report.description, notes: report.notes,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingReport) {
        const updated = await warehouseService.updateDamageReport(editingReport.id, form);
        setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
        toast.success('Damage report updated');
      } else {
        const created = await warehouseService.createDamageReport({
          ...form,
          reportedBy: 'Current User',
          reportedDate: new Date().toISOString(),
        });
        setReports(prev => [created, ...prev]);
        toast.success('Damage report created');
      }
      setDialogOpen(false);
    } catch { toast.error('Failed to save damage report'); }
  };

  const handleDelete = async () => {
    if (!selectedReport) return;
    try {
      await warehouseService.deleteDamageReport(selectedReport.id);
      setReports(prev => prev.filter(r => r.id !== selectedReport.id));
      toast.success('Damage report deleted');
      setDeleteDialogOpen(false);
    } catch { toast.error('Failed to delete damage report'); }
  };

  const handleStatusAction = async (report: DamageReport, nextStatus: FlowStatus) => {
    const updates: Partial<DamageReport> = { status: nextStatus };
    if (nextStatus === 'Inspected') { updates.inspectedBy = 'Current User'; updates.inspectedDate = new Date().toISOString(); }
    if (nextStatus === 'Approved') { updates.approvedBy = 'Current User'; updates.approvedDate = new Date().toISOString(); }
    try {
      const updated = await warehouseService.updateDamageReport(report.id, updates);
      setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
      toast.success(`Report marked as ${nextStatus}`);
      setStatusActionDialog({ open: false, report: null, nextStatus: 'Inspected' });
    } catch { toast.error('Failed to update status'); }
  };

  const handleExport = () => {
    exportToCSV(
      reports.map(r => ({
        damageId: r.damageId, sku: r.sku, productName: r.productName, category: r.category,
        quantity: r.quantity, unit: r.unit, severity: r.severity, status: r.status,
        warehouseName: r.warehouseName, location: r.location, reportedBy: r.reportedBy,
        reportedDate: r.reportedDate, linkedGRN: r.linkedGRN || '', linkedGDN: r.linkedGDN || '',
      })),
      'damage-reports',
      [
        { key: 'damageId', label: 'Damage ID' }, { key: 'sku', label: 'SKU' },
        { key: 'productName', label: 'Product Name' }, { key: 'category', label: 'Category' },
        { key: 'quantity', label: 'Quantity' }, { key: 'unit', label: 'Unit' },
        { key: 'severity', label: 'Severity' }, { key: 'status', label: 'Status' },
        { key: 'warehouseName', label: 'Warehouse' }, { key: 'location', label: 'Location' },
        { key: 'reportedBy', label: 'Reported By' }, { key: 'reportedDate', label: 'Reported Date' },
        { key: 'linkedGRN', label: 'Linked GRN' }, { key: 'linkedGDN', label: 'Linked GDN' },
      ],
    );
    toast.success('Damage reports exported');
  };

  const columns: Column<DamageReport>[] = [
    { key: 'damageId', header: 'Damage#', sortable: true, render: r => <span className="font-mono text-xs">{r.damageId}</span> },
    {
      key: 'productName', header: 'SKU / Product', render: r => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold">{r.productName}</span>
          <span className="text-[10px] font-mono text-muted-foreground">{r.sku}</span>
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: r => <span className="text-xs text-muted-foreground">{r.category}</span> },
    { key: 'quantity', header: 'Qty', render: r => <span className="text-xs font-medium">{r.quantity} {r.unit}</span> },
    {
      key: 'severity', header: 'Severity', sortable: true, render: r => (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', severityColors[r.severity])}>{r.severity}</span>
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true, render: r => (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', damageStatusColors[r.status])}>{r.status}</span>
      ),
    },
    { key: 'warehouseName', header: 'Warehouse', render: r => <span className="text-xs">{r.warehouseName}</span> },
    {
      key: 'reportedBy', header: 'Reported By/Date', render: r => (
        <div className="flex flex-col">
          <span className="text-xs">{r.reportedBy}</span>
          <span className="text-[10px] text-muted-foreground">{formatDate(r.reportedDate)}</span>
        </div>
      ),
    },
    {
      key: 'linkedGRN', header: 'Link', render: r => (
        <div className="flex flex-col">
          {r.linkedGRN && <span className="text-[10px] font-mono text-blue-400">GRN: {r.linkedGRN}</span>}
          {r.linkedGDN && <span className="text-[10px] font-mono text-amber-400">GDN: {r.linkedGDN}</span>}
          {!r.linkedGRN && !r.linkedGDN && <span className="text-[10px] text-muted-foreground">-</span>}
        </div>
      ),
    },
    {
      key: 'actions', header: 'Actions', render: r => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); setSelectedReport(r); setDetailDrawerOpen(true); }}>
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={(e) => { e.stopPropagation(); handleEdit(r); }}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7 text-red-400" onClick={(e) => { e.stopPropagation(); setSelectedReport(r); setDeleteDialogOpen(true); }}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const getNextStatuses = (report: DamageReport): FlowStatus[] => statusFlow[report.status as FlowStatus] || [];

  return (
    <PageWrapper title="Damage Reports">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <KPICard key={i} title={kpi.title} value={kpi.value} icon={kpi.icon} iconColor={kpi.iconColor} />
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search damage ID, SKU, product..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-[300px] h-9 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleCreate}><Plus className="w-3.5 h-3.5 mr-1.5" />New Report</Button>
            <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-3.5 h-3.5 mr-1.5" />Export</Button>
            <Button variant="outline" size="sm" onClick={fetchReports}><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh</Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status */}
          {statusFilters.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-colors', statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:bg-muted/80')}>
              {s === 'All' ? 'All Status' : s}
            </button>
          ))}
          <span className="w-px h-5 bg-border mx-1" />
          {severityFilters.map(s => (
            <button key={s} onClick={() => setSeverityFilter(s)} className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-colors', severityFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:bg-muted/80')}>
              {s === 'All' ? 'All Severity' : s}
            </button>
          ))}
        </div>

        {/* Data */}
        {loading ? (
          <LoadingState rows={8} message="Loading damage reports..." />
        ) : reports.length === 0 ? (
          <EmptyState icon={<AlertTriangle className="w-8 h-8" />} title="No damage reports" description="Try adjusting your search or filters" action={<Button size="sm" onClick={handleCreate}><Plus className="w-3.5 h-3.5 mr-1.5" />Create Report</Button>} />
        ) : (
          <DataTable data={reports} columns={columns} searchKey={undefined} pageSize={25} />
        )}
      </div>

      {/* Status Action Buttons */}
      {selectedReport && !detailDrawerOpen && null}
      {reports.map(r => {
        const next = getNextStatuses(r);
        if (next.length === 0) return null;
        return (
          <div key={r.id} className="hidden">{/* status buttons rendered in drawer */}</div>
        );
      })}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>{editingReport ? 'Edit Damage Report' : 'New Damage Report'}</DialogTitle></DialogHeader>
          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} placeholder="e.g. SKU-001" />
              </div>
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input value={form.productName} onChange={e => setForm(p => ({ ...p, productName: e.target.value }))} placeholder="Product name" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Category" />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} placeholder="pcs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Aisle/Rack" />
              </div>
              <div className="space-y-2">
                <Label>Warehouse ID</Label>
                <Input value={form.warehouseId} onChange={e => setForm(p => ({ ...p, warehouseId: e.target.value }))} placeholder="WH-001" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Severity</Label>
                <select value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value as DamageSeverity }))} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none">
                  <option value="Minor">Minor</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Cause</Label>
                <Input value={form.cause} onChange={e => setForm(p => ({ ...p, cause: e.target.value }))} placeholder="Cause of damage" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none resize-none" placeholder="Describe the damage..." />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none resize-none" placeholder="Additional notes..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
            <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
            <Button size="sm" onClick={handleSave}>{editingReport ? 'Update' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Drawer */}
      <Drawer open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen} direction="right">
        <DrawerContent className="max-w-md">
          <DrawerHeader className="border-b border-border">
            <DrawerTitle>Damage Report Details</DrawerTitle>
            <DrawerClose className="absolute right-4 top-4"><X className="w-4 h-4" /></DrawerClose>
          </DrawerHeader>
          {selectedReport && (
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm font-semibold">{selectedReport.damageId}</p>
                <div className="flex gap-1">
                  <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', severityColors[selectedReport.severity])}>{selectedReport.severity}</span>
                  <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', damageStatusColors[selectedReport.status])}>{selectedReport.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs text-muted-foreground">SKU</Label><p className="text-sm font-mono">{selectedReport.sku}</p></div>
                <div><Label className="text-xs text-muted-foreground">Product</Label><p className="text-sm font-semibold">{selectedReport.productName}</p></div>
                <div><Label className="text-xs text-muted-foreground">Category</Label><p className="text-sm">{selectedReport.category}</p></div>
                <div><Label className="text-xs text-muted-foreground">Quantity</Label><p className="text-sm">{selectedReport.quantity} {selectedReport.unit}</p></div>
                <div><Label className="text-xs text-muted-foreground">Location</Label><p className="text-sm">{selectedReport.location}</p></div>
                <div><Label className="text-xs text-muted-foreground">Warehouse</Label><p className="text-sm">{selectedReport.warehouseName}</p></div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Cause</Label>
                <p className="text-sm">{selectedReport.cause || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Description</Label>
                <p className="text-sm text-muted-foreground">{selectedReport.description || 'No description'}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Notes</Label>
                <p className="text-sm text-muted-foreground">{selectedReport.notes || 'No notes'}</p>
              </div>

              {/* Linked Documents */}
              <div className="grid grid-cols-2 gap-3">
                {selectedReport.linkedGRN && (
                  <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <Label className="text-xs text-blue-400">Linked GRN</Label>
                    <p className="text-sm font-mono">{selectedReport.linkedGRN}</p>
                  </div>
                )}
                {selectedReport.linkedGDN && (
                  <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <Label className="text-xs text-amber-400">Linked GDN</Label>
                    <p className="text-sm font-mono">{selectedReport.linkedGDN}</p>
                  </div>
                )}
              </div>

              {/* Reporting Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><Label className="text-xs text-muted-foreground">Reported By</Label><p className="text-sm">{selectedReport.reportedBy}</p></div>
                <div><Label className="text-xs text-muted-foreground">Reported Date</Label><p className="text-sm">{formatDate(selectedReport.reportedDate)}</p></div>
                {selectedReport.inspectedBy && <div><Label className="text-xs text-muted-foreground">Inspected By</Label><p className="text-sm">{selectedReport.inspectedBy}</p></div>}
                {selectedReport.inspectedDate && <div><Label className="text-xs text-muted-foreground">Inspected Date</Label><p className="text-sm">{formatDate(selectedReport.inspectedDate)}</p></div>}
                {selectedReport.approvedBy && <div><Label className="text-xs text-muted-foreground">Approved By</Label><p className="text-sm">{selectedReport.approvedBy}</p></div>}
                {selectedReport.approvedDate && <div><Label className="text-xs text-muted-foreground">Approved Date</Label><p className="text-sm">{formatDate(selectedReport.approvedDate)}</p></div>}
              </div>

              {/* Timeline */}
              {selectedReport.timeline && selectedReport.timeline.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Timeline</Label>
                  <div className="space-y-2">
                    {selectedReport.timeline.map((event, i) => (
                      <div key={event.id || i} className="flex items-start gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-muted-foreground">{event.description} — {event.userName} at {formatDate(event.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Actions */}
              {getNextStatuses(selectedReport).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  {getNextStatuses(selectedReport).map(next => (
                    <Button key={next} size="sm" variant="outline" onClick={() => { setDetailDrawerOpen(false); setStatusActionDialog({ open: true, report: selectedReport, nextStatus: next }); }}>
                      {next === 'Inspected' && <><Search className="w-3.5 h-3.5 mr-1.5" />Mark Inspected</>}
                      {next === 'Approved' && <><ThumbsUp className="w-3.5 h-3.5 mr-1.5" />Approve</>}
                      {next === 'Rejected' && <><ThumbsDown className="w-3.5 h-3.5 mr-1.5" />Reject</>}
                      {next === 'Disposed' && <><TrashIcon className="w-3.5 h-3.5 mr-1.5" />Dispose</>}
                      {next === 'Compensated' && <><CheckCircle className="w-3.5 h-3.5 mr-1.5" />Compensate</>}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* Delete Confirm */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Damage Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete report <strong>{selectedReport?.damageId}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Action Confirm */}
      <AlertDialog open={statusActionDialog.open} onOpenChange={open => setStatusActionDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Change status of report <strong>{statusActionDialog.report?.damageId}</strong> to <strong>{statusActionDialog.nextStatus}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => statusActionDialog.report && handleStatusAction(statusActionDialog.report, statusActionDialog.nextStatus)}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}

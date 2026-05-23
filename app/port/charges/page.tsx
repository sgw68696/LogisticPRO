'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { portService } from '@/services/port/portService';
import type { PortCharge, ChargeCategory, ChargeStatus } from '@/types/port';
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
import { Receipt, DollarSign, Clock, CheckCircle, AlertTriangle, Ban, Search, X, RotateCcw, Plus, Eye, Pencil, Trash2, Download, ArrowUpDown, FileText, Ship, CalendarDays, Building2, CreditCard, TrendingUp } from 'lucide-react';

const chargeStatusColors: Record<string, string> = {
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Collected: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
  Disputed: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Waived: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const chargeCategoryColors: Record<string, string> = {
  'Berth Hire': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Pilotage: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Towage: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Mooring: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Cargo Handling': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Storage: 'bg-green-500/10 text-green-400 border-green-500/20',
  Demurrage: 'bg-red-500/10 text-red-400 border-red-500/20',
  Customs: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  Documentation: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Security: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Environmental: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Other: 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20',
};

const chargeCategories: ChargeCategory[] = ['Berth Hire', 'Pilotage', 'Towage', 'Mooring', 'Cargo Handling', 'Storage', 'Demurrage', 'Customs', 'Documentation', 'Security', 'Environmental', 'Other'];
const statusOptions: ChargeStatus[] = ['Pending', 'Collected', 'Overdue', 'Disputed', 'Waived'];
const currencies = ['USD', 'EUR', 'INR', 'SGD'] as const;

const emptyCharge: Partial<PortCharge> = {
  type: 'Berth Hire',
  status: 'Pending',
  vessel: '',
  vesselId: '',
  voyage: '',
  description: '',
  payer: '',
  quantity: 1,
  rate: 0,
  currency: 'USD',
  amount: 0,
  issuedDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  notes: '',
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

function StatusPill({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  const colors = label !== 'All' ? chargeStatusColors[label] : '';
  const statusDot: Record<string, string> = { Pending: 'bg-amber-400', Collected: 'bg-emerald-400', Overdue: 'bg-red-400', Disputed: 'bg-orange-400', Waived: 'bg-gray-400' };
  return (
    <button onClick={onClick} className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.70rem] font-bold border transition-all', active && colors ? `${colors} shadow-sm` : '', active && !colors ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' : '', !active ? 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:border-border' : '')}>
      {label !== 'All' && <span className={cn('w-1.5 h-1.5 rounded-full', statusDot[label] || 'bg-muted-foreground')} />}
      {label}<span className={cn('text-[0.65rem]', active ? 'opacity-80' : 'text-muted-foreground/60')}>{count}</span>
    </button>
  );
}

export default function ChargesPage() {
  const [data, setData] = useState<PortCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<PortCharge | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<Partial<PortCharge>>({ ...emptyCharge });
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCharge, setDeletingCharge] = useState<PortCharge | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await portService.listCharges({ search: search || undefined, category: categoryFilter !== 'All' ? categoryFilter : undefined, status: statusFilter !== 'All' ? statusFilter : undefined });
      setData(result);
    } catch { setError('Failed to load port charges'); }
    finally { setLoading(false); }
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = data.reduce((s, c) => s + c.amount, 0);
    const collected = data.filter(c => c.status === 'Collected').reduce((s, c) => s + c.amount, 0);
    const pending = data.filter(c => c.status === 'Pending').reduce((s, c) => s + c.amount, 0);
    const overdue = data.filter(c => c.status === 'Overdue').reduce((s, c) => s + c.amount, 0);
    const disputed = data.filter(c => c.status === 'Disputed').reduce((s, c) => s + c.amount, 0);
    return { total, collected, pending, overdue, disputed };
  }, [data]);

  const statusPills = useMemo(() => {
    const counts: Record<string, number> = { All: data.length };
    data.forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return ['All', 'Pending', 'Collected', 'Overdue', 'Disputed', 'Waived'].map(label => ({ label, count: counts[label] || 0 }));
  }, [data]);

  const filtered = useMemo(() => {
    let result = [...data];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.chargeId.toLowerCase().includes(q) || c.invoiceRef.toLowerCase().includes(q) || c.vessel.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.payer.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'All') result = result.filter(c => c.type === categoryFilter);
    if (statusFilter !== 'All') result = result.filter(c => c.status === statusFilter);
    return result;
  }, [data, search, categoryFilter, statusFilter]);

  const openCreate = () => { setEditingCharge({ ...emptyCharge, issuedDate: new Date().toISOString().split('T')[0] }); setIsEditing(false); setDialogOpen(true); };
  const openEdit = (charge: PortCharge) => { setEditingCharge({ ...charge, issuedDate: charge.issuedDate?.split('T')[0] || '', dueDate: charge.dueDate?.split('T')[0] || '', paidDate: charge.paidDate?.split('T')[0] || '' }); setIsEditing(true); setDialogOpen(true); };
  const openDetail = (charge: PortCharge) => { setSelectedCharge(charge); setDrawerOpen(true); };
  const openDelete = (charge: PortCharge) => { setDeletingCharge(charge); setDeleteOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...editingCharge, amount: (editingCharge.quantity || 0) * (editingCharge.rate || 0) };
      if (isEditing && editingCharge.id) {
        const updated = await portService.updateCharge(editingCharge.id, payload);
        setData(prev => prev.map(c => c.id === editingCharge.id ? updated : c));
        toast.success('Charge updated successfully');
      } else {
        const created = await portService.createCharge(payload);
        setData(prev => [created, ...prev]);
        toast.success('Charge created successfully');
      }
      setDialogOpen(false);
    } catch { toast.error('Failed to save charge'); }
    finally { setSaving(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCharge) return;
    try {
      await portService.deleteCharge(deletingCharge.id);
      setData(prev => prev.filter(c => c.id !== deletingCharge.id));
      toast.success('Charge deleted successfully');
      setDeleteOpen(false);
      setDeletingCharge(null);
    } catch { toast.error('Failed to delete charge'); }
  };

  const handleStatusUpdate = async (charge: PortCharge, newStatus: ChargeStatus) => {
    try {
      const updated = await portService.updateCharge(charge.id, { status: newStatus, ...(newStatus === 'Collected' ? { paidDate: new Date().toISOString() } : {}) });
      setData(prev => prev.map(c => c.id === charge.id ? updated : c));
      toast.success(`Charge marked as ${newStatus}`);
    } catch { toast.error('Failed to update status'); }
  };

  const handleExport = () => {
    const headers = [
      { key: 'chargeId' as keyof PortCharge, label: 'Charge ID' },
      { key: 'invoiceRef' as keyof PortCharge, label: 'Invoice Ref' },
      { key: 'type' as keyof PortCharge, label: 'Category' },
      { key: 'vessel' as keyof PortCharge, label: 'Vessel' },
      { key: 'voyage' as keyof PortCharge, label: 'Voyage' },
      { key: 'description' as keyof PortCharge, label: 'Description' },
      { key: 'payer' as keyof PortCharge, label: 'Payer' },
      { key: 'amount' as keyof PortCharge, label: 'Amount' },
      { key: 'currency' as keyof PortCharge, label: 'Currency' },
      { key: 'status' as keyof PortCharge, label: 'Status' },
      { key: 'dueDate' as keyof PortCharge, label: 'Due Date' },
      { key: 'paidDate' as keyof PortCharge, label: 'Paid Date' },
    ];
    exportToCSV(filtered as unknown as Record<string, unknown>[], 'port-charges', headers);
    toast.success('Charges exported to CSV');
  };

  const computeAmount = (q: number | undefined, r: number | undefined) => (q || 0) * (r || 0);
  const showActions = selectedCharge || (!!search) || categoryFilter !== 'All' || statusFilter !== 'All';

  const columns: Column<PortCharge>[] = [
    {
      key: 'invoiceRef', header: 'Invoice Ref', sortable: true,
      render: (c) => (
        <button onClick={() => openDetail(c)} className="text-left min-w-0 hover:opacity-80">
          <p className="text-sm font-semibold text-foreground">{c.invoiceRef}</p>
          <p className="text-xs text-muted-foreground font-mono">{c.chargeId}</p>
        </button>
      ),
    },
    {
      key: 'type', header: 'Type / Category', sortable: true,
      render: (c) => (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold border', chargeCategoryColors[c.type] || 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20')}>
          {c.type}
        </span>
      ),
    },
    {
      key: 'vessel', header: 'Vessel / Voyage', sortable: true,
      render: (c) => (
        <div className="min-w-0">
          <p className="text-sm text-foreground truncate">{c.vessel}</p>
          <p className="text-xs font-mono text-muted-foreground">{c.voyage}</p>
        </div>
      ),
    },
    {
      key: 'description', header: 'Description',
      render: (c) => <span className="text-sm text-muted-foreground max-w-[200px] truncate block">{c.description}</span>,
    },
    {
      key: 'payer', header: 'Payer', sortable: true,
      render: (c) => <span className="text-sm text-foreground">{c.payer}</span>,
    },
    {
      key: 'amount', header: 'Amount', sortable: true,
      render: (c) => <span className="text-sm font-semibold text-foreground font-mono whitespace-nowrap">{formatCurrency(c.amount, c.currency)}</span>,
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (c) => (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border', chargeStatusColors[c.status] || '')}>
          <span className={cn('w-1.5 h-1.5 rounded-full', c.status === 'Pending' ? 'bg-amber-400' : c.status === 'Collected' ? 'bg-emerald-400' : c.status === 'Overdue' ? 'bg-red-400' : c.status === 'Disputed' ? 'bg-orange-400' : 'bg-gray-400')} />
          {c.status}
        </span>
      ),
    },
    {
      key: 'dueDate', header: 'Due / Paid', sortable: true,
      render: (c) => (
        <div className="min-w-0 whitespace-nowrap">
          <p className="text-xs text-foreground">Due: {formatDate(c.dueDate, 'short')}</p>
          <p className="text-xs text-muted-foreground">{c.paidDate ? `Paid: ${formatDate(c.paidDate, 'short')}` : '\u2014'}</p>
        </div>
      ),
    },
    {
      key: 'id', header: '', className: 'w-[200px] text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => openDetail(c)} className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" title="View"><Eye className="w-4 h-4" /></button>
          <button onClick={() => openEdit(c)} className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
          <div className="relative group">
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-amber-500/10 hover:text-amber-400 transition-colors" title="Update Status"><TrendingUp className="w-4 h-4" /></button>
            <div className="absolute right-0 top-full mt-1 z-50 hidden group-hover:block bg-card border border-border/60 rounded-lg shadow-xl py-1 min-w-[160px]">
              {statusOptions.filter(s => s !== c.status).map(s => (
                <button key={s} onClick={() => handleStatusUpdate(c, s)} className="w-full text-left px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors">{s === 'Collected' ? 'Mark as Collected' : s === 'Overdue' ? 'Mark as Overdue' : s === 'Disputed' ? 'Mark as Disputed' : s === 'Waived' ? 'Mark as Waived' : s}</button>
              ))}
            </div>
          </div>
          <button onClick={() => openDelete(c)} className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <PageWrapper title="Port Charges" description="Port handling fees, demurrage, and storage charges">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center"><AlertTriangle className="w-8 h-8 text-red-400" /></div>
          <h3 className="text-lg font-medium text-foreground">Failed to load port charges</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">{error}</p>
          <Button variant="outline" onClick={fetchData} className="gap-2"><RotateCcw className="w-4 h-4" />Retry</Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Port Charges"
      description="Port handling fees, demurrage, and storage charges"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2 rounded-[9px]"><Download className="w-4 h-4" />Export CSV</Button>
          <Button onClick={openCreate} className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg rounded-[10px] gap-2"><Plus className="w-4 h-4" />Create Charge</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <KPICard title="Total Charges" value={formatCurrency(stats.total, 'USD')} icon={<DollarSign className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Collected" value={formatCurrency(stats.collected, 'USD')} icon={<CheckCircle className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Pending" value={formatCurrency(stats.pending, 'USD')} icon={<Clock className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Overdue" value={formatCurrency(stats.overdue, 'USD')} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" />
        <KPICard title="Disputed" value={formatCurrency(stats.disputed, 'USD')} icon={<Ban className="w-5 h-5" />} iconColor="amber" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoice, vessel, payer, ref..." className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)] transition-all duration-200" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-[170px] h-9 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none focus:border-primary/50 px-3">
            <option value="All">All Categories</option>
            {chargeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusPills.map(pill => <StatusPill key={pill.label} label={pill.label} count={pill.count} active={statusFilter === pill.label} onClick={() => setStatusFilter(pill.label)} />)}
        </div>
      </div>

      {loading ? <LoadingState rows={5} message="Loading port charges..." /> : filtered.length === 0 ? (
        <EmptyState icon={<Receipt className="w-8 h-8 text-muted-foreground" />} title="No charges found" description={search || categoryFilter !== 'All' || statusFilter !== 'All' ? 'Try adjusting your search or filter criteria' : 'No port charges recorded yet'} />
      ) : <DataTable<PortCharge> data={filtered} columns={columns} pageSize={10} emptyMessage="No charges match your criteria" />}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{isEditing ? 'Edit Charge' : 'Create Charge'}</DialogTitle><DialogClose /></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Type / Category</Label>
              <Select value={editingCharge.type} onValueChange={v => setEditingCharge(p => ({ ...p, type: v as ChargeCategory }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {chargeCategories.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={editingCharge.status} onValueChange={v => setEditingCharge(p => ({ ...p, status: v as ChargeStatus }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Vessel</Label>
              <Input value={editingCharge.vessel || ''} onChange={e => setEditingCharge(p => ({ ...p, vessel: e.target.value }))} className="h-9 text-xs" placeholder="Vessel name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Vessel ID</Label>
              <Input value={editingCharge.vesselId || ''} onChange={e => setEditingCharge(p => ({ ...p, vesselId: e.target.value }))} className="h-9 text-xs" placeholder="Vessel ID" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Voyage</Label>
              <Input value={editingCharge.voyage || ''} onChange={e => setEditingCharge(p => ({ ...p, voyage: e.target.value }))} className="h-9 text-xs" placeholder="Voyage number" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Payer</Label>
              <Input value={editingCharge.payer || ''} onChange={e => setEditingCharge(p => ({ ...p, payer: e.target.value }))} className="h-9 text-xs" placeholder="Payer name" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input value={editingCharge.description || ''} onChange={e => setEditingCharge(p => ({ ...p, description: e.target.value }))} className="h-9 text-xs" placeholder="Charge description" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Quantity</Label>
              <Input type="number" value={editingCharge.quantity || 0} onChange={e => setEditingCharge(p => ({ ...p, quantity: Number(e.target.value) }))} className="h-9 text-xs" min={0} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Rate</Label>
              <Input type="number" value={editingCharge.rate || 0} onChange={e => setEditingCharge(p => ({ ...p, rate: Number(e.target.value) }))} className="h-9 text-xs" min={0} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Currency</Label>
              <Select value={editingCharge.currency} onValueChange={v => setEditingCharge(p => ({ ...p, currency: v as 'USD' | 'EUR' | 'INR' | 'SGD' }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currencies.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Amount (computed)</Label>
              <Input value={formatCurrency(computeAmount(editingCharge.quantity, editingCharge.rate), editingCharge.currency || 'USD')} className="h-9 text-xs font-mono font-semibold" readOnly />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Issued Date</Label>
              <Input type="date" value={editingCharge.issuedDate || ''} onChange={e => setEditingCharge(p => ({ ...p, issuedDate: e.target.value }))} className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Due Date</Label>
              <Input type="date" value={editingCharge.dueDate || ''} onChange={e => setEditingCharge(p => ({ ...p, dueDate: e.target.value }))} className="h-9 text-xs" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Notes</Label>
              <Input value={editingCharge.notes || ''} onChange={e => setEditingCharge(p => ({ ...p, notes: e.target.value }))} className="h-9 text-xs" placeholder="Optional notes" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : isEditing ? 'Update Charge' : 'Create Charge'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-w-md">
          <DrawerHeader><DrawerTitle>Charge Details</DrawerTitle><DrawerClose /></DrawerHeader>
          {selectedCharge && (
            <div className="px-6 pb-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-foreground">{selectedCharge.invoiceRef}</p>
                  <p className="text-xs font-mono text-muted-foreground">{selectedCharge.chargeId}</p>
                </div>
                <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border', chargeStatusColors[selectedCharge.status] || '')}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', selectedCharge.status === 'Pending' ? 'bg-amber-400' : selectedCharge.status === 'Collected' ? 'bg-emerald-400' : selectedCharge.status === 'Overdue' ? 'bg-red-400' : selectedCharge.status === 'Disputed' ? 'bg-orange-400' : 'bg-gray-400')} />
                  {selectedCharge.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Category</p><p className="font-medium text-foreground">{selectedCharge.type}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Amount</p><p className="font-medium text-foreground font-mono">{formatCurrency(selectedCharge.amount, selectedCharge.currency)}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Vessel</p><p className="font-medium text-foreground">{selectedCharge.vessel}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Voyage</p><p className="font-medium text-foreground">{selectedCharge.voyage}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Payer</p><p className="font-medium text-foreground">{selectedCharge.payer}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Qty x Rate</p><p className="font-medium text-foreground">{selectedCharge.quantity} x {formatCurrency(selectedCharge.rate, selectedCharge.currency)}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Issued</p><p className="font-medium text-foreground">{formatDate(selectedCharge.issuedDate, 'short')}</p></div>
                <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Due</p><p className="font-medium text-foreground">{formatDate(selectedCharge.dueDate, 'short')}</p></div>
                {selectedCharge.paidDate && <div className="p-3 bg-muted/20 rounded-lg"><p className="text-xs text-muted-foreground">Paid</p><p className="font-medium text-foreground">{formatDate(selectedCharge.paidDate, 'short')}</p></div>}
                {selectedCharge.invoiceLink && <div className="p-3 bg-muted/20 rounded-lg col-span-2"><p className="text-xs text-muted-foreground">Invoice Link</p><a href={selectedCharge.invoiceLink} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline text-xs">{selectedCharge.invoiceLink}</a></div>}
              </div>

              {selectedCharge.notes && (
                <div className="p-3 bg-muted/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-foreground">{selectedCharge.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {statusOptions.filter(s => s !== selectedCharge.status).map(s => (
                  <Button key={s} size="sm" variant="outline" className="text-xs" onClick={() => { handleStatusUpdate(selectedCharge, s); setDrawerOpen(false); }}>
                    {s === 'Collected' ? 'Mark Collected' : s === 'Overdue' ? 'Mark Overdue' : s === 'Disputed' ? 'Mark Disputed' : s === 'Waived' ? 'Mark Waived' : s}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Charge</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogDescription>Are you sure you want to delete charge <strong>{deletingCharge?.invoiceRef}</strong>? This action cannot be undone.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}

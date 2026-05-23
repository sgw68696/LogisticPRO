'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { portService } from '@/services/port/portService';
import type { Flight, FlightStatus } from '@/types/port';
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
import { Plane, Luggage, Clock, AlertTriangle, Search, X, RotateCcw, Plus, Eye, Pencil, Trash2, Download, ArrowUpDown, MapPin, CalendarDays, User, Phone, Wifi, Airplay } from 'lucide-react';

const flightStatusColors: Record<string, string> = {
  Scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Boarding: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Departed: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'In Flight': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Arrived: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Landed: 'bg-green-500/10 text-green-400 border-green-500/20',
  Delayed: 'bg-red-500/10 text-red-400 border-red-500/20',
  Cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Diverted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'On Stand': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const flightStatusDot: Record<string, string> = {
  Scheduled: 'bg-blue-400', Boarding: 'bg-amber-400', Departed: 'bg-indigo-400',
  'In Flight': 'bg-cyan-400', Arrived: 'bg-emerald-400', Landed: 'bg-green-400',
  Delayed: 'bg-red-400', Cancelled: 'bg-gray-400', Diverted: 'bg-purple-400', 'On Stand': 'bg-orange-400',
};

const typeColors: Record<string, string> = {
  Arrival: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Departure: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
};

const statusFlow: Record<string, FlightStatus[]> = {
  Scheduled: ['Boarding'],
  Boarding: ['Departed'],
  Departed: ['In Flight'],
  'In Flight': ['Arrived', 'Landed'],
  Arrived: ['Landed'],
  Landed: [],
  Delayed: ['Scheduled', 'Boarding', 'Departed', 'In Flight', 'Arrived', 'Landed'],
  Cancelled: ['Scheduled'],
  Diverted: ['Arrived', 'Landed'],
  'On Stand': ['Scheduled'],
};

const statusPillsOrder = [
  'All', 'Scheduled', 'Boarding', 'Departed', 'In Flight',
  'Arrived', 'Landed', 'Delayed', 'Cancelled', 'Diverted', 'On Stand',
] as const;

interface FlightFormData {
  flightNumber: string; airline: string; type: 'Arrival' | 'Departure';
  origin: string; originCode: string; destination: string; destinationCode: string;
  scheduled: string; estimated: string; gate: string;
  carrier: string; aircraft: string; cargoWeight: number; cargoVolume: number;
  awbCount: number; notes: string;
}

const defaultFormData: FlightFormData = {
  flightNumber: '', airline: '', type: 'Arrival',
  origin: '', originCode: '', destination: '', destinationCode: '',
  scheduled: new Date().toISOString().slice(0, 16), estimated: new Date().toISOString().slice(0, 16),
  gate: '', carrier: '', aircraft: '',
  cargoWeight: 0, cargoVolume: 0, awbCount: 0, notes: '',
};

function RouteView({ origin, originCode, destination, destinationCode, type }: { origin: string; originCode: string; destination: string; destinationCode: string; type: string }) {
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="text-right">
        <p className="text-xs font-semibold text-foreground">{originCode}</p>
        <p className="text-[0.6rem] text-muted-foreground truncate max-w-[60px]">{origin}</p>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-1.5 h-1.5 rounded-full border border-muted-foreground/40" />
        <div className="w-px h-3 bg-muted-foreground/20" />
        <div className={cn('w-1.5 h-1.5 rounded-full', type === 'Arrival' ? 'bg-emerald-400/60' : 'bg-sky-400/60')} />
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground">{destinationCode}</p>
        <p className="text-[0.6rem] text-muted-foreground truncate max-w-[60px]">{destination}</p>
      </div>
    </div>
  );
}

function formatWeight(kg: number) {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}T`;
  return `${kg} kg`;
}

export default function FlightSchedulePage() {
  const [data, setData] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [formData, setFormData] = useState<FlightFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  const [deletingFlight, setDeletingFlight] = useState<Flight | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await portService.listFlights({
        search: search || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        type: typeFilter !== 'All' ? typeFilter : undefined,
      });
      setData(result);
    } catch {
      setError('Failed to load flight data');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = data.length;
    const arrived = data.filter(f => f.status === 'Arrived' || f.status === 'Landed').length;
    const inFlight = data.filter(f => f.status === 'In Flight').length;
    const delayed = data.filter(f => f.status === 'Delayed').length;
    return { total, arrived, inFlight, delayed };
  }, [data]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(f =>
      f.flightNumber.toLowerCase().includes(q) ||
      f.airline.toLowerCase().includes(q) ||
      f.origin.toLowerCase().includes(q) ||
      f.destination.toLowerCase().includes(q)
    );
  }, [data, search]);

  const resetForm = useCallback((flight?: Flight | null) => {
    if (flight) {
      setFormData({
        flightNumber: flight.flightNumber, airline: flight.airline,
        type: flight.type, origin: flight.origin, originCode: flight.originCode,
        destination: flight.destination, destinationCode: flight.destinationCode,
        scheduled: flight.scheduled.slice(0, 16), estimated: flight.estimated.slice(0, 16),
        gate: flight.gate, carrier: flight.carrier, aircraft: flight.aircraft,
        cargoWeight: flight.cargoWeight, cargoVolume: flight.cargoVolume,
        awbCount: flight.awbCount, notes: flight.notes,
      });
    } else {
      setFormData(defaultFormData);
    }
  }, []);

  const openCreate = useCallback(() => {
    setEditingFlight(null);
    resetForm(null);
    setDialogOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((flight: Flight) => {
    setEditingFlight(flight);
    resetForm(flight);
    setDialogOpen(true);
  }, [resetForm]);

  const openDrawer = useCallback((flight: Flight) => {
    setSelectedFlight(flight);
    setDrawerOpen(true);
  }, []);

  const handleFormChange = useCallback((field: keyof FlightFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        cargoWeight: Number(formData.cargoWeight),
        cargoVolume: Number(formData.cargoVolume),
        awbCount: Number(formData.awbCount),
      };
      if (editingFlight) {
        await portService.updateFlight(editingFlight.id, payload);
        setData(prev => prev.map(f => f.id === editingFlight.id ? { ...f, ...payload, updatedAt: new Date().toISOString() } as Flight : f));
        toast.success('Flight updated successfully');
      } else {
        const created = await portService.createFlight(payload);
        setData(prev => [...prev, created]);
        toast.success('Flight created successfully');
      }
      setDialogOpen(false);
    } catch {
      toast.error('Failed to save flight');
    } finally {
      setSaving(false);
    }
  }, [formData, editingFlight]);

  const handleDelete = useCallback(async () => {
    if (!deletingFlight) return;
    try {
      await portService.deleteFlight(deletingFlight.id);
      setData(prev => prev.filter(f => f.id !== deletingFlight.id));
      toast.success('Flight deleted');
      setDeleteOpen(false);
      setDeletingFlight(null);
    } catch {
      toast.error('Failed to delete flight');
    }
  }, [deletingFlight]);

  const handleStatusUpdate = useCallback(async (flight: Flight, newStatus: FlightStatus) => {
    try {
      await portService.updateFlight(flight.id, { status: newStatus });
      setData(prev => prev.map(f => f.id === flight.id ? { ...f, status: newStatus, updatedAt: new Date().toISOString() } as Flight : f));
      if (selectedFlight?.id === flight.id) {
        setSelectedFlight(prev => prev ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() } : null);
      }
      toast.success(`Flight status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update flight status');
    }
  }, [selectedFlight]);

  const handleExportCSV = useCallback(() => {
    if (filtered.length === 0) { toast.error('No data to export'); return; }
    exportToCSV(
      filtered.map(f => ({
        flightNumber: f.flightNumber, airline: f.airline, type: f.type,
        origin: f.origin, originCode: f.originCode,
        destination: f.destination, destinationCode: f.destinationCode,
        scheduled: f.scheduled, estimated: f.estimated, actual: f.actual || '',
        gate: f.gate, status: f.status, carrier: f.carrier,
        cargoWeight: f.cargoWeight, cargoVolume: f.cargoVolume, awbCount: f.awbCount,
      })),
      'flights-export',
      [
        { key: 'flightNumber', label: 'Flight Number' },
        { key: 'airline', label: 'Airline' },
        { key: 'type', label: 'Type' },
        { key: 'origin', label: 'Origin' },
        { key: 'originCode', label: 'Origin Code' },
        { key: 'destination', label: 'Destination' },
        { key: 'destinationCode', label: 'Destination Code' },
        { key: 'scheduled', label: 'Scheduled' },
        { key: 'estimated', label: 'Estimated' },
        { key: 'actual', label: 'Actual' },
        { key: 'gate', label: 'Gate' },
        { key: 'status', label: 'Status' },
        { key: 'carrier', label: 'Carrier' },
        { key: 'cargoWeight', label: 'Cargo Weight' },
        { key: 'cargoVolume', label: 'Cargo Volume' },
        { key: 'awbCount', label: 'AWB Count' },
      ]
    );
    toast.success('Flights exported to CSV');
  }, [filtered]);

  const formatTime = useCallback((dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }, []);

  const statusPills = useMemo(() => {
    const counts: Record<string, number> = { All: data.length };
    data.forEach(f => { counts[f.status] = (counts[f.status] || 0) + 1; });
    return statusPillsOrder.map(label => ({ label, count: counts[label] || 0 }));
  }, [data]);

  const columns: Column<Flight>[] = useMemo(() => [
    {
      key: 'flightNumber', header: 'Flight #', sortable: true,
      render: (f) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Plane className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold font-mono text-foreground">{f.flightNumber}</p>
            <p className="text-xs text-muted-foreground">{f.airline}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type', header: 'Type', sortable: true,
      render: (f) => (
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold border', typeColors[f.type])}>
          {f.type === 'Arrival' ? '← Arrival' : 'Departure →'}
        </span>
      ),
    },
    {
      key: 'origin', header: 'Route',
      render: (f) => (
        <RouteView origin={f.origin} originCode={f.originCode} destination={f.destination} destinationCode={f.destinationCode} type={f.type} />
      ),
    },
    {
      key: 'scheduled', header: 'Schedule', sortable: true,
      render: (f) => (
        <div className="text-xs whitespace-nowrap">
          <p className="text-foreground">{formatTime(f.scheduled)}</p>
          {f.estimated !== f.scheduled && <p className="text-muted-foreground">Est: {formatTime(f.estimated)}</p>}
        </div>
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (f) => (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border', flightStatusColors[f.status])}>
          <span className={cn('w-1.5 h-1.5 rounded-full', flightStatusDot[f.status] || 'bg-muted-foreground')} />
          {f.status}
        </span>
      ),
    },
    {
      key: 'gate', header: 'Gate',
      render: (f) => <Badge variant="outline" className="font-mono text-xs">{f.gate || '—'}</Badge>,
    },
    {
      key: 'cargoWeight', header: 'Cargo', sortable: true,
      render: (f) => (
        <div className="text-xs font-medium tabular-nums">
          <p className="text-foreground">{formatWeight(f.cargoWeight)}</p>
          <p className="text-muted-foreground">{f.awbCount} AWB</p>
        </div>
      ),
    },
    {
      key: 'id', header: '', className: 'w-[100px] text-right',
      render: (f) => (
        <div className="flex items-center justify-end gap-0.5" onClick={e => e.stopPropagation()}>
          <button onClick={() => openDrawer(f)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" title="View">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => openEdit(f)} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-sky-500/10 hover:text-sky-400 transition-colors" title="Edit">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { setDeletingFlight(f); setDeleteOpen(true); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ], [openEdit, openDrawer]);

  return (
    <PageWrapper
      title="Flight Schedule"
      description="Cargo flight arrival and departure board"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Schedule Flight
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Flights" value={stats.total} icon={<Plane className="w-5 h-5" />} iconColor="cyan" description="All flights" />
        <KPICard title="Arrived / Landed" value={stats.arrived} icon={<Luggage className="w-5 h-5" />} iconColor="green" description="Completed flights" />
        <KPICard title="In Flight" value={stats.inFlight} icon={<Airplay className="w-5 h-5" />} iconColor="indigo" description="En route" />
        <KPICard title="Delayed" value={stats.delayed} icon={<AlertTriangle className="w-5 h-5" />} iconColor="red" description="Behind schedule" />
      </div>

      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search flights by number, airline, origin or destination..."
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
            <option value="Arrival">Arrivals</option>
            <option value="Departure">Departures</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {statusPills.map(pill => (
            <button
              key={pill.label}
              onClick={() => setStatusFilter(pill.label)}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                statusFilter === pill.label && pill.label !== 'All' ? flightStatusColors[pill.label] : '',
                statusFilter === pill.label && pill.label === 'All' ? 'bg-primary/10 text-primary border-primary/30' : '',
                statusFilter !== pill.label ? 'bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground hover:border-border' : '',
              )}
            >
              {pill.label !== 'All' && <span className={cn('w-1.5 h-1.5 rounded-full', flightStatusDot[pill.label] || 'bg-muted-foreground')} />}
              {pill.label}
              <span className={cn('text-[0.65rem]', statusFilter === pill.label ? 'opacity-80' : 'text-muted-foreground/60')}>{pill.count}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState rows={5} message="Loading flights..." />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Failed to load flights</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">{error}</p>
          <Button variant="outline" onClick={fetchData} className="gap-2"><RotateCcw className="w-4 h-4" /> Retry</Button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Plane className="w-8 h-8 text-muted-foreground" />}
          title="No flights found"
          description={search || statusFilter !== 'All' || typeFilter !== 'All' ? 'Try adjusting your search or filter' : 'No flights in the schedule yet'}
          action={<Button onClick={openCreate} size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" />Add Flight</Button>}
        />
      ) : (
        <DataTable<Flight>
          data={filtered}
          columns={columns}
          pageSize={10}
          pageSizeOptions={[10, 25, 50, 100]}
          onRowClick={openDrawer}
          emptyMessage="No flights match your criteria"
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFlight ? 'Edit Flight' : 'Schedule New Flight'}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Flight Number</Label>
                <Input value={formData.flightNumber} onChange={e => handleFormChange('flightNumber', e.target.value)} placeholder="e.g. CX-101" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Airline</Label>
                <Input value={formData.airline} onChange={e => handleFormChange('airline', e.target.value)} placeholder="e.g. Cathay Pacific" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</Label>
                <Select value={formData.type} onValueChange={v => handleFormChange('type', v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arrival">Arrival</SelectItem>
                    <SelectItem value="Departure">Departure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gate</Label>
                <Input value={formData.gate} onChange={e => handleFormChange('gate', e.target.value)} placeholder="e.g. A12" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Origin</Label>
                <Input value={formData.origin} onChange={e => handleFormChange('origin', e.target.value)} placeholder="e.g. Hong Kong" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Origin Code</Label>
                <Input value={formData.originCode} onChange={e => handleFormChange('originCode', e.target.value)} placeholder="e.g. HKG" maxLength={3} className="uppercase" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destination</Label>
                <Input value={formData.destination} onChange={e => handleFormChange('destination', e.target.value)} placeholder="e.g. Singapore" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destination Code</Label>
                <Input value={formData.destinationCode} onChange={e => handleFormChange('destinationCode', e.target.value)} placeholder="e.g. SIN" maxLength={3} className="uppercase" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scheduled</Label>
                <Input type="datetime-local" value={formData.scheduled} onChange={e => handleFormChange('scheduled', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estimated</Label>
                <Input type="datetime-local" value={formData.estimated} onChange={e => handleFormChange('estimated', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Carrier</Label>
                <Input value={formData.carrier} onChange={e => handleFormChange('carrier', e.target.value)} placeholder="e.g. CX" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aircraft</Label>
                <Input value={formData.aircraft} onChange={e => handleFormChange('aircraft', e.target.value)} placeholder="e.g. B777-300ER" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cargo Weight (kg)</Label>
                <Input type="number" value={formData.cargoWeight} onChange={e => handleFormChange('cargoWeight', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cargo Volume (CBM)</Label>
                <Input type="number" value={formData.cargoVolume} onChange={e => handleFormChange('cargoVolume', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AWB Count</Label>
                <Input type="number" value={formData.awbCount} onChange={e => handleFormChange('awbCount', Number(e.target.value))} />
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
                {saving ? 'Saving...' : editingFlight ? 'Update Flight' : 'Create Flight'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Drawer direction="right" open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader className="border-b border-border/60">
            <DrawerTitle className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-primary" />
              {selectedFlight?.flightNumber || 'Flight Details'}
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {selectedFlight && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedFlight.airline}</p>
                    <p className="text-xs text-muted-foreground">{selectedFlight.aircraft} · {selectedFlight.carrier}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold border', typeColors[selectedFlight.type])}>
                      {selectedFlight.type === 'Arrival' ? '← Arrival' : 'Departure →'}
                    </span>
                    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border', flightStatusColors[selectedFlight.status])}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', flightStatusDot[selectedFlight.status] || 'bg-muted-foreground')} />
                      {selectedFlight.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center py-3">
                  <RouteView
                    origin={selectedFlight.origin}
                    originCode={selectedFlight.originCode}
                    destination={selectedFlight.destination}
                    destinationCode={selectedFlight.destinationCode}
                    type={selectedFlight.type}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 bg-muted/20 rounded-lg p-4 border border-border/40">
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Scheduled</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{formatTime(selectedFlight.scheduled)}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Estimated</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{formatTime(selectedFlight.estimated)}</p>
                  </div>
                  {selectedFlight.actual && (
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Actual</p>
                      <p className="text-sm font-medium text-foreground mt-0.5">{formatTime(selectedFlight.actual)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Gate</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedFlight.gate || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Carrier</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedFlight.carrier}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Aircraft</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedFlight.aircraft}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Cargo Weight</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{formatWeight(selectedFlight.cargoWeight)}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">Cargo Volume</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedFlight.cargoVolume} CBM</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider">AWB Count</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{selectedFlight.awbCount}</p>
                  </div>
                </div>

                {selectedFlight.notes && (
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-foreground bg-muted/20 rounded-lg p-3 border border-border/40">{selectedFlight.notes}</p>
                  </div>
                )}

                <div>
                  <p className="text-[0.65rem] font-semibold uppercase text-muted-foreground tracking-wider mb-2">Status Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {(statusFlow[selectedFlight.status] || []).map(target => (
                      <Button
                        key={target}
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        onClick={() => handleStatusUpdate(selectedFlight, target)}
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        {target}
                      </Button>
                    ))}
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
            <AlertDialogTitle>Delete Flight</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete flight <strong>{deletingFlight?.flightNumber}</strong> ({deletingFlight?.airline})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingFlight(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import {
  Dialog, DialogBody, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, Download, Search, X,
  Package, SlidersHorizontal,
} from 'lucide-react';
import { getShipments, createShipment } from '@/services/shipmentService';
import { type Shipment, type ShipmentStatus } from '@/data/mockData';
import { formatDate, formatCurrency, generateTrackingId } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const statusOptions: ShipmentStatus[] = [
  'Pending', 'Picked Up', 'In Transit',
  'Out for Delivery', 'Delivered', 'Cancelled', 'Failed',
];

const serviceTypeBadge = (type: string) => {
  const map: Record<string, string> = {
    Express: 'bg-primary/10 text-primary border border-primary/20',
    Freight: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Standard: 'bg-muted/60 text-muted-foreground border border-border/50',
  };
  return map[type] || map.Standard;
};

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('shipments', 'create');

  useEffect(() => { loadShipments(); }, [statusFilter]);

  const loadShipments = async () => {
    setLoading(true);
    try {
      const filters = statusFilter !== 'all'
        ? { status: statusFilter as ShipmentStatus } : undefined;
      setShipments(await getShipments(filters));
    } catch {
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const filteredShipments = searchQuery
    ? shipments.filter(s =>
      s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.receiverName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : shipments;

  const columns: Column<Shipment>[] = [
    {
      key: 'trackingNumber',
      header: 'Tracking Number',
      sortable: true,
      render: (item) => (
        <span className="font-bold text-primary font-display text-[0.84rem]">
          {item.trackingNumber}
        </span>
      ),
    },
    {
      key: 'senderName',
      header: 'Sender',
      sortable: true,
      render: (item) => (
        <span className="text-[0.84rem] font-medium text-foreground">{item.senderName}</span>
      ),
    },
    {
      key: 'receiverName',
      header: 'Receiver',
      sortable: true,
      render: (item) => (
        <span className="text-[0.84rem] font-medium text-foreground">{item.receiverName}</span>
      ),
    },
    {
      key: 'deliveryAddress',
      header: 'Destination',
      render: (item) => (
        <span className="text-[0.78rem] text-muted-foreground truncate max-w-[180px] block">
          {item.deliveryAddress}
        </span>
      ),
    },
    {
      key: 'serviceType',
      header: 'Service',
      render: (item) => (
        <span className={`
          text-[0.72rem] font-bold px-2.5 py-1 rounded-full
          ${serviceTypeBadge(item.serviceType)}
        `}>
          {item.serviceType}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (item) => (
        <span className="text-[0.78rem] text-muted-foreground">
          {formatDate(item.createdAt)}
        </span>
      ),
    },
  ];

  const handleExportCSV = () => {
    const headers = ['Tracking Number', 'Sender', 'Receiver', 'Status', 'Service Type', 'Created At'];
    const rows = filteredShipments.map(s => [
      s.trackingNumber, s.senderName, s.receiverName,
      s.status, s.serviceType, formatDate(s.createdAt),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Shipments exported successfully');
  };

  return (
    <PageWrapper
      title="Shipments"
      description="Manage and track all shipments"
      actions={
        <div className="flex items-center gap-2">
          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="
              flex items-center gap-2 px-3.5 py-2
              bg-muted/40 border border-border/60
              rounded-[10px] cursor-pointer
              text-[0.82rem] font-semibold text-muted-foreground
              transition-all duration-200
              hover:bg-primary/8 hover:border-primary/30 hover:text-foreground
              hover:-translate-y-px
            "
          >
            <Download size={14} />
            Export CSV
          </button>

          {/* New Shipment */}
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="
                flex items-center gap-2 px-3.5 py-2
                rounded-[10px] cursor-pointer
                text-[0.82rem] font-bold text-white font-display
                transition-all duration-200
                hover:-translate-y-px
                hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]
              "
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              <Plus size={14} />
              New Shipment
            </button>
          )}
        </div>
      }
    >
      {/* ── Filter Bar ── */}
      <div className="
        bg-card border border-border/60
        rounded-xl p-4 mb-6 shadow-soft
      ">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="
              absolute left-3 top-1/2 -translate-y-1/2
              w-4 h-4 text-muted-foreground pointer-events-none
            " />
            <input
              type="text"
              placeholder="Search by tracking number, sender or receiver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                nb-search w-full h-9 pl-9 pr-3
                bg-muted/40 border border-border
                rounded-[9px] text-[0.84rem] text-foreground
                outline-none placeholder:text-muted-foreground
                focus:border-primary/50 focus:bg-primary/5
                focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]
              "
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[0.78rem] text-muted-foreground">
              <SlidersHorizontal size={13} />
              <span className="font-medium hidden sm:block">Filter:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="
                w-[170px] h-9 text-[0.82rem]
                bg-muted/40 border-border/60 rounded-[9px]
                focus:border-primary/50 focus:ring-0
              ">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="nb-dropdown">
                <SelectItem value="all" className="text-[0.82rem]">All Statuses</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status} className="text-[0.82rem]">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="
                  w-8 h-8 flex items-center justify-center
                  bg-destructive/10 border border-destructive/20
                  rounded-[8px] text-destructive
                  hover:bg-destructive/20 transition-colors duration-150
                "
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Active filter pill */}
        {(searchQuery || statusFilter !== 'all') && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
            <span className="text-[0.72rem] text-muted-foreground font-medium uppercase tracking-wide">
              Active filters:
            </span>
            {statusFilter !== 'all' && (
              <span className="
                inline-flex items-center gap-1.5 px-2.5 py-0.5
                bg-primary/10 border border-primary/20
                rounded-full text-[0.72rem] font-semibold text-primary
              ">
                {statusFilter}
                <button onClick={() => setStatusFilter('all')}>
                  <X size={10} />
                </button>
              </span>
            )}
            <span className="text-[0.72rem] text-muted-foreground ml-auto">
              {filteredShipments.length} result{filteredShipments.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <SkeletonLoader variant="table" count={10} />
      ) : (
        <DataTable
          data={filteredShipments}
          columns={columns}
          onRowClick={(s) => router.push(`/shipments/${s.id}`)}
          emptyMessage="No shipments found"
        />
      )}

      <CreateShipmentModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => { setShowCreateModal(false); loadShipments(); }}
      />
    </PageWrapper>
  );
}

/* ─────────────────────────────────────────────
   Create Shipment Modal
───────────────────────────────────────────── */
interface ShipmentFormData {
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageWeight: string;
  packageDimensions: string;
  packageType: string;
  serviceType: 'Express' | 'Standard' | 'Freight';
  notes: string;
}

interface CreateShipmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateShipmentModal({ open, onClose, onSuccess }: CreateShipmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ShipmentFormData>({
    senderName: '', senderPhone: '', senderEmail: '',
    receiverName: '', receiverPhone: '', receiverEmail: '',
    pickupAddress: '', deliveryAddress: '',
    packageWeight: '', packageDimensions: '',
    packageType: 'Box',
    serviceType: 'Standard',
    notes: '',
  });

  const update = <K extends keyof ShipmentFormData>(key: K, val: ShipmentFormData[K]) =>
    setFormData(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createShipment({
        ...formData,
        packageWeight: parseFloat(formData.packageWeight) || 0,
        trackingNumber: generateTrackingId(),
      });
      toast.success('Shipment created successfully');
      onSuccess();
    } catch {
      toast.error('Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `
    w-full h-10 px-3
    bg-muted/40 border border-border
    rounded-[9px] text-[0.84rem] text-foreground
    outline-none placeholder:text-muted-foreground
    transition-all duration-200
    focus:border-primary/60 focus:bg-primary/5
    focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.12)]
  `;

  const FieldLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
    <label
      htmlFor={htmlFor}
      className="block text-[0.72rem] font-semibold uppercase tracking-[0.7px] text-muted-foreground mb-1.5"
    >
      {children}
    </label>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-5 h-5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Package size={11} className="text-primary" />
      </div>
      <span className="text-[0.88rem] font-bold font-display text-foreground">{title}</span>
      <div className="flex-1 h-px bg-border/60 ml-1" />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* ✅ Remove nb-dropdown here — let dialog.tsx handle styling */}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* ✅ DialogHeader — gets px-6 pt-6 pb-5 + border-b from dialog.tsx */}
        <DialogHeader>
          <DialogTitle>Create New Shipment</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new shipment order
          </DialogDescription>
        </DialogHeader>

        {/* ✅ DialogBody — gets px-6 py-5 padding from dialog.tsx */}
        <DialogBody>
          <form id="create-shipment-form" onSubmit={handleSubmit} className="space-y-7">

            {/* Sender */}
            <div>
              <SectionHeader title="Sender Information" />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <FieldLabel htmlFor="senderName">Name *</FieldLabel>
                  <input id="senderName" className={inputCls}
                    value={formData.senderName}
                    onChange={e => update('senderName', e.target.value)} required />
                </div>
                <div>
                  <FieldLabel htmlFor="senderPhone">Phone *</FieldLabel>
                  <input id="senderPhone" className={inputCls}
                    value={formData.senderPhone}
                    onChange={e => update('senderPhone', e.target.value)} required />
                </div>
              </div>
              <div>
                <FieldLabel htmlFor="pickupAddress">Pickup Address *</FieldLabel>
                <textarea
                  id="pickupAddress" rows={2}
                  className={`${inputCls} h-auto py-2.5 resize-none`}
                  value={formData.pickupAddress}
                  onChange={e => update('pickupAddress', e.target.value)} required
                />
              </div>
            </div>

            {/* Receiver */}
            <div>
              <SectionHeader title="Receiver Information" />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <FieldLabel htmlFor="receiverName">Name *</FieldLabel>
                  <input id="receiverName" className={inputCls}
                    value={formData.receiverName}
                    onChange={e => update('receiverName', e.target.value)} required />
                </div>
                <div>
                  <FieldLabel htmlFor="receiverPhone">Phone *</FieldLabel>
                  <input id="receiverPhone" className={inputCls}
                    value={formData.receiverPhone}
                    onChange={e => update('receiverPhone', e.target.value)} required />
                </div>
              </div>
              <div>
                <FieldLabel htmlFor="deliveryAddress">Delivery Address *</FieldLabel>
                <textarea
                  id="deliveryAddress" rows={2}
                  className={`${inputCls} h-auto py-2.5 resize-none`}
                  value={formData.deliveryAddress}
                  onChange={e => update('deliveryAddress', e.target.value)} required
                />
              </div>
            </div>

            {/* Package */}
            <div>
              <SectionHeader title="Package Details" />
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <FieldLabel htmlFor="packageWeight">Weight (kg) *</FieldLabel>
                  <input id="packageWeight" type="number" className={inputCls}
                    value={formData.packageWeight}
                    onChange={e => update('packageWeight', e.target.value)} required />
                </div>
                <div>
                  <FieldLabel htmlFor="packageDimensions">Dimensions (LxWxH)</FieldLabel>
                  <input id="packageDimensions" placeholder="30x20x15" className={inputCls}
                    value={formData.packageDimensions}
                    onChange={e => update('packageDimensions', e.target.value)} />
                </div>
                <div>
                  <FieldLabel htmlFor="serviceType">Service Type</FieldLabel>
                  <Select
                    value={formData.serviceType}
                    onValueChange={v => update('serviceType', v as ShipmentFormData['serviceType'])}
                  >
                    {/* ✅ h-10 matches input height exactly */}
                    <SelectTrigger className="
                      h-10 text-[0.82rem]
                      bg-muted/40 border-border rounded-[9px]
                      focus:ring-0 focus:border-primary/60
                      focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.12)]
                    ">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="nb-dropdown">
                      {['Express', 'Standard', 'Freight'].map(v => (
                        <SelectItem key={v} value={v} className="text-[0.82rem]">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <FieldLabel htmlFor="notes">Notes (Optional)</FieldLabel>
                <textarea
                  id="notes" rows={2}
                  placeholder="Any special handling instructions..."
                  className={`${inputCls} h-auto py-2.5 resize-none`}
                  value={formData.notes}
                  onChange={e => update('notes', e.target.value)}
                />
              </div>
            </div>

          </form>
        </DialogBody>

        {/* ✅ DialogFooter — gets px-6 py-4 + border-t from dialog.tsx */}
        {/* form="..." attribute submits the form outside the <form> tag */}
        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="
              px-4 py-2 rounded-[9px] text-[0.82rem] font-semibold
              bg-muted/40 border border-border text-muted-foreground
              hover:text-foreground hover:bg-muted/70
              transition-all duration-200
            "
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-shipment-form"
            disabled={loading}
            className="
              px-5 py-2 rounded-[9px] text-[0.82rem] font-bold text-white font-display
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              hover:-translate-y-px
              hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]
            "
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : 'Create Shipment'}
          </button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
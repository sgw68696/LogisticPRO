"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
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
import {
  ArrowLeft, Package, MapPin, User, Phone,
  Mail, Truck, Calendar, Weight, Ruler,
  Edit, CheckCircle, Clock,
} from 'lucide-react';
import { getShipmentById, updateShipmentStatus } from '@/services/shipmentService';
import { type Shipment, type ShipmentStatus } from '@/data/mockData';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const statusOptions: ShipmentStatus[] = [
  'Pending', 'Picked Up', 'In Transit',
  'Out for Delivery', 'Delivered', 'Cancelled', 'Failed',
];

interface ShipmentDetailClientProps {
  id: string;
}

// Reusable info row
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label?: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5 text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        {label && <p className="text-[0.7rem] font-semibold uppercase tracking-[0.6px] text-muted-foreground mb-0.5">{label}</p>}
        <p className="text-[0.84rem] text-foreground">{value}</p>
      </div>
    </div>
  );
}

// Reusable section card
function SectionCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`
      bg-card border border-border/60 rounded-xl overflow-hidden shadow-soft
      transition-all duration-300 hover:border-primary/20
      ${className}
    `}>
      <div className="px-5 py-3.5 border-b border-border/40">
        <h3 className="text-[0.88rem] font-bold font-display text-foreground tracking-tight">
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function ShipmentDetailClient({ id }: ShipmentDetailClientProps) {
  const router = useRouter();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('shipments', 'edit');

  useEffect(() => { loadShipment(); }, [id]);

  const loadShipment = async () => {
    setLoading(true);
    try {
      setShipment(await getShipmentById(id));
    } catch {
      toast.error('Failed to load shipment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageWrapper title="Shipment Details"><SkeletonLoader variant="card" count={3} /></PageWrapper>;

  if (!shipment) return (
    <PageWrapper title="Not Found">
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center">
          <Package className="w-8 h-8 text-muted-foreground opacity-40" />
        </div>
        <p className="text-[0.88rem] text-muted-foreground">Shipment not found</p>
        <button
          onClick={() => router.push('/shipments')}
          className="
            flex items-center gap-2 px-4 py-2 rounded-[10px]
            text-[0.82rem] font-semibold text-white font-display
            transition-all duration-200 hover:-translate-y-px
          "
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <ArrowLeft size={14} /> Back to Shipments
        </button>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper
      title={shipment.trackingNumber}
      description="Shipment details and tracking history"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/shipments')}
            className="
              flex items-center gap-2 px-3.5 py-2
              bg-muted/40 border border-border/60
              rounded-[10px] text-[0.82rem] font-semibold text-muted-foreground
              hover:text-foreground hover:bg-muted/60
              transition-all duration-200 hover:-translate-y-px
            "
          >
            <ArrowLeft size={14} /> Back
          </button>
          {canEdit && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="
                flex items-center gap-2 px-3.5 py-2 rounded-[10px]
                text-[0.82rem] font-bold text-white font-display
                transition-all duration-200 hover:-translate-y-px
                hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]
              "
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
            >
              <Edit size={14} /> Update Status
            </button>
          )}
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Left: Main Info ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Hero Status Card */}
          <div className="
            bg-card border border-border/60 rounded-xl p-5 shadow-soft
            relative overflow-hidden
            before:absolute before:inset-x-0 before:top-0 before:h-px
            before:bg-gradient-to-r before:from-transparent before:via-primary/40 before:to-transparent
          ">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_oklch(var(--primary)/0.2)]"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                >
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-[1.1rem] font-extrabold font-display text-foreground tracking-tight">
                    {shipment.trackingNumber}
                  </h2>
                  <p className="text-[0.78rem] text-muted-foreground mt-0.5">
                    {shipment.serviceType} Delivery
                  </p>
                </div>
              </div>
              <StatusBadge status={shipment.status} />
            </div>
          </div>

          {/* Sender + Receiver Grid */}
          <div className="grid md:grid-cols-2 gap-5">
            <SectionCard title="Sender">
              <InfoRow icon={<User size={13} />} label="Name" value={shipment.senderName} />
              <InfoRow icon={<Phone size={13} />} label="Phone" value={shipment.senderPhone} />
              <InfoRow icon={<Mail size={13} />} label="Email" value={shipment.senderEmail} />
              <InfoRow icon={<MapPin size={13} />} label="Pickup Address" value={shipment.pickupAddress} />
            </SectionCard>

            <SectionCard title="Receiver">
              <InfoRow icon={<User size={13} />} label="Name" value={shipment.receiverName} />
              <InfoRow icon={<Phone size={13} />} label="Phone" value={shipment.receiverPhone} />
              <InfoRow icon={<Mail size={13} />} label="Email" value={shipment.receiverEmail} />
              <InfoRow icon={<MapPin size={13} />} label="Delivery Address" value={shipment.deliveryAddress} />
            </SectionCard>
          </div>

          {/* Package Details */}
          <SectionCard title="Package Details">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Weight size={14} />, label: 'Weight', value: `${shipment.packageWeight} kg`, color: 'bg-sky-500/10 text-sky-400' },
                { icon: <Ruler size={14} />, label: 'Dimensions', value: shipment.packageDimensions, color: 'bg-indigo-500/10 text-indigo-400' },
                { icon: <Package size={14} />, label: 'Type', value: shipment.packageType, color: 'bg-teal-500/10 text-teal-400' },
                { icon: <Truck size={14} />, label: 'Service', value: shipment.serviceType, color: 'bg-amber-500/10 text-amber-400' },
              ].map(({ icon, label, value, color }) => (
                <div key={label} className="
                  bg-muted/30 border border-border/40
                  rounded-xl p-3.5 text-center
                  hover:border-primary/20 transition-colors duration-200
                ">
                  <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mx-auto mb-2`}>
                    {icon}
                  </div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.6px] text-muted-foreground mb-1">
                    {label}
                  </p>
                  <p className="text-[0.84rem] font-bold text-foreground">{value}</p>
                </div>
              ))}
            </div>
            {shipment.notes && (
              <div className="
                mt-4 p-3.5 bg-muted/30 border border-border/40
                rounded-xl
              ">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.6px] text-muted-foreground mb-1">
                  Notes
                </p>
                <p className="text-[0.84rem] text-foreground">{shipment.notes}</p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Right: Timeline + Dates ── */}
        <div className="space-y-5">

          {/* Timeline */}
          <SectionCard title="Tracking Timeline">
            <div className="space-y-0">
              {shipment.timeline.map((event, index) => {
                const isFirst = index === 0;
                const isLast = index === shipment.timeline.length - 1;
                return (
                  <div key={index} className="flex gap-3">
                    {/* Dot + line */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`
                        w-7 h-7 rounded-full flex items-center justify-center z-10
                        transition-all duration-300
                        ${isFirst
                          ? 'shadow-[0_0_12px_oklch(var(--primary)/0.4)]'
                          : 'bg-muted/60 border border-border/60'
                        }
                      `}
                        style={isFirst
                          ? { background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }
                          : undefined
                        }
                      >
                        <CheckCircle size={13} className={isFirst ? 'text-white' : 'text-muted-foreground'} />
                      </div>
                      {!isLast && (
                        <div className="w-px flex-1 min-h-[24px] bg-gradient-to-b from-primary/30 to-border/30 my-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-5 flex-1 min-w-0">
                      <p className={`text-[0.84rem] font-semibold ${isFirst ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {event.status}
                      </p>
                      {event.location && (
                        <p className="text-[0.75rem] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {event.location}
                        </p>
                      )}
                      <p className="text-[0.7rem] text-muted-foreground/70 mt-0.5">
                        {formatDate(event.timestamp, 'datetime')}
                      </p>
                      {event.notes && (
                        <p className="text-[0.75rem] text-muted-foreground mt-1 bg-muted/30 rounded-lg px-2.5 py-1.5">
                          {event.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Important Dates */}
          <SectionCard title="Important Dates">
            <div className="space-y-0">
              {[
                {
                  icon: <Calendar size={13} />,
                  label: 'Created',
                  value: formatDate(shipment.createdAt, 'datetime'),
                  color: 'bg-muted/60 text-muted-foreground',
                },
                {
                  icon: <Clock size={13} />,
                  label: 'Est. Delivery',
                  value: formatDate(shipment.estimatedDelivery),
                  color: 'bg-amber-500/10 text-amber-400',
                },
                ...(shipment.actualDelivery ? [{
                  icon: <CheckCircle size={13} />,
                  label: 'Delivered',
                  value: formatDate(shipment.actualDelivery, 'datetime'),
                  color: 'bg-green-500/10 text-green-400',
                }] : []),
              ].map(({ icon, label, value, color }) => (
                <div key={label} className="
                  flex items-center justify-between
                  py-2.5 border-b border-border/30 last:border-0
                ">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${color}`}>
                      {icon}
                    </div>
                    <span className="text-[0.78rem] text-muted-foreground">{label}</span>
                  </div>
                  <span className="text-[0.78rem] font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <UpdateStatusModal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        shipment={shipment}
        onSuccess={() => { setShowStatusModal(false); loadShipment(); }}
      />
    </PageWrapper>
  );
}

/* ─────────────────────────────────────────────
   Update Status Modal
───────────────────────────────────────────── */
interface UpdateStatusModalProps {
  open: boolean; onClose: () => void;
  shipment: Shipment; onSuccess: () => void;
}

function UpdateStatusModal({ open, onClose, shipment, onSuccess }: UpdateStatusModalProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(shipment.status);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateShipmentStatus(shipment.id, status, notes);
      toast.success('Status updated successfully');
      onSuccess();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* ✅ Remove nb-dropdown + border-0 — dialog.tsx handles all styling */}
      <DialogContent className="max-w-md">

        {/* ✅ DialogHeader — px-6 pt-6 pb-5 + border-b from dialog.tsx */}
        <DialogHeader>
          <DialogTitle>Update Shipment Status</DialogTitle>
          <DialogDescription>
            Change status for{' '}
            <span className="font-semibold text-primary">{shipment.trackingNumber}</span>
          </DialogDescription>
        </DialogHeader>

        {/* ✅ DialogBody — px-6 py-5 from dialog.tsx, NO form here */}
        <DialogBody>
          <form id="update-status-form" onSubmit={handleSubmit} className="space-y-4">

            {/* Current status row */}
            <div className="flex items-center justify-between px-3 py-2.5 bg-muted/30 border border-border/40 rounded-xl">
              <span className="text-[0.78rem] text-muted-foreground font-medium">
                Current status
              </span>
              <StatusBadge status={shipment.status} />
            </div>

            {/* New Status */}
            <div>
              <label className="block text-[0.72rem] font-semibold uppercase tracking-[0.7px] text-muted-foreground mb-1.5">
                New Status
              </label>
              <Select value={status} onValueChange={v => setStatus(v as ShipmentStatus)}>
                <SelectTrigger className="
                  h-10 text-[0.84rem]
                  bg-muted/40 border-border rounded-[9px]
                  focus:ring-0 focus:border-primary/60
                  focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.12)]
                ">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="nb-dropdown">
                  {statusOptions.map(s => (
                    <SelectItem key={s} value={s} className="text-[0.82rem]">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[0.72rem] font-semibold uppercase tracking-[0.7px] text-muted-foreground mb-1.5">
                Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Add notes about this status update..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="
                  w-full px-3 py-2.5 resize-none
                  bg-muted/40 border border-border
                  rounded-[9px] text-[0.84rem] text-foreground
                  outline-none placeholder:text-muted-foreground
                  transition-all duration-200
                  focus:border-primary/60 focus:bg-primary/5
                  focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.12)]
                "
              />
            </div>

          </form>
        </DialogBody>

        {/* ✅ DialogFooter OUTSIDE form — px-6 py-4 + border-t from dialog.tsx */}
        {/* Uses form="..." to submit without nesting */}
        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="
              px-4 py-2 rounded-[9px]
              text-[0.82rem] font-semibold text-muted-foreground
              bg-muted/40 border border-border
              hover:text-foreground hover:bg-muted/70
              transition-all duration-200
            "
          >
            Cancel
          </button>
          <button
            type="submit"
            form="update-status-form"
            disabled={loading || status === shipment.status}
            className="
              px-5 py-2 rounded-[9px]
              text-[0.82rem] font-bold text-white font-display
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200
              hover:-translate-y-px
              hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]
            "
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </span>
            ) : 'Update Status'}
          </button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
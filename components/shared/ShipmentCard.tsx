import { MapPin, CalendarDays, Package } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '@/lib/shipment-utils/formatting';
import type { ConsolidatedShipment } from '@/types/shipment';
import { getServiceTypeIcon } from '@/config/statusConfig';

interface ShipmentCardProps {
  shipment: ConsolidatedShipment;
  href?: string;
  onView?: () => void;
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  Express: <Package className="w-4 h-4" />,
  Standard: <Package className="w-4 h-4" />,
  Freight: <Package className="w-4 h-4" />,
};

export function ShipmentCard({ shipment, href, onView }: ShipmentCardProps) {
  return (
    <div
      onClick={onView}
      className="rounded-xl border border-border/60 bg-card p-4 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-foreground">{shipment.trackingNumber}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{shipment.customerName}</p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <MapPin className="w-3.5 h-3.5" />
        <span className="truncate">{shipment.route.origin} → {shipment.route.destination}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <CalendarDays className="w-3.5 h-3.5" />
        <span>ETA: {formatDate(shipment.estimatedDelivery)}</span>
        <span className="text-border">|</span>
        <span>{shipment.serviceType}</span>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Package className="w-3.5 h-3.5" />
          <span>{shipment.package.pieces} pcs · {shipment.package.weight} {shipment.package.weightUnit}</span>
        </div>
        {shipment.onTimeStatus && (
          <span className={`text-xs font-medium ${shipment.onTimeStatus === 'On Time' ? 'text-emerald-400' : shipment.onTimeStatus === 'Delayed' ? 'text-red-400' : 'text-amber-400'}`}>
            {shipment.onTimeStatus}
          </span>
        )}
      </div>
    </div>
  );
}

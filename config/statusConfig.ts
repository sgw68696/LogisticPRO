import type { ShipmentStatus, ServiceType } from '@/types/shipment';
import type { PortalTicketStatus } from '@/types/portal';
import type {
  BookingStatus, ContainerStatus, DriverStatus, VehicleStatus,
  InvoiceStatus, OrderStatus,
} from '@/types/enums';

export interface StatusStyle {
  label: string;
  dot: string;
  bg: string;
  text: string;
  border: string;
}

export interface StatusConfig {
  pill: StatusStyle;
  icon?: string;
}

const statusStyles: Record<string, StatusStyle> = {
  draft:         { label: 'Draft',         dot: 'bg-gray-400',      bg: 'bg-gray-500/10', text: 'text-gray-400',      border: 'border-gray-500/20' },
  pending:       { label: 'Pending',       dot: 'bg-yellow-400',    bg: 'bg-yellow-500/10', text: 'text-yellow-400',    border: 'border-yellow-500/20' },
  confirmed:     { label: 'Confirmed',     dot: 'bg-blue-400',      bg: 'bg-blue-500/10',   text: 'text-blue-400',      border: 'border-blue-500/20' },
  processing:    { label: 'Processing',    dot: 'bg-indigo-400',    bg: 'bg-indigo-500/10',  text: 'text-indigo-400',    border: 'border-indigo-500/20' },
  pickedup:      { label: 'Picked Up',     dot: 'bg-cyan-400',      bg: 'bg-cyan-500/10',   text: 'text-cyan-400',      border: 'border-cyan-500/20' },
  intransit:     { label: 'In Transit',    dot: 'bg-sky-400',       bg: 'bg-sky-500/10',    text: 'text-sky-400',       border: 'border-sky-500/20' },
  outfordelivery:{ label: 'Out for Delivery', dot: 'bg-orange-400', bg: 'bg-orange-500/10',  text: 'text-orange-400',   border: 'border-orange-500/20' },
  delivered:     { label: 'Delivered',     dot: 'bg-emerald-400',   bg: 'bg-emerald-500/10', text: 'text-emerald-400',   border: 'border-emerald-500/20' },
  cancelled:     { label: 'Cancelled',     dot: 'bg-red-400',       bg: 'bg-red-500/10',    text: 'text-red-400',       border: 'border-red-500/20' },
  failed:        { label: 'Failed',        dot: 'bg-rose-400',      bg: 'bg-rose-500/10',   text: 'text-rose-400',      border: 'border-rose-500/20' },
  shipped:       { label: 'Shipped',       dot: 'bg-violet-400',    bg: 'bg-violet-500/10',  text: 'text-violet-400',    border: 'border-violet-500/20' },
  returned:      { label: 'Returned',      dot: 'bg-pink-400',      bg: 'bg-pink-500/10',   text: 'text-pink-400',      border: 'border-pink-500/20' },
  open:          { label: 'Open',          dot: 'bg-blue-400',      bg: 'bg-blue-500/10',   text: 'text-blue-400',      border: 'border-blue-500/20' },
  inprogress:    { label: 'In Progress',   dot: 'bg-amber-400',     bg: 'bg-amber-500/10',  text: 'text-amber-400',     border: 'border-amber-500/20' },
  awaitinginfo:  { label: 'Awaiting Info', dot: 'bg-purple-400',    bg: 'bg-purple-500/10',  text: 'text-purple-400',    border: 'border-purple-500/20' },
  resolved:      { label: 'Resolved',      dot: 'bg-emerald-400',   bg: 'bg-emerald-500/10', text: 'text-emerald-400',   border: 'border-emerald-500/20' },
  closed:        { label: 'Closed',        dot: 'bg-gray-400',      bg: 'bg-gray-500/10',   text: 'text-gray-400',      border: 'border-gray-500/20' },
  unpaid:        { label: 'Unpaid',        dot: 'bg-yellow-400',    bg: 'bg-yellow-500/10', text: 'text-yellow-400',    border: 'border-yellow-500/20' },
  paid:          { label: 'Paid',          dot: 'bg-emerald-400',   bg: 'bg-emerald-500/10', text: 'text-emerald-400',   border: 'border-emerald-500/20' },
  overdue:       { label: 'Overdue',       dot: 'bg-red-400',       bg: 'bg-red-500/10',    text: 'text-red-400',       border: 'border-red-500/20' },
  available:     { label: 'Available',     dot: 'bg-emerald-400',   bg: 'bg-emerald-500/10', text: 'text-emerald-400',   border: 'border-emerald-500/20' },
  onroute:       { label: 'On Route',      dot: 'bg-blue-400',      bg: 'bg-blue-500/10',   text: 'text-blue-400',      border: 'border-blue-500/20' },
  maintenance:   { label: 'Maintenance',   dot: 'bg-orange-400',    bg: 'bg-orange-500/10',  text: 'text-orange-400',    border: 'border-orange-500/20' },
  inactive:      { label: 'Inactive',      dot: 'bg-gray-400',      bg: 'bg-gray-500/10',   text: 'text-gray-400',      border: 'border-gray-500/20' },
  onduty:        { label: 'On Duty',       dot: 'bg-green-400',     bg: 'bg-green-500/10',   text: 'text-green-400',     border: 'border-green-500/20' },
  offduty:       { label: 'Off Duty',      dot: 'bg-gray-400',      bg: 'bg-gray-500/10',   text: 'text-gray-400',      border: 'border-gray-500/20' },
  active:        { label: 'Active',        dot: 'bg-emerald-400',   bg: 'bg-emerald-500/10', text: 'text-emerald-400',   border: 'border-emerald-500/20' },
  suspended:     { label: 'Suspended',     dot: 'bg-red-400',       bg: 'bg-red-500/10',    text: 'text-red-400',       border: 'border-red-500/20' },
  loaded:        { label: 'Loaded',        dot: 'bg-blue-400',      bg: 'bg-blue-500/10',   text: 'text-blue-400',      border: 'border-blue-500/20' },
  unloading:     { label: 'Unloading',     dot: 'bg-amber-400',     bg: 'bg-amber-500/10',  text: 'text-amber-400',     border: 'border-amber-500/20' },
  stuffed:       { label: 'Stuffed',       dot: 'bg-cyan-400',      bg: 'bg-cyan-500/10',   text: 'text-cyan-400',      border: 'border-cyan-500/20' },
  empty:         { label: 'Empty',         dot: 'bg-gray-400',      bg: 'bg-gray-500/10',   text: 'text-gray-400',      border: 'border-gray-500/20' },
  onhold:        { label: 'On Hold',       dot: 'bg-purple-400',    bg: 'bg-purple-500/10',  text: 'text-purple-400',    border: 'border-purple-500/20' },
  released:      { label: 'Released',      dot: 'bg-emerald-400',   bg: 'bg-emerald-500/10', text: 'text-emerald-400',   border: 'border-emerald-500/20' },
  damaged:       { label: 'Damaged',       dot: 'bg-red-400',       bg: 'bg-red-500/10',    text: 'text-red-400',       border: 'border-red-500/20' },
};

function toKey(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '');
}

export function getStatusStyle(status: string): StatusStyle {
  const key = toKey(status);
  const found = (statusStyles as Record<string, StatusStyle | undefined>)[key];
  if (found) return found;
  return { label: status, dot: 'bg-gray-400', bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };
}

export const SHIPMENT_STATUS_CONFIG: Record<ShipmentStatus, StatusStyle> = {
  Pending:          statusStyles.pending,
  'Picked Up':      statusStyles.pickedup,
  'In Transit':     statusStyles.intransit,
  'Out for Delivery': statusStyles.outfordelivery,
  Delivered:        statusStyles.delivered,
  Cancelled:        statusStyles.cancelled,
  Failed:           statusStyles.failed,
};

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, StatusStyle> = {
  Draft:            statusStyles.draft,
  Confirmed:        statusStyles.confirmed,
  Processing:       statusStyles.processing,
  Shipped:          statusStyles.shipped,
  Delivered:        statusStyles.delivered,
  Cancelled:        statusStyles.cancelled,
};

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusStyle> = {
  Draft:            statusStyles.draft,
  Confirmed:        statusStyles.confirmed,
  Processing:       statusStyles.processing,
  Shipped:          statusStyles.shipped,
  Delivered:        statusStyles.delivered,
  Returned:         statusStyles.returned,
};

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, StatusStyle> = {
  Unpaid:           statusStyles.unpaid,
  Paid:             statusStyles.paid,
  Overdue:          statusStyles.overdue,
  Cancelled:        statusStyles.cancelled,
};

export const VEHICLE_STATUS_CONFIG: Record<VehicleStatus, StatusStyle> = {
  Available:        statusStyles.available,
  'On Route':       statusStyles.onroute,
  Maintenance:      statusStyles.maintenance,
  Inactive:         statusStyles.inactive,
};

export const DRIVER_STATUS_CONFIG: Record<DriverStatus, StatusStyle> = {
  Active:           statusStyles.active,
  'On Duty':        statusStyles.onduty,
  'Off Duty':       statusStyles.offduty,
  Suspended:        statusStyles.suspended,
};

export const CONTAINER_STATUS_CONFIG: Record<ContainerStatus, StatusStyle> = {
  Loaded:           statusStyles.loaded,
  Unloading:        statusStyles.unloading,
  Stuffed:          statusStyles.stuffed,
  Empty:            statusStyles.empty,
  'On Hold':        statusStyles.onhold,
  Released:         statusStyles.released,
  Damaged:          statusStyles.damaged,
};

export const TICKET_STATUS_CONFIG: Record<PortalTicketStatus, StatusStyle> = {
  Open:             statusStyles.open,
  'In Progress':    statusStyles.inprogress,
  'Awaiting Info':  statusStyles.awaitinginfo,
  Resolved:         statusStyles.resolved,
  Closed:           statusStyles.closed,
};

export function getServiceTypeIcon(serviceType: ServiceType): string {
  const icons: Record<ServiceType, string> = {
    Express: 'Plane',
    Standard: 'Truck',
    Freight: 'Ship',
  };
  return icons[serviceType];
}

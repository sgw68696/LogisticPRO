export type CompanyOperationalType =
  | 'standard'
  | 'custom_agent'
  | 'destination_agent'
  | 'origin_agent'
  | 'transporter'
  | 'trucking_agent';

export type UserRole =
  | 'SuperAdmin'
  | 'OrganizationAdmin'
  | 'CompanyAdmin'
  | 'Manager'
  | 'Dispatcher'
  | 'Operator'
  | 'Agent'
  | 'Staff'
  | 'Driver'
  | 'CustomsAgent'
  | 'PortAgent'
  | 'CustomerPortal'
  | 'AuditorReadOnly';

export type ShipmentStatus =
  | 'Pending'
  | 'Picked Up'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Failed';

export type OrderStatus =
  | 'Draft'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Returned';

export type InvoiceStatus = 'Unpaid' | 'Paid' | 'Overdue' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'Partial' | 'Refunded';

export type GRNStatus =
  | 'Draft'
  | 'Expected'
  | 'Received'
  | 'In Inspection'
  | 'Putaway'
  | 'Completed'
  | 'Cancelled';

export type GDNStatus =
  | 'Draft'
  | 'Picking'
  | 'Packed'
  | 'Loading'
  | 'Dispatched'
  | 'Delivered'
  | 'Cancelled';

export type TransportMode = 'Land' | 'Air' | 'Water';
export type ServiceType = 'Express' | 'Standard' | 'Freight';

export interface BaseEntity {
  id: string;
  companyId: string;
  organizationId?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface TimelineEvent {
  id: string;
  status: string;
  timestamp: string;
  location: string;
  notes?: string;
  updatedBy: string;
  entityType?: string;
  entityId?: string;
}

export interface GlobalNotification {
  id: string;
  companyId: string;
  type:
    | 'shipment_created'
    | 'shipment_updated'
    | 'shipment_delayed'
    | 'shipment_delivered'
    | 'invoice_created'
    | 'invoice_paid'
    | 'invoice_overdue'
    | 'payment_received'
    | 'grn_created'
    | 'gdn_created'
    | 'low_stock'
    | 'critical_stock'
    | 'sla_warning'
    | 'sla_breach'
    | 'system'
    | 'user_created';
  severity: 'Info' | 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  message: string;
  module: string;
  referenceId: string | null;
  referenceType: string | null;
  actionUrl: string | null;
  timestamp: string;
  read: boolean;
  readBy: string[];
  readAt?: string;
  createdByRole: UserRole;
  visibleToRoles: UserRole[];
  metadata?: Record<string, unknown>;
}

export interface AuditLogEntry {
  id: string;
  companyId: string;
  organizationId?: string | null;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'create' | 'update' | 'delete' | 'status_change' | 'view' | 'export' | 'import';
  module: string;
  entityType: string;
  entityId: string;
  entityLabel: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  notes?: string;
  success: boolean;
  errorMessage?: string;
}

export interface ActivityFeedItem {
  id: string;
  companyId: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  userId: string;
  userName: string;
  timestamp: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ListParams {
  companyId?: string;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  status?: string;
}

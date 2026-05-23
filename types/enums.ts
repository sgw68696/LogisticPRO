export type CompanyStatus = 'Active' | 'Pending' | 'Suspended' | 'Inactive';

export type RegistrationStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export type UserRole =
  | 'SuperAdmin' | 'OrganizationAdmin' | 'CompanyAdmin' | 'Manager'
  | 'Dispatcher' | 'Operator' | 'Agent' | 'Staff'
  | 'Driver' | 'CustomsAgent' | 'PortAgent' | 'CustomerPortal' | 'AuditorReadOnly';

export type AgentType = 'warehouse' | 'driver' | 'finance';

export type CompanyOperationalType =
  | 'standard'
  | 'custom_agent'
  | 'destination_agent'
  | 'origin_agent'
  | 'transporter'
  | 'trucking_agent';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

export type OrderStatus = 'Draft' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Returned';

export type PaymentStatus = 'Pending' | 'Paid' | 'Partial' | 'Refunded';

export type VehicleStatus = 'Available' | 'On Route' | 'Maintenance' | 'Inactive';

export type DriverStatus = 'Active' | 'On Duty' | 'Off Duty' | 'Suspended';

export type InvoiceStatus = 'Unpaid' | 'Paid' | 'Overdue' | 'Cancelled';

export type BookingStatus =
  | 'Draft' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type ContainerStatus =
  | 'Loaded' | 'Unloading' | 'Stuffed' | 'Empty'
  | 'On Hold' | 'Released' | 'Damaged';

export type ContainerSize = '20ft' | '20ft HC' | '40ft' | '40ft HC' | '45ft';

export type MilestoneStatus =
  | 'Booking Created' | 'Planning Complete' | 'Container Assigned'
  | 'Customs Cleared' | 'Port Arrived' | 'Loaded on Vessel'
  | 'Departed Port' | 'Arrived at Destination Port'
  | 'Unloaded' | 'Warehouse Received' | 'Out for Delivery'
  | 'Delivered' | 'POD Received' | 'Billing Complete';

export const SHIPMENT_STATUS_FLOW: readonly string[] = [
  'Pending', 'Picked Up', 'In Transit', 'Out for Delivery',
  'Delivered', 'Cancelled', 'Failed',
] as const;

export const BOOKING_STATUS_FLOW: readonly BookingStatus[] = [
  'Draft', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled',
] as const;

export const MILESTONE_FLOW: readonly MilestoneStatus[] = [
  'Booking Created', 'Planning Complete', 'Container Assigned',
  'Customs Cleared', 'Port Arrived', 'Loaded on Vessel',
  'Departed Port', 'Arrived at Destination Port',
  'Unloaded', 'Warehouse Received', 'Out for Delivery',
  'Delivered', 'POD Received', 'Billing Complete',
] as const;

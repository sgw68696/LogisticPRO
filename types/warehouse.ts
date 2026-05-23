import type { ShipmentStatus } from './shipment';

export interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  locationId: string;
  batchNo: string | null;
  expiryDate: string | null;
  lastUpdated: string;
}

export interface Warehouse {
  id: string;
  warehouseId: string;
  name: string;
  location: string;
  city: string;
  capacity: number;
  currentStock: number;
  usedCapacity: number;
  manager: string;
  contact: string;
  inventory: InventoryItem[];
  inboundLogs: { date: string; items: number; source: string; grnId: string }[];
  outboundLogs: { date: string; items: number; destination: string; gdnId: string }[];
  createdAt: string;
  updatedAt: string;
}

export type GRNStatus = 'Draft' | 'Expected' | 'Received' | 'In Inspection' | 'Putaway' | 'Completed' | 'Cancelled';
export type GDNStatus = 'Draft' | 'Picking' | 'Packed' | 'Loading' | 'Dispatched' | 'Delivered' | 'Cancelled';

export interface GoodsReceivedNote {
  id: string;
  companyId: string;
  grnId: string;
  poReference: string;
  vendor: string;
  vendorContact: string;
  warehouseId: string;
  warehouseName: string;
  dock: string;
  receivedDate: string;
  items: GRNItem[];
  totalItems: number;
  totalQuantity: number;
  status: GRNStatus;
  receivedBy: string;
  approvedBy: string | null;
  notes: string;
  timeline: WHActivityEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface GRNItem {
  id: string;
  sku: string;
  productName: string;
  category: string;
  expectedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unit: string;
  batchNo: string;
  expiryDate: string | null;
  locationId: string;
  locationName: string;
  condition: 'Good' | 'Damaged' | 'Partial';
}

export interface GoodsDispatchNote {
  id: string;
  companyId: string;
  gdnId: string;
  orderRef: string;
  customer: string;
  customerContact: string;
  warehouseId: string;
  warehouseName: string;
  dock: string;
  dispatchDate: string;
  items: GDNItem[];
  totalItems: number;
  totalQuantity: number;
  status: GDNStatus;
  pickedBy: string | null;
  packedBy: string | null;
  checkedBy: string | null;
  vehicleNo: string;
  driverName: string;
  driverContact: string;
  notes: string;
  timeline: WHActivityEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface GDNItem {
  id: string;
  sku: string;
  productName: string;
  category: string;
  requestedQuantity: number;
  pickedQuantity: number;
  packedQuantity: number;
  unit: string;
  batchNo: string;
  locationId: string;
  locationName: string;
}

export interface WarehouseLocation {
  id: string;
  companyId: string;
  locationId: string;
  zone: string;
  aisle: string;
  rack: string;
  shelf: string;
  bin: string;
  barcode: string;
  type: 'Pallet' | 'Case' | 'Bulk' | 'Overflow' | 'Hazmat' | 'Reefer';
  capacity: number;
  usedCapacity: number;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
  currentSku: string | null;
  currentProduct: string | null;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export type DamageSeverity = 'Minor' | 'Moderate' | 'Severe' | 'Critical';
export type DamageStatus = 'Reported' | 'Inspected' | 'Approved' | 'Rejected' | 'Disposed' | 'Compensated';

export interface DamageReport {
  id: string;
  companyId: string;
  damageId: string;
  sku: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  locationId: string;
  warehouseId: string;
  warehouseName: string;
  severity: DamageSeverity;
  status: DamageStatus;
  description: string;
  cause: string;
  reportedBy: string;
  reportedDate: string;
  inspectedBy: string | null;
  inspectedDate: string | null;
  approvedBy: string | null;
  approvedDate: string | null;
  images: string[];
  linkedGRN: string | null;
  linkedGDN: string | null;
  disposition: string;
  notes: string;
  timeline: WHActivityEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface WHActivityEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface WarehouseDashboardStats {
  grnsToday: number;
  pendingOutbound: number;
  inventoryValue: number;
  stockAlerts: number;
  damagedGoods: number;
  activeShipments: number;
  spaceUtilization: number;
  delayedDispatches: number;
  inboundToday: number;
  outboundToday: number;
  totalSKUs: number;
  totalLocations: number;
  occupiedLocations: number;
  pendingInspections: number;
  weeklyInbound: number[];
  weeklyOutbound: number[];
  lowStockItems: number;
  pendingGRNs: number;
  pendingGDNs: number;
}

export interface StockMovement {
  id: string;
  companyId: string;
  sku: string;
  productName: string;
  type: 'Inbound' | 'Outbound' | 'Transfer' | 'Adjustment' | 'Damage';
  quantity: number;
  fromLocation: string;
  toLocation: string;
  referenceId: string;
  referenceType: string;
  userId: string;
  userName: string;
  timestamp: string;
  notes: string;
}

export type WHNotifType = 'Stock Alert' | 'Shipment Alert' | 'Delayed Dispatch' | 'Damage Alert' | 'Assignment' | 'GRN Alert' | 'GDN Alert' | 'System';
export type WHNotifSeverity = 'Info' | 'Warning' | 'Critical';

export interface WarehouseNotification {
  id: string;
  companyId: string;
  type: WHNotifType;
  severity: WHNotifSeverity;
  title: string;
  message: string;
  module: string;
  referenceId: string | null;
  timestamp: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: string;
}

import type { BookingStatus } from './enums';

export type ShipmentStatus =
  | 'Pending' | 'Picked Up' | 'In Transit' | 'Out for Delivery'
  | 'Delivered' | 'Cancelled' | 'Failed';

export type ServiceType = 'Express' | 'Standard' | 'Freight';

export type PackageType = 'Box' | 'Envelope' | 'Pallet' | 'Crate' | 'Tube' | 'Other';

export type TransportMode = 'Land' | 'Air' | 'Water';

export interface ShipmentTimelineEvent {
  status: string;
  timestamp: string;
  location: string;
  notes: string;
  updatedBy?: string;
}

export interface ShipmentAddress {
  name: string;
  company?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface ShipmentPackage {
  weight: number;
  weightUnit: 'kg' | 'lbs';
  dimensions: string;
  type: PackageType;
  pieces: number;
  description: string;
  hazmat: boolean;
  hazmatClass?: string;
  value: number;
  currency: string;
}

export interface ShipmentRoute {
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  distance: number;
  distanceUnit: 'km' | 'mi';
  transportMode: TransportMode;
  estimatedTransitDays: number;
}

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  type: string;
  location: string;
  description: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
}

export interface ShipmentDocument {
  id: string;
  shipmentId: string;
  type: 'BOL' | 'Invoice' | 'POD' | 'Packing List' | 'Insurance' | 'Customs' | 'Inspection' | 'Other';
  title: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: 'Available' | 'Pending' | 'Expired';
}

export interface ShipmentCharge {
  id: string;
  shipmentId: string;
  description: string;
  type: 'Freight' | 'Fuel Surcharge' | 'Insurance' | 'Handling' | 'Storage' | 'Customs' | 'Other';
  quantity: number;
  rate: number;
  amount: number;
  currency: string;
}

export interface ConsolidatedShipment {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  serviceType: ServiceType;
  customerId: string;
  customerName: string;
  sender: ShipmentAddress;
  receiver: ShipmentAddress;
  package: ShipmentPackage;
  route: ShipmentRoute;
  assignedDriver: string | null;
  assignedVehicle: string | null;
  estimatedDelivery: string;
  actualDelivery: string | null;
  pickupDate: string | null;
  createdAt: string;
  updatedAt: string;
  notes: string;
  proofOfDelivery: string | null;
  timeline: ShipmentTimelineEvent[];
  trackingEvents: TrackingEvent[];
  documents: ShipmentDocument[];
  charges: ShipmentCharge[];
  customsStatus: 'Cleared' | 'Pending' | 'Hold' | 'Examined' | 'Released' | null;
  warehouseLocation: string | null;
  lastScanLocation: string | null;
  lastScanTime: string | null;
  onTimeStatus: 'On Time' | 'Delayed' | 'Early' | null;
}

export type ShipmentViewRole =
  | 'SuperAdmin' | 'CompanyAdmin' | 'Manager' | 'Dispatcher' | 'Operator'
  | 'Warehouse' | 'Driver' | 'Finance' | 'Support' | 'Customs'
  | 'PortAgent' | 'CustomerPortal' | 'AuditorReadOnly';

export interface ShipmentDashboardStats {
  totalShipments: number;
  activeShipments: number;
  inTransit: number;
  outForDelivery: number;
  deliveredToday: number;
  deliveredThisMonth: number;
  pendingPickups: number;
  failedDeliveries: number;
  cancelledShipments: number;
  delayedShipments: number;
  onTimeRate: number;
  averageDeliveryTime: number;
  totalRevenue: number;
  totalCost: number;
}

export interface LegacyShipment {
  id: string;
  trackingNumber: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageWeight: number;
  packageDimensions: string;
  packageType: string;
  serviceType: ServiceType;
  status: ShipmentStatus;
  assignedDriver: string | null;
  assignedVehicle: string | null;
  estimatedDelivery: string;
  actualDelivery: string | null;
  createdAt: string;
  updatedAt: string;
  notes: string;
  proofOfDelivery: string | null;
  timeline: { status: string; timestamp: string; location: string; notes: string }[];
}

export const BOOKING_TO_SHIPMENT_STATUS: Record<BookingStatus, ShipmentStatus | null> = {
  Draft: 'Pending',
  Confirmed: 'Pending',
  Processing: 'Pending',
  Shipped: 'In Transit',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
};

export const SHIPMENT_TO_BOOKING_STATUS: Record<ShipmentStatus, BookingStatus> = {
  Pending: 'Confirmed',
  'Picked Up': 'Processing',
  'In Transit': 'Shipped',
  'Out for Delivery': 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
  Failed: 'Cancelled',
};

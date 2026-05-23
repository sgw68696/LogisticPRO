import type { ContainerStatus, ContainerSize, InvoiceStatus } from '@/types/enums';
import type { ConsolidatedShipment } from '@/types/shipment';

export interface Vessel {
  id: string;
  companyId: string;
  vesselId: string;
  name: string;
  imo: string;
  flag: string;
  vesselType: 'Container Ship' | 'Bulk Carrier' | 'Tanker' | 'Ro-Ro' | 'General Cargo' | 'Reefer';
  grossTonnage: number;
  deadweight: number;
  length: number;
  beam: number;
  status: VesselStatus;
  voyage: string;
  carrier: string;
  captain: string;
  crewCount: number;
  port: string;
  berth: string | null;
  eta: string;
  etd: string | null;
  ata: string | null;
  atd: string | null;
  cargoCapacity: number;
  cargoLoaded: number;
  cargoUnit: 'TEU' | 'Tons' | 'CBM';
  lastPort: string;
  nextPort: string;
  notes: string;
  timeline: VesselTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export type VesselStatus =
  | 'Arrived' | 'Berthing' | 'Docked' | 'Loading' | 'Unloading'
  | 'Sailing' | 'Expected' | 'Departed' | 'Delayed' | 'Anchored';

export interface VesselTimelineEvent {
  id: string;
  vesselId: string;
  status: string;
  timestamp: string;
  location: string;
  notes: string;
}

export interface Flight {
  id: string;
  companyId: string;
  flightId: string;
  flightNumber: string;
  airline: string;
  type: 'Arrival' | 'Departure';
  status: FlightStatus;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  scheduled: string;
  estimated: string;
  actual: string | null;
  gate: string;
  cargoWeight: number;
  cargoVolume: number;
  awbCount: number;
  aircraft: string;
  aircraftType: string;
  carrier: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type FlightStatus =
  | 'Scheduled' | 'Boarding' | 'Departed' | 'In Flight' | 'Arrived'
  | 'Landed' | 'Delayed' | 'Cancelled' | 'Diverted' | 'On Stand';

export interface Berth {
  id: string;
  companyId: string;
  berthId: string;
  name: string;
  type: 'Container' | 'Bulk' | 'Liquid' | 'General' | 'Passenger' | 'Repair';
  status: BerthStatus;
  depth: number;
  length: number;
  maxDraft: number;
  maxVesselLength: number;
  maxVesselBeam: number;
  craneCapacity: string;
  craneCount: number;
  operator: string;
  currentVessel: string | null;
  currentVesselId: string | null;
  occupancyStart: string | null;
  occupancyEnd: string | null;
  occupancyRate: number;
  equipment: string[];
  services: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type BerthStatus =
  | 'Available' | 'Occupied' | 'Reserved' | 'Maintenance' | 'Out of Service';

export interface PortManifest {
  id: string;
  companyId: string;
  manifestId: string;
  type: 'Import' | 'Export' | 'Transshipment';
  status: ManifestStatus;
  vessel: string;
  vesselId: string;
  voyage: string;
  carrier: string;
  portOfLoading: string;
  portOfDischarge: string;
  containerCount: number;
  totalWeight: number;
  weightUnit: 'kg' | 'tons';
  hazmatCount: number;
  reeferCount: number;
  filedDate: string;
  filedBy: string;
  approvedDate: string | null;
  approvedBy: string | null;
  customsReference: string;
  notes: string;
  containers: string[];
  shipmentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type ManifestStatus =
  | 'Draft' | 'Filed' | 'Approved' | 'Amended' | 'Rejected' | 'Archived';

export interface PortCharge {
  id: string;
  companyId: string;
  chargeId: string;
  invoiceRef: string;
  type: ChargeCategory;
  status: ChargeStatus;
  vessel: string;
  vesselId: string;
  voyage: string;
  description: string;
  payer: string;
  quantity: number;
  rate: number;
  currency: 'USD' | 'EUR' | 'INR' | 'SGD';
  amount: number;
  issuedDate: string;
  dueDate: string;
  paidDate: string | null;
  invoiceLink: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ChargeCategory =
  | 'Berth Hire' | 'Pilotage' | 'Towage' | 'Mooring'
  | 'Cargo Handling' | 'Storage' | 'Demurrage' | 'Customs'
  | 'Documentation' | 'Security' | 'Environmental' | 'Other';

export type ChargeStatus = 'Pending' | 'Collected' | 'Overdue' | 'Disputed' | 'Waived';

export interface CargoOperation {
  id: string;
  companyId: string;
  operationId: string;
  type: CargoOpType;
  status: CargoOpStatus;
  vessel: string;
  vesselId: string;
  berth: string;
  berthId: string;
  manifest: string | null;
  manifestId: string | null;
  containerId: string | null;
  cargoType: string;
  cargoWeight: number;
  cargoVolume: number;
  quantity: number;
  unit: 'TEU' | 'Tons' | 'Units' | 'CBM';
  startTime: string;
  endTime: string | null;
  duration: number | null;
  operator: string;
  supervisor: string;
  equipment: string[];
  notes: string;
  timeline: CargoOpTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export type CargoOpType =
  | 'Offload' | 'Load' | 'Transfer' | 'Inspection'
  | 'Lashing' | 'Unlashing' | 'Shifting' | 'Stuffing';

export type CargoOpStatus =
  | 'Scheduled' | 'In Progress' | 'Completed' | 'Paused' | 'Cancelled' | 'On Hold';

export interface CargoOpTimelineEvent {
  id: string;
  operationId: string;
  status: string;
  timestamp: string;
  notes: string;
}

export interface PortDocument {
  id: string;
  companyId: string;
  documentId: string;
  title: string;
  category: PortDocCategory;
  status: PortDocStatus;
  type: 'PDF' | 'XLSX' | 'DOCX' | 'ZIP' | 'Image';
  referenceNumber: string;
  vessel: string;
  vesselId: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
  pageCount: number;
  issueDate: string;
  expiryDate: string | null;
  version: number;
  confidential: boolean;
  notes: string;
  folder: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type PortDocCategory =
  | 'Arrival Notice' | 'Cargo Manifest' | 'BOL'
  | 'AWB' | 'Port Clearance' | 'Customs Decl'
  | 'Inspection Report' | 'Survey Report'
  | 'Certificate' | 'Correspondence' | 'Other';

export type PortDocStatus =
  | 'Draft' | 'Approved' | 'Pending Review'
  | 'Rejected' | 'Expired' | 'Archived';

export interface PortNotification {
  id: string;
  companyId: string;
  type: PortNotifType;
  severity: PortNotifSeverity;
  title: string;
  message: string;
  module: string;
  referenceId: string | null;
  timestamp: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: string;
}

export type PortNotifType =
  | 'Vessel Arrival' | 'Departure' | 'Delay' | 'Berth Assignment'
  | 'Cargo Exception' | 'Customs Alert' | 'Document Ready'
  | 'Invoice' | 'System' | 'Weather';

export type PortNotifSeverity = 'Info' | 'Warning' | 'Critical' | 'Emergency';

export interface PortDashboardStats {
  vesselsArrivingToday: number;
  flightsArrivingToday: number;
  containersInPort: number;
  cargoPendingOffload: number;
  berthsOccupied: number;
  berthsAvailable: number;
  delayedArrivals: number;
  customsHoldCount: number;
  portRevenueToday: number;
  totalVessels: number;
  totalFlights: number;
  totalBerths: number;
  totalContainers: number;
  cargoVolumeToday: number;
  yardUtilization: number;
  berthOccupancyRate: number;
  equipmentAvailable: number;
  customsClearanceRate: number;
  avgTurnaroundTime: number;
}

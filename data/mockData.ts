// MOCK DATA FOR LOGISTICS MANAGEMENT SYSTEM

// MULTI-TENANCY & ENTERPRISE TYPES
export type CompanyStatus = 'Active' | 'Pending' | 'Suspended' | 'Inactive';
export type RegistrationStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
export type UserRole = 'SuperAdmin' | 'CompanyAdmin' | 'Manager' | 'Dispatcher' | 'Agent' | 'Staff' | 'Operator' | 'Admin';
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

// LOGISTICS OPERATION TYPES
export type ShipmentStatus = 'Pending' | 'Picked Up' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Failed';
export type OrderStatus = 'Draft' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Returned';
export type PaymentStatus = 'Pending' | 'Paid' | 'Partial' | 'Refunded';
export type VehicleStatus = 'Available' | 'On Route' | 'Maintenance' | 'Inactive';
export type DriverStatus = 'Active' | 'On Duty' | 'Off Duty' | 'Suspended';
export type InvoiceStatus = 'Unpaid' | 'Paid' | 'Overdue' | 'Cancelled';

// MULTI-TENANCY INTERFACES
export interface Company {
  id: string;
  name: string;
  registrationType: 'self-service' | 'admin-created';
  registrationStatus: RegistrationStatus;
  status: CompanyStatus;
  email: string;
  phone: string;
  registeredAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  taxId: string;
  businessType: 'Freight' | 'Express' | 'Courier' | 'Logistics' | 'Mixed';
  registrationDate: string;
  approvalDate: string | null;
  approvedBy: string | null; // SuperAdmin user ID
  logo: string | null;
  website: string | null;
  contactPerson: string;
  contactPhone: string;
  maxOrganizations: number;
  maxAgents: number;
  currentOrganizations: number;
  currentAgents: number;
  billingCycle: 'Monthly' | 'Quarterly' | 'Yearly';
  plan: 'Starter' | 'Professional' | 'Enterprise';
  documents: { type: string; url: string; verified: boolean; uploadedAt: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  companyId: string;
  name: string;
  type: 'Regional' | 'Department' | 'Branch' | 'Division';
  status: CompanyStatus;
  parentOrganizationId: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  managerId: string;
  agentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TransportType {
  id: string;
  companyId: string;
  name: 'Land' | 'Air' | 'Water';
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface TransportCategory {
  id: string;
  companyId: string;
  transportTypeId: string;
  name: string;
  description: string;
  specifications: Record<string, string | number | boolean>;
  capacity: number;
  capacityUnit: 'kg' | 'cubic_meters' | 'tons' | 'units';
  maxSpeed: number | null;
  fuelType: string | null;
  createdAt: string;
}

export interface TransportItem {
  id: string;
  companyId: string;
  categoryId: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  specification: Record<string, string | number>;
  price: number;
  createdAt: string;
}

// ============================================
// LAND TRANSPORT MODELS
// ============================================
export interface Vehicle {
  id: string;
  companyId: string;
  organizationId: string | null;
  categoryId: string;
  registrationNumber: string;
  chassisNumber: string;
  engineNumber: string;
  make: string;
  model: string;
  year: number;
  color: string;
  fuelType: 'Petrol' | 'Diesel' | 'CNG' | 'Electric';
  capacity: number;
  capacityUnit: 'kg' | 'liters' | 'cubic_meters';
  status: VehicleStatus;
  owner: string;
  insuranceNumber: string;
  insuranceExpiry: string;
  pollutionCertificate: string;
  pollutionExpiry: string;
  maintenanceSchedule: MaintenanceRecord[];
  fuelLog: FuelRecord[];
  currentDriver: string | null;
  totalDistance: number;
  lastServiceDate: string;
  nextServiceDue: string;
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  date: string;
  type: 'Regular' | 'Repair' | 'Emergency';
  description: string;
  cost: number;
  nextDueDate: string;
  performedBy: string;
}

export interface FuelRecord {
  id: string;
  vehicleId: string;
  date: string;
  quantity: number;
  cost: number;
  odometer: number;
  fuelType: string;
  location: string;
}

// ============================================
// AIR TRANSPORT MODELS
// ============================================
export interface Aircraft {
  id: string;
  companyId: string;
  organizationId: string | null;
  categoryId: string;
  registrationNumber: string;
  manufacturer: string;
  model: string;
  manufactureYear: number;
  serialNumber: string;
  capacity: number;
  capacityUnit: 'kg' | 'cubic_meters';
  maxFlightHours: number;
  currentFlightHours: number;
  maxAltitude: number;
  cruiseSpeed: number;
  range: number;
  fuelCapacity: number;
  status: 'Available' | 'On Route' | 'Maintenance' | 'Grounded';
  airworthinessExpiry: string;
  maintenanceLog: AircraftMaintenance[];
  lastInspection: string;
  nextInspectionDue: string;
  crew: {
    pilotId: string;
    copilotId: string;
    engineerIds: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface AircraftMaintenance {
  id: string;
  aircraftId: string;
  date: string;
  type: 'Routine' | 'Major' | 'Emergency';
  description: string;
  flightHoursBefore: number;
  flightHoursAfter: number;
  cost: number;
  certifiedBy: string;
}

// ============================================
// WATER TRANSPORT MODELS
// ============================================
export interface Ship {
  id: string;
  companyId: string;
  organizationId: string | null;
  categoryId: string;
  vesselName: string;
  imoNumber: string;
  callSign: string;
  flag: string; // Country of registry
  shipBuilder: string;
  yearBuilt: number;
  grossTonnage: number;
  netTonnage: number;
  deadWeightTonnage: number;
  length: number;
  breadth: number;
  depth: number;
  draughtDepth: number;
  containerCapacity: number; // For container ships
  cargoHoldCapacity: number;
  fuelCapacity: number;
  freshWaterCapacity: number;
  speed: number; // knots
  mainEngine: string;
  auxiliaryEngines: number;
  class: string; // Ship classification
  certification: string;
  certificationExpiry: string;
  lastDryDock: string;
  nextDryDockDue: string;
  crewSize: number;
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Docked' | 'Decommissioned';
  currentLocation: {
    latitude: number;
    longitude: number;
    port: string;
  };
  crewList: ShipCrew[];
  maintenanceRecords: ShipMaintenance[];
  certifications: ShipCertification[];
  createdAt: string;
  updatedAt: string;
}

export interface ShipCrew {
  id: string;
  shipId: string;
  crewMemberId: string;
  designation: 'Captain' | 'Chief Officer' | 'Engineer' | 'Cook' | 'Sailor' | 'Other';
  joinDate: string;
  leaveDate: string | null;
}

export interface ShipMaintenance {
  id: string;
  shipId: string;
  date: string;
  type: 'Routine' | 'Repair' | 'Emergency';
  description: string;
  location: string;
  cost: number;
  duration: number; // in days
  doneBy: string; // Shipyard/contractor name
}

export interface ShipCertification {
  id: string;
  shipId: string;
  type: string; // SOLAS, MARPOL, etc.
  issuedDate: string;
  expiryDate: string;
  issuedBy: string;
}

export interface Cargo {
  id: string;
  companyId: string;
  organizationId: string | null;
  cargoNumber: string;
  description: string;
  weight: number;
  weightUnit: 'kg' | 'tons' | 'lbs';
  volume: number;
  volumeUnit: 'cubic_meters' | 'cubic_feet';
  type: 'General' | 'Hazmat' | 'Perishable' | 'Fragile' | 'Temperature Controlled';
  packageCount: number;
  contents: CargoItem[];
  shipper: {
    name: string;
    address: string;
    contact: string;
  };
  consignee: {
    name: string;
    address: string;
    contact: string;
  };
  transportMode: 'Land' | 'Air' | 'Water';
  shipmentRoute: ShipmentLeg[];
  status: 'Pending' | 'Loaded' | 'In Transit' | 'Delivered' | 'Damaged' | 'Lost';
  currentLocation: {
    latitude: number;
    longitude: number;
    lastUpdate: string;
  } | null;
  insuranceAmount: number;
  insuranceProvider: string;
  inspectionRecords: CargoInspection[];
  temperatureLog: TemperatureLog[];
  createdAt: string;
  updatedAt: string;
}

export interface CargoItem {
  id: string;
  cargoId: string;
  description: string;
  quantity: number;
  unit: string;
  weight: number;
  hsCode: string;
  hazmatClass: string | null;
  estimatedValue: number;
}

export interface ShipmentLeg {
  id: string;
  cargoId: string;
  legNumber: number;
  origin: string;
  destination: string;
  transportType: 'Land' | 'Air' | 'Water';
  vehicleId: string | null;
  aircraftId: string | null;
  shipId: string | null;
  driverId: string | null;
  departureDate: string;
  estimatedArrival: string;
  actualArrival: string | null;
  status: 'Scheduled' | 'In Transit' | 'Completed' | 'Delayed' | 'Cancelled';
}

export interface CargoInspection {
  id: string;
  cargoId: string;
  date: string;
  inspectionType: 'Pre-Shipment' | 'During Transit' | 'Post-Delivery';
  inspectedBy: string;
  findings: string;
  damageFound: boolean;
  damageDetails: string | null;
  photos: string[];
  passed: boolean;
}

export interface TemperatureLog {
  id: string;
  cargoId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  location: string;
}

export interface Agent {
  id: string;
  companyId: string;
  organizationId: string | null;
  name: string;
  email: string;
  phone: string;
  username: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  roleAssignments: AgentRole[];
  createdAt: string;
  createdBy: string; // User ID who created this agent
  updatedAt: string;
}

export interface AgentRole {
  id: string;
  agentId: string;
  roleType: UserRole;
  permissions: AgentPermission[];
  assignedAt: string;
  assignedBy: string; // User ID
  scope: 'company' | 'organization' | 'department'; // Scope of the role
  scopeId: string | null; // Company/Organization/Department ID
}

export interface AgentPermission {
  module: string;
  action: PermissionAction;
  allowed: boolean;
  grantedAt: string;
}

export interface Shipment {
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
  serviceType: 'Express' | 'Standard' | 'Freight';
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

export interface Order {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shipmentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  vehicleId: string;
  type: 'Truck' | 'Van' | 'Bike' | 'Tempo';
  licensePlate: string;
  model: string;
  capacity: string;
  status: VehicleStatus;
  assignedDriver: string | null;
  currentLocation: string;
  maintenanceHistory: { date: string; description: string; cost: number }[];
  fuelLogs: { date: string; liters: number; cost: number }[];
}

export interface Driver {
  id: string;
  driverId: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  vehicleAssigned: string | null;
  status: DriverStatus;
  rating: number;
  totalTrips: number;
  joinDate: string;
  documents: { type: string; url: string; verified: boolean }[];
  tripHistory: { shipmentId: string; date: string; from: string; to: string; status: string }[];
}

export interface Warehouse {
  id: string;
  warehouseId: string;
  name: string;
  location: string;
  city: string;
  capacity: number;
  currentStock: number;
  manager: string;
  contact: string;
  inventory: InventoryItem[];
  inboundLogs: { date: string; items: number; source: string }[];
  outboundLogs: { date: string; items: number; destination: string }[];
}

export interface InventoryItem {
  sku: string;
  productName: string;
  category: string;
  quantity: number;
  location: string;
  lastUpdated: string;
}

export interface Customer {
  id: string;
  customerId: string;
  name: string;
  type: 'Individual' | 'Business';
  email: string;
  phone: string;
  city: string;
  address: string;
  totalShipments: number;
  outstandingBalance: number;
  createdAt: string;
  slaContract: string | null;
}

export interface Invoice {
  id: string;
  invoiceId: string;
  customerId: string;
  customerName: string;
  shipmentId: string | null;
  orderId: string | null;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidDate: string | null;
  items: { description: string; quantity: number; rate: number; amount: number }[];
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  createdAt: string;
  avatar: string;
  // Multi-tenancy fields
  companyId: string | null; // null for SuperAdmin
  organizationId: string | null; // null for SuperAdmin/CompanyAdmin
  agentId: string | null; // Links to Agent record for non-admin users
}

export interface Notification {
  id: string;
  type: 'shipment_delayed' | 'payment_overdue' | 'maintenance_due' | 'driver_off_duty' | 'new_order' | 'low_stock';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl: string | null;
}

// Helper functions
const generateTrackingNumber = (index: number): string => {
  return `LOG-2025-${String(10000 + index).padStart(5, '0')}`;
};

const randomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
};

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Indore', 'Jaipur'];
const addresses = [
  '123 MG Road, Sector 5',
  '456 Brigade Gateway, Whitefield',
  '789 Cyber City, DLF Phase 3',
  '321 Bandra West, Linking Road',
  '654 Koramangala, 5th Block',
  '987 Hitech City, Madhapur',
  '147 Salt Lake, Sector V',
  '258 SG Highway, Bodakdev',
  '369 Vijay Nagar, AB Road',
  '741 C-Scheme, MI Road'
];

// ============================================
// MOCK COMPANIES (Multi-tenancy)
// ============================================
export const mockCompanies: Company[] = [
  {
    id: 'cmp-001',
    name: 'TechLogistics India',
    registrationType: 'self-service',
    registrationStatus: 'Approved',
    status: 'Active',
    email: 'admin@techlogistics.com',
    phone: '+91 9876543210',
    registeredAddress: '123 Business Park, MG Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    country: 'India',
    taxId: 'TAX123456',
    businessType: 'Logistics',
    registrationDate: '2024-06-15T00:00:00Z',
    approvalDate: '2024-06-20T00:00:00Z',
    approvedBy: 'usr-001',
    logo: null,
    website: 'https://techlogistics.com',
    contactPerson: 'Rajesh Kumar',
    contactPhone: '+91 9876543210',
    maxOrganizations: 5,
    maxAgents: 50,
    currentOrganizations: 2,
    currentAgents: 15,
    billingCycle: 'Monthly',
    plan: 'Professional',
    documents: [
      { type: 'registration', url: '/docs/reg-001.pdf', verified: true, uploadedAt: '2024-06-15T00:00:00Z' },
      { type: 'tax', url: '/docs/tax-001.pdf', verified: true, uploadedAt: '2024-06-15T00:00:00Z' }
    ],
    createdAt: '2024-06-15T00:00:00Z',
    updatedAt: '2024-06-20T00:00:00Z'
  },
  {
    id: 'cmp-002',
    name: 'Global Express Cargo',
    registrationType: 'self-service',
    registrationStatus: 'Submitted',
    status: 'Pending',
    email: 'contact@globalexpress.com',
    phone: '+91 8765432109',
    registeredAddress: '456 Trade Centre, Airport Road',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    country: 'India',
    taxId: 'TAX654321',
    businessType: 'Express',
    registrationDate: '2024-09-10T00:00:00Z',
    approvalDate: null,
    approvedBy: null,
    logo: null,
    website: 'https://globalexpress.com',
    contactPerson: 'Priya Sharma',
    contactPhone: '+91 8765432109',
    maxOrganizations: 3,
    maxAgents: 30,
    currentOrganizations: 0,
    currentAgents: 0,
    billingCycle: 'Quarterly',
    plan: 'Starter',
    documents: [
      { type: 'registration', url: '/docs/reg-002.pdf', verified: true, uploadedAt: '2024-09-10T00:00:00Z' }
    ],
    createdAt: '2024-09-10T00:00:00Z',
    updatedAt: '2024-09-10T00:00:00Z'
  }
];

// ============================================
// MOCK ORGANIZATIONS
// ============================================
export const mockOrganizations: Organization[] = [
  {
    id: 'org-001',
    companyId: 'cmp-001',
    name: 'Bangalore Regional Office',
    type: 'Regional',
    status: 'Active',
    parentOrganizationId: null,
    address: '123 Business Park, MG Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    managerId: 'usr-002',
    agentCount: 8,
    createdAt: '2024-06-20T00:00:00Z',
    updatedAt: '2024-06-20T00:00:00Z'
  },
  {
    id: 'org-002',
    companyId: 'cmp-001',
    name: 'Mumbai Distribution Centre',
    type: 'Branch',
    status: 'Active',
    parentOrganizationId: null,
    address: '789 Logistics Hub, JVLR',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    managerId: 'usr-003',
    agentCount: 7,
    createdAt: '2024-07-01T00:00:00Z',
    updatedAt: '2024-07-01T00:00:00Z'
  }
];

// ============================================
// MOCK AGENTS
// ============================================
export const mockAgents: Agent[] = [
  {
    id: 'agt-001',
    companyId: 'cmp-001',
    organizationId: 'org-001',
    name: 'Priya Sharma',
    email: 'priya.sharma@techlogistics.com',
    phone: '+91 9876543211',
    username: 'priya_ops',
    status: 'Active',
    roleAssignments: [
      {
        id: 'rl-001',
        agentId: 'agt-001',
        roleType: 'Manager',
        permissions: [
          { module: 'shipments', action: 'view', allowed: true, grantedAt: '2024-06-20T00:00:00Z' },
          { module: 'shipments', action: 'create', allowed: true, grantedAt: '2024-06-20T00:00:00Z' },
          { module: 'shipments', action: 'edit', allowed: true, grantedAt: '2024-06-20T00:00:00Z' }
        ],
        assignedAt: '2024-06-20T00:00:00Z',
        assignedBy: 'usr-001',
        scope: 'organization',
        scopeId: 'org-001'
      }
    ],
    createdAt: '2024-06-20T00:00:00Z',
    createdBy: 'usr-001',
    updatedAt: '2024-06-20T00:00:00Z'
  }
];

// ============================================
// MOCK TRANSPORT TYPES & CATEGORIES
// ============================================
export const mockTransportTypes: TransportType[] = [
  { id: 'tt-001', companyId: 'cmp-001', name: 'Land', status: 'Active', createdAt: '2024-06-20T00:00:00Z' },
  { id: 'tt-002', companyId: 'cmp-001', name: 'Air', status: 'Active', createdAt: '2024-06-20T00:00:00Z' },
  { id: 'tt-003', companyId: 'cmp-001', name: 'Water', status: 'Active', createdAt: '2024-06-20T00:00:00Z' }
];

export const mockTransportCategories: TransportCategory[] = [
  {
    id: 'tc-001',
    companyId: 'cmp-001',
    transportTypeId: 'tt-001',
    name: 'Heavy Truck',
    description: 'Large cargo trucks for long-distance freight',
    specifications: { axles: 3, length: '20m', width: '2.5m', height: '3m' },
    capacity: 25000,
    capacityUnit: 'kg',
    maxSpeed: 100,
    fuelType: 'Diesel',
    createdAt: '2024-06-20T00:00:00Z'
  },
  {
    id: 'tc-002',
    companyId: 'cmp-001',
    transportTypeId: 'tt-003',
    name: 'Container Ship',
    description: 'Large container cargo ship for international trade',
    specifications: { containerCapacity: 10000, draughtDraft: '12.5m', length: '280m' },
    capacity: 500000,
    capacityUnit: 'tons',
    maxSpeed: null,
    fuelType: 'Bunker Oil',
    createdAt: '2024-06-20T00:00:00Z'
  }
];

export const mockTransportItems: TransportItem[] = [
  {
    id: 'ti-001',
    companyId: 'cmp-001',
    categoryId: 'tc-001',
    name: 'Tire Set',
    description: 'Set of 10 truck tires for heavy vehicles',
    quantity: 50,
    unit: 'set',
    specification: { brand: 'Bridgestone', type: 'All-terrain', size: '295/80R22.5' },
    price: 15000,
    createdAt: '2024-06-20T00:00:00Z'
  }
];

// ============================================
// MOCK USERS (Updated with multi-tenancy)
// ============================================
export const mockUsers: User[] = [
  {
    id: 'usr-001',
    username: 'superadmin',
    password: 'admin123',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@logisticspro.com',
    phone: '+91 98765 43210',
    role: 'SuperAdmin',
    status: 'Active',
    lastLogin: '2025-01-15T09:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    avatar: 'RK',
    companyId: null,
    organizationId: null,
    agentId: null
  },
  {
    id: 'usr-002',
    username: 'ops_manager',
    password: 'ops123',
    name: 'Priya Sharma',
    email: 'priya.sharma@techlogistics.com',
    phone: '+91 98765 43211',
    role: 'Manager',
    status: 'Active',
    lastLogin: '2025-01-15T08:45:00Z',
    createdAt: '2024-02-15T00:00:00Z',
    avatar: 'PS',
    companyId: 'cmp-001',
    organizationId: 'org-001',
    agentId: 'agt-001'
  },
  {
    id: 'usr-003',
    username: 'dispatch',
    password: 'dispatch123',
    name: 'Amit Patel',
    email: 'amit.patel@techlogistics.com',
    phone: '+91 98765 43212',
    role: 'Dispatcher',
    status: 'Active',
    lastLogin: '2025-01-15T07:00:00Z',
    createdAt: '2024-03-10T00:00:00Z',
    avatar: 'AP',
    companyId: 'cmp-001',
    organizationId: 'org-002',
    agentId: null
  },
  {
    id: 'usr-004',
    username: 'warehouse',
    password: 'warehouse123',
    name: 'Sunita Reddy',
    email: 'sunita.reddy@techlogistics.com',
    phone: '+91 98765 43213',
    role: 'Agent',
    status: 'Active',
    lastLogin: '2025-01-14T18:00:00Z',
    createdAt: '2024-04-05T00:00:00Z',
    avatar: 'SR',
    companyId: 'cmp-001',
    organizationId: 'org-001',
    agentId: null
  },
  {
    id: 'usr-005',
    username: 'driver01',
    password: 'driver123',
    name: 'Mohammed Khan',
    email: 'mohammed.khan@techlogistics.com',
    phone: '+91 98765 43214',
    role: 'Agent',
    status: 'Active',
    lastLogin: '2025-01-15T06:00:00Z',
    createdAt: '2024-05-20T00:00:00Z',
    avatar: 'MK',
    companyId: 'cmp-001',
    organizationId: 'org-001',
    agentId: null
  },
  {
    id: 'usr-006',
    username: 'finance',
    password: 'finance123',
    name: 'Ananya Gupta',
    email: 'ananya.gupta@techlogistics.com',
    phone: '+91 98765 43215',
    role: 'Agent',
    status: 'Active',
    lastLogin: '2025-01-15T10:00:00Z',
    createdAt: '2024-06-12T00:00:00Z',
    avatar: 'AG',
    companyId: 'cmp-001',
    organizationId: 'org-001',
    agentId: null
  },
  {
    id: 'usr-007',
    username: 'support',
    password: 'support123',
    name: 'Vikram Singh',
    email: 'vikram.singh@techlogistics.com',
    phone: '+91 98765 43216',
    role: 'Staff',
    status: 'Active',
    lastLogin: '2025-01-15T09:00:00Z',
    createdAt: '2024-07-08T00:00:00Z',
    avatar: 'VS',
    companyId: 'cmp-001',
    organizationId: 'org-002',
    agentId: null
  },
  {
    id: 'usr-008',
    username: 'company_admin',
    password: 'cust123',
    name: 'Vikram Sharma',
    email: 'admin@techlogistics.com',
    phone: '+91 98765 43217',
    role: 'CompanyAdmin',
    status: 'Active',
    lastLogin: '2025-01-14T14:30:00Z',
    createdAt: '2024-08-01T00:00:00Z',
    avatar: 'VS',
    companyId: 'cmp-001',
    organizationId: null,
    agentId: null
  }
];

// MOCK SHIPMENTS (50+ shipments)
export const mockShipments: Shipment[] = Array.from({ length: 55 }, (_, i) => {
  const statuses: ShipmentStatus[] = ['Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const serviceTypes: ('Express' | 'Standard' | 'Freight')[] = ['Express', 'Standard', 'Freight'];
  const packageTypes = ['Box', 'Envelope', 'Pallet', 'Crate', 'Tube'];
  
  const createdDate = new Date(2025, 0, Math.floor(Math.random() * 15) + 1);
  const estimatedDate = new Date(createdDate.getTime() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000);
  
  return {
    id: `shp-${String(i + 1).padStart(3, '0')}`,
    trackingNumber: generateTrackingNumber(i + 1),
    senderName: ['Tech Solutions Pvt Ltd', 'Global Traders', 'Sunrise Industries', 'Metro Supplies', 'Elite Electronics'][Math.floor(Math.random() * 5)],
    senderPhone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    senderEmail: `sender${i + 1}@company.com`,
    receiverName: ['Sharma & Sons', 'City Mart', 'Fashion Hub', 'Quick Retail', 'Prime Distributors'][Math.floor(Math.random() * 5)],
    receiverPhone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    receiverEmail: `receiver${i + 1}@business.com`,
    pickupAddress: `${addresses[Math.floor(Math.random() * addresses.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}`,
    deliveryAddress: `${addresses[Math.floor(Math.random() * addresses.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}`,
    packageWeight: Math.floor(Math.random() * 50) + 1,
    packageDimensions: `${Math.floor(Math.random() * 50) + 10}x${Math.floor(Math.random() * 50) + 10}x${Math.floor(Math.random() * 30) + 5} cm`,
    packageType: packageTypes[Math.floor(Math.random() * packageTypes.length)],
    serviceType: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
    status,
    assignedDriver: status !== 'Pending' ? `drv-${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}` : null,
    assignedVehicle: status !== 'Pending' ? `veh-${String(Math.floor(Math.random() * 15) + 1).padStart(3, '0')}` : null,
    estimatedDelivery: estimatedDate.toISOString(),
    actualDelivery: status === 'Delivered' ? new Date(estimatedDate.getTime() + (Math.random() * 2 - 1) * 24 * 60 * 60 * 1000).toISOString() : null,
    createdAt: createdDate.toISOString(),
    updatedAt: new Date().toISOString(),
    notes: ['Handle with care', 'Fragile items', 'Customer requested morning delivery', 'Business address - weekdays only', ''][Math.floor(Math.random() * 5)],
    proofOfDelivery: status === 'Delivered' ? '/pod/signature.png' : null,
    timeline: [
      { status: 'Order Created', timestamp: createdDate.toISOString(), location: 'System', notes: 'Shipment order created' },
      ...(status !== 'Pending' ? [{ status: 'Picked Up', timestamp: new Date(createdDate.getTime() + 2 * 60 * 60 * 1000).toISOString(), location: cities[Math.floor(Math.random() * cities.length)], notes: 'Package collected from sender' }] : []),
      ...(status === 'In Transit' || status === 'Out for Delivery' || status === 'Delivered' ? [{ status: 'In Transit', timestamp: new Date(createdDate.getTime() + 12 * 60 * 60 * 1000).toISOString(), location: 'Distribution Hub', notes: 'Package in transit to destination city' }] : []),
      ...(status === 'Out for Delivery' || status === 'Delivered' ? [{ status: 'Out for Delivery', timestamp: new Date(createdDate.getTime() + 20 * 60 * 60 * 1000).toISOString(), location: cities[Math.floor(Math.random() * cities.length)], notes: 'Out for delivery' }] : []),
      ...(status === 'Delivered' ? [{ status: 'Delivered', timestamp: new Date(createdDate.getTime() + 24 * 60 * 60 * 1000).toISOString(), location: 'Destination', notes: 'Package delivered successfully' }] : []),
    ]
  };
});

// MOCK ORDERS (20+ orders)
export const mockOrders: Order[] = Array.from({ length: 25 }, (_, i) => {
  const orderStatuses: OrderStatus[] = ['Draft', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Returned'];
  const paymentStatuses: PaymentStatus[] = ['Pending', 'Paid', 'Partial', 'Refunded'];
  const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
  
  const items = Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => ({
    name: ['Laptop', 'Mobile Phone', 'Tablet', 'Headphones', 'Smart Watch', 'Camera', 'Printer', 'Monitor'][Math.floor(Math.random() * 8)],
    quantity: Math.floor(Math.random() * 5) + 1,
    price: [15000, 25000, 35000, 5000, 12000, 45000, 18000, 22000][Math.floor(Math.random() * 8)]
  }));
  
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  
  return {
    id: `ord-${String(i + 1).padStart(3, '0')}`,
    orderId: `ORD-2025-${String(1000 + i + 1).padStart(5, '0')}`,
    customerId: `cust-${String(Math.floor(Math.random() * 30) + 1).padStart(3, '0')}`,
    customerName: ['Tech Solutions Pvt Ltd', 'Global Traders', 'Sunrise Industries', 'Metro Supplies', 'Elite Electronics', 'Sharma & Sons', 'City Mart'][Math.floor(Math.random() * 7)],
    items,
    totalAmount,
    status,
    paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
    shipmentId: status === 'Shipped' || status === 'Delivered' ? `shp-${String(Math.floor(Math.random() * 55) + 1).padStart(3, '0')}` : null,
    createdAt: randomDate(new Date(2025, 0, 1), new Date(2025, 0, 15)),
    updatedAt: new Date().toISOString()
  };
});

// MOCK VEHICLES (15+ vehicles)
export const mockVehicles: Vehicle[] = [
  {
    id: 'veh-001',
    companyId: 'cmp-001',
    organizationId: 'org-001',
    categoryId: 'tc-001',
    registrationNumber: 'MH 12 AB 1234',
    chassisNumber: 'TATA123456789ABC',
    engineNumber: 'TEM789123456',
    make: 'Tata',
    model: '407',
    year: 2020,
    color: 'White',
    fuelType: 'Diesel',
    capacity: 3000,
    capacityUnit: 'kg',
    status: 'Available',
    owner: 'TechLogistics India',
    insuranceNumber: 'INS123456',
    insuranceExpiry: '2025-12-31',
    pollutionCertificate: 'PC789456',
    pollutionExpiry: '2025-06-30',
    maintenanceSchedule: [
      { id: 'mtn-001', vehicleId: 'veh-001', date: '2024-12-15', type: 'Regular', description: 'Oil change and brake check', cost: 5000, nextDueDate: '2025-03-15', performedBy: 'Workshop A' }
    ],
    fuelLog: [
      { id: 'fl-001', vehicleId: 'veh-001', date: '2025-01-14', quantity: 80, cost: 7200, odometer: 145000, fuelType: 'Diesel', location: 'Mumbai Fuel Station' }
    ],
    currentDriver: 'drv-001',
    totalDistance: 145000,
    lastServiceDate: '2024-12-15',
    nextServiceDue: '2025-03-15',
    purchaseDate: '2020-06-10',
    createdAt: '2020-06-10',
    updatedAt: '2025-01-14'
  },
  {
    id: 'veh-002',
    companyId: 'cmp-001',
    organizationId: 'org-002',
    categoryId: 'tc-001',
    registrationNumber: 'DL 01 CD 5678',
    chassisNumber: 'MAHIND234567890',
    engineNumber: 'MEG456789012',
    make: 'Mahindra',
    model: 'Supro',
    year: 2019,
    color: 'Blue',
    fuelType: 'Diesel',
    capacity: 1000,
    capacityUnit: 'kg',
    status: 'On Route',
    owner: 'TechLogistics India',
    insuranceNumber: 'INS654321',
    insuranceExpiry: '2025-11-15',
    pollutionCertificate: 'PC123789',
    pollutionExpiry: '2025-05-15',
    maintenanceSchedule: [
      { id: 'mtn-002', vehicleId: 'veh-002', date: '2024-11-20', type: 'Repair', description: 'Tire replacement', cost: 12000, nextDueDate: '2025-05-20', performedBy: 'TireFix Center' }
    ],
    fuelLog: [
      { id: 'fl-002', vehicleId: 'veh-002', date: '2025-01-15', quantity: 45, cost: 4050, odometer: 98765, fuelType: 'Diesel', location: 'Delhi Fuel Station' }
    ],
    currentDriver: 'drv-002',
    totalDistance: 98765,
    lastServiceDate: '2024-11-20',
    nextServiceDue: '2025-05-20',
    purchaseDate: '2019-03-22',
    createdAt: '2019-03-22',
    updatedAt: '2025-01-15'
  },
];

// MOCK AIRCRAFT (4 aircraft)
export const mockAircraft: Aircraft[] = [
  {
    id: 'air-001',
    companyId: 'cmp-001',
    organizationId: 'org-001',
    categoryId: 'ac-001',
    registrationNumber: 'VT-ABC',
    manufacturer: 'Boeing',
    model: '737 Freighter',
    manufactureYear: 2015,
    serialNumber: 'BB737F001',
    capacity: 25000,
    capacityUnit: 'kg',
    maxFlightHours: 75000,
    currentFlightHours: 45230,
    maxAltitude: 43000,
    cruiseSpeed: 500,
    range: 5400,
    fuelCapacity: 26730,
    status: 'Available',
    airworthinessExpiry: '2025-12-31',
    maintenanceLog: [
      { id: 'am-001', aircraftId: 'air-001', date: '2024-11-15', type: 'Routine', description: 'Pre-flight inspection', flightHoursBefore: 45200, flightHoursAfter: 45230, cost: 50000, certifiedBy: 'CAA Inspector' }
    ],
    lastInspection: '2024-11-15',
    nextInspectionDue: '2025-05-15',
    crew: { pilotId: 'crew-001', copilotId: 'crew-002', engineerIds: ['crew-003'] },
    createdAt: '2015-06-15',
    updatedAt: '2025-01-14'
  },
  {
    id: 'air-002',
    companyId: 'cmp-001',
    organizationId: 'org-001',
    categoryId: 'ac-001',
    registrationNumber: 'VT-XYZ',
    manufacturer: 'Airbus',
    model: 'A330 Freighter',
    manufactureYear: 2018,
    serialNumber: 'AA330F002',
    capacity: 65000,
    capacityUnit: 'kg',
    maxFlightHours: 90000,
    currentFlightHours: 32500,
    maxAltitude: 43000,
    cruiseSpeed: 475,
    range: 7400,
    fuelCapacity: 139090,
    status: 'Maintenance',
    airworthinessExpiry: '2026-06-30',
    maintenanceLog: [
      { id: 'am-002', aircraftId: 'air-002', date: '2025-01-10', type: 'Major', description: 'Engine overhaul', flightHoursBefore: 32500, flightHoursAfter: 32500, cost: 500000, certifiedBy: 'Airbus Service Center' }
    ],
    lastInspection: '2025-01-10',
    nextInspectionDue: '2025-07-10',
    crew: { pilotId: 'crew-004', copilotId: 'crew-005', engineerIds: ['crew-006', 'crew-007'] },
    createdAt: '2018-09-20',
    updatedAt: '2025-01-10'
  }
];

// MOCK SHIPS (3 ships)
export const mockShips: Ship[] = [
  {
    id: 'ship-001',
    companyId: 'cmp-001',
    organizationId: 'org-001',
    categoryId: 'sc-001',
    vesselName: 'TechCargo Express',
    imoNumber: '9876543',
    callSign: 'TCEX',
    flag: 'India',
    shipBuilder: 'Cochin Shipyard',
    yearBuilt: 2015,
    grossTonnage: 50000,
    netTonnage: 35000,
    deadWeightTonnage: 65000,
    length: 225,
    breadth: 32,
    depth: 18,
    draughtDepth: 10.5,
    containerCapacity: 3500,
    cargoHoldCapacity: 75000,
    fuelCapacity: 3500,
    freshWaterCapacity: 350,
    speed: 22,
    mainEngine: 'MAN B&W 6S70ME-C',
    auxiliaryEngines: 3,
    class: 'Lloyd Register',
    certification: 'SOLAS, MARPOL',
    certificationExpiry: '2026-12-31',
    lastDryDock: '2023-06-15',
    nextDryDockDue: '2026-06-15',
    crewSize: 25,
    status: 'Active',
    currentLocation: { latitude: 19.0760, longitude: 72.8777, port: 'Mumbai Port' },
    crewList: [
      { id: 'crew-s001', shipId: 'ship-001', crewMemberId: 'crew-010', designation: 'Captain', joinDate: '2019-01-15', leaveDate: null },
      { id: 'crew-s002', shipId: 'ship-001', crewMemberId: 'crew-011', designation: 'Chief Officer', joinDate: '2020-06-20', leaveDate: null }
    ],
    maintenanceRecords: [
      { id: 'sm-001', shipId: 'ship-001', date: '2024-12-01', type: 'Routine', description: 'Hull inspection and maintenance', location: 'Mumbai Dry Dock', cost: 250000, duration: 5, doneBy: 'Mumbai Shipyard' }
    ],
    certifications: [
      { id: 'sc-001', shipId: 'ship-001', type: 'SOLAS', issuedDate: '2023-01-15', expiryDate: '2026-12-31', issuedBy: 'Lloyd Register' },
      { id: 'sc-002', shipId: 'ship-001', type: 'MARPOL', issuedDate: '2023-01-15', expiryDate: '2026-12-31', issuedBy: 'Lloyd Register' }
    ],
    createdAt: '2015-06-20',
    updatedAt: '2025-01-14'
  },
  {
    id: 'ship-002',
    companyId: 'cmp-001',
    organizationId: 'org-002',
    categoryId: 'sc-001',
    vesselName: 'IndianOcean Carrier',
    imoNumber: '8765432',
    callSign: 'IOC',
    flag: 'Singapore',
    shipBuilder: 'Hyundai Heavy Industries',
    yearBuilt: 2018,
    grossTonnage: 120000,
    netTonnage: 80000,
    deadWeightTonnage: 155000,
    length: 320,
    breadth: 44,
    depth: 25,
    draughtDepth: 13.5,
    containerCapacity: 10000,
    cargoHoldCapacity: 185000,
    fuelCapacity: 5000,
    freshWaterCapacity: 500,
    speed: 19.5,
    mainEngine: 'MAN B&W 8S90ME-C',
    auxiliaryEngines: 4,
    class: 'ABS',
    certification: 'SOLAS, MARPOL, ISM',
    certificationExpiry: '2027-06-30',
    lastDryDock: '2022-03-10',
    nextDryDockDue: '2025-03-10',
    crewSize: 35,
    status: 'Active',
    currentLocation: { latitude: 12.9716, longitude: 77.5946, port: 'Singapore Port' },
    crewList: [],
    maintenanceRecords: [],
    certifications: [],
    createdAt: '2018-09-15',
    updatedAt: '2025-01-15'
  }
];

// MOCK CARGO (5 cargo shipments)
export const mockCargo: Cargo[] = [
  {
    id: 'cargo-001',
    companyId: 'cmp-001',
    organizationId: 'org-001',
    cargoNumber: 'CARGO-2025-001',
    description: 'Electronics Export - Container',
    weight: 15000,
    weightUnit: 'kg',
    volume: 25,
    volumeUnit: 'cubic_meters',
    type: 'General',
    packageCount: 250,
    contents: [
      { id: 'ci-001', cargoId: 'cargo-001', description: 'Laptop Computers', quantity: 100, unit: 'units', weight: 10000, hsCode: '8471.30', hazmatClass: null, estimatedValue: 3000000 },
      { id: 'ci-002', cargoId: 'cargo-001', description: 'Mobile Devices', quantity: 150, unit: 'units', weight: 5000, hsCode: '8517.62', hazmatClass: null, estimatedValue: 2000000 }
    ],
    shipper: { name: 'Tech Exports Ltd', address: 'Bangalore, India', contact: '+91 9876543210' },
    consignee: { name: 'Global Tech Imports', address: 'Singapore', contact: '+65 98765432' },
    transportMode: 'Water',
    shipmentRoute: [
      { id: 'leg-001', cargoId: 'cargo-001', legNumber: 1, origin: 'Bangalore', destination: 'Mumbai Port', transportType: 'Land', vehicleId: 'veh-001', aircraftId: null, shipId: null, driverId: 'drv-001', departureDate: '2025-01-10', estimatedArrival: '2025-01-12', actualArrival: '2025-01-12', status: 'Completed' },
      { id: 'leg-002', cargoId: 'cargo-001', legNumber: 2, origin: 'Mumbai Port', destination: 'Singapore Port', transportType: 'Water', vehicleId: null, aircraftId: null, shipId: 'ship-001', driverId: null, departureDate: '2025-01-13', estimatedArrival: '2025-01-28', actualArrival: null, status: 'In Transit' }
    ],
    status: 'In Transit',
    currentLocation: { latitude: 4.1748, longitude: 101.6964, lastUpdate: '2025-01-14T10:30:00Z' },
    insuranceAmount: 5000000,
    insuranceProvider: 'Global Insurance Corp',
    inspectionRecords: [
      { id: 'insp-001', cargoId: 'cargo-001', date: '2025-01-10', inspectionType: 'Pre-Shipment', inspectedBy: 'Inspector A', findings: 'All goods in good condition', damageFound: false, damageDetails: null, photos: [], passed: true }
    ],
    temperatureLog: [
      { id: 'tl-001', cargoId: 'cargo-001', timestamp: '2025-01-14T10:00:00Z', temperature: 22, humidity: 45, location: 'Ship Container' }
    ],
    createdAt: '2025-01-10',
    updatedAt: '2025-01-14'
  },
  {
    id: 'cargo-002',
    companyId: 'cmp-001',
    organizationId: 'org-001',
    cargoNumber: 'CARGO-2025-002',
    description: 'Pharmaceutical Shipment - Temperature Controlled',
    weight: 2500,
    weightUnit: 'kg',
    volume: 8,
    volumeUnit: 'cubic_meters',
    type: 'Temperature Controlled',
    packageCount: 50,
    contents: [
      { id: 'ci-003', cargoId: 'cargo-002', description: 'Medicine Boxes', quantity: 50, unit: 'boxes', weight: 2500, hsCode: '3004.90', hazmatClass: null, estimatedValue: 500000 }
    ],
    shipper: { name: 'Pharma Industries Ltd', address: 'Hyderabad, India', contact: '+91 8765432109' },
    consignee: { name: 'Medical Supplies Co', address: 'Dubai', contact: '+971 123456789' },
    transportMode: 'Air',
    shipmentRoute: [
      { id: 'leg-003', cargoId: 'cargo-002', legNumber: 1, origin: 'Hyderabad', destination: 'Bangalore Airport', transportType: 'Land', vehicleId: 'veh-002', aircraftId: null, shipId: null, driverId: 'drv-002', departureDate: '2025-01-12', estimatedArrival: '2025-01-12', actualArrival: '2025-01-12', status: 'Completed' },
      { id: 'leg-004', cargoId: 'cargo-002', legNumber: 2, origin: 'Bangalore Airport', destination: 'Dubai Airport', transportType: 'Air', vehicleId: null, aircraftId: 'air-001', shipId: null, driverId: null, departureDate: '2025-01-13', estimatedArrival: '2025-01-14', actualArrival: null, status: 'In Transit' }
    ],
    status: 'In Transit',
    currentLocation: { latitude: 29.4454, longitude: 65.5031, lastUpdate: '2025-01-14T15:45:00Z' },
    insuranceAmount: 600000,
    insuranceProvider: 'AirCargo Insurance',
    inspectionRecords: [],
    temperatureLog: [
      { id: 'tl-002', cargoId: 'cargo-002', timestamp: '2025-01-14T15:00:00Z', temperature: 2, humidity: 35, location: 'Air Container' }
    ],
    createdAt: '2025-01-12',
    updatedAt: '2025-01-14'
  }
];

// MOCK DRIVERS (20+ drivers)
export const mockDrivers: Driver[] = Array.from({ length: 22 }, (_, i) => {
  const driverStatuses: DriverStatus[] = ['Active', 'On Duty', 'Off Duty', 'Suspended'];
  const names = ['Ramesh Kumar', 'Suresh Yadav', 'Mahesh Sharma', 'Ganesh Patel', 'Dinesh Singh', 'Rakesh Verma', 'Mukesh Gupta', 'Kamlesh Joshi', 'Santosh Mishra', 'Prakash Reddy', 'Rajendra Nair', 'Vijay Pillai', 'Ajay Menon', 'Sanjay Das', 'Ravi Chakraborty', 'Anil Banerjee', 'Sunil Mukherjee', 'Manoj Chatterjee', 'Vinod Bose', 'Ashok Sen', 'Deepak Roy', 'Kiran Majumdar'];
  
  return {
    id: `drv-${String(i + 1).padStart(3, '0')}`,
    driverId: `DRV-${String(i + 1).padStart(3, '0')}`,
    name: names[i],
    phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    email: `${names[i].toLowerCase().replace(' ', '.')}@logisticspro.com`,
    licenseNumber: `DL${Math.floor(Math.random() * 90000000) + 10000000}`,
    vehicleAssigned: i < 15 ? `veh-${String(i + 1).padStart(3, '0')}` : null,
    status: driverStatuses[Math.floor(Math.random() * driverStatuses.length)],
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
    totalTrips: Math.floor(Math.random() * 500) + 50,
    joinDate: randomDate(new Date(2022, 0, 1), new Date(2024, 11, 31)),
    documents: [
      { type: 'Driving License', url: '/documents/license.pdf', verified: true },
      { type: 'Aadhaar Card', url: '/documents/aadhaar.pdf', verified: true },
      { type: 'PAN Card', url: '/documents/pan.pdf', verified: Math.random() > 0.2 }
    ],
    tripHistory: Array.from({ length: 5 }, (_, j) => ({
      shipmentId: `shp-${String(Math.floor(Math.random() * 55) + 1).padStart(3, '0')}`,
      date: randomDate(new Date(2025, 0, 1), new Date(2025, 0, 15)),
      from: cities[Math.floor(Math.random() * cities.length)],
      to: cities[Math.floor(Math.random() * cities.length)],
      status: ['Completed', 'Completed', 'Completed', 'In Progress', 'Cancelled'][Math.floor(Math.random() * 5)]
    }))
  };
});

// MOCK WAREHOUSES (5 warehouses)
export const mockWarehouses: Warehouse[] = [
  {
    id: 'wh-001',
    warehouseId: 'WH-MUM-001',
    name: 'Mumbai Central Hub',
    location: 'Plot 45, MIDC Industrial Area, Andheri East',
    city: 'Mumbai',
    capacity: 50000,
    currentStock: 35000,
    manager: 'Arun Mehta',
    contact: '+91 9876543210',
    inventory: Array.from({ length: 20 }, (_, i) => ({
      sku: `SKU-MUM-${String(i + 1).padStart(4, '0')}`,
      productName: ['Electronics Box', 'Apparel Bundle', 'Food Package', 'Pharmaceutical Kit', 'Auto Parts', 'Home Appliance', 'Books Carton', 'Sports Equipment'][Math.floor(Math.random() * 8)],
      category: ['Electronics', 'Apparel', 'Food', 'Pharma', 'Auto', 'Home', 'Books', 'Sports'][Math.floor(Math.random() * 8)],
      quantity: Math.floor(Math.random() * 500) + 50,
      location: `Rack ${String.fromCharCode(65 + Math.floor(Math.random() * 10))}-${Math.floor(Math.random() * 50) + 1}`,
      lastUpdated: new Date().toISOString()
    })),
    inboundLogs: [{ date: '2025-01-14', items: 500, source: 'Delhi Hub' }, { date: '2025-01-12', items: 300, source: 'Supplier Direct' }],
    outboundLogs: [{ date: '2025-01-15', items: 250, destination: 'Pune Depot' }, { date: '2025-01-14', items: 180, destination: 'Local Delivery' }]
  },
  {
    id: 'wh-002',
    warehouseId: 'WH-DEL-001',
    name: 'Delhi Distribution Center',
    location: 'Sector 63, Noida Industrial Area',
    city: 'Delhi',
    capacity: 75000,
    currentStock: 52000,
    manager: 'Vikram Arora',
    contact: '+91 9876543211',
    inventory: Array.from({ length: 25 }, (_, i) => ({
      sku: `SKU-DEL-${String(i + 1).padStart(4, '0')}`,
      productName: ['Electronics Box', 'Apparel Bundle', 'Food Package', 'Pharmaceutical Kit', 'Auto Parts'][Math.floor(Math.random() * 5)],
      category: ['Electronics', 'Apparel', 'Food', 'Pharma', 'Auto'][Math.floor(Math.random() * 5)],
      quantity: Math.floor(Math.random() * 800) + 100,
      location: `Rack ${String.fromCharCode(65 + Math.floor(Math.random() * 15))}-${Math.floor(Math.random() * 60) + 1}`,
      lastUpdated: new Date().toISOString()
    })),
    inboundLogs: [{ date: '2025-01-15', items: 800, source: 'North Region Suppliers' }],
    outboundLogs: [{ date: '2025-01-15', items: 450, destination: 'Jaipur Hub' }]
  },
  {
    id: 'wh-003',
    warehouseId: 'WH-BLR-001',
    name: 'Bangalore Tech Park Warehouse',
    location: 'Electronic City Phase 2, Hosur Road',
    city: 'Bangalore',
    capacity: 40000,
    currentStock: 28000,
    manager: 'Karthik Iyer',
    contact: '+91 9876543212',
    inventory: Array.from({ length: 18 }, (_, i) => ({
      sku: `SKU-BLR-${String(i + 1).padStart(4, '0')}`,
      productName: ['Server Equipment', 'Laptop Boxes', 'Mobile Devices', 'Networking Gear', 'Software Media'][Math.floor(Math.random() * 5)],
      category: ['IT Hardware', 'Consumer Electronics', 'Networking', 'Software'][Math.floor(Math.random() * 4)],
      quantity: Math.floor(Math.random() * 300) + 50,
      location: `Rack ${String.fromCharCode(65 + Math.floor(Math.random() * 8))}-${Math.floor(Math.random() * 40) + 1}`,
      lastUpdated: new Date().toISOString()
    })),
    inboundLogs: [{ date: '2025-01-13', items: 200, source: 'Chennai Port' }],
    outboundLogs: [{ date: '2025-01-15', items: 150, destination: 'Hyderabad Hub' }]
  },
  {
    id: 'wh-004',
    warehouseId: 'WH-HYD-001',
    name: 'Hyderabad Logistics Hub',
    location: 'Patancheru Industrial Area, Sangareddy District',
    city: 'Hyderabad',
    capacity: 35000,
    currentStock: 21000,
    manager: 'Lakshmi Prasad',
    contact: '+91 9876543213',
    inventory: Array.from({ length: 15 }, (_, i) => ({
      sku: `SKU-HYD-${String(i + 1).padStart(4, '0')}`,
      productName: ['Pharma Products', 'Medical Equipment', 'Lab Supplies', 'Chemical Containers'][Math.floor(Math.random() * 4)],
      category: ['Pharma', 'Medical', 'Lab', 'Chemical'][Math.floor(Math.random() * 4)],
      quantity: Math.floor(Math.random() * 400) + 75,
      location: `Rack ${String.fromCharCode(65 + Math.floor(Math.random() * 7))}-${Math.floor(Math.random() * 35) + 1}`,
      lastUpdated: new Date().toISOString()
    })),
    inboundLogs: [{ date: '2025-01-14', items: 350, source: 'Bangalore Hub' }],
    outboundLogs: [{ date: '2025-01-15', items: 200, destination: 'Chennai Depot' }]
  },
  {
    id: 'wh-005',
    warehouseId: 'WH-IND-001',
    name: 'Indore Regional Center',
    location: 'Pithampur Industrial Area, Dhar District',
    city: 'Indore',
    capacity: 25000,
    currentStock: 18500,
    manager: 'Rohit Saxena',
    contact: '+91 9876543214',
    inventory: Array.from({ length: 12 }, (_, i) => ({
      sku: `SKU-IND-${String(i + 1).padStart(4, '0')}`,
      productName: ['Textile Bales', 'Garment Boxes', 'Fabric Rolls', 'Fashion Accessories'][Math.floor(Math.random() * 4)],
      category: ['Textile', 'Garment', 'Fabric', 'Accessories'][Math.floor(Math.random() * 4)],
      quantity: Math.floor(Math.random() * 600) + 100,
      location: `Rack ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}-${Math.floor(Math.random() * 25) + 1}`,
      lastUpdated: new Date().toISOString()
    })),
    inboundLogs: [{ date: '2025-01-12', items: 400, source: 'Mumbai Hub' }],
    outboundLogs: [{ date: '2025-01-14', items: 250, destination: 'Ahmedabad Depot' }]
  }
];

// MOCK CUSTOMERS (30+ customers)
export const mockCustomers: Customer[] = Array.from({ length: 32 }, (_, i) => {
  const businessNames = ['Tech Solutions Pvt Ltd', 'Global Traders', 'Sunrise Industries', 'Metro Supplies', 'Elite Electronics', 'Fashion Hub', 'Quick Retail', 'Prime Distributors', 'Mega Mart', 'City Stores', 'Urban Goods', 'Royal Enterprises', 'Diamond Traders', 'Golden Exports', 'Silver Imports'];
  const individualNames = ['Rahul Verma', 'Priya Singh', 'Amit Sharma', 'Neha Gupta', 'Vikram Patel', 'Anjali Reddy', 'Karan Malhotra', 'Divya Nair', 'Rohan Joshi', 'Meera Iyer', 'Arjun Das', 'Pooja Mehta', 'Siddharth Roy', 'Kavita Sen', 'Nikhil Bose'];
  const isBusinesss = Math.random() > 0.4;
  
  return {
    id: `cust-${String(i + 1).padStart(3, '0')}`,
    customerId: `CUST-${String(1000 + i + 1).padStart(5, '0')}`,
    name: isBusinesss ? businessNames[i % businessNames.length] : individualNames[i % individualNames.length],
    type: isBusinesss ? 'Business' : 'Individual',
    email: isBusinesss ? `contact@${businessNames[i % businessNames.length].toLowerCase().replace(/ /g, '')}.com` : `${individualNames[i % individualNames.length].toLowerCase().replace(' ', '.')}@email.com`,
    phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    city: cities[Math.floor(Math.random() * cities.length)],
    address: `${addresses[Math.floor(Math.random() * addresses.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}`,
    totalShipments: Math.floor(Math.random() * 100) + 5,
    outstandingBalance: Math.random() > 0.6 ? Math.floor(Math.random() * 50000) + 5000 : 0,
    createdAt: randomDate(new Date(2023, 0, 1), new Date(2024, 11, 31)),
    slaContract: isBusinesss ? `SLA-${String(i + 1).padStart(4, '0')}` : null
  };
});

// MOCK INVOICES (40+ invoices)
export const mockInvoices: Invoice[] = Array.from({ length: 45 }, (_, i) => {
  const invoiceStatuses: InvoiceStatus[] = ['Unpaid', 'Paid', 'Overdue', 'Cancelled'];
  const status = invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)];
  const customer = mockCustomers[Math.floor(Math.random() * mockCustomers.length)];
  
  const items = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => {
    const rate = [500, 1000, 1500, 2000, 2500, 3000][Math.floor(Math.random() * 6)];
    const quantity = Math.floor(Math.random() * 5) + 1;
    return {
      description: ['Express Delivery Charge', 'Standard Shipping Fee', 'Freight Handling', 'Insurance Premium', 'Packaging Service', 'Priority Processing'][Math.floor(Math.random() * 6)],
      quantity,
      rate,
      amount: rate * quantity
    };
  });
  
  const amount = items.reduce((sum, item) => sum + item.amount, 0);
  const createdDate = new Date(2025, 0, Math.floor(Math.random() * 15) + 1);
  const dueDate = new Date(createdDate.getTime() + 15 * 24 * 60 * 60 * 1000);
  
  return {
    id: `inv-${String(i + 1).padStart(3, '0')}`,
    invoiceId: `INV-2025-${String(1000 + i + 1).padStart(5, '0')}`,
    customerId: customer.id,
    customerName: customer.name,
    shipmentId: Math.random() > 0.3 ? `shp-${String(Math.floor(Math.random() * 55) + 1).padStart(3, '0')}` : null,
    orderId: Math.random() > 0.5 ? `ord-${String(Math.floor(Math.random() * 25) + 1).padStart(3, '0')}` : null,
    amount,
    status,
    dueDate: dueDate.toISOString(),
    paidDate: status === 'Paid' ? new Date(dueDate.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString() : null,
    items,
    createdAt: createdDate.toISOString()
  };
});

// MOCK NOTIFICATIONS (10+)
export const mockNotifications: Notification[] = [
  { id: 'notif-001', type: 'shipment_delayed', title: 'Shipment Delayed', message: 'Shipment LOG-2025-10012 is delayed due to weather conditions in Mumbai region.', timestamp: '2025-01-15T10:30:00Z', read: false, actionUrl: '/shipments/shp-012' },
  { id: 'notif-002', type: 'payment_overdue', title: 'Payment Overdue', message: 'Invoice INV-2025-01015 for Tech Solutions Pvt Ltd is 5 days overdue.', timestamp: '2025-01-15T09:15:00Z', read: false, actionUrl: '/finance' },
  { id: 'notif-003', type: 'maintenance_due', title: 'Vehicle Maintenance Due', message: 'Vehicle VEH-004 (TN 07 GH 3456) is due for scheduled maintenance.', timestamp: '2025-01-15T08:00:00Z', read: true, actionUrl: '/fleet/veh-004' },
  { id: 'notif-004', type: 'driver_off_duty', title: 'Driver Off Duty', message: 'Driver Ramesh Kumar has marked himself as off-duty for personal reasons.', timestamp: '2025-01-15T07:45:00Z', read: true, actionUrl: '/drivers/drv-001' },
  { id: 'notif-005', type: 'new_order', title: 'New Order Received', message: 'New order ORD-2025-01025 received from Global Traders worth ₹45,000.', timestamp: '2025-01-15T07:30:00Z', read: false, actionUrl: '/orders/ord-025' },
  { id: 'notif-006', type: 'low_stock', title: 'Low Stock Alert', message: 'Electronics Box inventory at Mumbai Central Hub is below minimum threshold (45 units remaining).', timestamp: '2025-01-15T06:00:00Z', read: false, actionUrl: '/warehouse/wh-001' },
  { id: 'notif-007', type: 'shipment_delayed', title: 'Delivery Failed', message: 'Delivery attempt for LOG-2025-10034 failed - customer not available. Rescheduled for tomorrow.', timestamp: '2025-01-14T18:30:00Z', read: true, actionUrl: '/shipments/shp-034' },
  { id: 'notif-008', type: 'payment_overdue', title: 'Bulk Payment Reminder', message: '3 invoices from Metro Supplies are pending payment. Total outstanding: ₹1,25,000.', timestamp: '2025-01-14T17:00:00Z', read: true, actionUrl: '/finance' },
  { id: 'notif-009', type: 'new_order', title: 'Express Order', message: 'Urgent express order ORD-2025-01024 received requiring same-day dispatch.', timestamp: '2025-01-14T16:30:00Z', read: false, actionUrl: '/orders/ord-024' },
  { id: 'notif-010', type: 'maintenance_due', title: 'Service Reminder', message: 'Vehicle VEH-012 (DL 08 WX 7890) service completed. Ready for deployment.', timestamp: '2025-01-14T15:00:00Z', read: true, actionUrl: '/fleet/veh-012' },
  { id: 'notif-011', type: 'shipment_delayed', title: 'Route Deviation Alert', message: 'Vehicle VEH-005 has deviated from planned route. Current location: Vadodara bypass.', timestamp: '2025-01-14T14:00:00Z', read: false, actionUrl: '/dispatch' },
  { id: 'notif-012', type: 'low_stock', title: 'Critical Stock Level', message: 'Pharmaceutical Kit stock at Hyderabad Hub is critically low (12 units remaining).', timestamp: '2025-01-14T12:00:00Z', read: false, actionUrl: '/warehouse/wh-004' },
];

// ANALYTICS DATA
export const mockAnalytics = {
  // Last 30 days shipment counts
  shipmentTrend: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2024, 11, 17 + i).toISOString().split('T')[0],
    shipments: Math.floor(Math.random() * 50) + 30,
    delivered: Math.floor(Math.random() * 40) + 20,
  })),
  
  // Status distribution
  statusDistribution: [
    { status: 'Delivered', count: 2450, color: '#22c55e' },
    { status: 'In Transit', count: 580, color: '#3b82f6' },
    { status: 'Out for Delivery', count: 320, color: '#f59e0b' },
    { status: 'Pending', count: 180, color: '#6b7280' },
    { status: 'Failed', count: 45, color: '#ef4444' },
    { status: 'Cancelled', count: 25, color: '#dc2626' },
  ],
  
  // Monthly revenue
  monthlyRevenue: [
    { month: 'Aug', revenue: 1250000, expenses: 850000 },
    { month: 'Sep', revenue: 1450000, expenses: 920000 },
    { month: 'Oct', revenue: 1680000, expenses: 1050000 },
    { month: 'Nov', revenue: 1520000, expenses: 980000 },
    { month: 'Dec', revenue: 1890000, expenses: 1150000 },
    { month: 'Jan', revenue: 1750000, expenses: 1080000 },
  ],
  
  // Revenue by region
  revenueByRegion: [
    { region: 'West', revenue: 4500000 },
    { region: 'North', revenue: 3800000 },
    { region: 'South', revenue: 3200000 },
    { region: 'East', revenue: 2100000 },
    { region: 'Central', revenue: 1850000 },
  ],
  
  // KPI Summary
  kpiSummary: {
    totalShipments: 3600,
    activeDeliveries: 580,
    pendingPickups: 180,
    revenueThisMonth: 1750000,
    onTimeDeliveryRate: 94.5,
    fleetUtilization: 78.3,
  },
  
  // Driver performance
  driverPerformance: mockDrivers.slice(0, 10).map(driver => ({
    name: driver.name,
    trips: driver.totalTrips,
    rating: driver.rating,
    onTimeRate: Math.round((Math.random() * 15 + 85) * 10) / 10,
  })),
  
  // Fleet utilization
  fleetUtilization: [
    { type: 'Truck', total: 5, active: 4, maintenance: 1 },
    { type: 'Van', total: 4, active: 3, maintenance: 0 },
    { type: 'Bike', total: 3, active: 2, maintenance: 1 },
    { type: 'Tempo', total: 3, active: 2, maintenance: 0 },
  ],
};

// Role-based menu configuration
export const roleMenuConfig: Record<UserRole, string[]> = {
  'SuperAdmin': ['dashboard', 'companies', 'organizations', 'fleet', 'dispatch', 'reports', 'users', 'settings'],
  'CompanyAdmin': ['dashboard', 'shipments', 'orders', 'fleet', 'drivers', 'dispatch', 'warehouse', 'customers', 'agents', 'transport', 'finance', 'reports', 'notifications', 'settings'],
  'Manager': ['dashboard', 'shipments', 'orders', 'fleet', 'drivers', 'dispatch', 'warehouse', 'customers', 'reports', 'notifications', 'settings'],
  'Dispatcher': ['dashboard', 'shipments', 'dispatch', 'drivers', 'fleet', 'notifications'],
  'Agent': ['dashboard', 'shipments', 'orders', 'customers', 'finance', 'warehouse', 'reports', 'notifications'],
  'Staff': ['dashboard', 'shipments', 'orders', 'customers', 'finance', 'warehouse', 'reports', 'notifications'],
  'Operator': ['dashboard', 'shipments', 'dispatch', 'drivers', 'fleet', 'notifications'],
  'Admin': ['dashboard', 'shipments', 'orders', 'fleet', 'drivers', 'dispatch', 'warehouse', 'customers', 'finance', 'reports', 'notifications', 'users', 'settings'],
};

// Role-based permissions
export const rolePermissions: Record<UserRole, Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>> = {
  'SuperAdmin': {
    companies: { view: true, create: true, edit: true, delete: true },
    organizations: { view: true, create: true, edit: true, delete: true },
    dashboard: { view: true, create: false, edit: false, delete: false },
    fleet: { view: true, create: false, edit: false, delete: false },
    dispatch: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, create: true, edit: false, delete: false },
    users: { view: true, create: true, edit: true, delete: true },
    settings: { view: true, create: true, edit: true, delete: true },
  },
  'CompanyAdmin': {
    shipments: { view: true, create: true, edit: true, delete: true },
    orders: { view: true, create: true, edit: true, delete: true },
    fleet: { view: true, create: true, edit: true, delete: true },
    drivers: { view: true, create: true, edit: true, delete: true },
    dispatch: { view: true, create: true, edit: true, delete: true },
    warehouse: { view: true, create: true, edit: true, delete: true },
    customers: { view: true, create: true, edit: true, delete: true },
    agents: { view: true, create: true, edit: true, delete: true },
    transport: { view: true, create: true, edit: true, delete: true },
    finance: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, create: true, edit: true, delete: true },
    users: { view: true, create: true, edit: true, delete: true },
    settings: { view: true, create: true, edit: true, delete: true },
  },
  'Manager': {
    shipments: { view: true, create: true, edit: true, delete: false },
    orders: { view: true, create: true, edit: true, delete: false },
    fleet: { view: true, create: true, edit: true, delete: false },
    drivers: { view: true, create: true, edit: true, delete: false },
    dispatch: { view: true, create: true, edit: true, delete: false },
    warehouse: { view: true, create: true, edit: true, delete: false },
    customers: { view: true, create: true, edit: true, delete: false },
    finance: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, create: true, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: true, create: false, edit: true, delete: false },
  },
  'Dispatcher': {
    shipments: { view: true, create: false, edit: true, delete: false },
    orders: { view: true, create: false, edit: false, delete: false },
    fleet: { view: true, create: false, edit: false, delete: false },
    drivers: { view: true, create: false, edit: false, delete: false },
    dispatch: { view: true, create: true, edit: true, delete: false },
    warehouse: { view: false, create: false, edit: false, delete: false },
    customers: { view: false, create: false, edit: false, delete: false },
    finance: { view: false, create: false, edit: false, delete: false },
    reports: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
  'Agent': {
    shipments: { view: true, create: true, edit: true, delete: false },
    orders: { view: true, create: true, edit: true, delete: false },
    fleet: { view: false, create: false, edit: false, delete: false },
    drivers: { view: false, create: false, edit: false, delete: false },
    dispatch: { view: false, create: false, edit: false, delete: false },
    warehouse: { view: true, create: true, edit: true, delete: false },
    customers: { view: true, create: true, edit: true, delete: false },
    finance: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
  'Staff': {
    shipments: { view: true, create: true, edit: true, delete: false },
    orders: { view: true, create: true, edit: true, delete: false },
    fleet: { view: false, create: false, edit: false, delete: false },
    drivers: { view: false, create: false, edit: false, delete: false },
    dispatch: { view: false, create: false, edit: false, delete: false },
    warehouse: { view: true, create: true, edit: true, delete: false },
    customers: { view: true, create: true, edit: true, delete: false },
    finance: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
  'Operator': {
    shipments: { view: true, create: false, edit: true, delete: false },
    orders: { view: true, create: false, edit: false, delete: false },
    fleet: { view: true, create: false, edit: false, delete: false },
    drivers: { view: true, create: false, edit: false, delete: false },
    dispatch: { view: true, create: true, edit: true, delete: false },
    warehouse: { view: false, create: false, edit: false, delete: false },
    customers: { view: false, create: false, edit: false, delete: false },
    finance: { view: false, create: false, edit: false, delete: false },
    reports: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
  'Admin': {
    shipments: { view: true, create: true, edit: true, delete: true },
    orders: { view: true, create: true, edit: true, delete: true },
    fleet: { view: true, create: true, edit: true, delete: true },
    drivers: { view: true, create: true, edit: true, delete: true },
    dispatch: { view: true, create: true, edit: true, delete: true },
    warehouse: { view: true, create: true, edit: true, delete: true },
    customers: { view: true, create: true, edit: true, delete: true },
    finance: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, create: true, edit: true, delete: true },
    users: { view: true, create: true, edit: true, delete: true },
    settings: { view: true, create: true, edit: true, delete: true },
  },
};

// MOCK DATA FOR LOGISTICS MANAGEMENT SYSTEM

// Types
export type ShipmentStatus = 'Pending' | 'Picked Up' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Failed';
export type OrderStatus = 'Draft' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Returned';
export type PaymentStatus = 'Pending' | 'Paid' | 'Partial' | 'Refunded';
export type VehicleStatus = 'Available' | 'On Route' | 'Maintenance' | 'Inactive';
export type DriverStatus = 'Active' | 'On Duty' | 'Off Duty' | 'Suspended';
export type InvoiceStatus = 'Unpaid' | 'Paid' | 'Overdue' | 'Cancelled';
export type UserRole = 'Admin' | 'Manager' | 'Dispatcher' | 'Staff';

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

// MOCK USERS (8 users - one per role)
export const mockUsers: User[] = [
  {
    id: 'usr-001',
    username: 'superadmin',
    password: 'admin123',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@logisticspro.com',
    phone: '+91 98765 43210',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2025-01-15T09:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    avatar: 'RK'
  },
  {
    id: 'usr-002',
    username: 'ops_manager',
    password: 'ops123',
    name: 'Priya Sharma',
    email: 'priya.sharma@logisticspro.com',
    phone: '+91 98765 43211',
    role: 'Manager',
    status: 'Active',
    lastLogin: '2025-01-15T08:45:00Z',
    createdAt: '2024-02-15T00:00:00Z',
    avatar: 'PS'
  },
  {
    id: 'usr-003',
    username: 'dispatch',
    password: 'dispatch123',
    name: 'Amit Patel',
    email: 'amit.patel@logisticspro.com',
    phone: '+91 98765 43212',
    role: 'Dispatcher',
    status: 'Active',
    lastLogin: '2025-01-15T07:00:00Z',
    createdAt: '2024-03-10T00:00:00Z',
    avatar: 'AP'
  },
  {
    id: 'usr-004',
    username: 'warehouse',
    password: 'warehouse123',
    name: 'Sunita Reddy',
    email: 'sunita.reddy@logisticspro.com',
    phone: '+91 98765 43213',
    role: 'Staff',
    status: 'Active',
    lastLogin: '2025-01-14T18:00:00Z',
    createdAt: '2024-04-05T00:00:00Z',
    avatar: 'SR'
  },
  {
    id: 'usr-005',
    username: 'driver01',
    password: 'driver123',
    name: 'Mohammed Khan',
    email: 'mohammed.khan@logisticspro.com',
    phone: '+91 98765 43214',
    role: 'Staff',
    status: 'Active',
    lastLogin: '2025-01-15T06:00:00Z',
    createdAt: '2024-05-20T00:00:00Z',
    avatar: 'MK'
  },
  {
    id: 'usr-006',
    username: 'finance',
    password: 'finance123',
    name: 'Ananya Gupta',
    email: 'ananya.gupta@logisticspro.com',
    phone: '+91 98765 43215',
    role: 'Staff',
    status: 'Active',
    lastLogin: '2025-01-15T10:00:00Z',
    createdAt: '2024-06-12T00:00:00Z',
    avatar: 'AG'
  },
  {
    id: 'usr-007',
    username: 'support',
    password: 'support123',
    name: 'Vikram Singh',
    email: 'vikram.singh@logisticspro.com',
    phone: '+91 98765 43216',
    role: 'Staff',
    status: 'Active',
    lastLogin: '2025-01-15T09:00:00Z',
    createdAt: '2024-07-08T00:00:00Z',
    avatar: 'VS'
  },
  {
    id: 'usr-008',
    username: 'customer01',
    password: 'cust123',
    name: 'Neha Enterprises',
    email: 'contact@nehaenterprises.com',
    phone: '+91 98765 43217',
    role: 'Staff',
    status: 'Active',
    lastLogin: '2025-01-14T14:30:00Z',
    createdAt: '2024-08-01T00:00:00Z',
    avatar: 'NE'
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
  { id: 'veh-001', vehicleId: 'VEH-001', type: 'Truck', licensePlate: 'MH 12 AB 1234', model: 'Tata 407', capacity: '3000 kg', status: 'Available', assignedDriver: 'drv-001', currentLocation: 'Mumbai Warehouse', maintenanceHistory: [{ date: '2024-12-15', description: 'Oil change and brake check', cost: 5000 }], fuelLogs: [{ date: '2025-01-14', liters: 80, cost: 7200 }] },
  { id: 'veh-002', vehicleId: 'VEH-002', type: 'Van', licensePlate: 'DL 01 CD 5678', model: 'Mahindra Supro', capacity: '1000 kg', status: 'On Route', assignedDriver: 'drv-002', currentLocation: 'En route to Delhi', maintenanceHistory: [{ date: '2024-11-20', description: 'Tire replacement', cost: 12000 }], fuelLogs: [{ date: '2025-01-15', liters: 45, cost: 4050 }] },
  { id: 'veh-003', vehicleId: 'VEH-003', type: 'Bike', licensePlate: 'KA 05 EF 9012', model: 'TVS Apache RTR', capacity: '20 kg', status: 'Available', assignedDriver: 'drv-003', currentLocation: 'Bangalore Hub', maintenanceHistory: [{ date: '2025-01-05', description: 'Chain lubrication', cost: 500 }], fuelLogs: [{ date: '2025-01-15', liters: 8, cost: 800 }] },
  { id: 'veh-004', vehicleId: 'VEH-004', type: 'Tempo', licensePlate: 'TN 07 GH 3456', model: 'Ashok Leyland Dost', capacity: '1500 kg', status: 'Maintenance', assignedDriver: null, currentLocation: 'Chennai Workshop', maintenanceHistory: [{ date: '2025-01-10', description: 'Engine overhaul', cost: 25000 }], fuelLogs: [{ date: '2025-01-08', liters: 55, cost: 4950 }] },
  { id: 'veh-005', vehicleId: 'VEH-005', type: 'Truck', licensePlate: 'GJ 01 IJ 7890', model: 'Eicher Pro 1059', capacity: '5000 kg', status: 'On Route', assignedDriver: 'drv-004', currentLocation: 'Highway - Ahmedabad to Mumbai', maintenanceHistory: [{ date: '2024-10-25', description: 'Full service', cost: 15000 }], fuelLogs: [{ date: '2025-01-15', liters: 120, cost: 10800 }] },
  { id: 'veh-006', vehicleId: 'VEH-006', type: 'Van', licensePlate: 'AP 09 KL 2345', model: 'Force Traveller', capacity: '1200 kg', status: 'Available', assignedDriver: 'drv-005', currentLocation: 'Hyderabad Depot', maintenanceHistory: [], fuelLogs: [{ date: '2025-01-14', liters: 50, cost: 4500 }] },
  { id: 'veh-007', vehicleId: 'VEH-007', type: 'Bike', licensePlate: 'MH 04 MN 6789', model: 'Honda Shine', capacity: '15 kg', status: 'Available', assignedDriver: 'drv-006', currentLocation: 'Pune Office', maintenanceHistory: [{ date: '2024-12-01', description: 'Battery replacement', cost: 3000 }], fuelLogs: [{ date: '2025-01-15', liters: 6, cost: 600 }] },
  { id: 'veh-008', vehicleId: 'VEH-008', type: 'Truck', licensePlate: 'RJ 14 OP 1234', model: 'BharatBenz 1217C', capacity: '7000 kg', status: 'Inactive', assignedDriver: null, currentLocation: 'Jaipur Yard', maintenanceHistory: [{ date: '2024-09-15', description: 'Major repair needed', cost: 50000 }], fuelLogs: [] },
  { id: 'veh-009', vehicleId: 'VEH-009', type: 'Tempo', licensePlate: 'WB 02 QR 5678', model: 'Tata Ace Gold', capacity: '750 kg', status: 'On Route', assignedDriver: 'drv-007', currentLocation: 'Kolkata to Howrah', maintenanceHistory: [], fuelLogs: [{ date: '2025-01-15', liters: 25, cost: 2250 }] },
  { id: 'veh-010', vehicleId: 'VEH-010', type: 'Van', licensePlate: 'MP 09 ST 9012', model: 'Maruti Eeco Cargo', capacity: '600 kg', status: 'Available', assignedDriver: 'drv-008', currentLocation: 'Indore Hub', maintenanceHistory: [{ date: '2025-01-02', description: 'AC repair', cost: 8000 }], fuelLogs: [{ date: '2025-01-14', liters: 35, cost: 3150 }] },
  { id: 'veh-011', vehicleId: 'VEH-011', type: 'Truck', licensePlate: 'KA 01 UV 3456', model: 'Tata Prima', capacity: '10000 kg', status: 'On Route', assignedDriver: 'drv-009', currentLocation: 'Bangalore to Chennai Highway', maintenanceHistory: [], fuelLogs: [{ date: '2025-01-15', liters: 150, cost: 13500 }] },
  { id: 'veh-012', vehicleId: 'VEH-012', type: 'Bike', licensePlate: 'DL 08 WX 7890', model: 'Bajaj Pulsar', capacity: '25 kg', status: 'Maintenance', assignedDriver: null, currentLocation: 'Delhi Service Center', maintenanceHistory: [{ date: '2025-01-12', description: 'Engine tune-up', cost: 2000 }], fuelLogs: [] },
  { id: 'veh-013', vehicleId: 'VEH-013', type: 'Tempo', licensePlate: 'MH 14 YZ 2345', model: 'Mahindra Bolero Pickup', capacity: '1100 kg', status: 'Available', assignedDriver: 'drv-010', currentLocation: 'Pune Warehouse', maintenanceHistory: [], fuelLogs: [{ date: '2025-01-14', liters: 40, cost: 3600 }] },
  { id: 'veh-014', vehicleId: 'VEH-014', type: 'Van', licensePlate: 'TN 01 AB 6789', model: 'Tata Winger', capacity: '1500 kg', status: 'On Route', assignedDriver: 'drv-011', currentLocation: 'Chennai to Coimbatore', maintenanceHistory: [{ date: '2024-11-10', description: 'Suspension check', cost: 6000 }], fuelLogs: [{ date: '2025-01-15', liters: 60, cost: 5400 }] },
  { id: 'veh-015', vehicleId: 'VEH-015', type: 'Truck', licensePlate: 'GJ 05 CD 1234', model: 'Ashok Leyland Ecomet', capacity: '8000 kg', status: 'Available', assignedDriver: 'drv-012', currentLocation: 'Ahmedabad Depot', maintenanceHistory: [], fuelLogs: [{ date: '2025-01-13', liters: 100, cost: 9000 }] },
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
  'Admin': ['dashboard', 'shipments', 'orders', 'fleet', 'drivers', 'dispatch', 'warehouse', 'customers', 'finance', 'reports', 'notifications', 'users', 'settings'],
  'Manager': ['dashboard', 'shipments', 'orders', 'fleet', 'drivers', 'dispatch', 'warehouse', 'customers', 'reports', 'notifications', 'settings'],
  'Dispatcher': ['dashboard', 'shipments', 'dispatch', 'drivers', 'fleet', 'notifications'],
  'Staff': ['dashboard', 'shipments', 'orders', 'customers', 'finance', 'warehouse', 'reports', 'notifications'],
};

// Role-based permissions
export const rolePermissions: Record<UserRole, Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>> = {
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
};

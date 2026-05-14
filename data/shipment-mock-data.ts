// ============================================
// CENTRALIZED SHIPMENT MOCK DATA
// Used across all user roles for consistency
// ============================================

import type {
  ConsolidatedShipment, ShipmentStatus, ServiceType, ShipmentDashboardStats,
} from '@/types/shipment';

const CITIES = [
  { city: 'Mumbai', code: 'BOM', state: 'Maharashtra' },
  { city: 'Delhi', code: 'DEL', state: 'Delhi' },
  { city: 'Bangalore', code: 'BLR', state: 'Karnataka' },
  { city: 'Hyderabad', code: 'HYD', state: 'Telangana' },
  { city: 'Chennai', code: 'MAA', state: 'Tamil Nadu' },
  { city: 'Kolkata', code: 'CCU', state: 'West Bengal' },
  { city: 'Pune', code: 'PNQ', state: 'Maharashtra' },
  { city: 'Ahmedabad', code: 'AMD', state: 'Gujarat' },
  { city: 'Jaipur', code: 'JAI', state: 'Rajasthan' },
  { city: 'Lucknow', code: 'LKO', state: 'Uttar Pradesh' },
];

const COMPANY_NAMES = [
  'Tech Solutions Pvt Ltd', 'Global Traders', 'Sunrise Industries',
  'Metro Supplies', 'Elite Electronics', 'Fashion Hub', 'Quick Retail',
  'Prime Distributors', 'Mega Mart', 'City Stores',
];

const CONTACT_NAMES = [
  'Rahul Verma', 'Priya Singh', 'Amit Sharma', 'Neha Gupta', 'Vikram Patel',
  'Anjali Reddy', 'Karan Malhotra', 'Divya Nair', 'Rohan Joshi', 'Meera Iyer',
];

const PACKAGE_DESCRIPTIONS = [
  'Electronics components', 'Industrial machinery parts',
  'Legal documents', 'Server equipment', 'Fashion samples',
  'Medical supplies', 'Automotive parts', 'Pharmaceutical products',
  'Consumer electronics', 'Textile rolls', 'Chemicals - non hazmat',
  'Food processing equipment', 'Printed materials', 'Furniture parts',
  'Solar panels', 'Beverage concentrate', 'Construction materials',
  'Laboratory equipment', 'Office supplies', 'Agricultural tools',
];

let shipmentCounter = 0;

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number): Date {
  const now = Date.now();
  return new Date(now - Math.random() * daysBack * 86400000);
}

function generateTimeline(status: ShipmentStatus, createdDate: Date) {
  const events: { status: string; timestamp: string; location: string; notes: string; updatedBy?: string }[] = [
    { status: 'Order Created', timestamp: createdDate.toISOString(), location: 'Online Portal', notes: 'Shipment order created via customer portal', updatedBy: 'System' },
  ];

  if (status !== 'Pending') {
    events.push({
      status: 'Picked Up', timestamp: new Date(createdDate.getTime() + rand(2, 6) * 3600000).toISOString(),
      location: pick(CITIES).city, notes: 'Package collected from sender', updatedBy: 'Driver',
    });
  }
  if (['In Transit', 'Out for Delivery', 'Delivered', 'Failed'].includes(status)) {
    events.push({
      status: 'Arrived at Hub', timestamp: new Date(createdDate.getTime() + rand(8, 16) * 3600000).toISOString(),
      location: `${pick(CITIES).city} Hub`, notes: 'Package arrived at sorting facility', updatedBy: 'Warehouse',
    });
    events.push({
      status: 'In Transit', timestamp: new Date(createdDate.getTime() + rand(14, 24) * 3600000).toISOString(),
      location: 'En Route', notes: 'Package dispatched to destination city', updatedBy: 'System',
    });
  }
  if (['Out for Delivery', 'Delivered', 'Failed'].includes(status)) {
    events.push({
      status: 'Out for Delivery', timestamp: new Date(createdDate.getTime() + rand(28, 36) * 3600000).toISOString(),
      location: pick(CITIES).city, notes: 'Package out for delivery with driver', updatedBy: 'Dispatcher',
    });
  }
  if (status === 'Delivered') {
    events.push({
      status: 'Delivered', timestamp: new Date(createdDate.getTime() + rand(32, 40) * 3600000).toISOString(),
      location: pick(CITIES).city, notes: 'Package delivered successfully. Signed by recipient.', updatedBy: 'Driver',
    });
  }
  if (status === 'Failed') {
    events.push({
      status: 'Failed Attempt', timestamp: new Date(createdDate.getTime() + rand(30, 38) * 3600000).toISOString(),
      location: pick(CITIES).city, notes: 'Delivery attempt failed - recipient not available', updatedBy: 'Driver',
    });
  }
  if (status === 'Cancelled') {
    events.push({
      status: 'Cancelled', timestamp: new Date(createdDate.getTime() + rand(2, 8) * 3600000).toISOString(),
      location: 'System', notes: 'Shipment cancelled by customer', updatedBy: 'Customer',
    });
  }
  return events;
}

function generateTrackingEvents(shipmentId: string, status: ShipmentStatus, createdDate: Date) {
  const events: { id: string; shipmentId: string; type: string; location: string; description: string; timestamp: string; latitude?: number; longitude?: number }[] = [];
  const locs = [
    { loc: `${pick(CITIES).city}, ${pick(CITIES).state}`, lat: 19.0760 + Math.random() * 2, lng: 72.8777 + Math.random() * 2 },
    { loc: `${pick(CITIES).city}, ${pick(CITIES).state}`, lat: 12.9716 + Math.random() * 2, lng: 77.5946 + Math.random() * 2 },
    { loc: `${pick(CITIES).city}, ${pick(CITIES).state}`, lat: 17.3850 + Math.random() * 2, lng: 78.4867 + Math.random() * 2 },
  ];

  let eventIdx = 0;
  events.push({ id: `te-${shipmentId}-${eventIdx++}`, shipmentId, type: 'Order Placed', location: locs[0].loc, description: 'Booking created successfully', timestamp: createdDate.toISOString(), latitude: locs[0].lat, longitude: locs[0].lng });

  if (status !== 'Pending') {
    events.push({ id: `te-${shipmentId}-${eventIdx++}`, shipmentId, type: 'Picked Up', location: locs[0].loc, description: 'Package collected from sender', timestamp: new Date(createdDate.getTime() + rand(2, 6) * 3600000).toISOString(), latitude: locs[0].lat, longitude: locs[0].lng });
  }
  if (['In Transit', 'Out for Delivery', 'Delivered', 'Failed'].includes(status)) {
    events.push({ id: `te-${shipmentId}-${eventIdx++}`, shipmentId, type: 'In Transit', location: locs[1].loc, description: 'Package in transit to destination', timestamp: new Date(createdDate.getTime() + rand(8, 20) * 3600000).toISOString(), latitude: locs[1].lat, longitude: locs[1].lng });
  }
  if (['Out for Delivery', 'Delivered'].includes(status)) {
    events.push({ id: `te-${shipmentId}-${eventIdx++}`, shipmentId, type: 'Out for Delivery', location: locs[2].loc, description: 'Package out for delivery', timestamp: new Date(createdDate.getTime() + rand(24, 32) * 3600000).toISOString(), latitude: locs[2].lat, longitude: locs[2].lng });
  }
  if (status === 'Delivered') {
    events.push({ id: `te-${shipmentId}-${eventIdx++}`, shipmentId, type: 'Delivered', location: locs[2].loc, description: 'Delivered successfully', timestamp: new Date(createdDate.getTime() + rand(30, 38) * 3600000).toISOString(), latitude: locs[2].lat, longitude: locs[2].lng });
  }
  if (status === 'Failed') {
    events.push({ id: `te-${shipmentId}-${eventIdx++}`, shipmentId, type: 'Failed Attempt', location: locs[2].loc, description: 'Delivery attempt failed', timestamp: new Date(createdDate.getTime() + rand(30, 38) * 3600000).toISOString(), latitude: locs[2].lat, longitude: locs[2].lng });
  }
  return events;
}

function generateDocuments(shipmentId: string) {
  const docs: { id: string; shipmentId: string; type: 'BOL' | 'Invoice' | 'POD' | 'Packing List' | 'Insurance' | 'Customs' | 'Inspection' | 'Other'; title: string; fileName: string; fileSize: string; uploadedAt: string; status: 'Available' | 'Pending' | 'Expired' }[] = [];
  const uploadDate = randomDate(30);
  docs.push({ id: `doc-${shipmentId}-1`, shipmentId, type: 'BOL', title: `Bill of Lading - ${shipmentId}`, fileName: `BOL-${shipmentId}.pdf`, fileSize: `${rand(100, 500)} KB`, uploadedAt: uploadDate.toISOString(), status: 'Available' });
  docs.push({ id: `doc-${shipmentId}-2`, shipmentId, type: 'Packing List', title: `Packing List - ${shipmentId}`, fileName: `PL-${shipmentId}.pdf`, fileSize: `${rand(50, 200)} KB`, uploadedAt: uploadDate.toISOString(), status: 'Available' });
  if (Math.random() > 0.5) {
    docs.push({ id: `doc-${shipmentId}-3`, shipmentId, type: 'Insurance', title: `Insurance Certificate - ${shipmentId}`, fileName: `INS-${shipmentId}.pdf`, fileSize: `${rand(200, 600)} KB`, uploadedAt: uploadDate.toISOString(), status: Math.random() > 0.8 ? 'Expired' : 'Available' });
  }
  return docs;
}

function generateCharges(shipmentId: string) {
  const freight = rand(500, 5000);
  const fuel = Math.round(freight * 0.15);
  const handling = rand(100, 800);
  return [
    { id: `chg-${shipmentId}-1`, shipmentId, description: 'Freight Charges', type: 'Freight' as const, quantity: 1, rate: freight, amount: freight, currency: 'INR' },
    { id: `chg-${shipmentId}-2`, shipmentId, description: 'Fuel Surcharge', type: 'Fuel Surcharge' as const, quantity: 1, rate: fuel, amount: fuel, currency: 'INR' },
    { id: `chg-${shipmentId}-3`, shipmentId, description: 'Handling Fee', type: 'Handling' as const, quantity: 1, rate: handling, amount: handling, currency: 'INR' },
  ];
}

export function generateMockShipments(count: number = 45): ConsolidatedShipment[] {
  const statuses: ShipmentStatus[] = ['Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed'];
  const serviceTypes: ServiceType[] = ['Express', 'Standard', 'Freight'];
  const packageTypes: any[] = ['Box', 'Envelope', 'Pallet', 'Crate', 'Tube'];

  return Array.from({ length: count }, (_, i) => {
    shipmentCounter++;
    const idx = shipmentCounter;
    const status = statuses[rand(0, statuses.length - 1)];
    const serviceType = pick(serviceTypes);
    const originCity = pick(CITIES);
    const destCity = pick(CITIES);
    const createdDate = randomDate(30);
    const estimatedDays = serviceType === 'Express' ? rand(1, 2) : serviceType === 'Standard' ? rand(3, 5) : rand(5, 10);
    const estimatedDate = new Date(createdDate.getTime() + estimatedDays * 86400000);
    const sender = pick(COMPANY_NAMES);
    const receiver = pick(COMPANY_NAMES);
    const senderContact = pick(CONTACT_NAMES);
    const receiverContact = pick(CONTACT_NAMES);
    const weight = rand(1, 500) + Math.random();
    const onTimeRandom = Math.random();
    const onTimeStatus = status === 'Delivered' ? (onTimeRandom > 0.85 ? 'Delayed' : onTimeRandom > 0.70 ? 'Early' : 'On Time') : null;

    const shipment: ConsolidatedShipment = {
      id: `shp-${String(idx).padStart(3, '0')}`,
      trackingNumber: `LOG-2026-${String(10000 + idx).padStart(5, '0')}`,
      status,
      serviceType,
      customerId: `cust-${String(rand(1, 32)).padStart(3, '0')}`,
      customerName: sender,
      sender: {
        name: senderContact, company: sender, phone: `+91 ${rand(7000000000, 9999999999)}`,
        email: `contact@${sender.toLowerCase().replace(/ /g, '')}.com`,
        address: `${rand(1, 999)} ${pick(['MG Road', 'Brigade Road', 'Ring Road', 'Main Street', 'Park Avenue'])}`,
        city: originCity.city, state: originCity.state, pincode: String(rand(100000, 999999)), country: 'India',
      },
      receiver: {
        name: receiverContact, company: receiver, phone: `+91 ${rand(7000000000, 9999999999)}`,
        email: `info@${receiver.toLowerCase().replace(/ /g, '')}.com`,
        address: `${rand(1, 999)} ${pick(['Industrial Area', 'Business Park', 'Tech Park', 'Shopping Center', 'Market Road'])}`,
        city: destCity.city, state: destCity.state, pincode: String(rand(100000, 999999)), country: 'India',
      },
      package: {
        weight: Math.round(weight * 10) / 10, weightUnit: 'kg',
        dimensions: `${rand(10, 120)}x${rand(10, 80)}x${rand(5, 60)} cm`,
        type: pick(packageTypes), pieces: rand(1, 10),
        description: pick(PACKAGE_DESCRIPTIONS), hazmat: Math.random() > 0.9,
        hazmatClass: Math.random() > 0.9 ? `Class ${rand(1, 9)}` : undefined,
        value: rand(1000, 500000), currency: 'INR',
      },
      route: {
        origin: `${originCity.city}, ${originCity.state}`,
        originCode: originCity.code,
        destination: `${destCity.city}, ${destCity.state}`,
        destinationCode: destCity.code,
        distance: rand(200, 2500), distanceUnit: 'km',
        transportMode: 'Land', estimatedTransitDays: estimatedDays,
      },
      assignedDriver: status !== 'Pending' ? `drv-${String(rand(1, 22)).padStart(3, '0')}` : null,
      assignedVehicle: status !== 'Pending' ? `veh-${String(rand(1, 15)).padStart(3, '0')}` : null,
      estimatedDelivery: estimatedDate.toISOString(),
      actualDelivery: status === 'Delivered' ? new Date(estimatedDate.getTime() + rand(-1, 1) * 86400000).toISOString() : null,
      pickupDate: status !== 'Pending' ? new Date(createdDate.getTime() + rand(2, 6) * 3600000).toISOString() : null,
      createdAt: createdDate.toISOString(),
      updatedAt: new Date().toISOString(),
      notes: pick(['Handle with care', 'Fragile items', 'Customer requested morning delivery', 'Business address - weekdays only', 'Leave at reception', 'Signature required', '']),
      proofOfDelivery: status === 'Delivered' ? `/pod/${shipmentCounter}.png` : null,
      timeline: generateTimeline(status, createdDate),
      trackingEvents: generateTrackingEvents(`shp-${String(idx).padStart(3, '0')}`, status, createdDate),
      documents: generateDocuments(`shp-${String(idx).padStart(3, '0')}`),
      charges: generateCharges(`shp-${String(idx).padStart(3, '0')}`),
      customsStatus: Math.random() > 0.8 ? pick(['Cleared', 'Pending', 'Hold', 'Examined', 'Released']) : null,
      warehouseLocation: Math.random() > 0.4 ? `${pick(['Zone-A', 'Zone-B', 'Zone-C', 'Dock-1', 'Dock-2', 'Yard-1'])}` : null,
      lastScanLocation: status !== 'Pending' ? pick(CITIES).city : null,
      lastScanTime: status !== 'Pending' ? new Date(createdDate.getTime() + rand(1, 24) * 3600000).toISOString() : null,
      onTimeStatus,
    };
    return shipment;
  });
}

export const mockConsolidatedShipments = generateMockShipments(45);

export const mockShipmentDashboardStats: ShipmentDashboardStats = {
  totalShipments: mockConsolidatedShipments.length,
  activeShipments: mockConsolidatedShipments.filter(s => !['Delivered', 'Cancelled', 'Failed'].includes(s.status)).length,
  inTransit: mockConsolidatedShipments.filter(s => s.status === 'In Transit').length,
  outForDelivery: mockConsolidatedShipments.filter(s => s.status === 'Out for Delivery').length,
  deliveredToday: mockConsolidatedShipments.filter(s => s.status === 'Delivered' && new Date(s.actualDelivery || s.updatedAt).toDateString() === new Date().toDateString()).length,
  deliveredThisMonth: mockConsolidatedShipments.filter(s => s.status === 'Delivered').length,
  pendingPickups: mockConsolidatedShipments.filter(s => s.status === 'Pending').length,
  failedDeliveries: mockConsolidatedShipments.filter(s => s.status === 'Failed').length,
  cancelledShipments: mockConsolidatedShipments.filter(s => s.status === 'Cancelled').length,
  delayedShipments: mockConsolidatedShipments.filter(s => s.onTimeStatus === 'Delayed').length,
  onTimeRate: 92.5,
  averageDeliveryTime: 3.4,
  totalRevenue: mockConsolidatedShipments.reduce((s, sh) => s + sh.charges.reduce((c, ch) => c + ch.amount, 0), 0),
  totalCost: mockConsolidatedShipments.reduce((s, sh) => s + sh.charges.reduce((c, ch) => c + Math.round(ch.amount * 0.65), 0), 0),
};

// Pre-computed role-based views (filtered data)
export function getShipmentsForRole(role: string, shipments = mockConsolidatedShipments) {
  switch (role) {
    case 'SuperAdmin': case 'CompanyAdmin': case 'Manager':
      return shipments;
    case 'Dispatcher': case 'Operator':
      return shipments.filter(s => !['Delivered', 'Cancelled'].includes(s.status));
    case 'Warehouse':
      return shipments.filter(s => ['Pending', 'Picked Up', 'In Transit'].includes(s.status));
    case 'Driver':
      return shipments.filter(s => s.assignedDriver && ['Picked Up', 'In Transit', 'Out for Delivery'].includes(s.status));
    case 'Finance':
      return shipments.filter(s => s.status === 'Delivered' || s.status === 'In Transit');
    case 'Support':
      return shipments.filter(s => ['Failed', 'Cancelled'].includes(s.status) || s.onTimeStatus === 'Delayed');
    case 'Customs':
      return shipments.filter(s => s.customsStatus !== null);
    case 'PortAgent':
      return shipments.filter(s => s.route.transportMode === 'Water' || s.customsStatus !== null);
    case 'CustomerPortal':
      return shipments.filter(s => s.customerName === 'Tech Solutions Pvt Ltd' || s.customerName === 'Global Traders');
    case 'AuditorReadOnly':
      return shipments.filter(s => s.status === 'Delivered' || s.status === 'Cancelled');
    default:
      return shipments;
  }
}

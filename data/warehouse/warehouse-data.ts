import type {
  GoodsReceivedNote, GRNItem, GoodsDispatchNote, GDNItem,
  WarehouseLocation, DamageReport, StockMovement,
  WarehouseDashboardStats, WarehouseNotification, WHActivityEvent,
  GRNStatus, GDNStatus,
} from '@/types/warehouse';
import type { Warehouse, InventoryItem } from '@/types/warehouse';

const COMPANIES = ['cmp-001', 'cmp-002', 'cmp-003'];
const WAREHOUSES: Warehouse[] = [
  { id: 'wh-001', warehouseId: 'WH-001', name: 'Mumbai Central WHS', location: 'JNPT Port Area, Navi Mumbai', city: 'Mumbai', capacity: 50000, currentStock: 34200, usedCapacity: 68.4, manager: 'Rajesh Kumar', contact: '+91-9876543210', inventory: [], inboundLogs: [], outboundLogs: [], createdAt: '2024-01-15T00:00:00Z', updatedAt: '2025-05-20T00:00:00Z' },
  { id: 'wh-002', warehouseId: 'WH-002', name: 'Delhi North Logistics', location: 'Sector 58, Noida', city: 'Delhi', capacity: 35000, currentStock: 21500, usedCapacity: 61.4, manager: 'Priya Sharma', contact: '+91-9876543211', inventory: [], inboundLogs: [], outboundLogs: [], createdAt: '2024-03-20T00:00:00Z', updatedAt: '2025-05-21T00:00:00Z' },
  { id: 'wh-003', warehouseId: 'WH-003', name: 'Bangalore East Fulfillment', location: 'Whitefield, Bangalore', city: 'Bangalore', capacity: 25000, currentStock: 19800, usedCapacity: 79.2, manager: 'Arjun Singh', contact: '+91-9876543212', inventory: [], inboundLogs: [], outboundLogs: [], createdAt: '2024-06-10T00:00:00Z', updatedAt: '2025-05-19T00:00:00Z' },
  { id: 'wh-004', warehouseId: 'WH-004', name: 'Chennai SeaPort WHS', location: 'Ennore Port Area', city: 'Chennai', capacity: 40000, currentStock: 28900, usedCapacity: 72.3, manager: 'Deepa Nair', contact: '+91-9876543213', inventory: [], inboundLogs: [], outboundLogs: [], createdAt: '2024-02-01T00:00:00Z', updatedAt: '2025-05-22T00:00:00Z' },
  { id: 'wh-005', warehouseId: 'WH-005', name: 'Pune West Distribution', location: 'MIDC Bhosari, Pune', city: 'Pune', capacity: 20000, currentStock: 12400, usedCapacity: 62.0, manager: 'Suresh Patel', contact: '+91-9876543214', inventory: [], inboundLogs: [], outboundLogs: [], createdAt: '2024-08-05T00:00:00Z', updatedAt: '2025-05-18T00:00:00Z' },
];
const WAREHOUSE_NAMES = WAREHOUSES.map(w => w.name);
const VENDORS = ['TechSupply Corp', 'Global Parts Ltd', 'Industrial Goods Co', 'Prime Materials Inc', 'United Supplies', 'Asia Pacific Trading', 'Euro Imports Ltd', 'Domestic Distributors'];
const CUSTOMERS = ['Reliance Retail', 'Tata Group', 'Adani Logistics', 'Flipkart India', 'Amazon Seller Services', 'BigBasket', 'Future Retail', 'Lifestyle International'];
const CATEGORIES = ['Electronics', 'Garments', 'Food & Beverage', 'Pharma', 'Auto Parts', 'Industrial', 'Consumer Goods', 'Chemicals'];
const PRODUCT_NAMES: Record<string, string[]> = {
  'Electronics': ['Smartphone X1', 'Laptop Pro 15', 'Bluetooth Earbuds', 'USB-C Hub', 'Wireless Charger', 'HDMI Cable 2m', 'SSD 1TB', 'LED Monitor 24"'],
  'Garments': ['Cotton T-Shirt', 'Denim Jeans', 'Winter Jacket', 'Formal Shirt', 'Sports Shoes', 'Casual Sneakers', 'Leather Belt', 'Wool Scarf'],
  'Food & Beverage': ['Organic Rice 5kg', 'Basmati Premium', 'Green Tea Pack', 'Almonds 1kg', 'Olive Oil 1L', 'Protein Bar Box', 'Honey Jar 500g', 'Coffee Beans'],
  'Pharma': ['Paracetamol 500mg', 'Vitamin C Tablets', 'Antibiotic Cream', 'First Aid Kit', 'Multivitamin Pack', 'Bandage Roll', 'Thermometer Digital', 'Mask Box 50'],
  'Auto Parts': ['Engine Oil 5L', 'Brake Pad Set', 'Air Filter', 'Spark Plug Set', 'Battery 12V', 'Wiper Blade', 'Headlight Bulb', 'Oil Filter'],
  'Industrial': ['Steel Rod 12mm', 'PVC Pipe 2m', 'Tool Kit Set', 'Safety Helmet', 'Work Gloves', 'Cable Tie Pack', 'Lubricant Spray', 'Measuring Tape'],
  'Consumer Goods': ['LED Bulb 12W', 'Extension Cord', 'Water Bottle', 'Tupperware Set', 'Toothbrush Pack', 'Soap Bar 6pk', 'Shampoo 500ml', 'Detergent 1kg'],
  'Chemicals': ['Cleaning Solution 5L', 'Industrial Solvent', 'Lab Reagent Kit', 'Disinfectant 10L', 'Paint Thinner', 'Adhesive Glue', 'Coolant 20L', 'Hydraulic Oil'],
};
const UNITS = ['pcs', 'kg', 'L', 'boxes', 'pallets', 'cartons'];
const ZONES = ['A', 'B', 'C', 'D', 'E'];
const AISLES = ['01', '02', '03', '04', '05', '06', '07', '08'];
const RACKS = ['A', 'B', 'C', 'D'];
const SHELVES = ['1', '2', '3', '4'];
const BINS = ['01', '02', '03', '04'];

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: readonly T[] | T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomDate(daysBack: number) { const d = new Date(); d.setDate(d.getDate() - rand(0, daysBack)); d.setHours(rand(0, 23), rand(0, 59)); return d.toISOString(); }
function futureDate(daysAhead: number) { const d = new Date(); d.setDate(d.getDate() + rand(0, daysAhead)); d.setHours(rand(0, 23), rand(0, 59)); return d.toISOString(); }

export function generateWarehouseInventory(): InventoryItem[] {
  const items: InventoryItem[] = [];
  let idx = 0;
  for (const cat of CATEGORIES) {
    const products = PRODUCT_NAMES[cat] || ['Generic Product'];
    for (const product of products.slice(0, 4)) {
      idx++;
      const qty = rand(10, 500);
      items.push({
        id: `inv-${String(idx).padStart(3, '0')}`,
        sku: `SKU-${cat.substring(0, 3).toUpperCase()}-${String(100 + idx)}`,
        productName: product,
        category: cat,
        quantity: qty,
        unit: pick(UNITS),
        location: `${pick(ZONES)}-${pick(AISLES)}-${pick(RACKS)}-${pick(SHELVES)}-${pick(BINS)}`,
        locationId: `loc-${String(rand(1, 50)).padStart(3, '0')}`,
        batchNo: Math.random() > 0.2 ? `BATCH-${String(rand(2025, 2026))}-${String(rand(100, 999))}` : null,
        expiryDate: Math.random() > 0.5 ? futureDate(180) : null,
        lastUpdated: randomDate(7),
      });
    }
  }
  return items;
}

function generateGRNItems(): GRNItem[] {
  const count = rand(3, 8);
  return Array.from({ length: count }, (_, i) => {
    const cat = pick(CATEGORIES);
    const products = PRODUCT_NAMES[cat] || ['Product'];
    const expected = rand(10, 200);
    const received = rand(Math.floor(expected * 0.8), expected);
    const rejected = rand(0, Math.floor(received * 0.05));
    return {
      id: `grni-${String(rand(100, 999))}`,
      sku: `SKU-${cat.substring(0, 3).toUpperCase()}-${String(100 + rand(0, 99))}`,
      productName: pick(products),
      category: cat,
      expectedQuantity: expected,
      receivedQuantity: received,
      acceptedQuantity: received - rejected,
      rejectedQuantity: rejected,
      unit: pick(UNITS),
      batchNo: `BATCH-${String(rand(2025, 2026))}-${String(rand(100, 999))}`,
      expiryDate: Math.random() > 0.4 ? futureDate(200) : null,
      locationId: `loc-${String(rand(1, 50)).padStart(3, '0')}`,
      locationName: `${pick(ZONES)}-${pick(AISLES)}-${pick(RACKS)}-${pick(SHELVES)}-${pick(BINS)}`,
      condition: pick(['Good', 'Good', 'Good', 'Good', 'Damaged', 'Partial'] as const),
    };
  });
}

function generateGDNItems(): GDNItem[] {
  const count = rand(2, 6);
  return Array.from({ length: count }, (_, i) => {
    const cat = pick(CATEGORIES);
    const products = PRODUCT_NAMES[cat] || ['Product'];
    const requested = rand(5, 100);
    const picked = rand(Math.floor(requested * 0.9), requested);
    return {
      id: `gdni-${String(rand(100, 999))}`,
      sku: `SKU-${cat.substring(0, 3).toUpperCase()}-${String(100 + rand(0, 99))}`,
      productName: pick(products),
      category: cat,
      requestedQuantity: requested,
      pickedQuantity: picked,
      packedQuantity: rand(Math.floor(picked * 0.95), picked),
      unit: pick(UNITS),
      batchNo: `BATCH-${String(rand(2025, 2026))}-${String(rand(100, 999))}`,
      locationId: `loc-${String(rand(1, 50)).padStart(3, '0')}`,
      locationName: `${pick(ZONES)}-${pick(AISLES)}-${pick(RACKS)}-${pick(SHELVES)}-${pick(BINS)}`,
    };
  });
}

function generateTimeline(entityId: string, statuses: string[]): WHActivityEvent[] {
  return statuses.map((s, i) => ({
    id: `${entityId}-tl-${i}`,
    type: 'status_change',
    title: s,
    description: `Status changed to ${s}`,
    entityType: 'warehouse',
    entityId,
    userId: 'user-001',
    userName: pick(['Rajesh Kumar', 'Priya Sharma', 'Arjun Singh', 'Deepa Nair', 'Suresh Patel']),
    timestamp: randomDate(Math.max(1, (statuses.length - i) * 2)),
  }));
}

export const mockWarehouses: Warehouse[] = WAREHOUSES.map(w => {
  const inventory = generateWarehouseInventory();
  const totalStock = inventory.reduce((s, i) => s + i.quantity, 0);
  return { ...w, inventory, currentStock: totalStock };
});

export const mockGRNs: GoodsReceivedNote[] = Array.from({ length: 20 }, (_, i) => {
  const items = generateGRNItems();
  const totalQty = items.reduce((s, i) => s + i.receivedQuantity, 0);
  const statuses: GRNStatus[] = ['Draft', 'Expected', 'Received', 'In Inspection', 'Putaway', 'Completed', 'Cancelled'];
  const status = statuses[i % statuses.length];
  return {
    id: `grn-${String(i + 1).padStart(3, '0')}`,
    companyId: pick(COMPANIES),
    grnId: `GRN-2025-${String(1000 + i)}`,
    poReference: `PO-2025-${String(1000 + rand(0, 50))}`,
    vendor: pick(VENDORS),
    vendorContact: `+91-${String(rand(7000000000, 9999999999))}`,
    warehouseId: pick(mockWarehouses).id,
    warehouseName: pick(WAREHOUSE_NAMES),
    dock: `Dock-${pick(['A', 'B', 'C'])}-${rand(1, 5)}`,
    receivedDate: status === 'Completed' || status === 'Putaway' || status === 'Received' ? randomDate(7) : futureDate(3),
    items,
    totalItems: items.length,
    totalQuantity: totalQty,
    status,
    receivedBy: pick(['Rajesh Kumar', 'Priya Sharma', 'Arjun Singh', 'Deepa Nair']),
    approvedBy: Math.random() > 0.4 ? pick(['Amit Verma', 'Sunita Rao', 'Mohammed Khan']) : null,
    notes: pick(['Regular stock replenishment', 'Urgent PO - Expedite', 'Vendor direct shipment', 'Consignment stock']),
    timeline: generateTimeline(`grn-${String(i + 1).padStart(3, '0')}`, ['Draft', 'Expected', 'Received', status]),
    createdAt: randomDate(30),
    updatedAt: randomDate(7),
  };
});

export const mockGDNs: GoodsDispatchNote[] = Array.from({ length: 20 }, (_, i) => {
  const items = generateGDNItems();
  const totalQty = items.reduce((s, i) => s + i.requestedQuantity, 0);
  const statuses: GDNStatus[] = ['Draft', 'Picking', 'Packed', 'Loading', 'Dispatched', 'Delivered', 'Cancelled'];
  const status = statuses[i % statuses.length];
  return {
    id: `gdn-${String(i + 1).padStart(3, '0')}`,
    companyId: pick(COMPANIES),
    gdnId: `GDN-2025-${String(1000 + i)}`,
    orderRef: `ORD-2025-${String(1000 + rand(0, 50))}`,
    customer: pick(CUSTOMERS),
    customerContact: `+91-${String(rand(7000000000, 9999999999))}`,
    warehouseId: pick(mockWarehouses).id,
    warehouseName: pick(WAREHOUSE_NAMES),
    dock: `Dock-${pick(['A', 'B', 'C'])}-${rand(1, 5)}`,
    dispatchDate: status === 'Dispatched' || status === 'Delivered' ? randomDate(5) : futureDate(3),
    items,
    totalItems: items.length,
    totalQuantity: totalQty,
    status,
    pickedBy: status !== 'Draft' ? pick(['Rajesh Kumar', 'Priya Sharma', 'Arjun Singh']) : null,
    packedBy: status === 'Packed' || status === 'Loading' || status === 'Dispatched' || status === 'Delivered' ? pick(['Suresh Patel', 'Deepa Nair']) : null,
    checkedBy: status === 'Dispatched' || status === 'Delivered' ? pick(['Amit Verma', 'Sunita Rao']) : null,
    vehicleNo: status === 'Dispatched' || status === 'Delivered' ? `MH-${String(rand(10, 99))}-${String(pick(['AB', 'CD', 'EF', 'GH']))}-${String(rand(1000, 9999))}` : '',
    driverName: status === 'Dispatched' || status === 'Delivered' ? pick(['Manoj Singh', 'Vijay Kumar', 'Ramesh Gupta', 'Dinesh Yadav']) : '',
    driverContact: `+91-${String(rand(7000000000, 9999999999))}`,
    notes: pick(['Customer pickup', 'Express delivery', 'Scheduled dispatch', 'Route optimization']),
    timeline: generateTimeline(`gdn-${String(i + 1).padStart(3, '0')}`, ['Draft', 'Picking', status]),
    createdAt: randomDate(20),
    updatedAt: randomDate(5),
  };
});

// Generate warehouse inventory for all warehouses
export const mockWarehouseInventory: InventoryItem[] = generateWarehouseInventory();

export const mockWarehouseLocations: WarehouseLocation[] = Array.from({ length: 50 }, (_, i) => {
  const zone = pick(ZONES);
  const aisle = pick(AISLES);
  const rack = pick(RACKS);
  const shelf = pick(SHELVES);
  const bin = pick(BINS);
  const isOccupied = i < 35;
  return {
    id: `loc-${String(i + 1).padStart(3, '0')}`,
    companyId: pick(COMPANIES),
    locationId: `${zone}-${aisle}-${rack}-${shelf}-${bin}`,
    zone,
    aisle,
    rack,
    shelf,
    bin,
    barcode: `BC-${String(10000 + i)}`,
    type: pick(['Pallet', 'Case', 'Bulk', 'Overflow', 'Reefer'] as const),
    capacity: rand(10, 100),
    usedCapacity: isOccupied ? rand(5, 100) : 0,
    status: isOccupied ? 'Occupied' : pick(['Available', 'Reserved', 'Maintenance'] as const),
    currentSku: isOccupied ? `SKU-${pick(CATEGORIES).substring(0, 3).toUpperCase()}-${String(100 + rand(0, 99))}` : null,
    currentProduct: isOccupied ? pick(['Smartphone X1', 'Laptop Pro', 'Cotton T-Shirt', 'Organic Rice', 'Engine Oil', 'LED Bulb']) : null,
    lastUpdated: randomDate(14),
    createdAt: randomDate(180),
    updatedAt: randomDate(7),
  };
});

export const mockDamageReports: DamageReport[] = Array.from({ length: 12 }, (_, i) => {
  const cat = pick(CATEGORIES);
  const products = PRODUCT_NAMES[cat] || ['Product'];
  const severities = ['Minor', 'Moderate', 'Severe', 'Critical'] as const;
  const statuses = ['Reported', 'Inspected', 'Approved', 'Rejected', 'Disposed', 'Compensated'] as const;
  const severity = severities[i % 4];
  const status = statuses[i % 6];
  return {
    id: `dmr-${String(i + 1).padStart(3, '0')}`,
    companyId: pick(COMPANIES),
    damageId: `DMR-${String(2025)}-${String(100 + i)}`,
    sku: `SKU-${cat.substring(0, 3).toUpperCase()}-${String(100 + rand(0, 99))}`,
    productName: pick(products),
    category: cat,
    quantity: rand(1, 25),
    unit: pick(UNITS),
    location: `${pick(ZONES)}-${pick(AISLES)}-${pick(RACKS)}-${pick(SHELVES)}-${pick(BINS)}`,
    locationId: `loc-${String(rand(1, 50)).padStart(3, '0')}`,
    warehouseId: pick(mockWarehouses).id,
    warehouseName: pick(WAREHOUSE_NAMES),
    severity,
    status,
    description: pick(['Product damaged during transit', 'Packaging crushed', 'Water damage detected', 'Forklift mishandling', 'Shelf collapse', 'Temperature damage']),
    cause: pick(['Transit', 'Handling', 'Storage', 'Equipment', 'Natural', 'Unknown']),
    reportedBy: pick(['Rajesh Kumar', 'Priya Sharma', 'Arjun Singh', 'Deepa Nair']),
    reportedDate: randomDate(14),
    inspectedBy: status !== 'Reported' ? pick(['Amit Verma', 'Sunita Rao', 'Mohammed Khan']) : null,
    inspectedDate: status !== 'Reported' ? randomDate(10) : null,
    approvedBy: status === 'Approved' || status === 'Compensated' ? pick(['Vikram Singh', 'Ananya Gupta']) : null,
    approvedDate: status === 'Approved' || status === 'Compensated' ? randomDate(5) : null,
    images: Math.random() > 0.5 ? [`/damage/dmr-${i}-01.jpg`, `/damage/dmr-${i}-02.jpg`] : [],
    linkedGRN: Math.random() > 0.6 ? `GRN-2025-${String(1000 + rand(0, 19))}` : null,
    linkedGDN: Math.random() > 0.7 ? `GDN-2025-${String(1000 + rand(0, 19))}` : null,
    disposition: pick(['Return to vendor', 'Insurance claim', 'Write off', 'Discount sale', 'Recycle']),
    notes: pick(['Immediate action required', 'Pending insurance assessment', 'Awaiting vendor response', 'Approved for disposal']),
    timeline: generateTimeline(`dmr-${String(i + 1).padStart(3, '0')}`, ['Reported', status]),
    createdAt: randomDate(20),
    updatedAt: randomDate(5),
  };
});

export const mockStockMovements: StockMovement[] = Array.from({ length: 30 }, (_, i) => ({
  id: `sm-${String(i + 1).padStart(3, '0')}`,
  companyId: pick(COMPANIES),
  sku: `SKU-${pick(CATEGORIES).substring(0, 3).toUpperCase()}-${String(100 + rand(0, 99))}`,
  productName: pick(['Smartphone X1', 'Laptop Pro', 'Cotton T-Shirt', 'Organic Rice', 'Engine Oil', 'LED Bulb']),
  type: pick(['Inbound', 'Outbound', 'Transfer', 'Adjustment', 'Damage'] as const),
  quantity: rand(1, 100),
  fromLocation: `${pick(ZONES)}-${pick(AISLES)}-${pick(RACKS)}-${pick(SHELVES)}-${pick(BINS)}`,
  toLocation: `${pick(ZONES)}-${pick(AISLES)}-${pick(RACKS)}-${pick(SHELVES)}-${pick(BINS)}`,
  referenceId: `REF-${String(1000 + i)}`,
  referenceType: pick(['GRN', 'GDN', 'Transfer', 'Adjustment', 'Damage']),
  userId: 'user-001',
  userName: pick(['Rajesh Kumar', 'Priya Sharma', 'Arjun Singh']),
  timestamp: randomDate(14),
  notes: pick(['Stock replenishment', 'Order fulfillment', 'Bin transfer', 'Inventory adjustment', 'Damage write-off']),
}));

export const mockWHNotifications: WarehouseNotification[] = [
  { id: 'whn-001', companyId: 'cmp-001', type: 'Stock Alert', severity: 'Warning', title: 'Low Stock Alert', message: 'SKU-ELC-101 (Smartphone X1) is below minimum threshold - only 12 units remaining', module: 'Stock', referenceId: 'inv-001', timestamp: randomDate(1), read: false, actionUrl: '/agent/warehouse/stock', createdAt: randomDate(2) },
  { id: 'whn-002', companyId: 'cmp-001', type: 'GRN Alert', severity: 'Info', title: 'GRN Expected', message: 'GRN-2025-1025 expected from TechSupply Corp - 45 items due today', module: 'Inbound', referenceId: 'grn-005', timestamp: randomDate(1), read: false, actionUrl: '/agent/warehouse/inbound', createdAt: randomDate(3) },
  { id: 'whn-003', companyId: 'cmp-001', type: 'Delayed Dispatch', severity: 'Warning', title: 'Dispatch Delayed', message: 'GDN-2025-1032 for Reliance Retail delayed - Picking in progress', module: 'Outbound', referenceId: 'gdn-012', timestamp: randomDate(1), read: true, actionUrl: '/agent/warehouse/outbound', createdAt: randomDate(4) },
  { id: 'whn-004', companyId: 'cmp-001', type: 'Damage Alert', severity: 'Critical', title: 'Critical Damage Reported', message: 'DMR-2025-102 - Water damage to 15 units of Electronics in Zone C', module: 'Damage', referenceId: 'dmr-002', timestamp: randomDate(1), read: false, actionUrl: '/agent/warehouse/damage', createdAt: randomDate(2) },
  { id: 'whn-005', companyId: 'cmp-001', type: 'Shipment Alert', severity: 'Info', title: 'Shipment Pickup Scheduled', message: 'Shipment SHP-2025-4521 assigned for warehouse pickup in 2 hours', module: 'Shipments', referenceId: 'shp-4521', timestamp: randomDate(1), read: false, actionUrl: '/agent/shipments', createdAt: randomDate(3) },
  { id: 'whn-006', companyId: 'cmp-001', type: 'Stock Alert', severity: 'Info', title: 'Stock Count Complete', message: 'Monthly inventory count completed - variance 0.3% within acceptable range', module: 'Stock', referenceId: null, timestamp: randomDate(2), read: true, actionUrl: null, createdAt: randomDate(5) },
  { id: 'whn-007', companyId: 'cmp-001', type: 'GRN Alert', severity: 'Warning', title: 'GRN Overdue', message: 'GRN-2025-1018 for Global Parts Ltd is 2 days overdue', module: 'Inbound', referenceId: 'grn-008', timestamp: randomDate(2), read: false, actionUrl: '/agent/warehouse/inbound', createdAt: randomDate(6) },
  { id: 'whn-008', companyId: 'cmp-001', type: 'Assignment', severity: 'Info', title: 'New Assignment', message: 'You have been assigned to inspect damaged goods in Zone D', module: 'Damage', referenceId: 'dmr-005', timestamp: randomDate(1), read: false, actionUrl: '/agent/warehouse/damage', createdAt: randomDate(2) },
  { id: 'whn-009', companyId: 'cmp-001', type: 'System', severity: 'Info', title: 'System Maintenance', message: 'WMS scheduled maintenance at 02:00 AM - 10 min downtime expected', module: 'System', referenceId: null, timestamp: randomDate(3), read: true, actionUrl: null, createdAt: randomDate(7) },
  { id: 'whn-010', companyId: 'cmp-001', type: 'GDN Alert', severity: 'Info', title: 'GDN Ready for Dispatch', message: 'GDN-2025-1045 packed and ready for dispatch - vehicle assigned', module: 'Outbound', referenceId: 'gdn-015', timestamp: randomDate(1), read: false, actionUrl: '/agent/warehouse/outbound', createdAt: randomDate(2) },
];

export const mockWHDashboardStats: WarehouseDashboardStats = {
  grnsToday: 8,
  pendingOutbound: 12,
  inventoryValue: rand(50000000, 200000000),
  stockAlerts: 4,
  damagedGoods: 3,
  activeShipments: 24,
  spaceUtilization: 68.4,
  delayedDispatches: 2,
  inboundToday: 6,
  outboundToday: 9,
  totalSKUs: mockWarehouseInventory.length,
  totalLocations: mockWarehouseLocations.length,
  occupiedLocations: mockWarehouseLocations.filter(l => l.status === 'Occupied').length,
  pendingInspections: 3,
  weeklyInbound: [45, 52, 38, 61, 48, 55, 42],
  weeklyOutbound: [38, 44, 35, 52, 41, 48, 36],
  lowStockItems: mockWarehouseInventory.filter(i => i.quantity < 20).length,
  pendingGRNs: mockGRNs.filter(g => g.status === 'Expected' || g.status === 'Draft' || g.status === 'Received').length,
  pendingGDNs: mockGDNs.filter(g => g.status === 'Draft' || g.status === 'Picking' || g.status === 'Packed').length,
};

export function getWarehouseCompanies() { return [...COMPANIES]; }
export function getWarehouseNames() { return [...WAREHOUSE_NAMES]; }
export function getVendors() { return [...VENDORS]; }
export function getCustomers() { return [...CUSTOMERS]; }
export function getCategories() { return [...CATEGORIES]; }

export const WH_GRN_STATUSES = ['Draft', 'Expected', 'Received', 'In Inspection', 'Putaway', 'Completed', 'Cancelled'] as const;
export const WH_GDN_STATUSES = ['Draft', 'Picking', 'Packed', 'Loading', 'Dispatched', 'Delivered', 'Cancelled'] as const;
export const WH_DAMAGE_STATUSES = ['Reported', 'Inspected', 'Approved', 'Rejected', 'Disposed', 'Compensated'] as const;
export const WH_DAMAGE_SEVERITIES = ['Minor', 'Moderate', 'Severe', 'Critical'] as const;

'use client';

import { ReactNode } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bell,
  Boxes,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  FileText,
  Fuel,
  Gauge,
  IndianRupee,
  MapPinned,
  PackageCheck,
  PackagePlus,
  ReceiptText,
  Route,
  Settings,
  ShieldCheck,
  Truck,
  Users,
  Warehouse,
  Wrench,
} from 'lucide-react';
import {
  mockCargo,
  mockCustomers,
  mockDrivers,
  mockInvoices,
  mockNotifications,
  mockOrders,
  mockShipments,
  mockUsers,
  mockVehicles,
  mockWarehouses,
} from '@/data/mockData';

type CompanyPageKey =
  | 'bookings'
  | 'bookingRequests'
  | 'rateCards'
  | 'spotRates'
  | 'contractRates'
  | 'shipments'
  | 'orders'
  | 'bol'
  | 'containerTracking'
  | 'liveMap'
  | 'slaAlerts'
  | 'documents'
  | 'documentsBol'
  | 'documentsPackingLists'
  | 'documentsCommercialInvoices'
  | 'documentsCoo'
  | 'documentsInsurance'
  | 'documentsPod'
  | 'customs'
  | 'hsCodes'
  | 'licenses'
  | 'dangerousGoods'
  | 'dispatch'
  | 'drivers'
  | 'driverDocuments'
  | 'fleet'
  | 'vehicleDocuments'
  | 'fleetLiveMap'
  | 'trips'
  | 'maintenance'
  | 'fuel'
  | 'warehouseInbound'
  | 'warehouseOutbound'
  | 'warehouseStock'
  | 'warehouseLocations'
  | 'cycleCount'
  | 'damage'
  | 'coldChain'
  | 'inventory'
  | 'customers'
  | 'agents'
  | 'invoices'
  | 'payments'
  | 'expenses'
  | 'reconciliation'
  | 'shipmentReports'
  | 'revenueReports'
  | 'performanceReports'
  | 'carrierPerformance'
  | 'warehouseReports'
  | 'users'
  | 'roles'
  | 'notifications'
  | 'settings';

type CellValue = string | number;

interface CompanyRow {
  id: string;
  [key: string]: CellValue;
}

interface CompanyBooking {
  id: string;
  customer: string;
  mode: string;
  route: string;
  carrier: string;
  status: string;
  date: string;
  price: number;
}

interface CompanyRate {
  id: string;
  lane: string;
  carrier: string;
  mode: string;
  baseRate: number;
  transit: string;
  status: string;
}

const COMPANY_ID = 'cmp-001';

const companyBookings: CompanyBooking[] = [
  { id: 'BKG-2025-001', customer: 'Tech Solutions Pvt Ltd', mode: 'Road', route: 'Bangalore to Mumbai', carrier: 'BlueDart Freight', status: 'Confirmed', date: '2025-01-08', price: 48500 },
  { id: 'BKG-2025-002', customer: 'Global Traders', mode: 'Sea', route: 'Mumbai Port to Singapore', carrier: 'Maersk India', status: 'Pending', date: '2025-01-10', price: 168000 },
  { id: 'BKG-2025-003', customer: 'Pharma Industries Ltd', mode: 'Air', route: 'Hyderabad to Dubai', carrier: 'Emirates SkyCargo', status: 'In Transit', date: '2025-01-12', price: 124000 },
  { id: 'BKG-2025-004', customer: 'Metro Supplies', mode: 'Road', route: 'Delhi to Jaipur', carrier: 'VRL Logistics', status: 'Delivered', date: '2025-01-13', price: 32000 },
  { id: 'BKG-2025-005', customer: 'Elite Electronics', mode: 'Rail', route: 'Chennai to Kolkata', carrier: 'Container Rail', status: 'Pending', date: '2025-01-14', price: 76000 },
  { id: 'BKG-2025-006', customer: 'Sunrise Industries', mode: 'Road', route: 'Pune to Ahmedabad', carrier: 'Gati Express', status: 'Confirmed', date: '2025-01-15', price: 39500 },
];

const companyRates: CompanyRate[] = [
  { id: 'RATE-001', lane: 'Bangalore to Mumbai', carrier: 'BlueDart Freight', mode: 'Road', baseRate: 42, transit: '2 days', status: 'Active' },
  { id: 'RATE-002', lane: 'Mumbai Port to Singapore', carrier: 'Maersk India', mode: 'Sea', baseRate: 118, transit: '15 days', status: 'Active' },
  { id: 'RATE-003', lane: 'Hyderabad to Dubai', carrier: 'Emirates SkyCargo', mode: 'Air', baseRate: 310, transit: '1 day', status: 'Active' },
  { id: 'RATE-004', lane: 'Delhi to Jaipur', carrier: 'VRL Logistics', mode: 'Road', baseRate: 28, transit: '1 day', status: 'Active' },
  { id: 'RATE-005', lane: 'Chennai to Kolkata', carrier: 'Container Rail', mode: 'Rail', baseRate: 54, transit: '4 days', status: 'Inactive' },
];

const expenses = [
  { id: 'EXP-001', category: 'Fuel', vendor: 'Mumbai Fuel Station', amount: 7200, status: 'Paid', date: '2025-01-14' },
  { id: 'EXP-002', category: 'Maintenance', vendor: 'TireFix Center', amount: 12000, status: 'Paid', date: '2025-01-10' },
  { id: 'EXP-003', category: 'Port Charges', vendor: 'Mumbai Port Trust', amount: 28500, status: 'Unpaid', date: '2025-01-13' },
  { id: 'EXP-004', category: 'Warehouse Handling', vendor: 'Bangalore Tech Park Warehouse', amount: 16200, status: 'Paid', date: '2025-01-12' },
  { id: 'EXP-005', category: 'Insurance', vendor: 'Global Insurance Corp', amount: 18500, status: 'Unpaid', date: '2025-01-15' },
];

const damageRecords = [
  { id: 'DMG-001', item: 'Electronics Box', warehouse: 'Mumbai Central Hub', quantity: 8, status: 'Inspection', value: 48000 },
  { id: 'DMG-002', item: 'Pharmaceutical Kit', warehouse: 'Hyderabad Logistics Hub', quantity: 3, status: 'Claim Filed', value: 22500 },
  { id: 'DMG-003', item: 'Apparel Bundle', warehouse: 'Delhi Distribution Center', quantity: 12, status: 'Resolved', value: 18000 },
  { id: 'DMG-004', item: 'Auto Parts', warehouse: 'Indore Regional Center', quantity: 5, status: 'Inspection', value: 35500 },
  { id: 'DMG-005', item: 'Server Equipment', warehouse: 'Bangalore Tech Park Warehouse', quantity: 2, status: 'Claim Filed', value: 120000 },
];

const roleRows = [
  { id: 'CompanyAdmin', users: 1, scope: 'Company-wide', permissions: 'Full company operations, users, finance and settings' },
  { id: 'Manager', users: 1, scope: 'Organization', permissions: 'Shipments, fleet, warehouse and reports' },
  { id: 'Dispatcher', users: 1, scope: 'Operations', permissions: 'Dispatch, drivers, fleet and tracking' },
  { id: 'Operator', users: 1, scope: 'Operations', permissions: 'Shipments, dispatch and fleet operations' },
  { id: 'Agent', users: 3, scope: 'Functional', permissions: 'Warehouse, driver or finance execution' },
  { id: 'Staff', users: 2, scope: 'Support', permissions: 'Shipments, customers, documents and reports' },
];

const formatDate = (value: string) => new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
}).format(new Date(value));

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(value);

const routeFromShipment = (pickup: string, delivery: string) => {
  const from = pickup.split(',').at(-1)?.trim() ?? pickup;
  const to = delivery.split(',').at(-1)?.trim() ?? delivery;
  return `${from} to ${to}`;
};

const toRows = <T,>(items: T[], mapper: (item: T) => CompanyRow) => items.map(mapper);

const textColumns = (keys: Array<[keyof CompanyRow & string, string]>): Column<CompanyRow>[] =>
  keys.map(([key, header]) => ({ key, header, sortable: true }));

const statusColumn: Column<CompanyRow> = {
  key: 'status',
  header: 'Status',
  sortable: true,
  render: (item) => <StatusBadge status={String(item.status)} />,
};

const modeColumn: Column<CompanyRow> = {
  key: 'mode',
  header: 'Mode',
  sortable: true,
  render: (item) => <Badge variant="outline">{item.mode}</Badge>,
};

function DataCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="border-border/60 bg-card shadow-soft">
      <CardHeader className="border-b border-border/50 pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}

function PageTable({ title, rows, columns }: { title: string; rows: CompanyRow[]; columns: Column<CompanyRow>[] }) {
  return (
    <PageWrapper title={title}>
      <DataCard title={title}>
        <DataTable data={rows} columns={columns} pageSize={10} searchKey="id" searchPlaceholder={`Search ${title.toLowerCase()}...`} />
      </DataCard>
    </PageWrapper>
  );
}

export function CompanyDashboardPage() {
  const activeShipments = mockShipments.filter(s => !['Delivered', 'Cancelled', 'Failed'].includes(s.status)).length;
  const pendingInvoices = mockInvoices.filter(i => i.status === 'Unpaid' || i.status === 'Overdue').length;
  const fleetOnRoad = mockVehicles.filter(v => v.status === 'On Route').length;
  const warehouseCapacity = mockWarehouses.reduce((sum, warehouse) => sum + warehouse.capacity, 0);
  const warehouseStock = mockWarehouses.reduce((sum, warehouse) => sum + warehouse.currentStock, 0);
  const warehouseUtilization = warehouseCapacity > 0 ? Math.round((warehouseStock / warehouseCapacity) * 100) : 0;
  const bookingsThisMonth = companyBookings.filter(booking => booking.date.startsWith('2025-01')).length;

  const shipmentRows = toRows(mockShipments.slice(0, 5), shipment => ({
    id: shipment.trackingNumber,
    route: routeFromShipment(shipment.pickupAddress, shipment.deliveryAddress),
    status: shipment.status,
    eta: formatDate(shipment.estimatedDelivery),
  }));
  const bookingRows = toRows(companyBookings.slice(0, 5), booking => ({
    id: booking.id,
    customer: booking.customer,
    mode: booking.mode,
    status: booking.status,
  }));

  return (
    <PageWrapper title="Company Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        <KPICard title="Active Shipments" value={activeShipments} icon={<Truck className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Pending Invoices" value={pendingInvoices} icon={<ReceiptText className="w-5 h-5" />} iconColor="amber" />
        <KPICard title="Fleet On-Road" value={fleetOnRoad} icon={<Route className="w-5 h-5" />} iconColor="teal" />
        <KPICard title="Warehouse Utilization %" value={`${warehouseUtilization}%`} icon={<Warehouse className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Bookings This Month" value={bookingsThisMonth} icon={<PackagePlus className="w-5 h-5" />} iconColor="green" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DataCard title="Recent Shipments">
          <DataTable
            data={shipmentRows}
            columns={[
              { key: 'id', header: 'ID' },
              { key: 'route', header: 'Route' },
              statusColumn,
              { key: 'eta', header: 'ETA' },
            ]}
            pageSize={5}
          />
        </DataCard>
        <DataCard title="Recent Bookings">
          <DataTable
            data={bookingRows}
            columns={[
              { key: 'id', header: 'ID' },
              { key: 'customer', header: 'Customer' },
              modeColumn,
              statusColumn,
            ]}
            pageSize={5}
          />
        </DataCard>
      </div>
    </PageWrapper>
  );
}

export function NewBookingPage() {
  return (
    <PageWrapper title="New Booking">
      <Card className="max-w-4xl border-border/60 bg-card shadow-soft">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-base">Shipment Booking Form</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              ['Carrier', 'BlueDart Freight'],
              ['Mode', 'Road Freight'],
              ['Origin', 'Bangalore Regional Office'],
              ['Destination', 'Mumbai Distribution Centre'],
              ['Pickup Date', '2025-01-18'],
              ['Cargo Type', 'Electronics'],
            ].map(([label, value]) => (
              <label key={label} className="space-y-2 text-sm font-medium text-foreground">
                <span>{label}</span>
                <input value={value} readOnly className="w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground" />
              </label>
            ))}
            <div className="md:col-span-2 flex justify-end gap-3 border-t border-border pt-5">
              <Button type="button" variant="outline">Save Draft</Button>
              <Button type="button">Create Booking</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

export function CompanyDataPage({ pageKey, title }: { pageKey: CompanyPageKey; title: string }) {
  const shipmentRows = toRows(mockShipments, shipment => ({
    id: shipment.trackingNumber,
    route: routeFromShipment(shipment.pickupAddress, shipment.deliveryAddress),
    service: shipment.serviceType,
    status: shipment.status,
    eta: formatDate(shipment.estimatedDelivery),
  }));
  const orderRows = toRows(mockOrders, order => ({
    id: order.orderId,
    customer: order.customerName,
    amount: formatCurrency(order.totalAmount),
    payment: order.paymentStatus,
    status: order.status,
  }));
  const cargoRows = toRows(mockCargo.filter(cargo => cargo.companyId === COMPANY_ID), cargo => ({
    id: cargo.cargoNumber,
    customer: cargo.consignee.name,
    mode: cargo.transportMode,
    status: cargo.status,
    value: formatCurrency(cargo.insuranceAmount),
  }));
  const vehicleRows = toRows(mockVehicles.filter(vehicle => vehicle.companyId === COMPANY_ID), vehicle => ({
    id: vehicle.registrationNumber,
    model: `${vehicle.make} ${vehicle.model}`,
    driver: vehicle.currentDriver ?? 'Unassigned',
    capacity: `${vehicle.capacity} ${vehicle.capacityUnit}`,
    status: vehicle.status,
  }));
  const driverRows = toRows(mockDrivers, driver => ({
    id: driver.driverId,
    name: driver.name,
    phone: driver.phone,
    vehicle: driver.vehicleAssigned ?? 'Unassigned',
    trips: driver.totalTrips,
    status: driver.status,
  }));
  const warehouseRows = toRows(mockWarehouses, warehouse => ({
    id: warehouse.warehouseId,
    name: warehouse.name,
    city: warehouse.city,
    manager: warehouse.manager,
    utilization: `${Math.round((warehouse.currentStock / warehouse.capacity) * 100)}%`,
  }));
  const inventoryRows = toRows(mockWarehouses.flatMap(warehouse => warehouse.inventory.map(item => ({ ...item, warehouse: warehouse.name }))), item => ({
    id: item.sku,
    product: item.productName,
    category: item.category,
    warehouse: item.warehouse,
    quantity: item.quantity,
    location: item.location,
  }));
  const invoiceRows = toRows(mockInvoices, invoice => ({
    id: invoice.invoiceId,
    customer: invoice.customerName,
    amount: formatCurrency(invoice.amount),
    due: formatDate(invoice.dueDate),
    status: invoice.status,
  }));
  const userRows = toRows(mockUsers.filter(user => user.companyId === COMPANY_ID), user => ({
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    status: user.status,
  }));

  const tables: Record<CompanyPageKey, { rows: CompanyRow[]; columns: Column<CompanyRow>[] }> = {
    bookings: {
      rows: toRows(companyBookings, booking => ({ id: booking.id, customer: booking.customer, route: booking.route, carrier: booking.carrier, mode: booking.mode, price: formatCurrency(booking.price), status: booking.status })),
      columns: [...textColumns([['id', 'Booking ID'], ['customer', 'Customer'], ['route', 'Route'], ['carrier', 'Carrier']]), modeColumn, { key: 'price', header: 'Price' }, statusColumn],
    },
    bookingRequests: {
      rows: toRows(companyBookings.filter(booking => booking.status === 'Pending'), booking => ({ id: booking.id, customer: booking.customer, route: booking.route, mode: booking.mode, date: formatDate(booking.date), status: booking.status })),
      columns: [...textColumns([['id', 'Request ID'], ['customer', 'Customer'], ['route', 'Route']]), modeColumn, { key: 'date', header: 'Date' }, statusColumn],
    },
    rateCards: {
      rows: toRows(companyRates, rate => ({ id: rate.id, lane: rate.lane, carrier: rate.carrier, mode: rate.mode, baseRate: `${formatCurrency(rate.baseRate)}/kg`, transit: rate.transit, status: rate.status })),
      columns: [...textColumns([['id', 'Rate ID'], ['lane', 'Lane'], ['carrier', 'Carrier']]), modeColumn, { key: 'baseRate', header: 'Base Rate' }, { key: 'transit', header: 'Transit' }, statusColumn],
    },
    spotRates: {
      rows: toRows(companyBookings.filter(booking => booking.status === 'Pending'), booking => ({ id: `SPOT-${booking.id.slice(-3)}`, customer: booking.customer, route: booking.route, mode: booking.mode, target: formatCurrency(Math.round(booking.price * 0.94)), status: 'Pending' })),
      columns: [...textColumns([['id', 'Request ID'], ['customer', 'Customer'], ['route', 'Route']]), modeColumn, { key: 'target', header: 'Target Rate' }, statusColumn],
    },
    contractRates: {
      rows: toRows(companyRates, rate => ({ id: `CTR-${rate.id.slice(-3)}`, carrier: rate.carrier, lane: rate.lane, mode: rate.mode, rate: `${formatCurrency(rate.baseRate * 0.88)}/kg`, status: rate.status })),
      columns: [...textColumns([['id', 'Contract ID'], ['carrier', 'Carrier'], ['lane', 'Lane']]), modeColumn, { key: 'rate', header: 'Contract Rate' }, statusColumn],
    },
    shipments: { rows: shipmentRows, columns: [...textColumns([['id', 'Tracking ID'], ['route', 'Route'], ['service', 'Service']]), statusColumn, { key: 'eta', header: 'ETA' }] },
    orders: { rows: orderRows, columns: [...textColumns([['id', 'Order ID'], ['customer', 'Customer'], ['amount', 'Amount'], ['payment', 'Payment']]), statusColumn] },
    bol: { rows: cargoRows.map(row => ({ ...row, bol: `BOL-${row.id}` })), columns: [...textColumns([['bol', 'BOL'], ['id', 'Cargo'], ['customer', 'Consignee']]), modeColumn, statusColumn] },
    containerTracking: { rows: cargoRows.map(row => ({ ...row, container: `CONT-${row.id.toString().slice(-3)}-${row.mode}` })), columns: [...textColumns([['container', 'Container'], ['id', 'Cargo'], ['customer', 'Consignee']]), modeColumn, statusColumn] },
    liveMap: { rows: vehicleRows.map(row => ({ ...row, location: row.id.toString().startsWith('MH') ? 'Mumbai Corridor' : 'North Region' })), columns: [...textColumns([['id', 'Vehicle'], ['model', 'Model'], ['driver', 'Driver'], ['location', 'Location']]), statusColumn] },
    slaAlerts: { rows: shipmentRows.filter(row => ['Pending', 'Failed', 'Cancelled'].includes(String(row.status))).slice(0, 12), columns: [...textColumns([['id', 'Shipment'], ['route', 'Route'], ['eta', 'ETA']]), statusColumn] },
    documents: { rows: cargoRows.map(row => ({ ...row, document: `DOC-${row.id}`, type: 'Shipment File' })), columns: textColumns([['document', 'Document'], ['type', 'Type'], ['id', 'Cargo'], ['customer', 'Party'], ['status', 'Status']]) },
    documentsBol: { rows: cargoRows.map(row => ({ ...row, document: `BOL-${row.id}`, type: 'Bill of Lading' })), columns: textColumns([['document', 'BOL'], ['id', 'Cargo'], ['customer', 'Consignee'], ['status', 'Status']]) },
    documentsPackingLists: { rows: cargoRows.map(row => ({ ...row, document: `PKL-${row.id}`, packages: 250 })), columns: textColumns([['document', 'Packing List'], ['id', 'Cargo'], ['customer', 'Consignee'], ['packages', 'Packages']]) },
    documentsCommercialInvoices: { rows: invoiceRows.slice(0, 12), columns: textColumns([['id', 'Invoice'], ['customer', 'Customer'], ['amount', 'Amount'], ['due', 'Due'], ['status', 'Status']]) },
    documentsCoo: { rows: cargoRows.map(row => ({ ...row, document: `COO-${row.id}`, origin: 'India' })), columns: textColumns([['document', 'Certificate'], ['id', 'Cargo'], ['origin', 'Origin'], ['customer', 'Consignee']]) },
    documentsInsurance: { rows: cargoRows.map(row => ({ ...row, document: `INS-${row.id}` })), columns: textColumns([['document', 'Policy'], ['id', 'Cargo'], ['customer', 'Insured Party'], ['value', 'Insured Value']]) },
    documentsPod: { rows: shipmentRows.filter(row => row.status === 'Delivered').slice(0, 12), columns: textColumns([['id', 'Shipment'], ['route', 'Route'], ['eta', 'Delivered On'], ['status', 'POD Status']]) },
    customs: { rows: cargoRows.map(row => ({ ...row, declaration: `CUS-${row.id}` })), columns: [...textColumns([['declaration', 'Declaration'], ['id', 'Cargo'], ['customer', 'Consignee']]), modeColumn, statusColumn] },
    hsCodes: { rows: toRows(mockCargo.flatMap(cargo => cargo.contents), item => ({ id: item.hsCode, description: item.description, quantity: item.quantity, value: formatCurrency(item.estimatedValue), hazmat: item.hazmatClass ?? 'None' })), columns: textColumns([['id', 'HS Code'], ['description', 'Description'], ['quantity', 'Qty'], ['value', 'Value'], ['hazmat', 'DG Class']]) },
    licenses: { rows: cargoRows.map(row => ({ id: `LIC-${row.id}`, cargo: row.id, type: 'Import/Export', authority: 'DGFT India', status: 'Active' })), columns: textColumns([['id', 'License'], ['cargo', 'Cargo'], ['type', 'Type'], ['authority', 'Authority'], ['status', 'Status']]) },
    dangerousGoods: { rows: toRows(mockCargo.flatMap(cargo => cargo.contents).filter(item => item.hazmatClass || item.weight > 4000), item => ({ id: item.id, item: item.description, hsCode: item.hsCode, class: item.hazmatClass ?? 'General Heavy Cargo', weight: `${item.weight} kg` })), columns: textColumns([['id', 'Item ID'], ['item', 'Item'], ['hsCode', 'HS Code'], ['class', 'Class'], ['weight', 'Weight']]) },
    dispatch: { rows: driverRows.slice(0, 15).map((row, index) => ({ ...row, vehicle: vehicleRows[index % vehicleRows.length]?.id ?? row.vehicle })), columns: [...textColumns([['id', 'Driver ID'], ['name', 'Driver'], ['vehicle', 'Vehicle'], ['trips', 'Trips']]), statusColumn] },
    drivers: { rows: driverRows, columns: [...textColumns([['id', 'Driver ID'], ['name', 'Name'], ['phone', 'Phone'], ['vehicle', 'Vehicle'], ['trips', 'Trips']]), statusColumn] },
    driverDocuments: { rows: toRows(mockDrivers.flatMap(driver => driver.documents.map(document => ({ driver, document }))), item => ({ id: item.driver.driverId, name: item.driver.name, document: item.document.type, verified: item.document.verified ? 'Verified' : 'Review' })), columns: textColumns([['id', 'Driver ID'], ['name', 'Driver'], ['document', 'Document'], ['verified', 'Status']]) },
    fleet: { rows: vehicleRows, columns: [...textColumns([['id', 'Registration'], ['model', 'Model'], ['driver', 'Driver'], ['capacity', 'Capacity']]), statusColumn] },
    vehicleDocuments: { rows: toRows(mockVehicles.filter(vehicle => vehicle.companyId === COMPANY_ID), vehicle => ({ id: vehicle.registrationNumber, insurance: vehicle.insuranceNumber, insuranceExpiry: formatDate(vehicle.insuranceExpiry), pollutionExpiry: formatDate(vehicle.pollutionExpiry), status: vehicle.status })), columns: [...textColumns([['id', 'Vehicle'], ['insurance', 'Insurance'], ['insuranceExpiry', 'Insurance Expiry'], ['pollutionExpiry', 'Pollution Expiry']]), statusColumn] },
    fleetLiveMap: { rows: vehicleRows.map(row => ({ ...row, location: row.id.toString().startsWith('MH') ? 'Mumbai Hub' : 'Delhi Corridor' })), columns: [...textColumns([['id', 'Vehicle'], ['model', 'Model'], ['driver', 'Driver'], ['location', 'GPS Location']]), statusColumn] },
    trips: { rows: toRows(mockDrivers.flatMap(driver => driver.tripHistory.map(trip => ({ driver, trip }))), item => ({ id: item.trip.shipmentId, driver: item.driver.name, route: `${item.trip.from} to ${item.trip.to}`, date: formatDate(item.trip.date), status: item.trip.status })), columns: [...textColumns([['id', 'Shipment'], ['driver', 'Driver'], ['route', 'Route'], ['date', 'Date']]), statusColumn] },
    maintenance: { rows: toRows(mockVehicles.filter(vehicle => vehicle.companyId === COMPANY_ID).flatMap(vehicle => vehicle.maintenanceSchedule.map(record => ({ vehicle, record }))), item => ({ id: item.record.id, vehicle: item.vehicle.registrationNumber, type: item.record.type, cost: formatCurrency(item.record.cost), nextDue: formatDate(item.record.nextDueDate), status: item.vehicle.status })), columns: [...textColumns([['id', 'Record'], ['vehicle', 'Vehicle'], ['type', 'Type'], ['cost', 'Cost'], ['nextDue', 'Next Due']]), statusColumn] },
    fuel: { rows: toRows(mockVehicles.filter(vehicle => vehicle.companyId === COMPANY_ID).flatMap(vehicle => vehicle.fuelLog.map(log => ({ vehicle, log }))), item => ({ id: item.log.id, vehicle: item.vehicle.registrationNumber, quantity: `${item.log.quantity} L`, cost: formatCurrency(item.log.cost), location: item.log.location, date: formatDate(item.log.date) })), columns: textColumns([['id', 'Log'], ['vehicle', 'Vehicle'], ['quantity', 'Fuel'], ['cost', 'Cost'], ['location', 'Location'], ['date', 'Date']]) },
    warehouseInbound: { rows: toRows(mockWarehouses.flatMap(warehouse => warehouse.inboundLogs.map(log => ({ warehouse, log }))), item => ({ id: `${item.warehouse.warehouseId}-${item.log.date}`, warehouse: item.warehouse.name, source: item.log.source, items: item.log.items, date: formatDate(item.log.date) })), columns: textColumns([['id', 'GRN'], ['warehouse', 'Warehouse'], ['source', 'Source'], ['items', 'Items'], ['date', 'Date']]) },
    warehouseOutbound: { rows: toRows(mockWarehouses.flatMap(warehouse => warehouse.outboundLogs.map(log => ({ warehouse, log }))), item => ({ id: `${item.warehouse.warehouseId}-${item.log.date}`, warehouse: item.warehouse.name, destination: item.log.destination, items: item.log.items, date: formatDate(item.log.date) })), columns: textColumns([['id', 'GDN'], ['warehouse', 'Warehouse'], ['destination', 'Destination'], ['items', 'Items'], ['date', 'Date']]) },
    warehouseStock: { rows: warehouseRows, columns: textColumns([['id', 'Warehouse ID'], ['name', 'Warehouse'], ['city', 'City'], ['manager', 'Manager'], ['utilization', 'Utilization']]) },
    warehouseLocations: { rows: inventoryRows.slice(0, 20), columns: textColumns([['id', 'SKU'], ['product', 'Product'], ['warehouse', 'Warehouse'], ['location', 'Bin / Rack'], ['quantity', 'Qty']]) },
    cycleCount: { rows: inventoryRows.slice(0, 20).map((row, index) => ({ ...row, counted: Number(row.quantity) - (index % 3), variance: index % 3 })), columns: textColumns([['id', 'SKU'], ['product', 'Product'], ['location', 'Location'], ['quantity', 'System Qty'], ['counted', 'Counted Qty'], ['variance', 'Variance']]) },
    damage: { rows: toRows(damageRecords, record => ({ id: record.id, item: record.item, warehouse: record.warehouse, quantity: record.quantity, value: formatCurrency(record.value), status: record.status })), columns: [...textColumns([['id', 'Report'], ['item', 'Item'], ['warehouse', 'Warehouse'], ['quantity', 'Qty'], ['value', 'Value']]), statusColumn] },
    coldChain: { rows: toRows(mockCargo.flatMap(cargo => cargo.temperatureLog.map(log => ({ cargo, log }))), item => ({ id: item.cargo.cargoNumber, cargo: item.cargo.description, temperature: `${item.log.temperature} C`, humidity: `${item.log.humidity}%`, location: item.log.location, time: formatDate(item.log.timestamp) })), columns: textColumns([['id', 'Cargo'], ['cargo', 'Description'], ['temperature', 'Temperature'], ['humidity', 'Humidity'], ['location', 'Location'], ['time', 'Time']]) },
    inventory: { rows: inventoryRows, columns: textColumns([['id', 'SKU'], ['product', 'Product'], ['category', 'Category'], ['warehouse', 'Warehouse'], ['quantity', 'Qty'], ['location', 'Location']]) },
    customers: { rows: toRows(mockCustomers, customer => ({ id: customer.customerId, name: customer.name, type: customer.type, city: customer.city, shipments: customer.totalShipments, outstanding: formatCurrency(customer.outstandingBalance) })), columns: textColumns([['id', 'Customer ID'], ['name', 'Name'], ['type', 'Type'], ['city', 'City'], ['shipments', 'Shipments'], ['outstanding', 'Outstanding']]) },
    agents: { rows: toRows(mockUsers.filter(user => user.companyId === COMPANY_ID && user.role === 'Agent'), user => ({ id: user.id, name: user.name, username: user.username, agentType: user.agentType ?? 'general', status: user.status })), columns: [...textColumns([['id', 'User ID'], ['name', 'Agent'], ['username', 'Username'], ['agentType', 'Agent Type']]), statusColumn] },
    invoices: { rows: invoiceRows, columns: [...textColumns([['id', 'Invoice'], ['customer', 'Customer'], ['amount', 'Amount'], ['due', 'Due']]), statusColumn] },
    payments: { rows: invoiceRows.filter(row => row.status === 'Paid'), columns: textColumns([['id', 'Invoice'], ['customer', 'Customer'], ['amount', 'Amount'], ['due', 'Paid Before'], ['status', 'Status']]) },
    expenses: { rows: toRows(expenses, expense => ({ id: expense.id, category: expense.category, vendor: expense.vendor, amount: formatCurrency(expense.amount), date: formatDate(expense.date), status: expense.status })), columns: [...textColumns([['id', 'Expense'], ['category', 'Category'], ['vendor', 'Vendor'], ['amount', 'Amount'], ['date', 'Date']]), statusColumn] },
    reconciliation: { rows: invoiceRows.map(row => ({ ...row, bankStatus: row.status === 'Paid' ? 'Matched' : 'Open' })), columns: textColumns([['id', 'Invoice'], ['customer', 'Customer'], ['amount', 'Amount'], ['status', 'Invoice Status'], ['bankStatus', 'Bank Status']]) },
    shipmentReports: { rows: shipmentRows, columns: [...textColumns([['id', 'Shipment'], ['route', 'Route'], ['service', 'Service'], ['eta', 'ETA']]), statusColumn] },
    revenueReports: { rows: invoiceRows, columns: [...textColumns([['id', 'Invoice'], ['customer', 'Customer'], ['amount', 'Revenue'], ['due', 'Due Date']]), statusColumn] },
    performanceReports: { rows: driverRows.map(row => ({ ...row, onTime: `${85 + (Number(row.trips) % 14)}%` })), columns: [...textColumns([['id', 'Driver'], ['name', 'Name'], ['trips', 'Trips'], ['onTime', 'On-Time']]), statusColumn] },
    carrierPerformance: { rows: toRows(companyRates, rate => ({ id: rate.carrier, lane: rate.lane, mode: rate.mode, transit: rate.transit, score: `${88 + rate.id.length}%`, status: rate.status })), columns: [...textColumns([['id', 'Carrier'], ['lane', 'Lane']]), modeColumn, { key: 'transit', header: 'Transit' }, { key: 'score', header: 'Score' }, statusColumn] },
    warehouseReports: { rows: warehouseRows, columns: textColumns([['id', 'Warehouse'], ['name', 'Name'], ['city', 'City'], ['manager', 'Manager'], ['utilization', 'Utilization']]) },
    users: { rows: userRows, columns: [...textColumns([['id', 'User ID'], ['name', 'Name'], ['username', 'Username'], ['role', 'Role']]), statusColumn] },
    roles: { rows: toRows(roleRows, role => ({ id: role.id, users: role.users, scope: role.scope, permissions: role.permissions })), columns: textColumns([['id', 'Role'], ['users', 'Users'], ['scope', 'Scope'], ['permissions', 'Permissions']]) },
    notifications: { rows: toRows(mockNotifications, notification => ({ id: notification.id, title: notification.title, type: notification.type, read: notification.read ? 'Read' : 'Unread', time: formatDate(notification.timestamp) })), columns: textColumns([['id', 'ID'], ['title', 'Title'], ['type', 'Type'], ['read', 'Read State'], ['time', 'Time']]) },
    settings: { rows: toRows([
      { id: 'Company Name', value: 'TechLogistics India', status: 'Active' },
      { id: 'Billing Cycle', value: 'Monthly', status: 'Active' },
      { id: 'Default Currency', value: 'INR', status: 'Active' },
      { id: 'Max Organizations', value: '5', status: 'Active' },
      { id: 'Max Agents', value: '50', status: 'Active' },
    ], setting => ({ id: setting.id, value: setting.value, status: setting.status })), columns: [...textColumns([['id', 'Setting'], ['value', 'Value']]), statusColumn] },
  };

  const selected = tables[pageKey];
  return <PageTable title={title} rows={selected.rows} columns={selected.columns} />;
}

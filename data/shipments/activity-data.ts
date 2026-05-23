export interface MockActivityLog {
  id: string;
  shipmentId: string | null;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

const activities: MockActivityLog[] = [
  { id: 'act-001', shipmentId: 'shp-001', userId: 'usr-001', userName: 'Vikram Singh', userRole: 'Manager', action: 'STATUS_UPDATE', details: 'Changed status from Pending to Picked Up', timestamp: '2026-05-10T10:30:00Z', ipAddress: '192.168.1.100' },
  { id: 'act-002', shipmentId: 'shp-001', userId: 'usr-003', userName: 'Priya Sharma', userRole: 'Dispatcher', action: 'DRIVER_ASSIGNED', details: 'Assigned driver drv-005 to shipment', timestamp: '2026-05-10T11:00:00Z', ipAddress: '192.168.1.101' },
  { id: 'act-003', shipmentId: 'shp-002', userId: 'usr-001', userName: 'Vikram Singh', userRole: 'Manager', action: 'SHIPMENT_CREATED', details: 'Created new shipment LOG-2026-10002', timestamp: '2026-05-10T09:15:00Z', ipAddress: '192.168.1.100' },
  { id: 'act-004', shipmentId: null, userId: 'usr-005', userName: 'Anjali Reddy', userRole: 'Finance', action: 'INVOICE_GENERATED', details: 'Generated invoice INV-2025-01023 for shp-015', timestamp: '2026-05-11T14:00:00Z', ipAddress: '192.168.1.105' },
  { id: 'act-005', shipmentId: 'shp-003', userId: 'usr-008', userName: 'Karan Malhotra', userRole: 'Warehouse', action: 'WAREHOUSE_CHECKIN', details: 'Shipment received at Zone-B, Dock-2', timestamp: '2026-05-11T08:45:00Z', ipAddress: '192.168.1.108' },
  { id: 'act-006', shipmentId: 'shp-004', userId: 'usr-002', userName: 'Amit Patel', userRole: 'SuperAdmin', action: 'STATUS_UPDATE', details: 'Changed status from In Transit to Out for Delivery', timestamp: '2026-05-11T16:30:00Z', ipAddress: '10.0.0.1' },
  { id: 'act-007', shipmentId: 'shp-005', userId: 'usr-004', userName: 'Sneha Gupta', userRole: 'Operator', action: 'ROUTE_MODIFIED', details: 'Updated delivery route to avoid traffic congestion', timestamp: '2026-05-12T07:20:00Z', ipAddress: '192.168.1.104' },
  { id: 'act-008', shipmentId: 'shp-006', userId: 'usr-012', userName: 'Ravi Teja', userRole: 'PortAgent', action: 'CONTAINER_ASSIGNED', details: 'Assigned container MAEU1234567 to shipment', timestamp: '2026-05-12T10:00:00Z', ipAddress: '192.168.1.112' },
  { id: 'act-009', shipmentId: 'shp-007', userId: 'usr-010', userName: 'Divya Nair', userRole: 'CustomsAgent', action: 'CUSTOMS_CLEARED', details: 'Customs clearance approved - DEC-2026-00001', timestamp: '2026-05-12T15:15:00Z', ipAddress: '192.168.1.110' },
  { id: 'act-010', shipmentId: 'shp-008', userId: 'usr-006', userName: 'Rohit Joshi', userRole: 'Support', action: 'NOTE_ADDED', details: 'Added note: Customer requested evening delivery', timestamp: '2026-05-13T09:30:00Z', ipAddress: '192.168.1.106' },
];

export function getMockActivityLog(shipmentId?: string): MockActivityLog[] {
  if (shipmentId) return activities.filter(a => a.shipmentId === shipmentId);
  return [...activities];
}

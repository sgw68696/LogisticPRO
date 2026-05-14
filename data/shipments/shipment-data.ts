import type { ConsolidatedShipment, ShipmentStatus, ShipmentDashboardStats } from '@/types/shipment';
import { generateConsolidatedShipments } from '../factories/shipment-factory';

export { generateConsolidatedShipments as generateMockShipments } from '../factories/shipment-factory';

export const mockConsolidatedShipments = generateConsolidatedShipments(45);

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

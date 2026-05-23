import { mockConsolidatedShipments } from '@/data/shipments/shipment-data';
import { PortalShipmentDetailClient } from './page-client';

export function generateStaticParams() {
  return mockConsolidatedShipments.map((shipment) => ({
    id: shipment.id,
  }));
}

export default function PortalShipmentDetailPage() {
  return <PortalShipmentDetailClient />;
}

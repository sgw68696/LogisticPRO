import { APP_CONFIG } from '@/config/appConfig';
import { portalShipments } from '@/data/portal-mock-data';
import type { Shipment, ShipmentStatus } from '@/data/mockData';

export interface ShipmentFilters {
  status?: ShipmentStatus | 'All';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  serviceType?: string;
}

export const getPortalShipments = async (filters?: ShipmentFilters): Promise<Shipment[]> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    let result = [...portalShipments];
    if (filters) {
      if (filters.status && filters.status !== 'All') result = result.filter(s => s.status === filters.status);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(s =>
          s.trackingNumber.toLowerCase().includes(q) ||
          s.senderName.toLowerCase().includes(q) ||
          s.receiverName.toLowerCase().includes(q) ||
          s.pickupAddress.toLowerCase().includes(q) ||
          s.deliveryAddress.toLowerCase().includes(q)
        );
      }
      if (filters.serviceType) result = result.filter(s => s.serviceType === filters.serviceType);
    }
    return result;
  }
  const params = new URLSearchParams();
  if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/portal/shipments?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return res.json();
};

export const getPortalShipmentById = async (id: string): Promise<Shipment | null> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    return portalShipments.find(s => s.id === id || s.trackingNumber === id) || null;
  }
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/portal/shipments/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  if (!res.ok) return null;
  return res.json();
};

import { APP_CONFIG } from '@/config/appConfig';
import { mockConsolidatedShipments, getShipmentsForRole } from '@/data/shipment-mock-data';
import type { ConsolidatedShipment, ShipmentStatus, ServiceType } from '@/types/shipment';

export interface ShipmentFilters {
  status?: ShipmentStatus | 'All';
  serviceType?: ServiceType | 'All';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  origin?: string;
  destination?: string;
  driver?: string;
  vehicle?: string;
  customsStatus?: string;
  sortBy?: 'createdAt' | 'estimatedDelivery' | 'status' | 'customerName';
  sortDir?: 'asc' | 'desc';
  role?: string;
}

export const getShipments = async (filters?: ShipmentFilters): Promise<ConsolidatedShipment[]> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    let result = filters?.role ? getShipmentsForRole(filters.role) : [...mockConsolidatedShipments];

    if (filters) {
      if (filters.status && filters.status !== 'All') result = result.filter(s => s.status === filters.status);
      if (filters.serviceType && filters.serviceType !== 'All') result = result.filter(s => s.serviceType === filters.serviceType);
      if (filters.customsStatus) result = result.filter(s => s.customsStatus === filters.customsStatus);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(s =>
          s.trackingNumber.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q) ||
          s.sender.name.toLowerCase().includes(q) ||
          s.receiver.name.toLowerCase().includes(q) ||
          s.sender.city.toLowerCase().includes(q) ||
          s.receiver.city.toLowerCase().includes(q) ||
          s.route.origin.toLowerCase().includes(q) ||
          s.route.destination.toLowerCase().includes(q)
        );
      }
      if (filters.dateFrom) result = result.filter(s => new Date(s.createdAt) >= new Date(filters.dateFrom!));
      if (filters.dateTo) result = result.filter(s => new Date(s.createdAt) <= new Date(filters.dateTo!));
      if (filters.driver) result = result.filter(s => s.assignedDriver === filters.driver);
      if (filters.vehicle) result = result.filter(s => s.assignedVehicle === filters.vehicle);
    }

    if (filters?.sortBy) {
      const dir = filters.sortDir === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        const aVal = a[filters.sortBy!];
        const bVal = b[filters.sortBy!];
        if (typeof aVal === 'string' && typeof bVal === 'string') return aVal.localeCompare(bVal) * dir;
        return 0;
      });
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }

  const params = new URLSearchParams();
  if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/shipments?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return res.json();
};

export const getShipmentById = async (id: string): Promise<ConsolidatedShipment | null> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    return mockConsolidatedShipments.find(s => s.id === id || s.trackingNumber === id) || null;
  }
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/shipments/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  if (!res.ok) return null;
  return res.json();
};

export const createShipment = async (data: Partial<ConsolidatedShipment>): Promise<ConsolidatedShipment> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 400));
    const shipment: ConsolidatedShipment = {
      id: `shp-${String(mockConsolidatedShipments.length + 1).padStart(3, '0')}`,
      trackingNumber: `LOG-2026-${String(10001 + mockConsolidatedShipments.length).padStart(5, '0')}`,
      status: 'Pending',
      serviceType: 'Standard',
      customerId: '',
      customerName: '',
      sender: { name: '', company: '', phone: '', email: '', address: '', city: '', state: '', pincode: '', country: 'India' },
      receiver: { name: '', company: '', phone: '', email: '', address: '', city: '', state: '', pincode: '', country: 'India' },
      package: { weight: 0, weightUnit: 'kg', dimensions: '', type: 'Box', pieces: 1, description: '', hazmat: false, value: 0, currency: 'INR' },
      route: { origin: '', originCode: '', destination: '', destinationCode: '', distance: 0, distanceUnit: 'km', transportMode: 'Land', estimatedTransitDays: 1 },
      assignedDriver: null, assignedVehicle: null,
      estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
      actualDelivery: null, pickupDate: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      notes: '', proofOfDelivery: null,
      timeline: [{ status: 'Order Created', timestamp: new Date().toISOString(), location: 'System', notes: 'Shipment order created', updatedBy: 'System' }],
      trackingEvents: [], documents: [], charges: [],
      customsStatus: null, warehouseLocation: null, lastScanLocation: null, lastScanTime: null, onTimeStatus: null,
      ...data,
    };
    return shipment;
  }
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/shipments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateShipment = async (id: string, updates: Partial<ConsolidatedShipment>): Promise<ConsolidatedShipment> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    const idx = mockConsolidatedShipments.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Shipment not found');
    mockConsolidatedShipments[idx] = { ...mockConsolidatedShipments[idx], ...updates, updatedAt: new Date().toISOString() };
    return mockConsolidatedShipments[idx];
  }
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/shipments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify(updates),
  });
  return res.json();
};

export const updateShipmentStatus = async (id: string, status: ShipmentStatus, notes?: string): Promise<ConsolidatedShipment> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    const idx = mockConsolidatedShipments.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Shipment not found');
    const shipment = mockConsolidatedShipments[idx];
    shipment.status = status;
    shipment.updatedAt = new Date().toISOString();
    shipment.timeline.push({
      status, timestamp: new Date().toISOString(), location: 'System Update',
      notes: notes || `Status updated to ${status}`, updatedBy: 'Staff',
    });
    if (status === 'Delivered') shipment.actualDelivery = new Date().toISOString();
    return shipment;
  }
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/shipments/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify({ status, notes }),
  });
  return res.json();
};

export const deleteShipment = async (id: string): Promise<void> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    const idx = mockConsolidatedShipments.findIndex(s => s.id === id);
    if (idx !== -1) mockConsolidatedShipments.splice(idx, 1);
    return;
  }
  await fetch(`${APP_CONFIG.API_BASE_URL}/shipments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
};

export const bulkUpdateStatus = async (ids: string[], status: ShipmentStatus): Promise<void> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 500));
    ids.forEach(id => {
      const s = mockConsolidatedShipments.find(sh => sh.id === id);
      if (s) {
        s.status = status;
        s.updatedAt = new Date().toISOString();
        s.timeline.push({ status, timestamp: new Date().toISOString(), location: 'Bulk Update', notes: `Bulk status update to ${status}`, updatedBy: 'System' });
      }
    });
    return;
  }
  await fetch(`${APP_CONFIG.API_BASE_URL}/shipments/bulk-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify({ ids, status }),
  });
};

export const getShipmentStats = async (role?: string) => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    const shipments = role ? getShipmentsForRole(role) : mockConsolidatedShipments;
    return {
      total: shipments.length,
      pending: shipments.filter(s => s.status === 'Pending').length,
      pickedUp: shipments.filter(s => s.status === 'Picked Up').length,
      inTransit: shipments.filter(s => s.status === 'In Transit').length,
      outForDelivery: shipments.filter(s => s.status === 'Out for Delivery').length,
      delivered: shipments.filter(s => s.status === 'Delivered').length,
      cancelled: shipments.filter(s => s.status === 'Cancelled').length,
      failed: shipments.filter(s => s.status === 'Failed').length,
      onTimeRate: 92.5,
    };
  }
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/shipments/stats`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return res.json();
};

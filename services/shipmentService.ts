import { APP_CONFIG } from "@/config/appConfig";
import { mockShipments, type Shipment, type ShipmentStatus } from "@/data/mockData";

export interface ShipmentFilters {
  status?: ShipmentStatus;
  dateFrom?: string;
  dateTo?: string;
  origin?: string;
  destination?: string;
  search?: string;
}

export const getShipments = async (filters?: ShipmentFilters): Promise<Shipment[]> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let result = [...mockShipments];
    
    if (filters) {
      if (filters.status) {
        result = result.filter(s => s.status === filters.status);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        result = result.filter(s => 
          s.trackingNumber.toLowerCase().includes(search) ||
          s.senderName.toLowerCase().includes(search) ||
          s.receiverName.toLowerCase().includes(search)
        );
      }
      if (filters.dateFrom) {
        result = result.filter(s => new Date(s.createdAt) >= new Date(filters.dateFrom!));
      }
      if (filters.dateTo) {
        result = result.filter(s => new Date(s.createdAt) <= new Date(filters.dateTo!));
      }
    }
    
    return result;
  }
  
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/shipments?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  
  return response.json();
};

export const getShipmentById = async (id: string): Promise<Shipment | null> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockShipments.find(s => s.id === id) || null;
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/shipments/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  
  if (!response.ok) return null;
  return response.json();
};

export const createShipment = async (shipment: Partial<Shipment>): Promise<Shipment> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newShipment: Shipment = {
      ...shipment,
      id: `shp-${String(mockShipments.length + 1).padStart(3, '0')}`,
      trackingNumber: `LOG-2025-${String(10000 + mockShipments.length + 1).padStart(5, '0')}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [{ status: 'Order Created', timestamp: new Date().toISOString(), location: 'System', notes: 'Shipment order created' }],
    } as Shipment;
    mockShipments.push(newShipment);
    return newShipment;
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/shipments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(shipment),
  });
  
  return response.json();
};

export const updateShipment = async (id: string, updates: Partial<Shipment>): Promise<Shipment> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockShipments.findIndex(s => s.id === id);
    if (index !== -1) {
      mockShipments[index] = { ...mockShipments[index], ...updates, updatedAt: new Date().toISOString() };
      return mockShipments[index];
    }
    throw new Error('Shipment not found');
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/shipments/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(updates),
  });
  
  return response.json();
};

export const updateShipmentStatus = async (id: string, status: ShipmentStatus, notes?: string): Promise<Shipment> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockShipments.findIndex(s => s.id === id);
    if (index !== -1) {
      const shipment = mockShipments[index];
      shipment.status = status;
      shipment.updatedAt = new Date().toISOString();
      shipment.timeline.push({
        status,
        timestamp: new Date().toISOString(),
        location: 'System Update',
        notes: notes || `Status updated to ${status}`,
      });
      if (status === 'Delivered') {
        shipment.actualDelivery = new Date().toISOString();
      }
      return shipment;
    }
    throw new Error('Shipment not found');
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/shipments/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ status, notes }),
  });
  
  return response.json();
};

export const deleteShipment = async (id: string): Promise<void> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockShipments.findIndex(s => s.id === id);
    if (index !== -1) {
      mockShipments.splice(index, 1);
    }
    return;
  }
  
  await fetch(`${APP_CONFIG.API_BASE_URL}/shipments/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
};

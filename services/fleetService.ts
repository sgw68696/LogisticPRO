import { APP_CONFIG } from '@/config/appConfig';
import { mockVehicles } from '@/data/mockData';
import type { FleetVehicle, VehicleStatus } from '@/types/vehicle';

export interface VehicleFilters {
  status?: VehicleStatus;
  type?: string;
  search?: string;
}

export const fleetService = {
  async list(filters?: VehicleFilters): Promise<FleetVehicle[]> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      let result: FleetVehicle[] = [...mockVehicles] as unknown as FleetVehicle[];
      if (filters) {
        if (filters.status) result = result.filter(v => v.status === filters.status);
        if (filters.type) result = result.filter(v => v.type === filters.type);
        if (filters.search) {
          const q = filters.search.toLowerCase();
          result = result.filter(v =>
            v.vehicleId.toLowerCase().includes(q) ||
            v.licensePlate.toLowerCase().includes(q) ||
            v.model.toLowerCase().includes(q)
          );
        }
      }
      return result;
    }
    const params = new URLSearchParams();
    if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/vehicles?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  },

  async getById(id: string): Promise<FleetVehicle | null> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(r => setTimeout(r, 200));
      const v = mockVehicles.find(v => v.id === id);
      return v ? (v as unknown as FleetVehicle) : null;
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/vehicles/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!res.ok) return null;
    return res.json();
  },

  async create(data: Partial<FleetVehicle>): Promise<FleetVehicle> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(r => setTimeout(r, 400));
      const newVehicle: FleetVehicle = {
        ...data,
        id: `veh-${String(mockVehicles.length + 1).padStart(3, '0')}`,
        vehicleId: `VEH-${String(mockVehicles.length + 1).padStart(3, '0')}`,
        type: 'Truck',
        licensePlate: '',
        model: '',
        capacity: '',
        status: 'Available',
        assignedDriver: null,
        currentLocation: '',
        maintenanceHistory: [],
        fuelLogs: [],
        ...data,
      };
      (mockVehicles as any).push(newVehicle);
      return newVehicle;
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async update(id: string, updates: Partial<FleetVehicle>): Promise<FleetVehicle> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      const idx = mockVehicles.findIndex(v => v.id === id);
      if (idx === -1) throw new Error('Vehicle not found');
      (mockVehicles as any)[idx] = { ...mockVehicles[idx], ...updates };
      return (mockVehicles as any)[idx] as FleetVehicle;
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/vehicles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async remove(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      const idx = mockVehicles.findIndex(v => v.id === id);
      if (idx !== -1) (mockVehicles as any[]).splice(idx, 1);
      return;
    }
    await fetch(`${APP_CONFIG.API_BASE_URL}/vehicles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  },
};

export const getVehicles = (filters?: VehicleFilters) => fleetService.list(filters);
export const getVehicleById = (id: string) => fleetService.getById(id);
export const createVehicle = (data: Partial<FleetVehicle>) => fleetService.create(data);
export const updateVehicle = (id: string, updates: Partial<FleetVehicle>) => fleetService.update(id, updates);
export const deleteVehicle = (id: string) => fleetService.remove(id);
export type { FleetVehicle, VehicleStatus };

import { APP_CONFIG } from "@/config/appConfig";
import { mockDrivers } from "@/data/mockData";
import type { Driver, DriverStatus } from "@/types/driver";

export interface DriverFilters {
  status?: DriverStatus;
  search?: string;
}

export const driverService = {
  async list(filters?: DriverFilters): Promise<Driver[]> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));

      let result = [...mockDrivers];

      if (filters) {
        if (filters.status) {
          result = result.filter(d => d.status === filters.status);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          result = result.filter(d =>
            d.name.toLowerCase().includes(search) ||
            d.driverId.toLowerCase().includes(search) ||
            d.phone.includes(search)
          );
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

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/drivers?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },

  async getById(id: string): Promise<Driver | null> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockDrivers.find(d => d.id === id) || null;
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/drivers/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (!response.ok) return null;
    return response.json();
  },

  async create(data: Partial<Driver>): Promise<Driver> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const newDriver: Driver = {
        ...data,
        id: `drv-${String(mockDrivers.length + 1).padStart(3, '0')}`,
        driverId: `DRV-${String(mockDrivers.length + 1).padStart(3, '0')}`,
        status: 'Active',
        rating: 5.0,
        totalTrips: 0,
        joinDate: new Date().toISOString(),
        documents: [],
        tripHistory: [],
      } as Driver;
      mockDrivers.push(newDriver);
      return newDriver;
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/drivers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  async update(id: string, updates: Partial<Driver>): Promise<Driver> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockDrivers.findIndex(d => d.id === id);
      if (index !== -1) {
        mockDrivers[index] = { ...mockDrivers[index], ...updates };
        return mockDrivers[index];
      }
      throw new Error('Driver not found');
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/drivers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(updates),
    });

    return response.json();
  },

  async remove(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockDrivers.findIndex(d => d.id === id);
      if (index !== -1) {
        mockDrivers.splice(index, 1);
      }
      return;
    }

    await fetch(`${APP_CONFIG.API_BASE_URL}/drivers/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },
};

// Backward-compatible named exports
export const getDrivers = (filters?: DriverFilters) => driverService.list(filters);
export const getDriverById = (id: string) => driverService.getById(id);
export const createDriver = (data: Partial<Driver>) => driverService.create(data);
export const updateDriver = (id: string, updates: Partial<Driver>) => driverService.update(id, updates);
export const deleteDriver = (id: string) => driverService.remove(id);
export type { Driver, DriverStatus };

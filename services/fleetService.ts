import { APP_CONFIG } from "@/config/appConfig";
import { mockVehicles, type Vehicle, type VehicleStatus } from "@/data/mockData";

export interface VehicleFilters {
  status?: VehicleStatus;
  type?: string;
  search?: string;
}

export const getVehicles = async (filters?: VehicleFilters): Promise<Vehicle[]> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let result = [...mockVehicles];
    
    if (filters) {
      if (filters.status) {
        result = result.filter(v => v.status === filters.status);
      }
      if (filters.type) {
        result = result.filter(v => v.type === filters.type);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        result = result.filter(v => 
          v.vehicleId.toLowerCase().includes(search) ||
          v.licensePlate.toLowerCase().includes(search) ||
          v.model.toLowerCase().includes(search)
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
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/vehicles?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  
  return response.json();
};

export const getVehicleById = async (id: string): Promise<Vehicle | null> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockVehicles.find(v => v.id === id) || null;
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/vehicles/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  
  if (!response.ok) return null;
  return response.json();
};

export const createVehicle = async (vehicle: Partial<Vehicle>): Promise<Vehicle> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `veh-${String(mockVehicles.length + 1).padStart(3, '0')}`,
      vehicleId: `VEH-${String(mockVehicles.length + 1).padStart(3, '0')}`,
      status: 'Available',
      maintenanceHistory: [],
      fuelLogs: [],
    } as Vehicle;
    mockVehicles.push(newVehicle);
    return newVehicle;
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/vehicles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(vehicle),
  });
  
  return response.json();
};

export const updateVehicle = async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockVehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      mockVehicles[index] = { ...mockVehicles[index], ...updates };
      return mockVehicles[index];
    }
    throw new Error('Vehicle not found');
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/vehicles/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(updates),
  });
  
  return response.json();
};

export const deleteVehicle = async (id: string): Promise<void> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockVehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      mockVehicles.splice(index, 1);
    }
    return;
  }
  
  await fetch(`${APP_CONFIG.API_BASE_URL}/vehicles/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
};

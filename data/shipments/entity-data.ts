import { mockDrivers } from '@/data/mockData';
import type { Driver } from '@/types/driver';

import { mockVehicles } from '@/data/mockData';
import type { Vehicle } from '@/types/vehicle';

import { mockCustomers } from '@/data/mockData';
import type { Customer } from '@/types/customer';

export function getMockDriverById(id: string): Driver | undefined {
  return mockDrivers.find(d => d.id === id || d.driverId === id);
}

export function getMockVehicleById(id: string): Vehicle | undefined {
  return mockVehicles.find(v => v.id === id);
}

export function getMockCustomerById(id: string): Customer | undefined {
  return mockCustomers.find(c => c.id === id || c.customerId === id);
}

export { mockDrivers, mockVehicles, mockCustomers };

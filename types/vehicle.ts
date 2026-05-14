import type { VehicleStatus } from './enums';

export type { VehicleStatus };

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  date: string;
  type: 'Regular' | 'Repair' | 'Emergency';
  description: string;
  cost: number;
  nextDueDate: string;
  performedBy: string;
}

export interface FuelRecord {
  id: string;
  vehicleId: string;
  date: string;
  quantity: number;
  cost: number;
  odometer: number;
  fuelType: string;
  location: string;
}

export interface Vehicle {
  id: string;
  companyId: string;
  organizationId: string | null;
  categoryId: string;
  registrationNumber: string;
  chassisNumber: string;
  engineNumber: string;
  make: string;
  model: string;
  year: number;
  color: string;
  fuelType: 'Petrol' | 'Diesel' | 'CNG' | 'Electric';
  capacity: number;
  capacityUnit: 'kg' | 'liters' | 'cubic_meters';
  status: VehicleStatus;
  owner: string;
  insuranceNumber: string;
  insuranceExpiry: string;
  pollutionCertificate: string;
  pollutionExpiry: string;
  maintenanceSchedule: MaintenanceRecord[];
  fuelLog: FuelRecord[];
  currentDriver: string | null;
  totalDistance: number;
  lastServiceDate: string;
  nextServiceDue: string;
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface FleetVehicle {
  id: string;
  vehicleId: string;
  type: 'Truck' | 'Van' | 'Bike' | 'Tempo';
  licensePlate: string;
  model: string;
  capacity: string;
  status: VehicleStatus;
  assignedDriver: string | null;
  currentLocation: string;
  maintenanceHistory: { date: string; description: string; cost: number }[];
  fuelLogs: { date: string; liters: number; cost: number }[];
}

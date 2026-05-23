import type { DriverStatus } from './enums';

export type { DriverStatus };

export interface Driver {
  id: string;
  driverId: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  vehicleAssigned: string | null;
  status: DriverStatus;
  rating: number;
  totalTrips: number;
  joinDate: string;
  documents: { type: string; url: string; verified: boolean }[];
  tripHistory: { shipmentId: string; date: string; from: string; to: string; status: string }[];
}

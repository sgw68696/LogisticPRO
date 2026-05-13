"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';

const mockFuelLogs = [
  { id: 'fl-001', vehicleId: 'veh-001', vehiclePlate: 'MH 12 AB 1234', date: '2025-01-14', quantity: 80, cost: 7200, odometer: 145000, fuelType: 'Diesel', location: 'Mumbai Fuel Station' },
  { id: 'fl-002', vehicleId: 'veh-002', vehiclePlate: 'DL 01 CD 5678', date: '2025-01-15', quantity: 45, cost: 4050, odometer: 98765, fuelType: 'Diesel', location: 'Delhi Fuel Station' },
  { id: 'fl-003', vehicleId: 'veh-003', vehiclePlate: 'KA 01 EF 9012', date: '2025-01-13', quantity: 60, cost: 5400, odometer: 78500, fuelType: 'Diesel', location: 'Bangalore Fuel Station' },
  { id: 'fl-004', vehicleId: 'veh-004', vehiclePlate: 'MH 02 GH 3456', date: '2025-01-12', quantity: 55, cost: 4950, odometer: 56000, fuelType: 'Diesel', location: 'Pune Fuel Station' },
  { id: 'fl-005', vehicleId: 'veh-005', vehiclePlate: 'TN 07 IJ 7890', date: '2025-01-14', quantity: 70, cost: 6300, odometer: 123000, fuelType: 'Diesel', location: 'Chennai Fuel Station' },
  { id: 'fl-006', vehicleId: 'veh-001', vehiclePlate: 'MH 12 AB 1234', date: '2025-01-10', quantity: 75, cost: 6750, odometer: 144500, fuelType: 'Diesel', location: 'Mumbai Fuel Station' },
  { id: 'fl-007', vehicleId: 'veh-002', vehiclePlate: 'DL 01 CD 5678', date: '2025-01-08', quantity: 50, cost: 4500, odometer: 98200, fuelType: 'Diesel', location: 'Delhi Fuel Station' },
];

export default function FleetFuel() {
  const columns: Column<typeof mockFuelLogs[0]>[] = [
    {
      key: 'vehiclePlate',
      header: 'Vehicle',
      render: (item) => item.vehiclePlate,
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => new Date(item.date).toLocaleDateString(),
    },
    {
      key: 'quantity',
      header: 'Quantity (L)',
      render: (item) => item.quantity,
    },
    {
      key: 'cost',
      header: 'Cost',
      render: (item) => `₹${item.cost.toLocaleString()}`,
    },
    {
      key: 'odometer',
      header: 'Odometer (km)',
      render: (item) => item.odometer.toLocaleString(),
    },
    {
      key: 'fuelType',
      header: 'Fuel Type',
      render: (item) => (
        <Badge variant="outline">{item.fuelType}</Badge>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (item) => item.location,
    },
  ];

  return (
    <PageWrapper title="Fuel Logs">
      <DataTable
        data={mockFuelLogs}
        columns={columns}
        searchPlaceholder="Search fuel logs..."
        searchKey="vehiclePlate"
        pageSize={10}
      />
    </PageWrapper>
  );
}

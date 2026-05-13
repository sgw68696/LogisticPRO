"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { mockDrivers, mockVehicles } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, User } from 'lucide-react';

const mockDispatchData = [
  { id: 'dsp-001', shipmentId: 'shp-001', driverId: 'drv-001', driverName: 'Ramesh Kumar', vehicleId: 'veh-001', vehiclePlate: 'MH 12 AB 1234', status: 'Assigned', pickupTime: '2025-01-15 09:00', route: 'Mumbai → Pune' },
  { id: 'dsp-002', shipmentId: 'shp-005', driverId: 'drv-002', driverName: 'Suresh Yadav', vehicleId: 'veh-002', vehiclePlate: 'DL 01 CD 5678', status: 'In Progress', pickupTime: '2025-01-15 08:30', route: 'Bangalore → Chennai' },
  { id: 'dsp-003', shipmentId: 'shp-012', driverId: 'drv-003', driverName: 'Mahesh Sharma', vehicleId: 'veh-003', vehiclePlate: 'KA 01 EF 9012', status: 'Completed', pickupTime: '2025-01-14 14:00', route: 'Hyderabad → Bangalore' },
  { id: 'dsp-004', shipmentId: 'shp-018', driverId: 'drv-004', driverName: 'Ganesh Patel', vehicleId: 'veh-004', vehiclePlate: 'MH 02 GH 3456', status: 'Pending', pickupTime: '2025-01-15 10:00', route: 'Delhi → Jaipur' },
  { id: 'dsp-005', shipmentId: 'shp-023', driverId: 'drv-005', driverName: 'Dinesh Singh', vehicleId: 'veh-005', vehiclePlate: 'TN 07 IJ 7890', status: 'Assigned', pickupTime: '2025-01-15 11:30', route: 'Chennai → Hyderabad' },
];

export default function ManagerDispatch() {
  const columns: Column<typeof mockDispatchData[0]>[] = [
    {
      key: 'shipmentId',
      header: 'Shipment ID',
      render: (item) => item.shipmentId,
    },
    {
      key: 'driverName',
      header: 'Driver',
      render: (item) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span>{item.driverName}</span>
        </div>
      ),
    },
    {
      key: 'vehiclePlate',
      header: 'Vehicle',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-muted-foreground" />
          <span>{item.vehiclePlate}</span>
        </div>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      render: (item) => item.route,
    },
    {
      key: 'pickupTime',
      header: 'Pickup Time',
      render: (item) => item.pickupTime,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors: Record<string, string> = {
          'Assigned': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          'In Progress': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          'Completed': 'bg-green-500/10 text-green-500 border-green-500/20',
          'Pending': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        };
        return (
          <Badge className={statusColors[item.status] || 'bg-gray-500/10 text-gray-500'}>
            {item.status}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <Button size="sm" variant="outline" disabled={item.status === 'Completed'}>
          {item.status === 'Pending' ? 'Assign' : item.status === 'Assigned' ? 'Start' : 'View'}
        </Button>
      ),
    },
  ];

  return (
    <PageWrapper title="Dispatch Board">
      <DataTable
        data={mockDispatchData}
        columns={columns}
        searchPlaceholder="Search dispatches..."
        searchKey="shipmentId"
        pageSize={10}
      />
    </PageWrapper>
  );
}

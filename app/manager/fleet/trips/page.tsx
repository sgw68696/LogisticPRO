"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { mockDrivers } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

const mockTripHistory = [
  { id: 'trip-001', driverId: 'drv-001', driverName: 'Ramesh Kumar', shipmentId: 'shp-001', from: 'Mumbai', to: 'Pune', distance: 150, duration: '3h 30m', status: 'Completed', date: '2025-01-14' },
  { id: 'trip-002', driverId: 'drv-002', driverName: 'Suresh Yadav', shipmentId: 'shp-005', from: 'Bangalore', to: 'Chennai', distance: 350, duration: '7h 15m', status: 'Completed', date: '2025-01-14' },
  { id: 'trip-003', driverId: 'drv-003', driverName: 'Mahesh Sharma', shipmentId: 'shp-012', from: 'Hyderabad', to: 'Bangalore', distance: 570, duration: '10h 00m', status: 'Completed', date: '2025-01-13' },
  { id: 'trip-004', driverId: 'drv-004', driverName: 'Ganesh Patel', shipmentId: 'shp-018', from: 'Delhi', to: 'Jaipur', distance: 280, duration: '5h 45m', status: 'In Progress', date: '2025-01-15' },
  { id: 'trip-005', driverId: 'drv-005', driverName: 'Dinesh Singh', shipmentId: 'shp-023', from: 'Chennai', to: 'Hyderabad', distance: 620, duration: '11h 30m', status: 'Completed', date: '2025-01-12' },
  { id: 'trip-006', driverId: 'drv-001', driverName: 'Ramesh Kumar', shipmentId: 'shp-030', from: 'Pune', to: 'Mumbai', distance: 150, duration: '3h 20m', status: 'Completed', date: '2025-01-11' },
  { id: 'trip-007', driverId: 'drv-006', driverName: 'Rakesh Verma', shipmentId: 'shp-037', from: 'Kolkata', to: 'Delhi', distance: 1450, duration: '24h 00m', status: 'Completed', date: '2025-01-10' },
  { id: 'trip-008', driverId: 'drv-007', driverName: 'Mukesh Gupta', shipmentId: 'shp-044', from: 'Ahmedabad', to: 'Mumbai', distance: 530, duration: '9h 15m', status: 'Completed', date: '2025-01-09' },
];

export default function FleetTrips() {
  const columns: Column<typeof mockTripHistory[0]>[] = [
    {
      key: 'shipmentId',
      header: 'Shipment ID',
      render: (item) => item.shipmentId,
    },
    {
      key: 'driverName',
      header: 'Driver',
      render: (item) => item.driverName,
    },
    {
      key: 'from',
      header: 'From',
      render: (item) => item.from,
    },
    {
      key: 'to',
      header: 'To',
      render: (item) => item.to,
    },
    {
      key: 'distance',
      header: 'Distance (km)',
      render: (item) => item.distance,
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (item) => item.duration,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors: Record<string, string> = {
          'Completed': 'bg-green-500/10 text-green-500 border-green-500/20',
          'In Progress': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          'Cancelled': 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        return (
          <Badge className={statusColors[item.status] || 'bg-gray-500/10 text-gray-500'}>
            {item.status}
          </Badge>
        );
      },
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => new Date(item.date).toLocaleDateString(),
    },
  ];

  return (
    <PageWrapper title="Trip History">
      <DataTable
        data={mockTripHistory}
        columns={columns}
        searchPlaceholder="Search trips..."
        searchKey="shipmentId"
        pageSize={10}
      />
    </PageWrapper>
  );
}

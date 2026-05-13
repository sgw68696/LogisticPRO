"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { mockDrivers } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

export default function ManagerDrivers() {
  const drivers = mockDrivers.slice(0, 20);

  const columns: Column<typeof drivers[0]>[] = [
    {
      key: 'driverId',
      header: 'Driver ID',
      render: (item) => item.driverId,
    },
    {
      key: 'name',
      header: 'Name',
      render: (item) => item.name,
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (item) => item.phone,
    },
    {
      key: 'vehicleAssigned',
      header: 'Vehicle',
      render: (item) => item.vehicleAssigned || 'Unassigned',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors: Record<string, string> = {
          'Active': 'bg-green-500/10 text-green-500 border-green-500/20',
          'On Duty': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          'Off Duty': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
          'Suspended': 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        return (
          <Badge className={statusColors[item.status] || 'bg-gray-500/10 text-gray-500'}>
            {item.status}
          </Badge>
        );
      },
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (item) => `${item.rating}/5.0`,
    },
    {
      key: 'totalTrips',
      header: 'Total Trips',
      render: (item) => item.totalTrips,
    },
  ];

  return (
    <PageWrapper title="Drivers">
      <DataTable
        data={drivers}
        columns={columns}
        searchPlaceholder="Search drivers..."
        searchKey="name"
        pageSize={10}
      />
    </PageWrapper>
  );
}

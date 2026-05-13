"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { mockVehicles } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

export default function ManagerFleet() {
  const vehicles = mockVehicles;

  const columns: Column<typeof vehicles[0]>[] = [
    {
      key: 'registrationNumber',
      header: 'Registration',
      render: (item) => item.registrationNumber,
    },
    {
      key: 'make',
      header: 'Make',
      render: (item) => item.make,
    },
    {
      key: 'model',
      header: 'Model',
      render: (item) => item.model,
    },
    {
      key: 'year',
      header: 'Year',
      render: (item) => item.year,
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (item) => `${item.capacity} ${item.capacityUnit}`,
    },
    {
      key: 'fuelType',
      header: 'Fuel Type',
      render: (item) => item.fuelType,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors: Record<string, string> = {
          'Available': 'bg-green-500/10 text-green-500 border-green-500/20',
          'On Route': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          'Maintenance': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          'Inactive': 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        return (
          <Badge className={statusColors[item.status] || 'bg-gray-500/10 text-gray-500'}>
            {item.status}
          </Badge>
        );
      },
    },
    {
      key: 'currentDriver',
      header: 'Current Driver',
      render: (item) => item.currentDriver || 'Unassigned',
    },
  ];

  return (
    <PageWrapper title="Fleet">
      <DataTable
        data={vehicles}
        columns={columns}
        searchPlaceholder="Search vehicles..."
        searchKey="registrationNumber"
        pageSize={10}
      />
    </PageWrapper>
  );
}

"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { mockShipments } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function ManagerBookings() {
  const bookings = mockShipments.slice(0, 20);

  const columns: Column<typeof bookings[0]>[] = [
    {
      key: 'trackingNumber',
      header: 'Booking ID',
      render: (item) => item.trackingNumber,
    },
    {
      key: 'senderName',
      header: 'Customer',
      render: (item) => item.senderName,
    },
    {
      key: 'serviceType',
      header: 'Service Type',
      render: (item) => item.serviceType,
    },
    {
      key: 'packageWeight',
      header: 'Weight (kg)',
      render: (item) => item.packageWeight,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors: Record<string, string> = {
          'Pending': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          'Picked Up': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          'In Transit': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
          'Out for Delivery': 'bg-green-500/10 text-green-500 border-green-500/20',
          'Delivered': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
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
      key: 'createdAt',
      header: 'Created',
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <PageWrapper 
      title="All Bookings"
      actions={
        <Link href="/manager/bookings/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </Link>
      }
    >
      <DataTable
        data={bookings}
        columns={columns}
        searchPlaceholder="Search bookings..."
        searchKey="trackingNumber"
        pageSize={10}
      />
    </PageWrapper>
  );
}

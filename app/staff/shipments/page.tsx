"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { mockShipments } from '@/data/mockData';

export default function StaffShipments() {
  // Filter shipments for company cmp-001 (staff scope)
  const companyShipments = mockShipments.filter(s => s.id.startsWith('shp-'));

  const columns: Column<typeof mockShipments[0]>[] = [
    {
      key: 'trackingNumber',
      header: 'Tracking Number',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.status === 'Delivered' ? 'bg-green-100 text-green-800' :
          item.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
          item.status === 'Out for Delivery' ? 'bg-purple-100 text-purple-800' :
          item.status === 'Pending' ? 'bg-gray-100 text-gray-800' :
          item.status === 'Picked Up' ? 'bg-yellow-100 text-yellow-800' :
          item.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'pickupAddress',
      header: 'Origin',
      render: (item) => item.pickupAddress.split(',')[0],
      sortable: true,
    },
    {
      key: 'deliveryAddress',
      header: 'Destination',
      render: (item) => item.deliveryAddress.split(',')[0],
      sortable: true,
    },
    {
      key: 'serviceType',
      header: 'Carrier',
      render: (item) => item.serviceType,
      sortable: true,
    },
    {
      key: 'estimatedDelivery',
      header: 'ETA',
      render: (item) => new Date(item.estimatedDelivery).toLocaleDateString(),
      sortable: true,
    },
  ];

  return (
    <PageWrapper 
      title="Shipments" 
      description="View and manage all company shipments"
    >
      <DataTable
        data={companyShipments}
        columns={columns}
        searchKey="trackingNumber"
        searchPlaceholder="Search by tracking number..."
        pageSize={15}
      />
    </PageWrapper>
  );
}

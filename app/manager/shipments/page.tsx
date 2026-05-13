"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { mockShipments } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

export default function ManagerShipments() {
  const shipments = mockShipments.slice(0, 25);

  const columns: Column<typeof shipments[0]>[] = [
    {
      key: 'trackingNumber',
      header: 'Tracking #',
      render: (item) => item.trackingNumber,
    },
    {
      key: 'senderName',
      header: 'Sender',
      render: (item) => item.senderName,
    },
    {
      key: 'receiverName',
      header: 'Receiver',
      render: (item) => item.receiverName,
    },
    {
      key: 'serviceType',
      header: 'Service',
      render: (item) => item.serviceType,
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
      key: 'estimatedDelivery',
      header: 'ETA',
      render: (item) => new Date(item.estimatedDelivery).toLocaleDateString(),
    },
  ];

  return (
    <PageWrapper title="Shipments">
      <DataTable
        data={shipments}
        columns={columns}
        searchPlaceholder="Search shipments..."
        searchKey="trackingNumber"
        pageSize={10}
      />
    </PageWrapper>
  );
}

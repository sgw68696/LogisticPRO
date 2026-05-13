"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';

const mockOutboundLogs = [
  { id: 'gdn-001', gdnNumber: 'GDN-2025-001', shipmentId: 'shp-001', customer: 'Sharma & Sons', itemsDispatched: 148, itemsDelivered: 148, dispatchedBy: 'Sunita Reddy', date: '2025-01-15', status: 'Completed' },
  { id: 'gdn-002', gdnNumber: 'GDN-2025-002', shipmentId: 'shp-005', customer: 'City Mart', itemsDispatched: 200, itemsDelivered: 198, dispatchedBy: 'Mohammed Khan', date: '2025-01-14', status: 'In Transit' },
  { id: 'gdn-003', gdnNumber: 'GDN-2025-003', shipmentId: 'shp-012', customer: 'Fashion Hub', itemsDispatched: 72, itemsDelivered: 72, dispatchedBy: 'Sunita Reddy', date: '2025-01-13', status: 'Completed' },
  { id: 'gdn-004', gdnNumber: 'GDN-2025-004', shipmentId: 'shp-018', customer: 'Quick Retail', itemsDispatched: 295, itemsDelivered: 290, dispatchedBy: 'Mohammed Khan', date: '2025-01-12', status: 'In Transit' },
  { id: 'gdn-005', gdnNumber: 'GDN-2025-005', shipmentId: 'shp-023', customer: 'Prime Distributors', itemsDispatched: 120, itemsDelivered: 120, dispatchedBy: 'Sunita Reddy', date: '2025-01-11', status: 'Completed' },
  { id: 'gdn-006', gdnNumber: 'GDN-2025-006', shipmentId: 'shp-030', customer: 'Elite Electronics', itemsDispatched: 178, itemsDelivered: 175, dispatchedBy: 'Mohammed Khan', date: '2025-01-10', status: 'In Transit' },
];

export default function WarehouseOutbound() {
  const columns: Column<typeof mockOutboundLogs[0]>[] = [
    {
      key: 'gdnNumber',
      header: 'GDN Number',
      render: (item) => item.gdnNumber,
    },
    {
      key: 'shipmentId',
      header: 'Shipment ID',
      render: (item) => item.shipmentId,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (item) => item.customer,
    },
    {
      key: 'itemsDispatched',
      header: 'Dispatched',
      render: (item) => item.itemsDispatched,
    },
    {
      key: 'itemsDelivered',
      header: 'Delivered',
      render: (item) => item.itemsDelivered,
    },
    {
      key: 'dispatchedBy',
      header: 'Dispatched By',
      render: (item) => item.dispatchedBy,
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => new Date(item.date).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors: Record<string, string> = {
          'Completed': 'bg-green-500/10 text-green-500 border-green-500/20',
          'In Transit': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          'Pending': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        };
        return (
          <Badge className={statusColors[item.status] || 'bg-gray-500/10 text-gray-500'}>
            {item.status}
          </Badge>
        );
      },
    },
  ];

  return (
    <PageWrapper title="Outbound (GDN)">
      <DataTable
        data={mockOutboundLogs}
        columns={columns}
        searchPlaceholder="Search GDN..."
        searchKey="gdnNumber"
        pageSize={10}
      />
    </PageWrapper>
  );
}

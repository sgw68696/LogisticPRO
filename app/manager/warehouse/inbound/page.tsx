"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';

const mockInboundLogs = [
  { id: 'grn-001', grnNumber: 'GRN-2025-001', shipmentId: 'shp-001', supplier: 'Tech Solutions Pvt Ltd', itemsReceived: 150, itemsAccepted: 148, itemsDamaged: 2, receivedBy: 'Sunita Reddy', date: '2025-01-15', status: 'Completed' },
  { id: 'grn-002', grnNumber: 'GRN-2025-002', shipmentId: 'shp-005', supplier: 'Global Traders', itemsReceived: 200, itemsAccepted: 200, itemsDamaged: 0, receivedBy: 'Mohammed Khan', date: '2025-01-14', status: 'Completed' },
  { id: 'grn-003', grnNumber: 'GRN-2025-003', shipmentId: 'shp-012', supplier: 'Sunrise Industries', itemsReceived: 75, itemsAccepted: 72, itemsDamaged: 3, receivedBy: 'Sunita Reddy', date: '2025-01-13', status: 'Completed' },
  { id: 'grn-004', grnNumber: 'GRN-2025-004', shipmentId: 'shp-018', supplier: 'Metro Supplies', itemsReceived: 300, itemsAccepted: 295, itemsDamaged: 5, receivedBy: 'Mohammed Khan', date: '2025-01-12', status: 'Completed' },
  { id: 'grn-005', grnNumber: 'GRN-2025-005', shipmentId: 'shp-023', supplier: 'Elite Electronics', itemsReceived: 120, itemsAccepted: 120, itemsDamaged: 0, receivedBy: 'Sunita Reddy', date: '2025-01-11', status: 'Completed' },
  { id: 'grn-006', grnNumber: 'GRN-2025-006', shipmentId: 'shp-030', supplier: 'Fashion Hub', itemsReceived: 180, itemsAccepted: 178, itemsDamaged: 2, receivedBy: 'Mohammed Khan', date: '2025-01-10', status: 'Completed' },
];

export default function WarehouseInbound() {
  const columns: Column<typeof mockInboundLogs[0]>[] = [
    {
      key: 'grnNumber',
      header: 'GRN Number',
      render: (item) => item.grnNumber,
    },
    {
      key: 'shipmentId',
      header: 'Shipment ID',
      render: (item) => item.shipmentId,
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (item) => item.supplier,
    },
    {
      key: 'itemsReceived',
      header: 'Received',
      render: (item) => item.itemsReceived,
    },
    {
      key: 'itemsAccepted',
      header: 'Accepted',
      render: (item) => item.itemsAccepted,
    },
    {
      key: 'itemsDamaged',
      header: 'Damaged',
      render: (item) => item.itemsDamaged,
    },
    {
      key: 'receivedBy',
      header: 'Received By',
      render: (item) => item.receivedBy,
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => new Date(item.date).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
          {item.status}
        </Badge>
      ),
    },
  ];

  return (
    <PageWrapper title="Inbound (GRN)">
      <DataTable
        data={mockInboundLogs}
        columns={columns}
        searchPlaceholder="Search GRN..."
        searchKey="grnNumber"
        pageSize={10}
      />
    </PageWrapper>
  );
}

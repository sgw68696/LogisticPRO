"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';

const mockDGShipments = [
  { id: 'dg-001', shipmentId: 'shp-001', unNumber: 'UN3480', properShippingName: 'Lithium Ion Batteries', class: '9', packingGroup: 'II', quantity: 50, unit: 'kg', origin: 'Mumbai', destination: 'Singapore', status: 'Approved', declarationDate: '2025-01-10' },
  { id: 'dg-002', shipmentId: 'shp-005', unNumber: 'UN1993', properShippingName: 'Flammable Liquids', class: '3', packingGroup: 'III', quantity: 200, unit: 'liters', origin: 'Chennai', destination: 'Dubai', status: 'Pending Approval', declarationDate: '2025-01-12' },
  { id: 'dg-003', shipmentId: 'shp-012', unNumber: 'UN3090', properShippingName: 'Lithium Metal Batteries', class: '9', packingGroup: 'II', quantity: 30, unit: 'kg', origin: 'Hyderabad', destination: 'USA', status: 'Approved', declarationDate: '2025-01-08' },
  { id: 'dg-004', shipmentId: 'shp-018', unNumber: 'UN1203', properShippingName: 'Gasoline', class: '3', packingGroup: 'II', quantity: 500, unit: 'liters', origin: 'Delhi', destination: 'Germany', status: 'Under Review', declarationDate: '2025-01-11' },
  { id: 'dg-005', shipmentId: 'shp-023', unNumber: 'UN1830', properShippingName: 'Sulfuric Acid', class: '8', packingGroup: 'II', quantity: 100, unit: 'liters', origin: 'Mumbai', destination: 'UK', status: 'Approved', declarationDate: '2025-01-09' },
];

export default function ComplianceDG() {
  const columns: Column<typeof mockDGShipments[0]>[] = [
    {
      key: 'shipmentId',
      header: 'Shipment ID',
      render: (item) => item.shipmentId,
    },
    {
      key: 'unNumber',
      header: 'UN Number',
      render: (item) => item.unNumber,
    },
    {
      key: 'properShippingName',
      header: 'Proper Shipping Name',
      render: (item) => item.properShippingName,
    },
    {
      key: 'class',
      header: 'Class',
      render: (item) => (
        <Badge variant="outline">{item.class}</Badge>
      ),
    },
    {
      key: 'packingGroup',
      header: 'Packing Group',
      render: (item) => item.packingGroup,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (item) => `${item.quantity} ${item.unit}`,
    },
    {
      key: 'origin',
      header: 'Origin',
      render: (item) => item.origin,
    },
    {
      key: 'destination',
      header: 'Destination',
      render: (item) => item.destination,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors: Record<string, string> = {
          'Approved': 'bg-green-500/10 text-green-500 border-green-500/20',
          'Pending Approval': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          'Under Review': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        };
        return (
          <Badge className={statusColors[item.status] || 'bg-gray-500/10 text-gray-500'}>
            {item.status}
          </Badge>
        );
      },
    },
    {
      key: 'declarationDate',
      header: 'Declaration Date',
      render: (item) => new Date(item.declarationDate).toLocaleDateString(),
    },
  ];

  return (
    <PageWrapper title="Dangerous Goods">
      <DataTable
        data={mockDGShipments}
        columns={columns}
        searchPlaceholder="Search DG shipments..."
        searchKey="shipmentId"
        pageSize={10}
      />
    </PageWrapper>
  );
}

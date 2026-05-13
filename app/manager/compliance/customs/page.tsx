"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';

const mockCustomsDeclarations = [
  { id: 'cst-001', declarationNumber: 'CST-2025-001', shipmentId: 'shp-001', hsCode: '8471.30', description: 'Laptop Computers', origin: 'India', destination: 'Singapore', value: 3000000, status: 'Cleared', submittedDate: '2025-01-10', clearedDate: '2025-01-12' },
  { id: 'cst-002', declarationNumber: 'CST-2025-002', shipmentId: 'shp-005', hsCode: '8517.62', description: 'Mobile Devices', origin: 'India', destination: 'Dubai', value: 2000000, status: 'Pending Review', submittedDate: '2025-01-12', clearedDate: null },
  { id: 'cst-003', declarationNumber: 'CST-2025-003', shipmentId: 'shp-012', hsCode: '3004.90', description: 'Medicine Boxes', origin: 'India', destination: 'USA', value: 500000, status: 'Cleared', submittedDate: '2025-01-08', clearedDate: '2025-01-09' },
  { id: 'cst-004', declarationNumber: 'CST-2025-004', shipmentId: 'shp-018', hsCode: '8415.10', description: 'Air Compressors', origin: 'India', destination: 'Germany', value: 1500000, status: 'Under Query', submittedDate: '2025-01-11', clearedDate: null },
  { id: 'cst-005', declarationNumber: 'CST-2025-005', shipmentId: 'shp-023', hsCode: '6403.20', description: 'Footwear', origin: 'India', destination: 'UK', value: 800000, status: 'Cleared', submittedDate: '2025-01-09', clearedDate: '2025-01-10' },
];

export default function ComplianceCustoms() {
  const columns: Column<typeof mockCustomsDeclarations[0]>[] = [
    {
      key: 'declarationNumber',
      header: 'Declaration #',
      render: (item) => item.declarationNumber,
    },
    {
      key: 'shipmentId',
      header: 'Shipment ID',
      render: (item) => item.shipmentId,
    },
    {
      key: 'hsCode',
      header: 'HS Code',
      render: (item) => item.hsCode,
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => item.description,
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
      key: 'value',
      header: 'Value',
      render: (item) => `₹${item.value.toLocaleString()}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors: Record<string, string> = {
          'Cleared': 'bg-green-500/10 text-green-500 border-green-500/20',
          'Pending Review': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          'Under Query': 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        return (
          <Badge className={statusColors[item.status] || 'bg-gray-500/10 text-gray-500'}>
            {item.status}
          </Badge>
        );
      },
    },
    {
      key: 'submittedDate',
      header: 'Submitted',
      render: (item) => new Date(item.submittedDate).toLocaleDateString(),
    },
  ];

  return (
    <PageWrapper title="Customs Declarations">
      <DataTable
        data={mockCustomsDeclarations}
        columns={columns}
        searchPlaceholder="Search declarations..."
        searchKey="declarationNumber"
        pageSize={10}
      />
    </PageWrapper>
  );
}

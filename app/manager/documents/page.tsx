"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';

const mockDocuments = [
  { id: 'doc-001', documentName: 'Commercial Invoice', shipmentId: 'shp-001', type: 'Invoice', uploadedBy: 'System', uploadedDate: '2025-01-10', size: '245 KB' },
  { id: 'doc-002', documentName: 'Packing List', shipmentId: 'shp-001', type: 'Packing List', uploadedBy: 'Warehouse Team', uploadedDate: '2025-01-10', size: '128 KB' },
  { id: 'doc-003', documentName: 'Bill of Lading', shipmentId: 'shp-005', type: 'BOL', uploadedBy: 'Carrier', uploadedDate: '2025-01-11', size: '312 KB' },
  { id: 'doc-004', documentName: 'Certificate of Origin', shipmentId: 'shp-012', type: 'Certificate', uploadedBy: 'Customs Agent', uploadedDate: '2025-01-08', size: '156 KB' },
  { id: 'doc-005', documentName: 'Insurance Certificate', shipmentId: 'shp-018', type: 'Insurance', uploadedBy: 'Finance Team', uploadedDate: '2025-01-12', size: '289 KB' },
  { id: 'doc-006', documentName: 'Proof of Delivery', shipmentId: 'shp-023', type: 'POD', uploadedBy: 'Driver', uploadedDate: '2025-01-13', size: '445 KB' },
  { id: 'doc-007', documentName: 'Dangerous Goods Declaration', shipmentId: 'shp-030', type: 'DGD', uploadedBy: 'Shipper', uploadedDate: '2025-01-14', size: '198 KB' },
  { id: 'doc-008', documentName: 'Air Waybill', shipmentId: 'shp-035', type: 'AWB', uploadedBy: 'Airline', uploadedDate: '2025-01-14', size: '267 KB' },
];

export default function ManagerDocuments() {
  const columns: Column<typeof mockDocuments[0]>[] = [
    {
      key: 'documentName',
      header: 'Document Name',
      render: (item) => item.documentName,
    },
    {
      key: 'shipmentId',
      header: 'Shipment ID',
      render: (item) => item.shipmentId,
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => (
        <Badge variant="outline">{item.type}</Badge>
      ),
    },
    {
      key: 'uploadedBy',
      header: 'Uploaded By',
      render: (item) => item.uploadedBy,
    },
    {
      key: 'uploadedDate',
      header: 'Uploaded Date',
      render: (item) => new Date(item.uploadedDate).toLocaleDateString(),
    },
    {
      key: 'size',
      header: 'Size',
      render: (item) => item.size,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost">
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper title="Documents">
      <DataTable
        data={mockDocuments}
        columns={columns}
        searchPlaceholder="Search documents..."
        searchKey="documentName"
        pageSize={10}
      />
    </PageWrapper>
  );
}

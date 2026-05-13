"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';

const mockBOL = [
  { id: 'bol-001', bolNumber: 'BOL-2025-001', shipmentId: 'shp-001', carrier: 'DHL', origin: 'Mumbai', destination: 'Delhi', shipper: 'Tech Solutions Pvt Ltd', consignee: 'Sharma & Sons', weight: 250, status: 'Issued', issuedDate: '2025-01-10' },
  { id: 'bol-002', bolNumber: 'BOL-2025-002', shipmentId: 'shp-005', carrier: 'FedEx', origin: 'Bangalore', destination: 'Chennai', shipper: 'Global Traders', consignee: 'City Mart', weight: 180, status: 'In Transit', issuedDate: '2025-01-11' },
  { id: 'bol-003', bolNumber: 'BOL-2025-003', shipmentId: 'shp-012', carrier: 'BlueDart', origin: 'Hyderabad', destination: 'Pune', shipper: 'Sunrise Industries', consignee: 'Fashion Hub', weight: 320, status: 'Delivered', issuedDate: '2025-01-08' },
  { id: 'bol-004', bolNumber: 'BOL-2025-004', shipmentId: 'shp-018', carrier: 'Ekart', origin: 'Delhi', destination: 'Kolkata', shipper: 'Metro Supplies', consignee: 'Quick Retail', weight: 150, status: 'Issued', issuedDate: '2025-01-12' },
  { id: 'bol-005', bolNumber: 'BOL-2025-005', shipmentId: 'shp-023', carrier: 'DHL', origin: 'Mumbai', destination: 'Bangalore', shipper: 'Elite Electronics', consignee: 'Prime Distributors', weight: 450, status: 'In Transit', issuedDate: '2025-01-13' },
];

export default function ManagerBOL() {
  const columns: Column<typeof mockBOL[0]>[] = [
    {
      key: 'bolNumber',
      header: 'BOL Number',
      render: (item) => item.bolNumber,
    },
    {
      key: 'shipmentId',
      header: 'Shipment ID',
      render: (item) => item.shipmentId,
    },
    {
      key: 'carrier',
      header: 'Carrier',
      render: (item) => item.carrier,
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
      key: 'weight',
      header: 'Weight (kg)',
      render: (item) => item.weight,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors: Record<string, string> = {
          'Issued': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          'In Transit': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          'Delivered': 'bg-green-500/10 text-green-500 border-green-500/20',
        };
        return (
          <Badge className={statusColors[item.status] || 'bg-gray-500/10 text-gray-500'}>
            {item.status}
          </Badge>
        );
      },
    },
    {
      key: 'issuedDate',
      header: 'Issued Date',
      render: (item) => new Date(item.issuedDate).toLocaleDateString(),
    },
  ];

  return (
    <PageWrapper title="Bill of Lading">
      <DataTable
        data={mockBOL}
        columns={columns}
        searchPlaceholder="Search BOL..."
        searchKey="bolNumber"
        pageSize={10}
      />
    </PageWrapper>
  );
}

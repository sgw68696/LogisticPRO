"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';

const mockStockPositions = [
  { id: 'stock-001', sku: 'SKU-MUM-0001', productName: 'Electronics Box', category: 'Electronics', quantity: 450, location: 'Rack A-1', minLevel: 100, status: 'In Stock' },
  { id: 'stock-002', sku: 'SKU-MUM-0002', productName: 'Apparel Bundle', category: 'Apparel', quantity: 320, location: 'Rack B-2', minLevel: 150, status: 'In Stock' },
  { id: 'stock-003', sku: 'SKU-MUM-0003', productName: 'Food Package', category: 'Food', quantity: 85, location: 'Rack C-3', minLevel: 100, status: 'Low Stock' },
  { id: 'stock-004', sku: 'SKU-MUM-0004', productName: 'Pharmaceutical Kit', category: 'Pharma', quantity: 200, location: 'Rack D-4', minLevel: 80, status: 'In Stock' },
  { id: 'stock-005', sku: 'SKU-MUM-0005', productName: 'Auto Parts', category: 'Auto', quantity: 15, location: 'Rack E-5', minLevel: 50, status: 'Critical' },
  { id: 'stock-006', sku: 'SKU-MUM-0006', productName: 'Home Appliance', category: 'Home', quantity: 180, location: 'Rack F-6', minLevel: 75, status: 'In Stock' },
  { id: 'stock-007', sku: 'SKU-MUM-0007', productName: 'Books Carton', category: 'Books', quantity: 550, location: 'Rack G-7', minLevel: 200, status: 'In Stock' },
  { id: 'stock-008', sku: 'SKU-MUM-0008', productName: 'Sports Equipment', category: 'Sports', quantity: 95, location: 'Rack H-8', minLevel: 100, status: 'Low Stock' },
];

export default function WarehouseStock() {
  const columns: Column<typeof mockStockPositions[0]>[] = [
    {
      key: 'sku',
      header: 'SKU',
      render: (item) => item.sku,
    },
    {
      key: 'productName',
      header: 'Product Name',
      render: (item) => item.productName,
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <Badge variant="outline">{item.category}</Badge>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (item) => item.quantity,
    },
    {
      key: 'location',
      header: 'Location',
      render: (item) => item.location,
    },
    {
      key: 'minLevel',
      header: 'Min Level',
      render: (item) => item.minLevel,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors: Record<string, string> = {
          'In Stock': 'bg-green-500/10 text-green-500 border-green-500/20',
          'Low Stock': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          'Critical': 'bg-red-500/10 text-red-500 border-red-500/20',
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
    <PageWrapper title="Stock Positions">
      <DataTable
        data={mockStockPositions}
        columns={columns}
        searchPlaceholder="Search stock..."
        searchKey="productName"
        pageSize={10}
      />
    </PageWrapper>
  );
}

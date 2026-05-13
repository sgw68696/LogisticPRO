"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { mockOrders } from '@/data/mockData';

export default function StaffOrders() {
  const columns: Column<typeof mockOrders[0]>[] = [
    {
      key: 'orderId',
      header: 'Order Number',
      sortable: true,
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.status === 'Delivered' ? 'bg-green-100 text-green-800' :
          item.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
          item.status === 'Confirmed' ? 'bg-yellow-100 text-yellow-800' :
          item.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
          item.status === 'Returned' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      render: (item) => `₹${item.totalAmount.toLocaleString()}`,
      sortable: true,
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
          item.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
          item.paymentStatus === 'Refunded' ? 'bg-blue-100 text-blue-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {item.paymentStatus}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
      sortable: true,
    },
  ];

  return (
    <PageWrapper 
      title="Orders" 
      description="View and assist with customer orders"
    >
      <DataTable
        data={mockOrders}
        columns={columns}
        searchKey="orderId"
        searchPlaceholder="Search by order number..."
        pageSize={15}
      />
    </PageWrapper>
  );
}

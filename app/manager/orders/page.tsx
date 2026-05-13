"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { mockOrders } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

export default function ManagerOrders() {
  const orders = mockOrders.slice(0, 20);

  const columns: Column<typeof orders[0]>[] = [
    {
      key: 'orderId',
      header: 'Order ID',
      render: (item) => item.orderId,
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (item) => item.customerName,
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      render: (item) => `₹${item.totalAmount.toLocaleString()}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors: Record<string, string> = {
          'Draft': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
          'Confirmed': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          'Processing': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          'Shipped': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
          'Delivered': 'bg-green-500/10 text-green-500 border-green-500/20',
          'Returned': 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        return (
          <Badge className={statusColors[item.status] || 'bg-gray-500/10 text-gray-500'}>
            {item.status}
          </Badge>
        );
      },
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (item) => {
        const paymentColors: Record<string, string> = {
          'Pending': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          'Paid': 'bg-green-500/10 text-green-500 border-green-500/20',
          'Partial': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          'Refunded': 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        return (
          <Badge className={paymentColors[item.paymentStatus] || 'bg-gray-500/10 text-gray-500'}>
            {item.paymentStatus}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <PageWrapper title="Orders">
      <DataTable
        data={orders}
        columns={columns}
        searchPlaceholder="Search orders..."
        searchKey="orderId"
        pageSize={10}
      />
    </PageWrapper>
  );
}

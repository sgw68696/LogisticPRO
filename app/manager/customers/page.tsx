"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { mockCustomers } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

export default function ManagerCustomers() {
  const customers = mockCustomers.slice(0, 20);

  const columns: Column<typeof customers[0]>[] = [
    {
      key: 'customerId',
      header: 'Customer ID',
      render: (item) => item.customerId,
    },
    {
      key: 'name',
      header: 'Name',
      render: (item) => item.name,
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => (
        <Badge variant="outline">{item.type}</Badge>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (item) => item.email,
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (item) => item.phone,
    },
    {
      key: 'city',
      header: 'City',
      render: (item) => item.city,
    },
    {
      key: 'totalShipments',
      header: 'Total Shipments',
      render: (item) => item.totalShipments,
    },
    {
      key: 'outstandingBalance',
      header: 'Outstanding Balance',
      render: (item) => `₹${item.outstandingBalance.toLocaleString()}`,
    },
  ];

  return (
    <PageWrapper title="Customers">
      <DataTable
        data={customers}
        columns={columns}
        searchPlaceholder="Search customers..."
        searchKey="name"
        pageSize={10}
      />
    </PageWrapper>
  );
}

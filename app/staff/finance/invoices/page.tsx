"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, Column } from '@/components/shared/DataTable';
import { mockInvoices } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

export default function StaffFinanceInvoices() {
  const columns: Column<typeof mockInvoices[0]>[] = [
    {
      key: 'invoiceId',
      header: 'Invoice ID',
      sortable: true,
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item) => `₹${item.amount.toLocaleString()}`,
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={
          item.status === 'Paid' ? 'default' :
          item.status === 'Unpaid' ? 'secondary' :
          item.status === 'Overdue' ? 'destructive' :
          'outline'
        }>
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (item) => new Date(item.dueDate).toLocaleDateString(),
      sortable: true,
    },
    {
      key: 'paidDate',
      header: 'Paid Date',
      render: (item) => item.paidDate ? new Date(item.paidDate).toLocaleDateString() : '-',
      sortable: true,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
      sortable: true,
    },
  ];

  return (
    <PageWrapper 
      title="Invoices" 
      description="View invoices (read-only access)"
    >
      <div className="space-y-4">
        {/* View Only Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              View Only
            </Badge>
            <span className="text-sm text-blue-800">
              You have read-only access to invoices. Contact your manager for any changes.
            </span>
          </div>
        </div>

        {/* Invoices Table */}
        <DataTable
          data={mockInvoices}
          columns={columns}
          searchKey="invoiceId"
          searchPlaceholder="Search by invoice ID..."
          pageSize={15}
        />
      </div>
    </PageWrapper>
  );
}

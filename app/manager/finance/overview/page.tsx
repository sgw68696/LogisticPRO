"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const mockInvoices = [
  { id: 'inv-001', invoiceNumber: 'INV-2025-001', customerId: 'cust-001', customerName: 'Tech Solutions Pvt Ltd', amount: 150000, status: 'Paid', dueDate: '2025-01-20', paidDate: '2025-01-18' },
  { id: 'inv-002', invoiceNumber: 'INV-2025-002', customerId: 'cust-002', customerName: 'Global Traders', amount: 85000, status: 'Pending', dueDate: '2025-01-25', paidDate: null },
  { id: 'inv-003', invoiceNumber: 'INV-2025-003', customerId: 'cust-003', customerName: 'Sunrise Industries', amount: 220000, status: 'Paid', dueDate: '2025-01-15', paidDate: '2025-01-14' },
  { id: 'inv-004', invoiceNumber: 'INV-2025-004', customerId: 'cust-004', customerName: 'Metro Supplies', amount: 95000, status: 'Overdue', dueDate: '2025-01-10', paidDate: null },
  { id: 'inv-005', invoiceNumber: 'INV-2025-005', customerId: 'cust-005', customerName: 'Elite Electronics', amount: 175000, status: 'Pending', dueDate: '2025-01-28', paidDate: null },
];

export default function FinanceOverview() {
  const columns: Column<typeof mockInvoices[0]>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (item) => item.invoiceNumber,
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (item) => item.customerName,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item) => `₹${item.amount.toLocaleString()}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const statusColors: Record<string, string> = {
          'Paid': 'bg-green-500/10 text-green-500 border-green-500/20',
          'Pending': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          'Overdue': 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        return (
          <Badge className={statusColors[item.status] || 'bg-gray-500/10 text-gray-500'}>
            {item.status}
          </Badge>
        );
      },
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (item) => new Date(item.dueDate).toLocaleDateString(),
    },
  ];

  return (
    <PageWrapper title="Financial Overview">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹12,45,000</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-green-500" />
              <span className="text-green-500">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">₹3,55,000</div>
            <p className="text-xs text-muted-foreground mt-1">5 invoices pending</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Amount</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">₹95,000</div>
            <p className="text-xs text-muted-foreground mt-1">1 invoice overdue</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">₹4,85,000</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-green-500" />
              <span className="text-green-500">+8.2%</span> margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={mockInvoices}
            columns={columns}
            searchPlaceholder="Search invoices..."
            searchKey="invoiceNumber"
            pageSize={10}
          />
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

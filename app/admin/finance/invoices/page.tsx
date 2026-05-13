'use client';

import { useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, FileText, TrendingUp, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { mockInvoices, mockCustomers, type InvoiceStatus, type Invoice } from '@/data/mockData';

const invoiceStatusStyles: Record<InvoiceStatus, string> = {
  Paid: 'border-green-500/30 text-green-400',
  Unpaid: 'border-amber-500/30 text-amber-400',
  Overdue: 'border-red-500/30 text-red-400',
  Cancelled: 'border-slate-500/30 text-slate-400',
};

const columns: Column<Invoice>[] = [
  {
    key: 'invoiceId',
    header: 'Invoice No.',
    sortable: true,
    render: (item) => <span className="font-mono text-xs font-medium">{item.invoiceId}</span>,
  },
  { key: 'customerName', header: 'Customer', sortable: true },
  {
    key: 'amount',
    header: 'Amount',
    sortable: true,
    className: 'text-right',
    render: (item) => <span className="font-semibold">₹{item.amount.toLocaleString('en-IN')}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (item) => (
      <Badge variant="outline" className={invoiceStatusStyles[item.status]}>{item.status}</Badge>
    ),
  },
  {
    key: 'dueDate',
    header: 'Due Date',
    sortable: true,
    render: (item) => new Date(item.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  },
  {
    key: 'paidDate',
    header: 'Paid Date',
    render: (item) => item.paidDate
      ? new Date(item.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : <span className="text-muted-foreground/50">—</span>,
  },
];

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customerName: '',
    amount: '',
    dueDate: '',
    description: '',
  });

  const filteredInvoices = useMemo(() => {
    let result = [...mockInvoices];
    if (statusFilter !== 'all') {
      result = result.filter(i => i.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.invoiceId.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [statusFilter, searchQuery]);

  const totalRevenue = useMemo(
    () => mockInvoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0),
    []
  );
  const totalOverdue = useMemo(
    () => mockInvoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0),
    []
  );

  const handleCreateInvoice = () => {
    setDialogOpen(false);
    setNewInvoice({ customerName: '', amount: '', dueDate: '', description: '' });
  };

  return (
    <PageWrapper
      title="Invoices"
      description="View and manage all platform invoices"
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />New Invoice</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>Fill in the details to generate a new invoice.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customer">Customer Name</Label>
                <Input
                  id="customer"
                  placeholder="Enter customer name"
                  value={newInvoice.customerName}
                  onChange={(e) => setNewInvoice({ ...newInvoice, customerName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Description</Label>
                <Input
                  id="desc"
                  placeholder="Invoice description"
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateInvoice}>Create Invoice</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Invoices"
          value={mockInvoices.length}
          icon={<FileText className="w-5 h-5" />}
          iconColor="cyan"
        />
        <KPICard
          title="Total Revenue (Paid)"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: 12, isPositive: true }}
          iconColor="green"
        />
        <KPICard
          title="Overdue Amount"
          value={`₹${totalOverdue.toLocaleString('en-IN')}`}
          icon={<AlertCircle className="w-5 h-5" />}
          trend={{ value: 5, isPositive: false }}
          iconColor="red"
        />
        <KPICard
          title="Pending Invoices"
          value={mockInvoices.filter(i => i.status === 'Unpaid').length}
          icon={<AlertCircle className="w-5 h-5" />}
          description="Awaiting payment"
          iconColor="amber"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold">All Invoices</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  className="pl-8 h-9 w-[220px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as InvoiceStatus | 'all')}
              >
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredInvoices}
            columns={columns}
            pageSize={10}
            emptyMessage="No invoices match your filters."
          />
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

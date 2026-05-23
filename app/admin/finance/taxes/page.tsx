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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, FileText, Percent, Calendar, CheckCircle, AlertTriangle, Pencil } from 'lucide-react';
import { mockCompanies } from '@/data/mockData';

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  type: 'GST' | 'VAT' | 'Service Tax' | 'Customs Duty';
  applicableOn: string[];
  status: 'active' | 'inactive';
  updatedAt: string;
}

const initialTaxRates: TaxRate[] = [
  { id: 'tax-001', name: 'CGST', rate: 9, type: 'GST', applicableOn: ['Domestic Shipping', 'Warehousing', 'Logistics Services'], status: 'active', updatedAt: '2025-01-01' },
  { id: 'tax-002', name: 'SGST', rate: 9, type: 'GST', applicableOn: ['Domestic Shipping', 'Warehousing', 'Logistics Services'], status: 'active', updatedAt: '2025-01-01' },
  { id: 'tax-003', name: 'IGST', rate: 18, type: 'GST', applicableOn: ['Inter-state Shipping', 'Cross-border Logistics'], status: 'active', updatedAt: '2025-01-01' },
  { id: 'tax-004', name: 'Customs Import Duty', rate: 12, type: 'Customs Duty', applicableOn: ['Import Shipments', 'International Cargo'], status: 'active', updatedAt: '2025-01-05' },
  { id: 'tax-005', name: 'Service Tax', rate: 15, type: 'Service Tax', applicableOn: ['Consulting', 'Value-added Services'], status: 'inactive', updatedAt: '2024-06-30' },
  { id: 'tax-006', name: 'VAT', rate: 5, type: 'VAT', applicableOn: ['Transportation Services'], status: 'active', updatedAt: '2025-01-10' },
];

interface FilingRecord {
  period: string;
  type: string;
  totalTax: number;
  filedDate: string;
  status: 'filed' | 'pending' | 'overdue';
}

const filingHistory: FilingRecord[] = [
  { period: 'Q4 2024 (Oct-Dec)', type: 'GST Return', totalTax: 425000, filedDate: '2025-01-20', status: 'filed' },
  { period: 'Q3 2024 (Jul-Sep)', type: 'GST Return', totalTax: 398000, filedDate: '2024-10-18', status: 'filed' },
  { period: 'Q2 2024 (Apr-Jun)', type: 'GST Return', totalTax: 375000, filedDate: '2024-07-15', status: 'filed' },
  { period: 'Jan 2025', type: 'Customs Duty', totalTax: 185000, filedDate: '2025-02-05', status: 'filed' },
  { period: 'Q1 2025 (Jan-Mar)', type: 'GST Return', totalTax: 0, filedDate: '', status: 'pending' },
];

const taxColumns: Column<TaxRate>[] = [
  { key: 'name', header: 'Tax Name', sortable: true },
  {
    key: 'rate',
    header: 'Rate (%)',
    sortable: true,
    className: 'text-right',
    render: (item) => <span className="font-semibold">{item.rate}%</span>,
  },
  { key: 'type', header: 'Type', sortable: true },
  {
    key: 'applicableOn',
    header: 'Applicable On',
    render: (item) => (
      <div className="flex flex-wrap gap-1">
        {item.applicableOn.map((a, i) => (
          <Badge key={i} variant="outline" className="text-[0.6rem] border-slate-500/20 text-muted-foreground">{a}</Badge>
        ))}
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (item) => (
      <Badge variant="outline" className={item.status === 'active' ? 'border-green-500/30 text-green-400' : 'border-slate-500/30 text-slate-400'}>
        {item.status}
      </Badge>
    ),
  },
  {
    key: 'updatedAt',
    header: 'Last Updated',
    render: (item) => new Date(item.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  },
];

const filingColumns: Column<FilingRecord>[] = [
  { key: 'period', header: 'Period', sortable: true },
  { key: 'type', header: 'Type', sortable: true },
  {
    key: 'totalTax',
    header: 'Total Tax',
    sortable: true,
    className: 'text-right',
    render: (item) => <span className="font-semibold">₹{item.totalTax.toLocaleString('en-IN')}</span>,
  },
  {
    key: 'filedDate',
    header: 'Filed Date',
    render: (item) => item.filedDate
      ? new Date(item.filedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : <span className="text-muted-foreground/50">—</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (item) => (
      <div className="flex items-center gap-1.5">
        {item.status === 'filed' ? (
          <CheckCircle className="w-3.5 h-3.5 text-green-400" />
        ) : item.status === 'pending' ? (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
        )}
        <span className="capitalize text-xs">{item.status}</span>
      </div>
    ),
  },
];

export default function TaxesPage() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>(initialTaxRates);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxRate | null>(null);

  const totalTaxCollected = filingHistory
    .filter(f => f.status === 'filed')
    .reduce((s, f) => s + f.totalTax, 0);

  const handleAddTax = () => {
    setDialogOpen(false);
    setEditingTax(null);
  };

  return (
    <PageWrapper
      title="Tax Management"
      description="Configure tax rates and manage compliance filings"
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setEditingTax(null)}>
              <Plus className="w-4 h-4" />Add Tax Rate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTax ? 'Edit Tax Rate' : 'Add New Tax Rate'}</DialogTitle>
              <DialogDescription>{editingTax ? 'Update the tax rate details.' : 'Configure a new tax rate for the platform.'}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="taxName">Tax Name</Label>
                <Input id="taxName" placeholder="e.g. CGST, IGST" defaultValue={editingTax?.name || ''} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="taxRate">Rate (%)</Label>
                  <Input id="taxRate" type="number" placeholder="18" defaultValue={editingTax?.rate || ''} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="taxType">Type</Label>
                  <Select defaultValue={editingTax?.type || 'GST'}>
                    <SelectTrigger id="taxType"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GST">GST</SelectItem>
                      <SelectItem value="VAT">VAT</SelectItem>
                      <SelectItem value="Service Tax">Service Tax</SelectItem>
                      <SelectItem value="Customs Duty">Customs Duty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select defaultValue={editingTax?.status || 'active'}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTax}>{editingTax ? 'Update' : 'Add'} Tax Rate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Active Tax Rates"
          value={taxRates.filter(t => t.status === 'active').length}
          icon={<Percent className="w-5 h-5" />}
          iconColor="cyan"
        />
        <KPICard
          title="Total Tax Collected"
          value={`₹${totalTaxCollected.toLocaleString('en-IN')}`}
          icon={<FileText className="w-5 h-5" />}
          trend={{ value: 8, isPositive: true }}
          iconColor="green"
        />
        <KPICard
          title="Pending Returns"
          value={filingHistory.filter(f => f.status !== 'filed').length}
          icon={<Calendar className="w-5 h-5" />}
          description="Requires filing"
          iconColor="amber"
        />
        <KPICard
          title="Avg Effective Rate"
          value="12.4%"
          icon={<Percent className="w-5 h-5" />}
          trend={{ value: 0.5, isPositive: false }}
          iconColor="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Percent className="w-4 h-4 text-muted-foreground" />
              Tax Rate Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={taxRates}
              columns={taxColumns}
              searchKey="name"
              searchPlaceholder="Search tax rates..."
              pageSize={10}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Filing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filingHistory}
              columns={filingColumns}
              pageSize={10}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            Upcoming Compliance Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'GST Return (Q1 2025)', date: 'Apr 20, 2025', status: '30 days left' },
              { label: 'Customs Duty (Feb 2025)', date: 'Mar 5, 2025', status: '14 days left' },
              { label: 'Annual Tax Filing', date: 'Jul 31, 2025', status: '4 months left' },
            ].map((deadline) => (
              <div key={deadline.label} className="p-4 rounded-lg border border-border/40 bg-muted/5">
                <p className="text-sm font-semibold text-foreground">{deadline.label}</p>
                <p className="text-xs text-muted-foreground mt-1">Due: {deadline.date}</p>
                <Badge variant="outline" className="mt-2 text-[0.6rem] border-amber-500/30 text-amber-400">{deadline.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

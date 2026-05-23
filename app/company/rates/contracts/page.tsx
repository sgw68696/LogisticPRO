'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search, Plus, Filter, FileText, Building, Calendar,
  DollarSign, Edit, Trash2, Download, TrendingUp, TrendingDown,
  Percent, RefreshCw, Shield,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockContracts = [
  {
    id: 'contract-001',
    contractNumber: 'CTR-2025-001',
    title: 'BlueDart Annual Express Agreement',
    carrierId: 'carrier-001',
    carrierName: 'BlueDart Freight',
    serviceType: 'Express',
    mode: 'Road',
    routes: ['Bangalore–Mumbai', 'Mumbai–Delhi', 'Delhi–Bangalore'],
    baseRate: 38.50,
    ratePerKg: 1.85,
    minWeight: 0.5,
    maxWeight: 50,
    currency: 'INR',
    status: 'Active',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    volumeDiscount: 15,
    contractType: 'Master Agreement',
    renewalTerms: 'Automatic',
    paymentTerms: 'Net 30 days',
    serviceLevel: 'Premium',
    createdAt: '2024-12-15',
    updatedAt: '2025-01-05',
  },
  {
    id: 'contract-002',
    contractNumber: 'CTR-2025-002',
    title: 'Maersk International Freight',
    carrierId: 'carrier-002',
    carrierName: 'Maersk India',
    serviceType: 'Freight',
    mode: 'Sea',
    routes: ['Mumbai–Singapore', 'Chennai–Colombo', 'Mumbai–Colombo'],
    baseRate: 350.00,
    ratePerKg: 3.25,
    minWeight: 100,
    maxWeight: 5000,
    currency: 'USD',
    status: 'Active',
    startDate: '2025-01-15',
    endDate: '2025-06-30',
    volumeDiscount: 20,
    contractType: 'Service Agreement',
    renewalTerms: 'Manual',
    paymentTerms: 'Net 45 days',
    serviceLevel: 'Standard',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-10',
  },
  {
    id: 'contract-003',
    contractNumber: 'CTR-2025-003',
    title: 'Emirates Air Cargo Express',
    carrierId: 'carrier-003',
    carrierName: 'Emirates SkyCargo',
    serviceType: 'Express',
    mode: 'Air',
    routes: ['Hyderabad–Dubai', 'Mumbai–Dubai', 'Mumbai–London'],
    baseRate: 420.00,
    ratePerKg: 4.50,
    minWeight: 1.0,
    maxWeight: 100,
    currency: 'USD',
    status: 'Active',
    startDate: '2025-02-01',
    endDate: '2025-12-31',
    volumeDiscount: 25,
    contractType: 'Master Agreement',
    renewalTerms: 'Automatic',
    paymentTerms: 'Net 30 days',
    serviceLevel: 'Premium',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-20',
  },
  {
    id: 'contract-004',
    contractNumber: 'CTR-2025-004',
    title: 'VRL Regional Road Network',
    carrierId: 'carrier-004',
    carrierName: 'VRL Logistics',
    serviceType: 'Standard',
    mode: 'Road',
    routes: ['Delhi–Jaipur', 'Delhi–Chandigarh', 'Jaipur–Ahmedabad'],
    baseRate: 22.00,
    ratePerKg: 1.20,
    minWeight: 0.5,
    maxWeight: 25,
    currency: 'INR',
    status: 'Active',
    startDate: '2025-01-01',
    endDate: '2025-09-30',
    volumeDiscount: 10,
    contractType: 'Seasonal Agreement',
    renewalTerms: 'Manual',
    paymentTerms: 'Net 15 days',
    serviceLevel: 'Economy',
    createdAt: '2024-12-20',
    updatedAt: '2025-01-02',
  },
  {
    id: 'contract-005',
    contractNumber: 'CTR-2025-005',
    title: 'Container Rail Bulk Agreement',
    carrierId: 'carrier-005',
    carrierName: 'Container Rail',
    serviceType: 'Freight',
    mode: 'Rail',
    routes: ['Chennai–Kolkata', 'Mumbai–Delhi', 'Bangalore–Kolkata'],
    baseRate: 48.00,
    ratePerKg: 1.65,
    minWeight: 50,
    maxWeight: 2000,
    currency: 'INR',
    status: 'Draft',
    startDate: '2025-03-01',
    endDate: '2025-12-31',
    volumeDiscount: 12,
    contractType: 'Service Agreement',
    renewalTerms: 'Automatic',
    paymentTerms: 'Net 30 days',
    serviceLevel: 'Standard',
    createdAt: '2025-01-18',
    updatedAt: '2025-01-18',
  },
  {
    id: 'contract-006',
    contractNumber: 'CTR-2024-006',
    title: 'Gati Express - Last Mile Network',
    carrierId: 'carrier-006',
    carrierName: 'Gati Express',
    serviceType: 'Express',
    mode: 'Road',
    routes: ['Pune–Ahmedabad', 'Pune–Mumbai', 'Mumbai–Ahmedabad'],
    baseRate: 32.00,
    ratePerKg: 1.75,
    minWeight: 0.5,
    maxWeight: 20,
    currency: 'INR',
    status: 'Expired',
    startDate: '2024-07-01',
    endDate: '2024-12-31',
    volumeDiscount: 8,
    contractType: 'Seasonal Agreement',
    renewalTerms: 'Manual',
    paymentTerms: 'Net 30 days',
    serviceLevel: 'Standard',
    createdAt: '2024-06-15',
    updatedAt: '2024-12-01',
  },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    Expired: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    Draft: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  };
  return map[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const modeBadge = (mode: string) => {
  const map: Record<string, string> = {
    Road: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    Air: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
    Sea: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    Rail: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return map[mode] || 'bg-gray-100 text-gray-800';
};

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  carrierId: string;
  carrierName: string;
  serviceType: string;
  mode: string;
  routes: string[];
  baseRate: number;
  ratePerKg: number;
  minWeight: number;
  maxWeight: number;
  currency: string;
  status: string;
  startDate: string;
  endDate: string;
  volumeDiscount: number;
  contractType: string;
  renewalTerms: string;
  paymentTerms: string;
  serviceLevel: string;
  createdAt: string;
  updatedAt: string;
}

export default function ContractRatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');

  const filteredContracts = mockContracts.filter((contract) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      contract.contractNumber.toLowerCase().includes(q) ||
      contract.title.toLowerCase().includes(q) ||
      contract.carrierName.toLowerCase().includes(q) ||
      contract.routes.some(r => r.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchMode = modeFilter === 'all' || contract.mode === modeFilter;

    return matchSearch && matchStatus && matchMode;
  });

  const totalContracts = mockContracts.length;
  const activeContracts = mockContracts.filter(c => c.status === 'Active').length;
  const expiredContracts = mockContracts.filter(c => c.status === 'Expired').length;
  const draftContracts = mockContracts.filter(c => c.status === 'Draft').length;
  const avgDiscount = Math.round(mockContracts.reduce((sum, c) => sum + c.volumeDiscount, 0) / mockContracts.length);

  const columns: Column<Contract>[] = [
    {
      key: 'contractNumber',
      header: 'Contract',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <div className="font-mono text-sm font-semibold">{item.contractNumber}</div>
            <div className="text-xs text-muted-foreground max-w-[200px] truncate">{item.title}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'carrierName',
      header: 'Carrier',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <div className="font-medium text-sm">{item.carrierName}</div>
            <div className="text-xs text-muted-foreground">{item.serviceLevel}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'mode',
      header: 'Mode',
      render: (item) => (
        <Badge className={modeBadge(item.mode)}>{item.mode}</Badge>
      ),
    },
    {
      key: 'routes',
      header: 'Routes',
      render: (item) => (
        <div className="max-w-[200px]">
          {item.routes.slice(0, 2).map((route, index) => (
            <div key={index} className="text-xs font-mono bg-muted/50 px-2 py-1 rounded mb-0.5 truncate">
              {route}
            </div>
          ))}
          {item.routes.length > 2 && (
            <div className="text-xs text-muted-foreground">+{item.routes.length - 2} more</div>
          )}
        </div>
      ),
    },
    {
      key: 'baseRate',
      header: 'Base Rate',
      sortable: true,
      render: (item) => (
        <div className="font-semibold">
          <span className="text-xs text-muted-foreground">{item.currency}</span>{' '}
          {item.baseRate.toFixed(2)}
          <div className="text-xs text-muted-foreground font-normal">per shipment</div>
        </div>
      ),
    },
    {
      key: 'volumeDiscount',
      header: 'Volume Discount',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Percent className="w-3.5 h-3.5 text-green-500" />
          <span className="font-semibold text-green-600 dark:text-green-400">{item.volumeDiscount}%</span>
        </div>
      ),
    },
    {
      key: 'contractType',
      header: 'Type',
      render: (item) => (
        <Badge variant="outline" className="text-xs">{item.contractType}</Badge>
      ),
    },
    {
      key: 'paymentTerms',
      header: 'Payment',
      render: (item) => (
        <div className="text-sm">{item.paymentTerms}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <Badge className={statusBadge(item.status)}>{item.status}</Badge>
      ),
    },
    {
      key: 'endDate',
      header: 'End Date',
      sortable: true,
      render: (item) => {
        const endDate = new Date(item.endDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <div>
              <div className="text-sm">{endDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              {item.status === 'Active' && daysUntilExpiry > 0 && daysUntilExpiry <= 90 && (
                <div className="text-xs text-amber-500 font-medium">{daysUntilExpiry} days left</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-7 h-7">
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7">
            <Download className="w-3.5 h-3.5" />
          </Button>
          {item.status !== 'Expired' && (
            <Button variant="ghost" size="icon" className="w-7 h-7 text-red-500 hover:text-red-600">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Contract Rates"
      description="Manage carrier contracts and negotiated pricing agreements"
      actions={
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Contract
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalContracts}</div>
              <p className="text-xs text-muted-foreground mt-1">All agreements</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeContracts}</div>
              <p className="text-xs text-muted-foreground mt-1">In effect</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{draftContracts}</div>
              <p className="text-xs text-muted-foreground mt-1">Pending approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{expiredContracts}</div>
              <p className="text-xs text-muted-foreground mt-1">Needs renewal</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Discount</CardTitle>
              <Percent className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{avgDiscount}%</div>
              <p className="text-xs text-muted-foreground mt-1">Across contracts</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border/60 rounded-xl p-4 shadow-soft">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by contract #, title, carrier, or route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nb-search w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[0.78rem] text-muted-foreground">
                <Filter size={13} />
                <span className="font-medium hidden sm:block">Filters:</span>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:border-primary/50 focus:ring-0">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="nb-dropdown">
                  <SelectItem value="all" className="text-[0.82rem]">All Statuses</SelectItem>
                  <SelectItem value="Active" className="text-[0.82rem]">Active</SelectItem>
                  <SelectItem value="Draft" className="text-[0.82rem]">Draft</SelectItem>
                  <SelectItem value="Expired" className="text-[0.82rem]">Expired</SelectItem>
                  <SelectItem value="Pending" className="text-[0.82rem]">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={modeFilter} onValueChange={setModeFilter}>
                <SelectTrigger className="w-[110px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:border-primary/50 focus:ring-0">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent className="nb-dropdown">
                  <SelectItem value="all" className="text-[0.82rem]">All Modes</SelectItem>
                  <SelectItem value="Road" className="text-[0.82rem]">Road</SelectItem>
                  <SelectItem value="Air" className="text-[0.82rem]">Air</SelectItem>
                  <SelectItem value="Sea" className="text-[0.82rem]">Sea</SelectItem>
                  <SelectItem value="Rail" className="text-[0.82rem]">Rail</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Contracts Table */}
        {filteredContracts.length > 0 ? (
          <DataTable
            data={filteredContracts}
            columns={columns}
            searchKey="contractNumber"
            searchPlaceholder="Search contracts..."
            pageSize={10}
            emptyMessage="No contracts found"
          />
        ) : (
          <EmptyState
            icon={<FileText className="w-8 h-8" />}
            title="No contracts found"
            description="Try adjusting your search or filters"
          />
        )}
      </div>
    </PageWrapper>
  );
}

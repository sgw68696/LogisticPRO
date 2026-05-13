'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, Plus, Filter, FileText, Building, Calendar,
  DollarSign, Edit, Trash2, Download, TrendingUp, TrendingDown
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock contract rates data
const mockContractRates = [
  {
    id: 'contract-001',
    contractNumber: 'CTR-2024-001',
    title: 'Global Logistics - Annual Express',
    carrierId: 'carrier-001',
    carrierName: 'DHL Express',
    companyId: 'cmp-001',
    companyName: 'Global Logistics Ltd',
    serviceType: 'Express',
    routes: ['MUM-DEL', 'DEL-BLR', 'BLR-HYD'],
    baseRate: 12.50,
    ratePerKg: 1.85,
    minWeight: 0.5,
    maxWeight: 25,
    currency: 'INR',
    status: 'Active',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    volumeDiscount: 15,
    createdAt: '2023-12-15',
    updatedAt: '2024-01-05',
    createdBy: 'admin-001',
    contractType: 'Master Agreement',
    renewalTerms: 'Automatic',
    paymentTerms: 'Net 30 days',
    serviceLevel: 'Premium',
    exclusivity: true,
  },
  {
    id: 'contract-002',
    contractNumber: 'CTR-2024-002',
    title: 'Swift Transport - International Freight',
    carrierId: 'carrier-002',
    carrierName: 'Maersk Line',
    companyId: 'cmp-002',
    companyName: 'Swift Transport Co',
    serviceType: 'Freight',
    routes: ['DEL-NYC', 'MUM-SIN', 'BLR-DXB'],
    baseRate: 380.00,
    ratePerKg: 3.25,
    minWeight: 100,
    maxWeight: 5000,
    currency: 'USD',
    status: 'Active',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    volumeDiscount: 20,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10',
    createdBy: 'admin-002',
    contractType: 'Service Agreement',
    renewalTerms: 'Manual',
    paymentTerms: 'Net 45 days',
    serviceLevel: 'Standard',
    exclusivity: false,
  },
  {
    id: 'contract-003',
    contractNumber: 'CTR-2024-003',
    title: 'Regional Express - Domestic',
    carrierId: 'carrier-003',
    carrierName: 'FedEx',
    companyId: 'all',
    companyName: 'All Companies',
    serviceType: 'Express',
    routes: ['BLR-MAA', 'HYD-BLR', 'MAA-HYD'],
    baseRate: 8.75,
    ratePerKg: 1.45,
    minWeight: 0.5,
    maxWeight: 15,
    currency: 'INR',
    status: 'Active',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    volumeDiscount: 10,
    createdAt: '2023-11-20',
    updatedAt: '2024-01-01',
    createdBy: 'admin-001',
    contractType: 'Seasonal Agreement',
    renewalTerms: 'Manual',
    paymentTerms: 'Net 15 days',
    serviceLevel: 'Economy',
    exclusivity: false,
  },
  {
    id: 'contract-004',
    contractNumber: 'CTR-2024-004',
    title: 'Premium Air Cargo - Expired',
    carrierId: 'carrier-004',
    carrierName: 'Emirates SkyCargo',
    companyId: 'cmp-001',
    companyName: 'Global Logistics Ltd',
    serviceType: 'Air Freight',
    routes: ['DEL-DXB', 'BOM-DXB', 'BLR-DXB'],
    baseRate: 450.00,
    ratePerKg: 4.50,
    minWeight: 50,
    maxWeight: 2000,
    currency: 'USD',
    status: 'Expired',
    startDate: '2023-07-01',
    endDate: '2023-12-31',
    volumeDiscount: 25,
    createdAt: '2023-06-15',
    updatedAt: '2023-12-01',
    createdBy: 'admin-002',
    contractType: 'Master Agreement',
    renewalTerms: 'Manual',
    paymentTerms: 'Net 60 days',
    serviceLevel: 'Premium',
    exclusivity: true,
  },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Expired: 'bg-red-100 text-red-800 border-red-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return map[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const serviceTypeBadge = (type: string) => {
  const map: Record<string, string> = {
    Express: 'bg-purple-100 text-purple-800',
    Standard: 'bg-blue-100 text-blue-800',
    Freight: 'bg-orange-100 text-orange-800',
    'Air Freight': 'bg-cyan-100 text-cyan-800',
  };
  return map[type] || 'bg-gray-100 text-gray-800';
};

export default function ContractRatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  const filteredContracts = mockContractRates.filter((contract) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      contract.contractNumber.toLowerCase().includes(q) ||
      contract.title.toLowerCase().includes(q) ||
      contract.carrierName.toLowerCase().includes(q) ||
      contract.companyName.toLowerCase().includes(q);
    
    const matchStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchService = serviceFilter === 'all' || contract.serviceType === serviceFilter;
    
    return matchSearch && matchStatus && matchService;
  });

  // Calculate KPIs
  const totalContracts = mockContractRates.length;
  const activeContracts = mockContractRates.filter(c => c.status === 'Active').length;
  const expiredContracts = mockContractRates.filter(c => c.status === 'Expired').length;
  const globalContracts = mockContractRates.filter(c => c.companyId === 'all').length;
  const avgDiscount = mockContractRates.reduce((sum, c) => sum + c.volumeDiscount, 0) / mockContractRates.length;

  const columns: Column<typeof mockContractRates[0]>[] = [
    {
      key: 'contractNumber',
      header: 'Contract #',
      sortable: true,
      render: (item) => (
        <div className="font-mono text-sm font-semibold">{item.contractNumber}</div>
      ),
    },
    {
      key: 'title',
      header: 'Contract Title',
      sortable: true,
      render: (item) => (
        <div className="max-w-[250px]">
          <div className="font-semibold">{item.title}</div>
          <div className="text-xs text-muted-foreground">{item.contractType}</div>
        </div>
      ),
    },
    {
      key: 'carrierName',
      header: 'Carrier',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{item.carrierName}</div>
            <div className="text-xs text-muted-foreground">{item.carrierId}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'serviceType',
      header: 'Service',
      render: (item) => (
        <Badge className={serviceTypeBadge(item.serviceType)}>
          {item.serviceType}
        </Badge>
      ),
    },
    {
      key: 'routes',
      header: 'Routes',
      sortable: true,
      render: (item) => (
        <div className="max-w-[200px]">
          {item.routes.slice(0, 2).map((route, index) => (
            <div key={index} className="text-xs font-mono bg-muted/50 px-2 py-1 rounded mb-1">
              {route}
            </div>
          ))}
          {item.routes.length > 2 && (
            <div className="text-xs text-muted-foreground">
              +{item.routes.length - 2} more
            </div>
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
          {item.currency} {item.baseRate.toFixed(2)}
        </div>
      ),
    },
    {
      key: 'volumeDiscount',
      header: 'Volume Discount',
      sortable: true,
      render: (item) => (
        <div className="font-semibold text-green-600">
          {item.volumeDiscount}%
        </div>
      ),
    },
    {
      key: 'companyName',
      header: 'Applicable To',
      sortable: true,
      render: (item) => (
        <Badge variant={item.companyId === 'all' ? 'default' : 'secondary'}>
          {item.companyName}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <Badge className={statusBadge(item.status)}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'endDate',
      header: 'End Date',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{new Date(item.endDate).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="w-3 h-3" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-3 h-3" />
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Contract Rates"
      description="Manage carrier contracts and negotiated rates"
      actions={
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Contract
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalContracts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeContracts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{expiredContracts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Global</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalContracts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Discount</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{avgDiscount.toFixed(1)}%</div>
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
                placeholder="Search by contract #, title, carrier, or company..."
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
                <SelectTrigger className="w-[120px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:border-primary/50 focus:ring-0">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="nb-dropdown">
                  <SelectItem value="all" className="text-[0.82rem]">All Status</SelectItem>
                  <SelectItem value="Active" className="text-[0.82rem]">Active</SelectItem>
                  <SelectItem value="Expired" className="text-[0.82rem]">Expired</SelectItem>
                  <SelectItem value="Pending" className="text-[0.82rem]">Pending</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-[140px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:border-primary/50 focus:ring-0">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent className="nb-dropdown">
                  <SelectItem value="all" className="text-[0.82rem]">All Services</SelectItem>
                  <SelectItem value="Express" className="text-[0.82rem]">Express</SelectItem>
                  <SelectItem value="Standard" className="text-[0.82rem]">Standard</SelectItem>
                  <SelectItem value="Freight" className="text-[0.82rem]">Freight</SelectItem>
                  <SelectItem value="Air Freight" className="text-[0.82rem]">Air Freight</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Contracts Table */}
        <DataTable
          data={filteredContracts}
          columns={columns}
          searchKey="contractNumber"
          searchPlaceholder="Search contracts..."
          pageSize={15}
          emptyMessage="No contracts found"
        />
      </div>
    </PageWrapper>
  );
}

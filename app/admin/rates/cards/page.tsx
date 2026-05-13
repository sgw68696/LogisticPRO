'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, Plus, Filter, Calculator, MapPin, Package, 
  DollarSign, Edit, Trash2, Copy, TrendingUp, TrendingDown
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock rate cards data
const mockRateCards = [
  {
    id: 'rate-001',
    name: 'Express Domestic',
    code: 'EXP-DOM-001',
    serviceType: 'Express',
    origin: 'Mumbai',
    destination: 'Delhi',
    baseRate: 15.50,
    ratePerKg: 2.25,
    minWeight: 0.5,
    maxWeight: 50,
    deliveryTime: '24 hours',
    currency: 'INR',
    status: 'Active',
    companyId: 'all',
    companyName: 'All Companies',
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10',
    createdBy: 'admin-001',
    fuelSurcharge: 5.5,
    insuranceRate: 1.2,
    codCharges: 25.00,
    specialHandling: false,
  },
  {
    id: 'rate-002',
    name: 'Standard International',
    code: 'STD-INT-002',
    serviceType: 'Standard',
    origin: 'Delhi',
    destination: 'New York',
    baseRate: 125.00,
    ratePerKg: 8.75,
    minWeight: 1.0,
    maxWeight: 100,
    deliveryTime: '5-7 days',
    currency: 'USD',
    status: 'Active',
    companyId: 'cmp-001',
    companyName: 'Global Logistics Ltd',
    validFrom: '2024-01-01',
    validTo: '2024-06-30',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-08',
    createdBy: 'admin-002',
    fuelSurcharge: 12.5,
    insuranceRate: 2.5,
    codCharges: 50.00,
    specialHandling: true,
  },
  {
    id: 'rate-003',
    name: 'Freight Bulk',
    code: 'FRG-BLK-003',
    serviceType: 'Freight',
    origin: 'Chennai',
    destination: 'Singapore',
    baseRate: 450.00,
    ratePerKg: 3.50,
    minWeight: 100,
    maxWeight: 5000,
    deliveryTime: '10-14 days',
    currency: 'USD',
    status: 'Active',
    companyId: 'cmp-002',
    companyName: 'Swift Transport Co',
    validFrom: '2024-01-15',
    validTo: '2024-12-31',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-12',
    createdBy: 'admin-001',
    fuelSurcharge: 8.0,
    insuranceRate: 1.8,
    codCharges: 0,
    specialHandling: false,
  },
  {
    id: 'rate-004',
    name: 'Express Regional',
    code: 'EXP-REG-004',
    serviceType: 'Express',
    origin: 'Bangalore',
    destination: 'Hyderabad',
    baseRate: 8.00,
    ratePerKg: 1.50,
    minWeight: 0.5,
    maxWeight: 25,
    deliveryTime: '12 hours',
    currency: 'INR',
    status: 'Inactive',
    companyId: 'all',
    companyName: 'All Companies',
    validFrom: '2023-12-01',
    validTo: '2024-03-31',
    createdAt: '2023-12-01',
    updatedAt: '2024-01-01',
    createdBy: 'admin-002',
    fuelSurcharge: 4.5,
    insuranceRate: 1.0,
    codCharges: 15.00,
    specialHandling: false,
  },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Inactive: 'bg-red-100 text-red-800 border-red-200',
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Expired: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return map[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const serviceTypeBadge = (type: string) => {
  const map: Record<string, string> = {
    Express: 'bg-purple-100 text-purple-800',
    Standard: 'bg-blue-100 text-blue-800',
    Freight: 'bg-orange-100 text-orange-800',
  };
  return map[type] || 'bg-gray-100 text-gray-800';
};

export default function RateCardsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  const filteredRateCards = mockRateCards.filter((rate) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      rate.name.toLowerCase().includes(q) ||
      rate.code.toLowerCase().includes(q) ||
      rate.origin.toLowerCase().includes(q) ||
      rate.destination.toLowerCase().includes(q) ||
      rate.companyName.toLowerCase().includes(q);
    
    const matchStatus = statusFilter === 'all' || rate.status === statusFilter;
    const matchService = serviceFilter === 'all' || rate.serviceType === serviceFilter;
    
    return matchSearch && matchStatus && matchService;
  });

  // Calculate KPIs
  const totalRateCards = mockRateCards.length;
  const activeRateCards = mockRateCards.filter(r => r.status === 'Active').length;
  const inactiveRateCards = mockRateCards.filter(r => r.status === 'Inactive').length;
  const globalRateCards = mockRateCards.filter(r => r.companyId === 'all').length;

  const columns: Column<typeof mockRateCards[0]>[] = [
    {
      key: 'name',
      header: 'Rate Card Name',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold">{item.name}</div>
          <div className="text-xs text-muted-foreground font-mono">{item.code}</div>
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
      key: 'route',
      header: 'Route',
      sortable: true,
      render: (item) => (
        <div className="max-w-[200px]">
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="truncate">{item.origin}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className="w-px h-px bg-muted-foreground mx-1" />
            <MapPin className="w-3 h-3" />
            <span className="truncate">{item.destination}</span>
          </div>
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
      key: 'ratePerKg',
      header: 'Rate/kg',
      sortable: true,
      render: (item) => (
        <div>
          {item.currency} {item.ratePerKg.toFixed(2)}
          <div className="text-xs text-muted-foreground">
            Min: {item.minWeight}kg | Max: {item.maxWeight}kg
          </div>
        </div>
      ),
    },
    {
      key: 'deliveryTime',
      header: 'Delivery Time',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1">
          <Package className="w-4 h-4 text-muted-foreground" />
          <span>{item.deliveryTime}</span>
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
      key: 'validTo',
      header: 'Valid Until',
      sortable: true,
      render: (item) => new Date(item.validTo).toLocaleDateString(),
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
            <Copy className="w-3 h-3" />
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
      title="Rate Cards"
      description="Manage global rate cards and pricing"
      actions={
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Rate Card
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rate Cards</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRateCards}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeRateCards}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{inactiveRateCards}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Global Rates</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalRateCards}</div>
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
                placeholder="Search by name, code, route, or company..."
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
                  <SelectItem value="Inactive" className="text-[0.82rem]">Inactive</SelectItem>
                  <SelectItem value="Draft" className="text-[0.82rem]">Draft</SelectItem>
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
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Rate Cards Table */}
        <DataTable
          data={filteredRateCards}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search rate cards..."
          pageSize={15}
          emptyMessage="No rate cards found"
        />
      </div>
    </PageWrapper>
  );
}

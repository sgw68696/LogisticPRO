'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search, Plus, Filter, Calculator, MapPin, Package,
  DollarSign, Edit, Trash2, Copy, TrendingUp, TrendingDown,
  ArrowRight, Fuel, Shield, Clock,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockRateCards = [
  {
    id: 'rate-001',
    name: 'Express Domestic - Bangalore to Mumbai',
    code: 'EXP-DOM-001',
    serviceType: 'Express',
    mode: 'Road',
    origin: 'Bangalore',
    destination: 'Mumbai',
    baseRate: 42.00,
    ratePerKg: 2.25,
    minWeight: 0.5,
    maxWeight: 50,
    deliveryTime: '24 hours',
    currency: 'INR',
    status: 'Active',
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    fuelSurcharge: 5.5,
    insuranceRate: 1.2,
    minCharge: 350,
  },
  {
    id: 'rate-002',
    name: 'Sea Freight - Mumbai to Singapore',
    code: 'SEA-FRT-002',
    serviceType: 'Freight',
    mode: 'Sea',
    origin: 'Mumbai Port',
    destination: 'Singapore',
    baseRate: 118.00,
    ratePerKg: 3.50,
    minWeight: 100,
    maxWeight: 5000,
    deliveryTime: '12-15 days',
    currency: 'USD',
    status: 'Active',
    validFrom: '2025-01-15',
    validTo: '2025-12-31',
    fuelSurcharge: 8.0,
    insuranceRate: 1.8,
    minCharge: 2500,
  },
  {
    id: 'rate-003',
    name: 'Air Express - Hyderabad to Dubai',
    code: 'AIR-EXP-003',
    serviceType: 'Express',
    mode: 'Air',
    origin: 'Hyderabad',
    destination: 'Dubai',
    baseRate: 310.00,
    ratePerKg: 4.50,
    minWeight: 1.0,
    maxWeight: 100,
    deliveryTime: '1 day',
    currency: 'USD',
    status: 'Active',
    validFrom: '2025-01-01',
    validTo: '2025-06-30',
    fuelSurcharge: 12.5,
    insuranceRate: 2.5,
    minCharge: 1500,
  },
  {
    id: 'rate-004',
    name: 'Road Express - Delhi to Jaipur',
    code: 'ROD-EXP-004',
    serviceType: 'Standard',
    mode: 'Road',
    origin: 'Delhi',
    destination: 'Jaipur',
    baseRate: 28.00,
    ratePerKg: 1.50,
    minWeight: 0.5,
    maxWeight: 25,
    deliveryTime: '1 day',
    currency: 'INR',
    status: 'Active',
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    fuelSurcharge: 4.5,
    insuranceRate: 1.0,
    minCharge: 250,
  },
  {
    id: 'rate-005',
    name: 'Rail Freight - Chennai to Kolkata',
    code: 'RAL-FRT-005',
    serviceType: 'Freight',
    mode: 'Rail',
    origin: 'Chennai',
    destination: 'Kolkata',
    baseRate: 54.00,
    ratePerKg: 1.85,
    minWeight: 50,
    maxWeight: 2000,
    deliveryTime: '4-5 days',
    currency: 'INR',
    status: 'Inactive',
    validFrom: '2024-12-01',
    validTo: '2025-03-31',
    fuelSurcharge: 6.0,
    insuranceRate: 1.5,
    minCharge: 1200,
  },
  {
    id: 'rate-006',
    name: 'Air Cargo - Mumbai to London',
    code: 'AIR-CRG-006',
    serviceType: 'Express',
    mode: 'Air',
    origin: 'Mumbai',
    destination: 'London',
    baseRate: 520.00,
    ratePerKg: 6.75,
    minWeight: 1.0,
    maxWeight: 80,
    deliveryTime: '1-2 days',
    currency: 'USD',
    status: 'Active',
    validFrom: '2025-02-01',
    validTo: '2025-12-31',
    fuelSurcharge: 15.0,
    insuranceRate: 3.0,
    minCharge: 2500,
  },
  {
    id: 'rate-007',
    name: 'Sea Container - Chennai to Colombo',
    code: 'SEA-CNT-007',
    serviceType: 'Freight',
    mode: 'Sea',
    origin: 'Chennai Port',
    destination: 'Colombo',
    baseRate: 195.00,
    ratePerKg: 2.10,
    minWeight: 500,
    maxWeight: 10000,
    deliveryTime: '7-10 days',
    currency: 'USD',
    status: 'Active',
    validFrom: '2025-01-01',
    validTo: '2025-09-30',
    fuelSurcharge: 7.5,
    insuranceRate: 1.5,
    minCharge: 5000,
  },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    Inactive: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    Draft: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    Expired: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
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

interface RateCard {
  id: string;
  name: string;
  code: string;
  serviceType: string;
  mode: string;
  origin: string;
  destination: string;
  baseRate: number;
  ratePerKg: number;
  minWeight: number;
  maxWeight: number;
  deliveryTime: string;
  currency: string;
  status: string;
  validFrom: string;
  validTo: string;
  fuelSurcharge: number;
  insuranceRate: number;
  minCharge: number;
}

export default function RateCardsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');

  const filteredRateCards = mockRateCards.filter((rate) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      rate.name.toLowerCase().includes(q) ||
      rate.code.toLowerCase().includes(q) ||
      rate.origin.toLowerCase().includes(q) ||
      rate.destination.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || rate.status === statusFilter;
    const matchMode = modeFilter === 'all' || rate.mode === modeFilter;

    return matchSearch && matchStatus && matchMode;
  });

  const totalCards = mockRateCards.length;
  const activeCards = mockRateCards.filter(r => r.status === 'Active').length;
  const inactiveCards = mockRateCards.filter(r => r.status === 'Inactive').length;
  const avgBaseRate = Math.round(mockRateCards.reduce((sum, r) => sum + r.baseRate, 0) / mockRateCards.length);

  const columns: Column<RateCard>[] = [
    {
      key: 'name',
      header: 'Rate Card',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <Calculator className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight">{item.name}</div>
            <div className="text-xs text-muted-foreground font-mono mt-0.5">{item.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5 text-sm">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span>{item.origin}</span>
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <span>{item.destination}</span>
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
      key: 'baseRate',
      header: 'Base Rate',
      sortable: true,
      render: (item) => (
        <div className="font-semibold">
          <span className="text-xs text-muted-foreground">{item.currency}</span>{' '}
          {item.baseRate.toFixed(2)}
          <div className="text-xs text-muted-foreground font-normal">
            Min: ₹{item.minCharge.toLocaleString('en-IN')}
          </div>
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
            {item.minWeight}–{item.maxWeight} kg
          </div>
        </div>
      ),
    },
    {
      key: 'surcharges',
      header: 'Surcharges',
      render: (item) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-xs">
            <Fuel className="w-3 h-3 text-muted-foreground" />
            <span>Fuel: {item.fuelSurcharge}%</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Shield className="w-3 h-3 text-muted-foreground" />
            <span>Insurance: {item.insuranceRate}%</span>
          </div>
        </div>
      ),
    },
    {
      key: 'deliveryTime',
      header: 'Transit Time',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm">{item.deliveryTime}</span>
        </div>
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
      key: 'validTo',
      header: 'Valid Until',
      sortable: true,
      render: (item) => (
        <div className="text-sm">
          {new Date(item.validTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      ),
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
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7 text-red-500 hover:text-red-600">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Rate Cards"
      description="Manage your company's rate cards and pricing structures"
      actions={
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Rate Card
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rate Cards</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCards}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all modes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCards}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently in use</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{inactiveCards}</div>
              <p className="text-xs text-muted-foreground mt-1">Discontinued</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Base Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockRateCards.filter(r => r.status === 'Active').length > 0
                  ? (mockRateCards.filter(r => r.status === 'Active').reduce((s, r) => s + r.baseRate, 0) / activeCards).toFixed(0)
                  : 0}
                <span className="text-sm font-normal text-muted-foreground">/ship</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active cards only</p>
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
                placeholder="Search by rate card name, code, or route..."
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
                  <SelectItem value="Inactive" className="text-[0.82rem]">Inactive</SelectItem>
                  <SelectItem value="Draft" className="text-[0.82rem]">Draft</SelectItem>
                  <SelectItem value="Expired" className="text-[0.82rem]">Expired</SelectItem>
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

        {/* Rate Cards Table */}
        {filteredRateCards.length > 0 ? (
          <DataTable
            data={filteredRateCards}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search rate cards..."
            pageSize={10}
            emptyMessage="No rate cards found"
          />
        ) : (
          <EmptyState
            icon={<Calculator className="w-8 h-8" />}
            title="No rate cards found"
            description="Try adjusting your search or filters, or create a new rate card"
            action={{
              label: 'New Rate Card',
              onClick: () => {},
            }}
          />
        )}
      </div>
    </PageWrapper>
  );
}

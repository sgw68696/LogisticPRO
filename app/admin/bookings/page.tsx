'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, Plus, Filter, Calendar, MapPin, Package, 
  User, Clock, DollarSign, TrendingUp, TrendingDown
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock booking data if not available in mockData
const mockBookingsData = [
  {
    id: 'bk-001',
    bookingNumber: 'BK2024001',
    companyId: 'cmp-001',
    companyName: 'Global Logistics Ltd',
    customerId: 'cust-001',
    customerName: 'John Smith',
    serviceType: 'Express',
    origin: 'Mumbai, India',
    destination: 'New York, USA',
    weight: 150.5,
    dimensions: '120x80x60',
    status: 'Confirmed',
    priority: 'High',
    estimatedDelivery: '2024-01-15',
    actualDelivery: null,
    price: 2500.00,
    currency: 'USD',
    createdAt: '2024-01-10',
    createdBy: 'admin-001',
    assignedDriver: 'driver-001',
    trackingNumber: 'TRK001234567',
    specialInstructions: 'Handle with care - fragile items',
    insurance: true,
    insuranceAmount: 500.00,
    customsDeclaration: true,
    customsStatus: 'Pending',
  },
  {
    id: 'bk-002',
    bookingNumber: 'BK2024002',
    companyId: 'cmp-002',
    companyName: 'Swift Transport Co',
    customerId: 'cust-002',
    customerName: 'Sarah Johnson',
    serviceType: 'Standard',
    origin: 'Delhi, India',
    destination: 'London, UK',
    weight: 75.2,
    dimensions: '80x60x40',
    status: 'In Transit',
    priority: 'Medium',
    estimatedDelivery: '2024-01-18',
    actualDelivery: null,
    price: 1200.00,
    currency: 'USD',
    createdAt: '2024-01-11',
    createdBy: 'admin-002',
    assignedDriver: 'driver-002',
    trackingNumber: 'TRK001234568',
    specialInstructions: '',
    insurance: false,
    insuranceAmount: 0,
    customsDeclaration: false,
    customsStatus: 'N/A',
  },
  {
    id: 'bk-003',
    bookingNumber: 'BK2024003',
    companyId: 'cmp-001',
    companyName: 'Global Logistics Ltd',
    customerId: 'cust-003',
    customerName: 'Michael Chen',
    serviceType: 'Freight',
    origin: 'Chennai, India',
    destination: 'Singapore',
    weight: 450.8,
    dimensions: '200x150x100',
    status: 'Delivered',
    priority: 'Low',
    estimatedDelivery: '2024-01-12',
    actualDelivery: '2024-01-11',
    price: 3800.00,
    currency: 'USD',
    createdAt: '2024-01-08',
    createdBy: 'admin-001',
    assignedDriver: 'driver-003',
    trackingNumber: 'TRK001234569',
    specialInstructions: 'Temperature controlled cargo',
    insurance: true,
    insuranceAmount: 750.00,
    customsDeclaration: true,
    customsStatus: 'Cleared',
  },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    'In Transit': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Delivered: 'bg-green-100 text-green-800 border-green-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
    Pending: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return map[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const priorityBadge = (priority: string) => {
  const map: Record<string, string> = {
    High: 'bg-red-100 text-red-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Low: 'bg-green-100 text-green-800',
  };
  return map[priority] || 'bg-gray-100 text-gray-800';
};

const serviceTypeBadge = (type: string) => {
  const map: Record<string, string> = {
    Express: 'bg-purple-100 text-purple-800',
    Standard: 'bg-blue-100 text-blue-800',
    Freight: 'bg-orange-100 text-orange-800',
  };
  return map[type] || 'bg-gray-100 text-gray-800';
};

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredBookings = mockBookingsData.filter((booking) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      booking.bookingNumber.toLowerCase().includes(q) ||
      booking.customerName.toLowerCase().includes(q) ||
      booking.companyName.toLowerCase().includes(q) ||
      booking.origin.toLowerCase().includes(q) ||
      booking.destination.toLowerCase().includes(q);
    
    const matchStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || booking.priority === priorityFilter;
    
    return matchSearch && matchStatus && matchPriority;
  });

  // Calculate KPIs
  const totalBookings = mockBookingsData.length;
  const confirmedBookings = mockBookingsData.filter(b => b.status === 'Confirmed').length;
  const inTransitBookings = mockBookingsData.filter(b => b.status === 'In Transit').length;
  const deliveredBookings = mockBookingsData.filter(b => b.status === 'Delivered').length;
  const totalRevenue = mockBookingsData.reduce((sum, b) => sum + b.price, 0);

  const columns: Column<typeof mockBookingsData[0]>[] = [
    {
      key: 'bookingNumber',
      header: 'Booking #',
      sortable: true,
      render: (item) => (
        <div className="font-mono text-sm font-semibold">{item.bookingNumber}</div>
      ),
    },
    {
      key: 'companyName',
      header: 'Company',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium">{item.companyName}</div>
          <div className="text-xs text-muted-foreground">{item.companyId}</div>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span>{item.customerName}</span>
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
      key: 'origin',
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
      key: 'weight',
      header: 'Weight',
      sortable: true,
      render: (item) => `${item.weight} kg`,
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
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (item) => (
        <Badge className={priorityBadge(item.priority)}>
          {item.priority}
        </Badge>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (item) => (
        <div className="font-semibold">
          {item.currency} {item.price.toLocaleString()}
        </div>
      ),
    },
    {
      key: 'estimatedDelivery',
      header: 'ETA',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{new Date(item.estimatedDelivery).toLocaleDateString()}</span>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="All Bookings"
      description="View and manage all bookings across companies"
      actions={
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Booking
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{confirmedBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{inTransitBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{deliveredBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">USD {totalRevenue.toLocaleString()}</div>
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
                placeholder="Search by booking #, customer, company, or route..."
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
                <SelectTrigger className="w-[140px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:border-primary/50 focus:ring-0">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="nb-dropdown">
                  <SelectItem value="all" className="text-[0.82rem]">All Statuses</SelectItem>
                  <SelectItem value="Confirmed" className="text-[0.82rem]">Confirmed</SelectItem>
                  <SelectItem value="In Transit" className="text-[0.82rem]">In Transit</SelectItem>
                  <SelectItem value="Delivered" className="text-[0.82rem]">Delivered</SelectItem>
                  <SelectItem value="Cancelled" className="text-[0.82rem]">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[120px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:border-primary/50 focus:ring-0">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="nb-dropdown">
                  <SelectItem value="all" className="text-[0.82rem]">All Priority</SelectItem>
                  <SelectItem value="High" className="text-[0.82rem]">High</SelectItem>
                  <SelectItem value="Medium" className="text-[0.82rem]">Medium</SelectItem>
                  <SelectItem value="Low" className="text-[0.82rem]">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <DataTable
          data={filteredBookings}
          columns={columns}
          searchKey="bookingNumber"
          searchPlaceholder="Search bookings..."
          pageSize={20}
          emptyMessage="No bookings found"
        />
      </div>
    </PageWrapper>
  );
}

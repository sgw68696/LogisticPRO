'use client';

import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search, Plus, Filter, Calendar, MapPin, Package,
  User, Clock, DollarSign, TrendingUp, TrendingDown,
  Eye, XCircle, Truck, ArrowRight, Send
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const companyBookingsData = [
  {
    id: 'BKG-2025-001',
    bookingNumber: 'BKG-2025-001',
    customer: 'Tech Solutions Pvt Ltd',
    serviceType: 'Express',
    mode: 'Road',
    origin: 'Bangalore, India',
    destination: 'Mumbai, India',
    weight: 450,
    dimensions: '120x80x60',
    status: 'Confirmed',
    priority: 'High',
    estimatedDelivery: '2025-01-18',
    actualDelivery: null,
    price: 48500,
    currency: 'INR',
    carrier: 'BlueDart Freight',
    trackingNumber: 'TRK-BD-001',
    createdAt: '2025-01-08',
    createdBy: 'user-001',
  },
  {
    id: 'BKG-2025-002',
    bookingNumber: 'BKG-2025-002',
    customer: 'Global Traders',
    serviceType: 'Freight',
    mode: 'Sea',
    origin: 'Mumbai Port, India',
    destination: 'Singapore',
    weight: 12400,
    dimensions: '600x240x240',
    status: 'Pending',
    priority: 'Medium',
    estimatedDelivery: '2025-01-28',
    actualDelivery: null,
    price: 168000,
    currency: 'INR',
    carrier: 'Maersk India',
    trackingNumber: 'TRK-MK-002',
    createdAt: '2025-01-10',
    createdBy: 'user-002',
  },
  {
    id: 'BKG-2025-003',
    bookingNumber: 'BKG-2025-003',
    customer: 'Pharma Industries Ltd',
    serviceType: 'Express',
    mode: 'Air',
    origin: 'Hyderabad, India',
    destination: 'Dubai, UAE',
    weight: 1200,
    dimensions: '200x150x120',
    status: 'In Transit',
    priority: 'High',
    estimatedDelivery: '2025-01-16',
    actualDelivery: null,
    price: 124000,
    currency: 'INR',
    carrier: 'Emirates SkyCargo',
    trackingNumber: 'TRK-EK-003',
    createdAt: '2025-01-12',
    createdBy: 'user-001',
  },
  {
    id: 'BKG-2025-004',
    bookingNumber: 'BKG-2025-004',
    customer: 'Metro Supplies',
    serviceType: 'Standard',
    mode: 'Road',
    origin: 'Delhi, India',
    destination: 'Jaipur, India',
    weight: 180,
    dimensions: '80x60x40',
    status: 'Delivered',
    priority: 'Low',
    estimatedDelivery: '2025-01-15',
    actualDelivery: '2025-01-14',
    price: 32000,
    currency: 'INR',
    carrier: 'VRL Logistics',
    trackingNumber: 'TRK-VR-004',
    createdAt: '2025-01-13',
    createdBy: 'user-003',
  },
  {
    id: 'BKG-2025-005',
    bookingNumber: 'BKG-2025-005',
    customer: 'Elite Electronics',
    serviceType: 'Freight',
    mode: 'Rail',
    origin: 'Chennai, India',
    destination: 'Kolkata, India',
    weight: 5800,
    dimensions: '400x200x180',
    status: 'Pending',
    priority: 'Medium',
    estimatedDelivery: '2025-01-22',
    actualDelivery: null,
    price: 76000,
    currency: 'INR',
    carrier: 'Container Rail',
    trackingNumber: 'TRK-CR-005',
    createdAt: '2025-01-14',
    createdBy: 'user-002',
  },
  {
    id: 'BKG-2025-006',
    bookingNumber: 'BKG-2025-006',
    customer: 'Sunrise Industries',
    serviceType: 'Express',
    mode: 'Road',
    origin: 'Pune, India',
    destination: 'Ahmedabad, India',
    weight: 320,
    dimensions: '100x80x60',
    status: 'Confirmed',
    priority: 'High',
    estimatedDelivery: '2025-01-19',
    actualDelivery: null,
    price: 39500,
    currency: 'INR',
    carrier: 'Gati Express',
    trackingNumber: 'TRK-GT-006',
    createdAt: '2025-01-15',
    createdBy: 'user-001',
  },
  {
    id: 'BKG-2025-007',
    bookingNumber: 'BKG-2025-007',
    customer: 'Apex Automotive',
    serviceType: 'Freight',
    mode: 'Sea',
    origin: 'Chennai Port, India',
    destination: 'Colombo, Sri Lanka',
    weight: 18500,
    dimensions: '800x300x300',
    status: 'In Transit',
    priority: 'High',
    estimatedDelivery: '2025-01-25',
    actualDelivery: null,
    price: 245000,
    currency: 'INR',
    carrier: 'Maersk India',
    trackingNumber: 'TRK-MK-007',
    createdAt: '2025-01-11',
    createdBy: 'user-003',
  },
  {
    id: 'BKG-2025-008',
    bookingNumber: 'BKG-2025-008',
    customer: 'FreshFarm Produce',
    serviceType: 'Standard',
    mode: 'Road',
    origin: 'Nagpur, India',
    destination: 'Mumbai, India',
    weight: 2800,
    dimensions: '300x200x180',
    status: 'Cancelled',
    priority: 'Medium',
    estimatedDelivery: '2025-01-14',
    actualDelivery: null,
    price: 28500,
    currency: 'INR',
    carrier: 'VRL Logistics',
    trackingNumber: 'TRK-VR-008',
    createdAt: '2025-01-09',
    createdBy: 'user-002',
  },
  {
    id: 'BKG-2025-009',
    bookingNumber: 'BKG-2025-009',
    customer: 'Tech Solutions Pvt Ltd',
    serviceType: 'Express',
    mode: 'Air',
    origin: 'Bangalore, India',
    destination: 'Singapore',
    weight: 860,
    dimensions: '180x120x100',
    status: 'Delivered',
    priority: 'High',
    estimatedDelivery: '2025-01-13',
    actualDelivery: '2025-01-12',
    price: 189000,
    currency: 'INR',
    carrier: 'Emirates SkyCargo',
    trackingNumber: 'TRK-EK-009',
    createdAt: '2025-01-07',
    createdBy: 'user-001',
  },
  {
    id: 'BKG-2025-010',
    bookingNumber: 'BKG-2025-010',
    customer: 'MediCore Pharma',
    serviceType: 'Express',
    mode: 'Air',
    origin: 'Mumbai, India',
    destination: 'London, UK',
    weight: 450,
    dimensions: '150x100x80',
    status: 'Confirmed',
    priority: 'High',
    estimatedDelivery: '2025-01-20',
    actualDelivery: null,
    price: 312000,
    currency: 'INR',
    carrier: 'Emirates SkyCargo',
    trackingNumber: 'TRK-EK-010',
    createdAt: '2025-01-16',
    createdBy: 'user-001',
  },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Confirmed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    Pending: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    'In Transit': 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
    Delivered: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    Cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const priorityBadge = (priority: string) => {
  const map: Record<string, string> = {
    High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };
  return map[priority] || 'bg-gray-100 text-gray-800';
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

type StatusTab = 'all' | 'Pending' | 'Confirmed' | 'In Transit' | 'Delivered' | 'Cancelled';

interface Booking {
  id: string;
  bookingNumber: string;
  customer: string;
  serviceType: string;
  mode: string;
  origin: string;
  destination: string;
  weight: number;
  dimensions: string;
  status: string;
  priority: string;
  estimatedDelivery: string;
  actualDelivery: string | null;
  price: number;
  currency: string;
  carrier: string;
  trackingNumber: string;
  createdAt: string;
  createdBy: string;
}

export default function CompanyBookingsPage() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<StatusTab>('all');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const filteredBookings = companyBookingsData.filter((booking) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      booking.bookingNumber.toLowerCase().includes(q) ||
      booking.customer.toLowerCase().includes(q) ||
      booking.origin.toLowerCase().includes(q) ||
      booking.destination.toLowerCase().includes(q) ||
      booking.carrier.toLowerCase().includes(q) ||
      booking.trackingNumber.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchMode = modeFilter === 'all' || booking.mode === modeFilter;
    const matchPriority = priorityFilter === 'all' || booking.priority === priorityFilter;
    const matchTab = activeTab === 'all' || booking.status === activeTab;

    return matchSearch && matchStatus && matchMode && matchPriority && matchTab;
  });

  const totalBookings = companyBookingsData.length;
  const pendingBookings = companyBookingsData.filter(b => b.status === 'Pending').length;
  const confirmedBookings = companyBookingsData.filter(b => b.status === 'Confirmed').length;
  const inTransitBookings = companyBookingsData.filter(b => b.status === 'In Transit').length;
  const deliveredBookings = companyBookingsData.filter(b => b.status === 'Delivered').length;
  const totalRevenue = companyBookingsData.reduce((sum, b) => sum + b.price, 0);

  const tabs: { key: StatusTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: totalBookings },
    { key: 'Pending', label: 'Pending', count: pendingBookings },
    { key: 'Confirmed', label: 'Confirmed', count: confirmedBookings },
    { key: 'In Transit', label: 'In Transit', count: inTransitBookings },
    { key: 'Delivered', label: 'Delivered', count: deliveredBookings },
    { key: 'Cancelled', label: 'Cancelled', count: companyBookingsData.filter(b => b.status === 'Cancelled').length },
  ];

  const columns: Column<Booking>[] = [
    {
      key: 'bookingNumber',
      header: 'Booking #',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <div className="font-mono text-sm font-semibold">{item.bookingNumber}</div>
            <div className="text-xs text-muted-foreground">{item.trackingNumber}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="font-medium truncate max-w-[160px]">{item.customer}</span>
        </div>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      sortable: true,
      render: (item) => (
        <div className="max-w-[200px]">
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="truncate">{item.origin.split(',')[0]}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
            <ArrowRight className="w-2.5 h-2.5" />
            <span className="truncate">{item.destination.split(',')[0]}</span>
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
      key: 'carrier',
      header: 'Carrier',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm">{item.carrier}</span>
        </div>
      ),
    },
    {
      key: 'weight',
      header: 'Weight',
      sortable: true,
      render: (item) => `${(item.weight / 1000).toFixed(1)}t`,
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
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (item) => (
        <Badge className={priorityBadge(item.priority)}>{item.priority}</Badge>
      ),
    },
    {
      key: 'price',
      header: 'Amount',
      sortable: true,
      render: (item) => (
        <div className="font-semibold text-right">
          <span className="text-xs text-muted-foreground">{item.currency}</span>{' '}
          {item.price.toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      key: 'estimatedDelivery',
      header: 'ETA',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm">{new Date(item.estimatedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-7 h-7">
            <Eye className="w-3.5 h-3.5" />
          </Button>
          {item.status === 'Pending' && (
            <Button variant="ghost" size="icon" className="w-7 h-7 text-red-500 hover:text-red-600">
              <XCircle className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="All Bookings"
      description="Manage your company's shipments and freight bookings"
      actions={
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Booking
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{pendingBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{confirmedBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for pickup</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{inTransitBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">On the move</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{deliveredBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground mt-1">All bookings</p>
            </CardContent>
          </Card>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setStatusFilter('all'); }}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted-foreground/10 text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-card border border-border/60 rounded-xl p-4 shadow-soft">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by booking #, customer, route, carrier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nb-search w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
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
                  <SelectItem value="Pending" className="text-[0.82rem]">Pending</SelectItem>
                  <SelectItem value="Confirmed" className="text-[0.82rem]">Confirmed</SelectItem>
                  <SelectItem value="In Transit" className="text-[0.82rem]">In Transit</SelectItem>
                  <SelectItem value="Delivered" className="text-[0.82rem]">Delivered</SelectItem>
                  <SelectItem value="Cancelled" className="text-[0.82rem]">Cancelled</SelectItem>
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

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[120px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:border-primary/50 focus:ring-0">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="nb-dropdown">
                  <SelectItem value="all" className="text-[0.82rem]">All Priorities</SelectItem>
                  <SelectItem value="High" className="text-[0.82rem]">High</SelectItem>
                  <SelectItem value="Medium" className="text-[0.82rem]">Medium</SelectItem>
                  <SelectItem value="Low" className="text-[0.82rem]">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded-xl animate-pulse" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredBookings.length > 0 ? (
          <DataTable
            data={filteredBookings}
            columns={columns}
            searchKey="bookingNumber"
            searchPlaceholder="Search bookings..."
            pageSize={10}
            emptyMessage="No bookings match your filters"
          />
        ) : (
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title="No bookings found"
            description={
              searchQuery || statusFilter !== 'all' || modeFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first booking to get started'
            }
            action={!searchQuery && statusFilter === 'all' && modeFilter === 'all' ? {
              label: 'New Booking',
              onClick: () => {},
            } : undefined}
          />
        )}
      </div>
    </PageWrapper>
  );
}

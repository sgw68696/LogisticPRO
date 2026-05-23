'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search, Plus, Filter, Zap, MapPin, Package,
  DollarSign, TrendingUp, TrendingDown, Clock,
  ArrowRight, Send, CheckCircle2, XCircle, User, AlertCircle,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockSpotRequests = [
  {
    id: 'SPOT-2025-001',
    customer: 'Tech Solutions Pvt Ltd',
    mode: 'Road',
    origin: 'Bangalore',
    destination: 'Mumbai',
    weight: 450,
    targetRate: 38000,
    quotedRate: 36500,
    currency: 'INR',
    status: 'Quoted',
    priority: 'High',
    requestedDate: '2025-01-18',
    validUntil: '2025-01-20',
    carrier: 'BlueDart Freight',
    transitTime: '2 days',
  },
  {
    id: 'SPOT-2025-002',
    customer: 'Global Traders',
    mode: 'Sea',
    origin: 'Mumbai Port',
    destination: 'Singapore',
    weight: 12400,
    targetRate: 155000,
    quotedRate: 148000,
    currency: 'INR',
    status: 'Accepted',
    priority: 'Medium',
    requestedDate: '2025-01-16',
    validUntil: '2025-01-22',
    carrier: 'Maersk India',
    transitTime: '15 days',
  },
  {
    id: 'SPOT-2025-003',
    customer: 'Pharma Industries Ltd',
    mode: 'Air',
    origin: 'Hyderabad',
    destination: 'Dubai',
    weight: 1200,
    targetRate: 118000,
    quotedRate: null,
    currency: 'INR',
    status: 'Pending',
    priority: 'High',
    requestedDate: '2025-01-19',
    validUntil: '2025-01-21',
    carrier: null,
    transitTime: null,
  },
  {
    id: 'SPOT-2025-004',
    customer: 'Elite Electronics',
    mode: 'Rail',
    origin: 'Chennai',
    destination: 'Kolkata',
    weight: 5800,
    targetRate: 72000,
    quotedRate: 68500,
    currency: 'INR',
    status: 'Declined',
    priority: 'Low',
    requestedDate: '2025-01-15',
    validUntil: '2025-01-18',
    carrier: 'Container Rail',
    transitTime: '4 days',
  },
  {
    id: 'SPOT-2025-005',
    customer: 'Sunrise Industries',
    mode: 'Road',
    origin: 'Pune',
    destination: 'Ahmedabad',
    weight: 320,
    targetRate: 28000,
    quotedRate: 27500,
    currency: 'INR',
    status: 'Quoted',
    priority: 'High',
    requestedDate: '2025-01-19',
    validUntil: '2025-01-21',
    carrier: 'Gati Express',
    transitTime: '1 day',
  },
  {
    id: 'SPOT-2025-006',
    customer: 'MediCore Pharma',
    mode: 'Air',
    origin: 'Mumbai',
    destination: 'London',
    weight: 450,
    targetRate: 295000,
    quotedRate: 285000,
    currency: 'INR',
    status: 'Accepted',
    priority: 'High',
    requestedDate: '2025-01-17',
    validUntil: '2025-01-22',
    carrier: 'Emirates SkyCargo',
    transitTime: '1 day',
  },
  {
    id: 'SPOT-2025-007',
    customer: 'Apex Automotive',
    mode: 'Sea',
    origin: 'Chennai Port',
    destination: 'Colombo',
    weight: 18500,
    targetRate: 232000,
    quotedRate: null,
    currency: 'INR',
    status: 'Pending',
    priority: 'Medium',
    requestedDate: '2025-01-20',
    validUntil: '2025-01-24',
    carrier: null,
    transitTime: null,
  },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Pending: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    Quoted: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    Accepted: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    Declined: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
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

const priorityBadge = (priority: string) => {
  const map: Record<string, string> = {
    High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };
  return map[priority] || 'bg-gray-100 text-gray-800';
};

interface SpotRate {
  id: string;
  customer: string;
  mode: string;
  origin: string;
  destination: string;
  weight: number;
  targetRate: number;
  quotedRate: number | null;
  currency: string;
  status: string;
  priority: string;
  requestedDate: string;
  validUntil: string;
  carrier: string | null;
  transitTime: string | null;
}

export default function SpotRatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');

  const filteredRates = mockSpotRequests.filter((rate) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      rate.id.toLowerCase().includes(q) ||
      rate.customer.toLowerCase().includes(q) ||
      rate.origin.toLowerCase().includes(q) ||
      rate.destination.toLowerCase().includes(q) ||
      (rate.carrier && rate.carrier.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'all' || rate.status === statusFilter;
    const matchMode = modeFilter === 'all' || rate.mode === modeFilter;

    return matchSearch && matchStatus && matchMode;
  });

  const totalRequests = mockSpotRequests.length;
  const pendingRequests = mockSpotRequests.filter(r => r.status === 'Pending').length;
  const quotedRequests = mockSpotRequests.filter(r => r.status === 'Quoted').length;
  const acceptedRequests = mockSpotRequests.filter(r => r.status === 'Accepted').length;
  const conversionRate = quotedRequests > 0
    ? Math.round((acceptedRequests / (quotedRequests + acceptedRequests)) * 100)
    : 0;

  const columns: Column<SpotRate>[] = [
    {
      key: 'id',
      header: 'Request ID',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="font-mono text-sm font-semibold">{item.id}</span>
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
          <span className="font-medium truncate max-w-[150px]">{item.customer}</span>
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
      key: 'targetRate',
      header: 'Target Rate',
      sortable: true,
      render: (item) => (
        <div className="font-semibold">
          ₹{(item.targetRate).toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      key: 'quotedRate',
      header: 'Quote',
      sortable: true,
      render: (item) => (
        item.quotedRate ? (
          <div>
            <div className="font-semibold text-green-600 dark:text-green-400">
              ₹{item.quotedRate.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-muted-foreground">
              {item.quotedRate < item.targetRate
                ? `Save ₹${(item.targetRate - item.quotedRate).toLocaleString('en-IN')}`
                : 'At target'}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item) => (
        <Badge className={priorityBadge(item.priority)}>{item.priority}</Badge>
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
      key: 'validUntil',
      header: 'Valid Until',
      sortable: true,
      render: (item) => {
        const validDate = new Date(item.validUntil);
        const now = new Date();
        const isExpiring = item.status === 'Quoted' && Math.ceil((validDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) <= 2;
        return (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <div>
              <div className="text-sm">{validDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
              {isExpiring && <div className="text-xs text-amber-500 font-medium">Expiring soon</div>}
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
          {item.status === 'Pending' && (
            <Button size="sm" className="h-7 gap-1 text-xs">
              <Send className="w-3.5 h-3.5" />
              Quote
            </Button>
          )}
          {item.status === 'Quoted' && (
            <>
              <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                Accept
              </Button>
              <Button size="sm" variant="outline" className="h-7 gap-1 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950">
                <XCircle className="w-3.5 h-3.5" />
                Decline
              </Button>
            </>
          )}
          {(item.status === 'Accepted' || item.status === 'Declined') && (
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              View
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Spot Rate Requests"
      description="Manage real-time spot pricing requests and quotes for your customers"
      actions={
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Spot Request
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRequests}</div>
              <p className="text-xs text-muted-foreground mt-1">All spot requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{pendingRequests}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting quote</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quoted</CardTitle>
              <Send className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{quotedRequests}</div>
              <p className="text-xs text-muted-foreground mt-1">Quotes sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{acceptedRequests}</div>
              <p className="text-xs text-muted-foreground mt-1">Converted</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Quote to booking</p>
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
                placeholder="Search by request ID, customer, route, or carrier..."
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
                  <SelectItem value="Pending" className="text-[0.82rem]">Pending</SelectItem>
                  <SelectItem value="Quoted" className="text-[0.82rem]">Quoted</SelectItem>
                  <SelectItem value="Accepted" className="text-[0.82rem]">Accepted</SelectItem>
                  <SelectItem value="Declined" className="text-[0.82rem]">Declined</SelectItem>
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

        {/* Spot Rates Table */}
        {filteredRates.length > 0 ? (
          <DataTable
            data={filteredRates}
            columns={columns}
            searchKey="id"
            searchPlaceholder="Search spot requests..."
            pageSize={10}
            emptyMessage="No spot rate requests found"
          />
        ) : (
          <EmptyState
            icon={<Zap className="w-8 h-8" />}
            title="No spot rate requests"
            description="Try adjusting your search or filters"
          />
        )}
      </div>
    </PageWrapper>
  );
}

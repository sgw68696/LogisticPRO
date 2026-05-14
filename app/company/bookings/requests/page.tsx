'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search, Filter, Calendar, MapPin, Package,
  Clock, CheckCircle2, XCircle, Send, User, ArrowRight,
  AlertCircle, ClipboardList,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockRequests = [
  {
    id: 'REQ-2025-001',
    customer: 'Tech Solutions Pvt Ltd',
    serviceType: 'Express',
    mode: 'Road',
    origin: 'Bangalore',
    destination: 'Mumbai',
    weight: 450,
    status: 'Pending',
    priority: 'High',
    requestedDate: '2025-01-18',
    requiredBy: '2025-01-22',
    notes: 'Fragile electronics, handle with care',
    createdBy: 'user-001',
    createdAt: '2025-01-17',
  },
  {
    id: 'REQ-2025-002',
    customer: 'Global Traders',
    serviceType: 'Freight',
    mode: 'Sea',
    origin: 'Mumbai Port',
    destination: 'Singapore',
    weight: 12400,
    status: 'Pending',
    priority: 'Medium',
    requestedDate: '2025-01-22',
    requiredBy: '2025-02-05',
    notes: 'Containerized cargo, FCL',
    createdBy: 'user-002',
    createdAt: '2025-01-17',
  },
  {
    id: 'REQ-2025-003',
    customer: 'MediCore Pharma',
    serviceType: 'Express',
    mode: 'Air',
    origin: 'Mumbai',
    destination: 'London',
    weight: 450,
    status: 'Approved',
    priority: 'High',
    requestedDate: '2025-01-16',
    requiredBy: '2025-01-20',
    notes: 'Temperature controlled, 2-8°C',
    createdBy: 'user-001',
    createdAt: '2025-01-15',
  },
  {
    id: 'REQ-2025-004',
    customer: 'FreshFarm Produce',
    serviceType: 'Standard',
    mode: 'Road',
    origin: 'Nagpur',
    destination: 'Mumbai',
    weight: 2800,
    status: 'Rejected',
    priority: 'Low',
    requestedDate: '2025-01-14',
    requiredBy: '2025-01-17',
    notes: 'Perishable goods, reefer required',
    createdBy: 'user-003',
    createdAt: '2025-01-13',
  },
  {
    id: 'REQ-2025-005',
    customer: 'Elite Electronics',
    serviceType: 'Freight',
    mode: 'Rail',
    origin: 'Chennai',
    destination: 'Kolkata',
    weight: 5800,
    status: 'Pending',
    priority: 'Medium',
    requestedDate: '2025-01-20',
    requiredBy: '2025-01-28',
    notes: 'High-value electronics, insurance needed',
    createdBy: 'user-002',
    createdAt: '2025-01-16',
  },
  {
    id: 'REQ-2025-006',
    customer: 'Apex Automotive',
    serviceType: 'Freight',
    mode: 'Sea',
    origin: 'Chennai Port',
    destination: 'Colombo',
    weight: 18500,
    status: 'Approved',
    priority: 'High',
    requestedDate: '2025-01-15',
    requiredBy: '2025-01-25',
    notes: 'Auto parts, multiple SKUs',
    createdBy: 'user-003',
    createdAt: '2025-01-14',
  },
  {
    id: 'REQ-2025-007',
    customer: 'Sunrise Industries',
    serviceType: 'Express',
    mode: 'Road',
    origin: 'Pune',
    destination: 'Ahmedabad',
    weight: 320,
    status: 'Pending',
    priority: 'High',
    requestedDate: '2025-01-19',
    requiredBy: '2025-01-21',
    notes: 'Urgent delivery',
    createdBy: 'user-001',
    createdAt: '2025-01-18',
  },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Pending: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    Approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    Rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
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

interface BookingRequest {
  id: string;
  customer: string;
  serviceType: string;
  mode: string;
  origin: string;
  destination: string;
  weight: number;
  status: string;
  priority: string;
  requestedDate: string;
  requiredBy: string;
  notes: string;
  createdBy: string;
  createdAt: string;
}

export default function BookingRequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredRequests = mockRequests.filter((req) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      req.id.toLowerCase().includes(q) ||
      req.customer.toLowerCase().includes(q) ||
      req.origin.toLowerCase().includes(q) ||
      req.destination.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchMode = modeFilter === 'all' || req.mode === modeFilter;
    const matchPriority = priorityFilter === 'all' || req.priority === priorityFilter;

    return matchSearch && matchStatus && matchMode && matchPriority;
  });

  const totalRequests = mockRequests.length;
  const pendingRequests = mockRequests.filter(r => r.status === 'Pending').length;
  const approvedRequests = mockRequests.filter(r => r.status === 'Approved').length;
  const rejectedRequests = mockRequests.filter(r => r.status === 'Rejected').length;
  const urgentRequests = mockRequests.filter(r => r.priority === 'High' && r.status === 'Pending').length;

  const columns: Column<BookingRequest>[] = [
    {
      key: 'id',
      header: 'Request ID',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <ClipboardList className="w-3.5 h-3.5 text-primary" />
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
          <span className="font-medium truncate max-w-[160px]">{item.customer}</span>
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
      key: 'priority',
      header: 'Priority',
      render: (item) => (
        <Badge className={priorityBadge(item.priority)}>{item.priority}</Badge>
      ),
    },
    {
      key: 'requiredBy',
      header: 'Required By',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm">{new Date(item.requiredBy).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
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
      key: 'actions',
      header: '',
      render: (item) => (
        <div className="flex items-center gap-1">
          {item.status === 'Pending' && (
            <>
              <Button size="sm" className="h-7 gap-1 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve
              </Button>
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950">
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </Button>
            </>
          )}
          {(item.status === 'Approved' || item.status === 'Rejected') && (
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
      title="Booking Requests"
      description="Review and manage incoming booking requests from customers"
      actions={
        <Button className="gap-2">
          <Send className="w-4 h-4" />
          New Request
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{pendingRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{approvedRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{rejectedRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{urgentRequests}</div>
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
                placeholder="Search by request ID, customer, or route..."
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
                  <SelectItem value="Approved" className="text-[0.82rem]">Approved</SelectItem>
                  <SelectItem value="Rejected" className="text-[0.82rem]">Rejected</SelectItem>
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

        {/* Requests Table */}
        {filteredRequests.length > 0 ? (
          <DataTable
            data={filteredRequests}
            columns={columns}
            searchKey="id"
            searchPlaceholder="Search requests..."
            pageSize={10}
            emptyMessage="No requests found"
          />
        ) : (
          <EmptyState
            icon={<ClipboardList className="w-8 h-8" />}
            title="No booking requests"
            description="There are no requests matching your current filters"
          />
        )}
      </div>
    </PageWrapper>
  );
}

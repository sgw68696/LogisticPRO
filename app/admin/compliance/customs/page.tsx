'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, Plus, Filter, FileText, Globe, Package, AlertTriangle,
  CheckCircle, Clock, Calendar, Eye, Download, TrendingUp, TrendingDown
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock customs declarations data
const mockCustomsDeclarations = [
  {
    id: 'customs-001',
    declarationNumber: 'CD-2024-001',
    shipmentId: 'shp-001',
    bookingId: 'bk-001',
    companyId: 'cmp-001',
    companyName: 'Global Logistics Ltd',
    customerId: 'cust-001',
    customerName: 'John Smith',
    declarationType: 'Import',
    originCountry: 'USA',
    destinationCountry: 'India',
    portOfEntry: 'Mumbai Port',
    portOfExit: 'New York Port',
    commodityType: 'Electronics',
    hsCode: '8517.12.00',
    declaredValue: 15000.00,
    currency: 'USD',
    duties: 2250.00,
    taxes: 750.00,
    totalDuties: 3000.00,
    status: 'Cleared',
    submittedDate: '2024-01-10',
    clearedDate: '2024-01-12',
    processingTime: '48 hours',
    riskLevel: 'Low',
    inspectionRequired: false,
    documents: ['Commercial Invoice', 'Packing List', 'Bill of Lading'],
    createdBy: 'admin-001',
    approvedBy: 'customs-officer-001',
    remarks: 'Standard clearance - no issues found',
  },
  {
    id: 'customs-002',
    declarationNumber: 'CD-2024-002',
    shipmentId: 'shp-002',
    bookingId: 'bk-002',
    companyId: 'cmp-002',
    companyName: 'Swift Transport Co',
    customerId: 'cust-002',
    customerName: 'Sarah Johnson',
    declarationType: 'Export',
    originCountry: 'India',
    destinationCountry: 'UK',
    portOfEntry: 'London Port',
    portOfExit: 'Delhi Port',
    commodityType: 'Textiles',
    hsCode: '5208.32.00',
    declaredValue: 8500.00,
    currency: 'USD',
    duties: 0.00,
    taxes: 425.00,
    totalDuties: 425.00,
    status: 'Under Review',
    submittedDate: '2024-01-11',
    clearedDate: null,
    processingTime: 'In Progress',
    riskLevel: 'Medium',
    inspectionRequired: true,
    documents: ['Commercial Invoice', 'Export License', 'Certificate of Origin'],
    createdBy: 'admin-002',
    approvedBy: null,
    remarks: 'Physical inspection required for textile verification',
  },
  {
    id: 'customs-003',
    declarationNumber: 'CD-2024-003',
    shipmentId: 'shp-003',
    bookingId: 'bk-003',
    companyId: 'cmp-001',
    companyName: 'Global Logistics Ltd',
    customerId: 'cust-003',
    customerName: 'Michael Chen',
    declarationType: 'Import',
    originCountry: 'China',
    destinationCountry: 'India',
    portOfEntry: 'Chennai Port',
    portOfExit: 'Shanghai Port',
    commodityType: 'Machinery',
    hsCode: '8479.90.90',
    declaredValue: 25000.00,
    currency: 'USD',
    duties: 3750.00,
    taxes: 1250.00,
    totalDuties: 5000.00,
    status: 'Flagged',
    submittedDate: '2024-01-09',
    clearedDate: null,
    processingTime: 'On Hold',
    riskLevel: 'High',
    inspectionRequired: true,
    documents: ['Commercial Invoice', 'Packing List', 'Import License'],
    createdBy: 'admin-001',
    approvedBy: null,
    remarks: 'Flagged for additional documentation - import license verification required',
  },
  {
    id: 'customs-004',
    declarationNumber: 'CD-2024-004',
    shipmentId: 'shp-004',
    bookingId: 'bk-004',
    companyId: 'cmp-003',
    companyName: 'Express Delivery Inc',
    customerId: 'cust-004',
    customerName: 'Emily Davis',
    declarationType: 'Import',
    originCountry: 'UAE',
    destinationCountry: 'India',
    portOfEntry: 'Mumbai Port',
    portOfExit: 'Dubai Port',
    commodityType: 'Perfumes',
    hsCode: '3303.00.10',
    declaredValue: 5000.00,
    currency: 'USD',
    duties: 750.00,
    taxes: 250.00,
    totalDuties: 1000.00,
    status: 'Rejected',
    submittedDate: '2024-01-08',
    clearedDate: '2024-01-10',
    processingTime: '72 hours',
    riskLevel: 'High',
    inspectionRequired: true,
    documents: ['Commercial Invoice', 'Packing List'],
    createdBy: 'admin-003',
    approvedBy: 'customs-officer-002',
    remarks: 'Rejected - missing required import permits for controlled substances',
  },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Cleared: 'bg-green-100 text-green-800 border-green-200',
    'Under Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Flagged: 'bg-orange-100 text-orange-800 border-orange-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
    Pending: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return map[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const riskLevelBadge = (level: string) => {
  const map: Record<string, string> = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800',
  };
  return map[level] || 'bg-gray-100 text-gray-800';
};

const declarationTypeBadge = (type: string) => {
  const map: Record<string, string> = {
    Import: 'bg-blue-100 text-blue-800',
    Export: 'bg-purple-100 text-purple-800',
    'Transit': 'bg-gray-100 text-gray-800',
  };
  return map[type] || 'bg-gray-100 text-gray-800';
};

export default function CustomsDeclarationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredDeclarations = mockCustomsDeclarations.filter((declaration) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      declaration.declarationNumber.toLowerCase().includes(q) ||
      declaration.customerName.toLowerCase().includes(q) ||
      declaration.companyName.toLowerCase().includes(q) ||
      declaration.commodityType.toLowerCase().includes(q) ||
      declaration.hsCode.toLowerCase().includes(q);
    
    const matchStatus = statusFilter === 'all' || declaration.status === statusFilter;
    const matchRisk = riskFilter === 'all' || declaration.riskLevel === riskFilter;
    const matchType = typeFilter === 'all' || declaration.declarationType === typeFilter;
    
    return matchSearch && matchStatus && matchRisk && matchType;
  });

  // Calculate KPIs
  const totalDeclarations = mockCustomsDeclarations.length;
  const clearedDeclarations = mockCustomsDeclarations.filter(d => d.status === 'Cleared').length;
  const underReviewDeclarations = mockCustomsDeclarations.filter(d => d.status === 'Under Review').length;
  const flaggedDeclarations = mockCustomsDeclarations.filter(d => d.status === 'Flagged' || d.status === 'Rejected').length;
  const totalDutiesCollected = mockCustomsDeclarations
    .filter(d => d.status === 'Cleared')
    .reduce((sum, d) => sum + d.totalDuties, 0);

  const columns: Column<typeof mockCustomsDeclarations[0]>[] = [
    {
      key: 'declarationNumber',
      header: 'Declaration #',
      sortable: true,
      render: (item) => (
        <div className="font-mono text-sm font-semibold">{item.declarationNumber}</div>
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
        <div className="font-medium">{item.customerName}</div>
      ),
    },
    {
      key: 'declarationType',
      header: 'Type',
      render: (item) => (
        <Badge className={declarationTypeBadge(item.declarationType)}>
          {item.declarationType}
        </Badge>
      ),
    },
    {
      key: 'route',
      header: 'Route',
      sortable: true,
      render: (item) => (
        <div className="max-w-[150px]">
          <div className="flex items-center gap-1 text-sm">
            <Globe className="w-3 h-3 text-muted-foreground" />
            <span className="truncate">{item.originCountry}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className="w-px h-px bg-muted-foreground mx-1" />
            <span className="truncate">{item.destinationCountry}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'commodityType',
      header: 'Commodity',
      sortable: true,
      render: (item) => (
        <div className="max-w-[120px]">
          <div className="font-medium">{item.commodityType}</div>
          <div className="text-xs text-muted-foreground font-mono">{item.hsCode}</div>
        </div>
      ),
    },
    {
      key: 'declaredValue',
      header: 'Declared Value',
      sortable: true,
      render: (item) => (
        <div className="font-semibold">
          {item.currency} {item.declaredValue.toLocaleString()}
        </div>
      ),
    },
    {
      key: 'totalDuties',
      header: 'Duties & Taxes',
      sortable: true,
      render: (item) => (
        <div className="font-semibold text-green-600">
          {item.currency} {item.totalDuties.toLocaleString()}
        </div>
      ),
    },
    {
      key: 'riskLevel',
      header: 'Risk Level',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Badge className={riskLevelBadge(item.riskLevel)}>
            {item.riskLevel}
          </Badge>
          {item.inspectionRequired && (
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          )}
        </div>
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
      key: 'submittedDate',
      header: 'Submitted',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{new Date(item.submittedDate).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="w-3 h-3" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-3 h-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Customs Declarations"
      description="Monitor all customs declarations across companies"
      actions={
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Declaration
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Declarations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDeclarations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cleared</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{clearedDeclarations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{underReviewDeclarations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged/Rejected</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{flaggedDeclarations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duties Collected</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                USD {totalDutiesCollected.toLocaleString()}
              </div>
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
                placeholder="Search by declaration #, customer, commodity, or HS code..."
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
                  <SelectItem value="all" className="text-[0.82rem]">All Status</SelectItem>
                  <SelectItem value="Cleared" className="text-[0.82rem]">Cleared</SelectItem>
                  <SelectItem value="Under Review" className="text-[0.82rem]">Under Review</SelectItem>
                  <SelectItem value="Flagged" className="text-[0.82rem]">Flagged</SelectItem>
                  <SelectItem value="Rejected" className="text-[0.82rem]">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[120px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:border-primary/50 focus:ring-0">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent className="nb-dropdown">
                  <SelectItem value="all" className="text-[0.82rem]">All Risk</SelectItem>
                  <SelectItem value="Low" className="text-[0.82rem]">Low</SelectItem>
                  <SelectItem value="Medium" className="text-[0.82rem]">Medium</SelectItem>
                  <SelectItem value="High" className="text-[0.82rem]">High</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:border-primary/50 focus:ring-0">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="nb-dropdown">
                  <SelectItem value="all" className="text-[0.82rem]">All Types</SelectItem>
                  <SelectItem value="Import" className="text-[0.82rem]">Import</SelectItem>
                  <SelectItem value="Export" className="text-[0.82rem]">Export</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Declarations Table */}
        <DataTable
          data={filteredDeclarations}
          columns={columns}
          searchKey="declarationNumber"
          searchPlaceholder="Search declarations..."
          pageSize={20}
          emptyMessage="No customs declarations found"
        />
      </div>
    </PageWrapper>
  );
}

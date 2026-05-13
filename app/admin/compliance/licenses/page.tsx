'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, Plus, Filter, FileText, Building, Shield, Calendar,
  AlertTriangle, CheckCircle, Clock, Download, TrendingUp, TrendingDown
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock import/export licenses data
const mockLicenses = [
  {
    id: 'license-001',
    licenseNumber: 'IMP-2024-001',
    licenseType: 'Import',
    companyId: 'cmp-001',
    companyName: 'Global Logistics Ltd',
    licenseCategory: 'Electronics Import',
    issuingAuthority: 'Directorate General of Foreign Trade',
    countryOfIssue: 'India',
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    status: 'Active',
    approvedBy: 'authority-001',
    approvedDate: '2023-12-15',
    commodityTypes: ['Consumer Electronics', 'Computer Hardware'],
    restrictions: 'No restricted items',
    maxAnnualValue: 5000000.00,
    currency: 'USD',
    currentUsage: 2150000.00,
    renewalRequired: false,
    documents: ['Import License Certificate', 'Company Registration', 'Tax Clearance'],
    createdBy: 'admin-001',
    lastUpdated: '2024-01-10',
    riskLevel: 'Low',
  },
  {
    id: 'license-002',
    licenseNumber: 'EXP-2024-002',
    licenseType: 'Export',
    companyId: 'cmp-002',
    companyName: 'Swift Transport Co',
    licenseCategory: 'Textile Export',
    issuingAuthority: 'Ministry of Commerce & Industry',
    countryOfIssue: 'India',
    validFrom: '2024-01-15',
    validTo: '2024-06-30',
    status: 'Active',
    approvedBy: 'authority-002',
    approvedDate: '2024-01-10',
    commodityTypes: ['Cotton Textiles', 'Synthetic Fabrics'],
    restrictions: 'Quota-based export limits',
    maxAnnualValue: 2000000.00,
    currency: 'USD',
    currentUsage: 1450000.00,
    renewalRequired: true,
    documents: ['Export License', 'Quality Certification', 'Environmental Clearance'],
    createdBy: 'admin-002',
    lastUpdated: '2024-01-12',
    riskLevel: 'Medium',
  },
  {
    id: 'license-003',
    licenseNumber: 'IMP-2024-003',
    licenseType: 'Import',
    companyId: 'cmp-003',
    companyName: 'Express Delivery Inc',
    licenseCategory: 'Pharmaceutical Import',
    issuingAuthority: 'Food and Drug Administration',
    countryOfIssue: 'India',
    validFrom: '2024-02-01',
    validTo: '2025-01-31',
    status: 'Under Review',
    approvedBy: null,
    approvedDate: null,
    commodityTypes: ['Generic Medicines', 'Medical Devices'],
    restrictions: 'FDA approval required for all items',
    maxAnnualValue: 10000000.00,
    currency: 'USD',
    currentUsage: 0.00,
    renewalRequired: false,
    documents: ['Application Form', 'Company License', 'Drug Manufacturing License'],
    createdBy: 'admin-003',
    lastUpdated: '2024-01-11',
    riskLevel: 'High',
  },
  {
    id: 'license-004',
    licenseNumber: 'EXP-2024-004',
    licenseType: 'Export',
    companyId: 'cmp-001',
    companyName: 'Global Logistics Ltd',
    licenseCategory: 'Gems & Jewelry Export',
    issuingAuthority: 'Gems and Jewellery Export Promotion Council',
    countryOfIssue: 'India',
    validFrom: '2023-07-01',
    validTo: '2024-06-30',
    status: 'Expired',
    approvedBy: 'authority-003',
    approvedDate: '2023-06-20',
    commodityTypes: ['Gold Jewelry', 'Silver Items', 'Precious Stones'],
    restrictions: 'Hallmarking required for gold items',
    maxAnnualValue: 3000000.00,
    currency: 'USD',
    currentUsage: 2800000.00,
    renewalRequired: true,
    documents: ['Export License', 'Hallmark Certificate', 'Quality Assessment'],
    createdBy: 'admin-001',
    lastUpdated: '2024-01-01',
    riskLevel: 'Medium',
  },
  {
    id: 'license-005',
    licenseNumber: 'IMP-2024-005',
    licenseType: 'Import',
    companyId: 'cmp-002',
    companyName: 'Swift Transport Co',
    licenseCategory: 'Chemical Import',
    issuingAuthority: 'Chemical and Fertilizers Ministry',
    countryOfIssue: 'India',
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    status: 'Suspended',
    approvedBy: 'authority-004',
    approvedDate: '2023-12-10',
    commodityTypes: ['Industrial Chemicals', 'Fertilizers'],
    restrictions: 'Environmental compliance mandatory',
    maxAnnualValue: 7500000.00,
    currency: 'USD',
    currentUsage: 1200000.00,
    renewalRequired: false,
    documents: ['Import License', 'Environmental Clearance', 'Safety Data Sheets'],
    createdBy: 'admin-002',
    lastUpdated: '2024-01-05',
    riskLevel: 'High',
    suspensionReason: 'Non-compliance with safety regulations',
  },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Expired: 'bg-red-100 text-red-800 border-red-200',
    'Under Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Suspended: 'bg-orange-100 text-orange-800 border-orange-200',
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

const licenseTypeBadge = (type: string) => {
  const map: Record<string, string> = {
    Import: 'bg-blue-100 text-blue-800',
    Export: 'bg-purple-100 text-purple-800',
  };
  return map[type] || 'bg-gray-100 text-gray-800';
};

export default function LicensesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  const filteredLicenses = mockLicenses.filter((license) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      license.licenseNumber.toLowerCase().includes(q) ||
      license.companyName.toLowerCase().includes(q) ||
      license.licenseCategory.toLowerCase().includes(q) ||
      license.issuingAuthority.toLowerCase().includes(q);
    
    const matchStatus = statusFilter === 'all' || license.status === statusFilter;
    const matchType = typeFilter === 'all' || license.licenseType === typeFilter;
    const matchRisk = riskFilter === 'all' || license.riskLevel === riskFilter;
    
    return matchSearch && matchStatus && matchType && matchRisk;
  });

  // Calculate KPIs
  const totalLicenses = mockLicenses.length;
  const activeLicenses = mockLicenses.filter(l => l.status === 'Active').length;
  const expiredLicenses = mockLicenses.filter(l => l.status === 'Expired').length;
  const suspendedLicenses = mockLicenses.filter(l => l.status === 'Suspended').length;
  const totalAuthorizedValue = mockLicenses
    .filter(l => l.status === 'Active')
    .reduce((sum, l) => sum + l.maxAnnualValue, 0);

  const columns: Column<typeof mockLicenses[0]>[] = [
    {
      key: 'licenseNumber',
      header: 'License #',
      sortable: true,
      render: (item) => (
        <div className="font-mono text-sm font-semibold">{item.licenseNumber}</div>
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
      key: 'licenseType',
      header: 'Type',
      render: (item) => (
        <Badge className={licenseTypeBadge(item.licenseType)}>
          {item.licenseType}
        </Badge>
      ),
    },
    {
      key: 'licenseCategory',
      header: 'Category',
      sortable: true,
      render: (item) => (
        <div className="max-w-[180px]">
          <div className="font-medium">{item.licenseCategory}</div>
          <div className="text-xs text-muted-foreground">{item.issuingAuthority}</div>
        </div>
      ),
    },
    {
      key: 'commodityTypes',
      header: 'Commodities',
      sortable: true,
      render: (item) => (
        <div className="max-w-[200px]">
          {item.commodityTypes.slice(0, 2).map((commodity, index) => (
            <div key={index} className="text-xs bg-muted/50 px-2 py-1 rounded mb-1">
              {commodity}
            </div>
          ))}
          {item.commodityTypes.length > 2 && (
            <div className="text-xs text-muted-foreground">
              +{item.commodityTypes.length - 2} more
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'maxAnnualValue',
      header: 'Authorized Value',
      sortable: true,
      render: (item) => (
        <div className="font-semibold">
          {item.currency} {item.maxAnnualValue.toLocaleString()}
        </div>
      ),
    },
    {
      key: 'currentUsage',
      header: 'Usage',
      sortable: true,
      render: (item) => {
        const usagePercentage = (item.currentUsage / item.maxAnnualValue) * 100;
        return (
          <div>
            <div className="font-semibold">
              {item.currency} {item.currentUsage.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {usagePercentage.toFixed(1)}% used
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className={`h-1.5 rounded-full ${
                  usagePercentage > 80 ? 'bg-red-500' :
                  usagePercentage > 60 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'riskLevel',
      header: 'Risk',
      sortable: true,
      render: (item) => (
        <Badge className={riskLevelBadge(item.riskLevel)}>
          {item.riskLevel}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Badge className={statusBadge(item.status)}>
            {item.status}
          </Badge>
          {item.renewalRequired && (
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          )}
        </div>
      ),
    },
    {
      key: 'validTo',
      header: 'Valid Until',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{new Date(item.validTo).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText className="w-3 h-3" />
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
      title="Import/Export Licenses"
      description="Manage licenses and permits for imports and exports"
      actions={
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New License
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLicenses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeLicenses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{expiredLicenses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspended</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{suspendedLicenses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Authorized Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                USD {totalAuthorizedValue.toLocaleString()}
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
                placeholder="Search by license #, company, category, or authority..."
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
                  <SelectItem value="Active" className="text-[0.82rem]">Active</SelectItem>
                  <SelectItem value="Expired" className="text-[0.82rem]">Expired</SelectItem>
                  <SelectItem value="Suspended" className="text-[0.82rem]">Suspended</SelectItem>
                  <SelectItem value="Under Review" className="text-[0.82rem]">Under Review</SelectItem>
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
              
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[110px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:border-primary/50 focus:ring-0">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent className="nb-dropdown">
                  <SelectItem value="all" className="text-[0.82rem]">All Risk</SelectItem>
                  <SelectItem value="Low" className="text-[0.82rem]">Low</SelectItem>
                  <SelectItem value="Medium" className="text-[0.82rem]">Medium</SelectItem>
                  <SelectItem value="High" className="text-[0.82rem]">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Licenses Table */}
        <DataTable
          data={filteredLicenses}
          columns={columns}
          searchKey="licenseNumber"
          searchPlaceholder="Search licenses..."
          pageSize={15}
          emptyMessage="No licenses found"
        />
      </div>
    </PageWrapper>
  );
}

'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, Plus, Filter, FileText, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Calendar, Download, BarChart3,
  Shield, Eye, Clock, Activity
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock compliance reports data
const mockComplianceReports = [
  {
    id: 'report-001',
    reportNumber: 'CR-2024-001',
    reportType: 'Monthly Compliance',
    category: 'Customs Clearance',
    companyId: 'all',
    companyName: 'All Companies',
    reportingPeriod: 'January 2024',
    generatedDate: '2024-02-05',
    status: 'Completed',
    complianceScore: 94.5,
    totalDeclarations: 1245,
    clearedDeclarations: 1178,
    flaggedDeclarations: 45,
    rejectedDeclarations: 22,
    totalDuties: 2850000.00,
    currency: 'USD',
    riskLevel: 'Low',
    issuesIdentified: 12,
    criticalIssues: 2,
    recommendations: 8,
    nextReviewDate: '2024-03-05',
    reviewedBy: 'compliance-officer-001',
    documents: ['Report PDF', 'Detailed Analytics', 'Issue Log'],
    createdBy: 'admin-001',
  },
  {
    id: 'report-002',
    reportNumber: 'CR-2024-002',
    reportType: 'License Audit',
    category: 'Import/Export Licenses',
    companyId: 'cmp-001',
    companyName: 'Global Logistics Ltd',
    reportingPeriod: 'Q1 2024',
    generatedDate: '2024-04-10',
    status: 'In Progress',
    complianceScore: 87.2,
    totalLicenses: 15,
    activeLicenses: 12,
    expiredLicenses: 2,
    suspendedLicenses: 1,
    totalAuthorizedValue: 12500000.00,
    currency: 'USD',
    riskLevel: 'Medium',
    issuesIdentified: 8,
    criticalIssues: 1,
    recommendations: 12,
    nextReviewDate: '2024-05-10',
    reviewedBy: null,
    documents: ['Draft Report', 'License Inventory'],
    createdBy: 'admin-002',
  },
  {
    id: 'report-003',
    reportNumber: 'CR-2024-003',
    reportType: 'Regulatory Compliance',
    category: 'Safety & Environmental',
    companyId: 'all',
    companyName: 'All Companies',
    reportingPeriod: '2024 Annual',
    generatedDate: '2024-01-15',
    status: 'Scheduled',
    complianceScore: 0,
    totalDeclarations: 0,
    clearedDeclarations: 0,
    flaggedDeclarations: 0,
    rejectedDeclarations: 0,
    totalDuties: 0,
    currency: 'USD',
    riskLevel: 'Unknown',
    issuesIdentified: 0,
    criticalIssues: 0,
    recommendations: 0,
    nextReviewDate: '2024-12-31',
    reviewedBy: null,
    documents: [],
    createdBy: 'admin-001',
  },
  {
    id: 'report-004',
    reportNumber: 'CR-2024-004',
    reportType: 'Weekly Risk Assessment',
    category: 'High-Risk Shipments',
    companyId: 'cmp-002',
    companyName: 'Swift Transport Co',
    reportingPeriod: 'Week 2, Jan 2024',
    generatedDate: '2024-01-12',
    status: 'Completed',
    complianceScore: 76.8,
    totalDeclarations: 156,
    clearedDeclarations: 120,
    flaggedDeclarations: 28,
    rejectedDeclarations: 8,
    totalDuties: 450000.00,
    currency: 'USD',
    riskLevel: 'High',
    issuesIdentified: 15,
    criticalIssues: 4,
    recommendations: 18,
    nextReviewDate: '2024-01-19',
    reviewedBy: 'compliance-officer-002',
    documents: ['Risk Report', 'Flagged Items List', 'Action Plan'],
    createdBy: 'admin-003',
  },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Completed: 'bg-green-100 text-green-800 border-green-200',
    'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    Failed: 'bg-red-100 text-red-800 border-red-200',
  };
  return map[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const riskLevelBadge = (level: string) => {
  const map: Record<string, string> = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800',
    Unknown: 'bg-gray-100 text-gray-800',
  };
  return map[level] || 'bg-gray-100 text-gray-800';
};

const reportTypeBadge = (type: string) => {
  const map: Record<string, string> = {
    'Monthly Compliance': 'bg-blue-100 text-blue-800',
    'License Audit': 'bg-purple-100 text-purple-800',
    'Regulatory Compliance': 'bg-orange-100 text-orange-800',
    'Weekly Risk Assessment': 'bg-red-100 text-red-800',
  };
  return map[type] || 'bg-gray-100 text-gray-800';
};

export default function ComplianceReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredReports = mockComplianceReports.filter((report) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      report.reportNumber.toLowerCase().includes(q) ||
      report.reportType.toLowerCase().includes(q) ||
      report.companyName.toLowerCase().includes(q) ||
      report.category.toLowerCase().includes(q);
    
    const matchStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchRisk = riskFilter === 'all' || report.riskLevel === riskFilter;
    const matchType = typeFilter === 'all' || report.reportType === typeFilter;
    
    return matchSearch && matchStatus && matchRisk && matchType;
  });

  // Calculate KPIs
  const totalReports = mockComplianceReports.length;
  const completedReports = mockComplianceReports.filter(r => r.status === 'Completed').length;
  const inProgressReports = mockComplianceReports.filter(r => r.status === 'In Progress').length;
  const scheduledReports = mockComplianceReports.filter(r => r.status === 'Scheduled').length;
  const avgComplianceScore = mockComplianceReports
    .filter(r => r.complianceScore > 0)
    .reduce((sum, r) => sum + r.complianceScore, 0) / 
    mockComplianceReports.filter(r => r.complianceScore > 0).length;

  const columns: Column<typeof mockComplianceReports[0]>[] = [
    {
      key: 'reportNumber',
      header: 'Report #',
      sortable: true,
      render: (item) => (
        <div className="font-mono text-sm font-semibold">{item.reportNumber}</div>
      ),
    },
    {
      key: 'reportType',
      header: 'Report Type',
      sortable: true,
      render: (item) => (
        <Badge className={reportTypeBadge(item.reportType)}>
          {item.reportType}
        </Badge>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => (
        <div className="max-w-[150px]">
          <div className="font-medium">{item.category}</div>
        </div>
      ),
    },
    {
      key: 'companyName',
      header: 'Scope',
      sortable: true,
      render: (item) => (
        <Badge variant={item.companyId === 'all' ? 'default' : 'secondary'}>
          {item.companyName}
        </Badge>
      ),
    },
    {
      key: 'reportingPeriod',
      header: 'Period',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{item.reportingPeriod}</span>
        </div>
      ),
    },
    {
      key: 'complianceScore',
      header: 'Compliance Score',
      sortable: true,
      render: (item) => {
        if (item.complianceScore === 0) {
          return <div className="text-muted-foreground">-</div>;
        }
        const scoreColor = item.complianceScore >= 90 ? 'text-green-600' :
                         item.complianceScore >= 80 ? 'text-yellow-600' :
                         item.complianceScore >= 70 ? 'text-orange-600' :
                         'text-red-600';
        return (
          <div className="flex items-center gap-2">
            <div className={`font-bold ${scoreColor}`}>{item.complianceScore.toFixed(1)}%</div>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
        );
      },
    },
    {
      key: 'totalDeclarations',
      header: 'Declarations',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold">{item.totalDeclarations}</div>
          <div className="text-xs text-green-600">Cleared: {item.clearedDeclarations}</div>
          <div className="text-xs text-red-600">Flagged: {item.flaggedDeclarations}</div>
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
          {item.criticalIssues > 0 && (
            <AlertTriangle className="w-4 h-4 text-red-600" />
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
      key: 'generatedDate',
      header: 'Generated',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{new Date(item.generatedDate).toLocaleDateString()}</span>
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
      title="Compliance Reports"
      description="Regulatory compliance reports and analytics"
      actions={
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Generate Report
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReports}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedReports}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{inProgressReports}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{scheduledReports}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Compliance</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgComplianceScore.toFixed(1)}%</div>
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
                placeholder="Search by report #, type, category, or company..."
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
                  <SelectItem value="Completed" className="text-[0.82rem]">Completed</SelectItem>
                  <SelectItem value="In Progress" className="text-[0.82rem]">In Progress</SelectItem>
                  <SelectItem value="Scheduled" className="text-[0.82rem]">Scheduled</SelectItem>
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
                <SelectTrigger className="w-[160px] h-9 text-[0.82rem] bg-muted/40 border-border/60 rounded-[9px] focus:border-primary/50 focus:ring-0">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent className="nb-dropdown">
                  <SelectItem value="all" className="text-[0.82rem]">All Types</SelectItem>
                  <SelectItem value="Monthly Compliance" className="text-[0.82rem]">Monthly Compliance</SelectItem>
                  <SelectItem value="License Audit" className="text-[0.82rem]">License Audit</SelectItem>
                  <SelectItem value="Regulatory Compliance" className="text-[0.82rem]">Regulatory Compliance</SelectItem>
                  <SelectItem value="Weekly Risk Assessment" className="text-[0.82rem]">Weekly Risk Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <DataTable
          data={filteredReports}
          columns={columns}
          searchKey="reportNumber"
          searchPlaceholder="Search compliance reports..."
          pageSize={15}
          emptyMessage="No compliance reports found"
        />
      </div>
    </PageWrapper>
  );
}

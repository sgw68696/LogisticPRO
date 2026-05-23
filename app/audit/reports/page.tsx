'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { auditService } from '@/services/audit/auditService';
import { ReportCard } from '@/components/audit/ReportCard';
import { ComplianceHeatmap } from '@/components/audit/ComplianceHeatmap';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  FileText,
  Download,
  Eye,
  Search,
  X,
  RotateCcw,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Scale,
  DollarSign,
  Shield,
} from 'lucide-react';
import type { AuditReport, AuditFinding } from '@/types/audit';

const REPORT_TYPES = ['All', 'Compliance', 'Financial', 'Operational', 'Security', 'Custom'] as const;
const REPORT_STATUSES = ['All', 'Draft', 'Final', 'Archived'] as const;

const typeColors: Record<string, string> = {
  Compliance: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Financial: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Operational: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Security: 'bg-red-500/10 text-red-400 border-red-500/20',
  Custom: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const statusColors: Record<string, string> = {
  Draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Final: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Archived: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const severityColors: Record<string, string> = {
  Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  High: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const findingStatusColors: Record<string, string> = {
  'Open': 'bg-red-500/10 text-red-400 border-red-500/20',
  'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Resolved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Won\'t Fix': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function FindingSeverityIcon({ severity }: { severity: string }) {
  if (severity === 'Critical') return <ShieldAlert className="w-3.5 h-3.5 text-red-400" />;
  if (severity === 'High') return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
  if (severity === 'Medium') return <Clock className="w-3.5 h-3.5 text-blue-400" />;
  return <CheckCircle className="w-3.5 h-3.5 text-slate-400" />;
}

export default function AuditReportsPage() {
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedReport, setSelectedReport] = useState<AuditReport | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await auditService.getReports();
        setReports(data);
      } catch (err) {
        console.error('Failed to load audit reports:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredReports = useMemo(() => {
    let result = [...reports];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q));
    }
    if (typeFilter !== 'All') {
      result = result.filter(r => r.type === typeFilter);
    }
    if (statusFilter !== 'All') {
      result = result.filter(r => r.status === statusFilter);
    }
    return result;
  }, [reports, searchQuery, typeFilter, statusFilter]);

  const kpiData = useMemo(() => {
    if (!reports.length) {
      return [
        { title: 'Total Reports', value: '0', icon: <FileText className="w-5 h-5" />, description: 'No reports generated', iconColor: 'indigo' as const },
        { title: 'Compliance Score', value: 'N/A', icon: <Scale className="w-5 h-5" />, description: 'No data available', iconColor: 'teal' as const },
        { title: 'Open Findings', value: '0', icon: <AlertTriangle className="w-5 h-5" />, description: 'No open findings', iconColor: 'amber' as const },
        { title: 'Risk Score', value: 'N/A', icon: <Shield className="w-5 h-5" />, description: 'No data available', iconColor: 'red' as const },
      ];
    }

    const avgCompliance = Math.round(reports.reduce((sum, r) => sum + r.complianceScore, 0) / reports.length);
    const avgRisk = Math.round(reports.reduce((sum, r) => sum + r.riskScore, 0) / reports.length);
    const openFindings = reports.reduce((sum, r) => sum + r.findings.filter(f => f.status === 'Open').length, 0);

    return [
      { title: 'Total Reports', value: reports.length, icon: <FileText className="w-5 h-5" />, trend: { value: reports.length > 5 ? 12 : 0, isPositive: true }, iconColor: 'indigo' as const },
      { title: 'Compliance Score', value: `${avgCompliance}%`, icon: <Scale className="w-5 h-5" />, trend: { value: avgCompliance >= 85 ? 5 : -3, isPositive: avgCompliance >= 85 }, iconColor: 'teal' as const },
      { title: 'Open Findings', value: openFindings, icon: <AlertTriangle className="w-5 h-5" />, trend: { value: openFindings > 0 ? 8 : 0, isPositive: openFindings === 0 }, iconColor: 'amber' as const },
      { title: 'Risk Score', value: `${avgRisk}`, icon: <Shield className="w-5 h-5" />, trend: { value: avgRisk <= 30 ? 15 : -10, isPositive: avgRisk <= 30 }, iconColor: 'red' as const },
    ];
  }, [reports]);

  const heatmapData = useMemo(() => {
    return [
      { module: 'Shipments', score: 96, status: 'compliant' as const },
      { module: 'Dispatches', score: 92, status: 'compliant' as const },
      { module: 'Fleet', score: 78, status: 'warning' as const },
      { module: 'Warehouse', score: 88, status: 'warning' as const },
      { module: 'Invoices', score: 94, status: 'compliant' as const },
      { module: 'Payments', score: 90, status: 'compliant' as const },
      { module: 'Customs', score: 85, status: 'warning' as const },
      { module: 'Licenses', score: 72, status: 'non-compliant' as const },
      { module: 'Compliance', score: 65, status: 'critical' as const },
    ];
  }, []);

  const slaMetrics = useMemo(() => {
    const moduleMap: Record<string, { slaTarget: number; slaAchieved: number; violations: number }> = {};
    reports.forEach(r => {
      r.slaMetrics?.forEach(sla => {
        if (!moduleMap[sla.module]) {
          moduleMap[sla.module] = { slaTarget: 0, slaAchieved: 0, violations: 0 };
        }
        moduleMap[sla.module].slaTarget += sla.slaTarget;
        moduleMap[sla.module].slaAchieved += sla.slaAchieved;
        moduleMap[sla.module].violations += sla.violations;
      });
    });
    return Object.entries(moduleMap).map(([module, data]) => ({
      module,
      slaTarget: Math.round(data.slaTarget / reports.length),
      slaAchieved: Math.round(data.slaAchieved / reports.length),
      violations: data.violations,
      complianceRate: Math.round((data.slaAchieved / (data.slaTarget || 1)) * 100),
    }));
  }, [reports]);

  const allFindings = useMemo(() => {
    const findings = reports.flatMap(r => r.findings);
    const severityCount = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    findings.forEach(f => { severityCount[f.severity]++; });
    return { findings, severityCount };
  }, [reports]);

  const handleView = useCallback((report: AuditReport) => {
    setSelectedReport(report);
  }, []);

  const handleDownload = useCallback((report: AuditReport) => {
    setToast({ visible: true, message: `Downloading ${report.title}...` });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  }, []);

  const handleGenerateReport = useCallback(() => {
    setToast({ visible: true, message: 'Simulation mode: Report generation not available in read-only mode' });
    setTimeout(() => setToast({ visible: false, message: '' }), 4000);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setTypeFilter('All');
    setStatusFilter('All');
  }, []);

  const hasActiveFilters = searchQuery || typeFilter !== 'All' || statusFilter !== 'All';

  return (
    <PageWrapper
      title="Audit Reports"
      description="Enterprise audit reports, compliance scorecards, and risk analysis"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs px-2.5 py-1">
            <Eye className="w-3 h-3 mr-1" />
            Read-Only
          </Badge>
          <Button size="sm" onClick={handleGenerateReport}>
            <FileText className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      }
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiData.map((kpi) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trend={'trend' in kpi ? kpi.trend : undefined}
            description={'description' in kpi ? kpi.description : undefined}
            iconColor={kpi.iconColor}
          />
        ))}
      </div>

      {/* Toast notification */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-2 fade-in duration-200">
          <div className="bg-card border border-border/60 rounded-xl px-5 py-3.5 shadow-xl backdrop-blur-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-sm text-foreground font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedReport(null)}>
          <div
            className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 m-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#6366f1]/60 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{selectedReport.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={cn('text-[0.6rem] px-1.5 py-0', typeColors[selectedReport.type])}>
                      {selectedReport.type}
                    </Badge>
                    <Badge variant="outline" className={cn('text-[0.6rem] px-1.5 py-0', statusColors[selectedReport.status])}>
                      {selectedReport.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{selectedReport.period}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setSelectedReport(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedReport.summary}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Key Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                    <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Risk Score</p>
                    <p className={cn(
                      'text-lg font-bold mt-1',
                      selectedReport.riskScore > 40 ? 'text-red-400' : selectedReport.riskScore > 25 ? 'text-amber-400' : 'text-emerald-400'
                    )}>{selectedReport.riskScore}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                    <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Compliance</p>
                    <p className={cn(
                      'text-lg font-bold mt-1',
                      selectedReport.complianceScore > 90 ? 'text-emerald-400' : selectedReport.complianceScore > 75 ? 'text-amber-400' : 'text-red-400'
                    )}>{selectedReport.complianceScore}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                    <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Findings</p>
                    <p className="text-lg font-bold mt-1 text-foreground">{selectedReport.findings.length}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                    <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Generated</p>
                    <p className="text-lg font-bold mt-1 text-foreground text-sm">{formatDate(selectedReport.generatedAt)}</p>
                  </div>
                </div>
              </div>

              {selectedReport.metrics.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Report Metrics</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedReport.metrics.map(metric => (
                      <div key={metric.label} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/10 border border-border/30">
                        {metric.trend === 'up'
                          ? <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          : metric.trend === 'down'
                            ? <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
                            : <BarChart3 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        }
                        <div className="min-w-0">
                          <p className="text-[0.65rem] text-muted-foreground truncate">{metric.label}</p>
                          <p className="text-sm font-semibold text-foreground">{metric.value} <span className={cn(
                            'text-[0.6rem] font-normal',
                            metric.trend === 'up' ? 'text-emerald-400' : metric.trend === 'down' ? 'text-red-400' : 'text-muted-foreground'
                          )}>{metric.change > 0 ? '+' : ''}{metric.change}%</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.findings.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Findings</h3>
                  <div className="space-y-2">
                    {selectedReport.findings.map(finding => (
                      <div key={finding.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-muted/10">
                        <FindingSeverityIcon severity={finding.severity} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-foreground">{finding.category}</span>
                            <Badge variant="outline" className={cn('text-[0.55rem] px-1 py-0', severityColors[finding.severity])}>
                              {finding.severity}
                            </Badge>
                            <Badge variant="outline" className={cn('text-[0.55rem] px-1 py-0', findingStatusColors[finding.status])}>
                              {finding.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{finding.description}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-[0.65rem] text-muted-foreground/70">
                            <span>Module: {finding.module}</span>
                            {finding.assignedTo && <span>Assigned to: {finding.assignedTo}</span>}
                            {finding.dueDate && <span>Due: {formatDate(finding.dueDate)}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.financialSummary && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Financial Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                      <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Revenue</p>
                      <p className="text-sm font-bold mt-1 text-emerald-400">{formatCurrency(selectedReport.financialSummary.totalRevenue)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                      <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Expenses</p>
                      <p className="text-sm font-bold mt-1 text-red-400">{formatCurrency(selectedReport.financialSummary.totalExpenses)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                      <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Net Profit</p>
                      <p className={cn('text-sm font-bold mt-1', selectedReport.financialSummary.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {formatCurrency(selectedReport.financialSummary.netProfit)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                      <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Outstanding Invoices</p>
                      <p className="text-sm font-bold mt-1 text-amber-400">{formatCurrency(selectedReport.financialSummary.outstandingInvoices)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                      <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Overdue Payments</p>
                      <p className="text-sm font-bold mt-1 text-red-400">{formatCurrency(selectedReport.financialSummary.overduePayments)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                      <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">Discrepancies</p>
                      <p className="text-sm font-bold mt-1 text-foreground">{selectedReport.financialSummary.discrepancies}</p>
                    </div>
                  </div>
                  {selectedReport.financialSummary.riskFlags.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider mb-1.5">Risk Flags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedReport.financialSummary.riskFlags.map((flag, i) => (
                          <Badge key={i} variant="outline" className="text-[0.6rem] px-1.5 py-0 bg-red-500/5 text-red-400 border-red-500/20">
                            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                            {flag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <p className="text-xs text-muted-foreground">
                  Generated {formatDate(selectedReport.generatedAt)} by {selectedReport.generatedBy}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => { handleDownload(selectedReport); setSelectedReport(null); }}>
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>Close</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all-reports" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all-reports">All Reports</TabsTrigger>
          <TabsTrigger value="compliance-scorecard">Compliance Scorecard</TabsTrigger>
          <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
        </TabsList>

        {/* ──── All Reports Tab ──── */}
        <TabsContent value="all-reports">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reports by title or summary..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-8 rounded-lg border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {REPORT_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                    typeFilter === type
                      ? type === 'All'
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : cn('bg-opacity-20 border-opacity-40', typeColors[type] || 'bg-primary/10 text-primary border-primary/30')
                      : 'bg-muted/20 text-muted-foreground border-transparent hover:bg-muted/40 hover:text-foreground'
                  )}
                >
                  {type}
                </button>
              ))}
              <div className="w-px h-5 bg-border/60 mx-1" />
              {REPORT_STATUSES.map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                    statusFilter === status
                      ? status === 'All'
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : cn('bg-opacity-20 border-opacity-40', statusColors[status] || 'bg-primary/10 text-primary border-primary/30')
                      : 'bg-muted/20 text-muted-foreground border-transparent hover:bg-muted/40 hover:text-foreground'
                  )}
                >
                  {status}
                </button>
              ))}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <LoadingState rows={6} message="Loading audit reports..." />
          ) : filteredReports.length === 0 ? (
            <EmptyState
              icon={<BarChart3 className="w-8 h-8 text-muted-foreground" />}
              title={hasActiveFilters ? "No reports match your filters" : "No audit reports yet"}
              description={hasActiveFilters ? "Try adjusting your search or filter criteria" : "Audit reports will appear here once they are generated"}
              action={hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear Filters
                </Button>
              ) : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map(report => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onView={handleView}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ──── Compliance Scorecard Tab ──── */}
        <TabsContent value="compliance-scorecard">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ComplianceHeatmap data={heatmapData} />
            </div>

            {/* SLA Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  SLA Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {slaMetrics.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No SLA metrics available</p>
                ) : (
                  <div className="space-y-3">
                    {slaMetrics.map(sla => (
                      <div key={sla.module} className="group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{sla.module}</span>
                          <span className={cn(
                            'text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full border',
                            sla.complianceRate >= 95 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : sla.complianceRate >= 85 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                          )}>{sla.complianceRate}%</span>
                        </div>
                        <div className="relative h-1.5 bg-muted/30 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              sla.complianceRate >= 95 ? 'bg-emerald-400'
                                : sla.complianceRate >= 85 ? 'bg-amber-400'
                                  : 'bg-red-400'
                            )}
                            style={{ width: `${sla.complianceRate}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-0.5">
                          <span className="text-[0.55rem] text-muted-foreground/60">Target: {sla.slaTarget}%</span>
                          {sla.violations > 0 && (
                            <span className="text-[0.55rem] text-red-400/80">{sla.violations} violation{sla.violations !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ──── Risk Analysis Tab ──── */}
        <TabsContent value="risk-analysis">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Findings by Severity */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                    Findings by Severity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {allFindings.findings.length === 0 ? (
                    <EmptyState
                      icon={<CheckCircle className="w-8 h-8 text-muted-foreground" />}
                      title="No findings across reports"
                      description="All reports are clean with no outstanding findings"
                    />
                  ) : (
                    <div className="space-y-4">
                      {/* Severity Summary */}
                      <div className="grid grid-cols-4 gap-3">
                        {(['Critical', 'High', 'Medium', 'Low'] as const).map(severity => (
                          <div key={severity} className={cn(
                            'p-3 rounded-lg border',
                            severity === 'Critical' ? 'bg-red-500/5 border-red-500/20'
                              : severity === 'High' ? 'bg-amber-500/5 border-amber-500/20'
                                : severity === 'Medium' ? 'bg-blue-500/5 border-blue-500/20'
                                  : 'bg-slate-500/5 border-slate-500/20'
                          )}>
                            <p className="text-[0.6rem] text-muted-foreground uppercase tracking-wider">{severity}</p>
                            <p className={cn(
                              'text-xl font-bold mt-0.5',
                              severity === 'Critical' ? 'text-red-400'
                                : severity === 'High' ? 'text-amber-400'
                                  : severity === 'Medium' ? 'text-blue-400'
                                    : 'text-slate-400'
                            )}>{allFindings.severityCount[severity]}</p>
                          </div>
                        ))}
                      </div>

                      {/* Findings List */}
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                        {allFindings.findings.map(finding => (
                          <div key={finding.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-muted/10 hover:bg-muted/20 transition-colors">
                            <FindingSeverityIcon severity={finding.severity} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-foreground">{finding.category}</span>
                                <Badge variant="outline" className={cn('text-[0.55rem] px-1 py-0', severityColors[finding.severity])}>
                                  {finding.severity}
                                </Badge>
                                <Badge variant="outline" className={cn('text-[0.55rem] px-1 py-0', findingStatusColors[finding.status])}>
                                  {finding.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{finding.description}</p>
                              <div className="flex items-center gap-3 mt-1 text-[0.6rem] text-muted-foreground/60">
                                <span>Module: {finding.module}</span>
                                <span>Detected: {formatDate(finding.detectedAt)}</span>
                                {finding.assignedTo && <span>Assignee: {finding.assignedTo}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Suspicious Activity Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                    Suspicious Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-4">Unusual access patterns and security events across audited modules</p>

                  <div className="space-y-3">
                    {reports.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No reports to analyze</p>
                    ) : (
                      <>
                        {/* Risk Summary */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-center">
                            <ShieldAlert className="w-4 h-4 text-red-400 mx-auto mb-1" />
                            <p className="text-lg font-bold text-red-400">{allFindings.severityCount.Critical + allFindings.severityCount.High}</p>
                            <p className="text-[0.55rem] text-muted-foreground uppercase">High Risk</p>
                          </div>
                          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center">
                            <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                            <p className="text-lg font-bold text-amber-400">{allFindings.severityCount.Medium}</p>
                            <p className="text-[0.55rem] text-muted-foreground uppercase">Medium Risk</p>
                          </div>
                        </div>

                        {/* Module Risk Distribution */}
                        <div>
                          <p className="text-[0.65rem] font-semibold text-foreground uppercase tracking-wider mb-2">Risk by Module</p>
                          <div className="space-y-2">
                            {(() => {
                              const moduleRisk: Record<string, { critical: number; high: number; medium: number; total: number }> = {};
                              allFindings.findings.forEach(f => {
                                if (!moduleRisk[f.module]) moduleRisk[f.module] = { critical: 0, high: 0, medium: 0, total: 0 };
                                moduleRisk[f.module].total++;
                                if (f.severity === 'Critical') moduleRisk[f.module].critical++;
                                else if (f.severity === 'High') moduleRisk[f.module].high++;
                                else if (f.severity === 'Medium') moduleRisk[f.module].medium++;
                              });
                              return Object.entries(moduleRisk)
                                .sort((a, b) => b[1].total - a[1].total)
                                .slice(0, 8)
                                .map(([module, risk]) => (
                                  <div key={module} className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border/30">
                                    <span className="text-xs text-foreground">{module}</span>
                                    <div className="flex items-center gap-1.5">
                                      {risk.critical > 0 && <span className="text-[0.55rem] font-bold text-red-400">{risk.critical}C</span>}
                                      {risk.high > 0 && <span className="text-[0.55rem] font-bold text-amber-400">{risk.high}H</span>}
                                      {risk.medium > 0 && <span className="text-[0.55rem] font-bold text-blue-400">{risk.medium}M</span>}
                                      <span className="text-[0.55rem] text-muted-foreground ml-1">({risk.total})</span>
                                    </div>
                                  </div>
                                ));
                            })()}
                          </div>
                        </div>

                        {/* Risk Score Trend */}
                        <div className="mt-4 pt-3 border-t border-border/40">
                          <p className="text-[0.65rem] font-semibold text-foreground uppercase tracking-wider mb-2">Risk Score Trend</p>
                          {reports.length >= 2 ? (
                            <div className="space-y-1.5">
                              {reports.slice(0, 5).map(report => (
                                <div key={report.id} className="flex items-center justify-between">
                                  <span className="text-[0.6rem] text-muted-foreground truncate max-w-[140px]">{report.title}</span>
                                  <div className="flex items-center gap-1.5">
                                    <div className={cn(
                                      'w-1.5 h-1.5 rounded-full',
                                      report.riskScore > 40 ? 'bg-red-400' : report.riskScore > 25 ? 'bg-amber-400' : 'bg-emerald-400'
                                    )} />
                                    <span className={cn(
                                      'text-[0.6rem] font-medium',
                                      report.riskScore > 40 ? 'text-red-400' : report.riskScore > 25 ? 'text-amber-400' : 'text-emerald-400'
                                    )}>{report.riskScore}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">Not enough data for trend analysis</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

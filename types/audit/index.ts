export interface AuditEntity {
  id: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  status: string;
  auditTrail: AuditTrailEntry[];
}

export interface AuditTrailEntry {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT';
  entityType: string;
  entityId: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedAt: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

export interface AuditLog {
  id: string;
  companyId: string;
  timestamp: string;
  actor: string;
  actorId: string;
  action: string;
  module: string;
  entityType: string;
  entityId: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  severity: 'Info' | 'Warning' | 'Critical';
  metadata?: Record<string, string>;
}

export interface AccessLog {
  id: string;
  companyId: string;
  timestamp: string;
  actor: string;
  actorId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  status: 'Granted' | 'Denied' | 'Blocked';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  details: string;
}

export interface ErrorLog {
  id: string;
  companyId: string;
  timestamp: string;
  module: string;
  errorCode: string;
  message: string;
  stackTrace: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  resolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
  ipAddress: string;
  userId: string | null;
  userAgent: string;
  metadata?: Record<string, string>;
}

export interface AuditReport {
  id: string;
  companyId: string;
  title: string;
  type: 'Compliance' | 'Financial' | 'Operational' | 'Security' | 'Custom';
  period: string;
  generatedAt: string;
  generatedBy: string;
  format: 'PDF' | 'CSV' | 'XLSX';
  status: 'Draft' | 'Final' | 'Archived';
  summary: string;
  metrics: ReportMetric[];
  charts: ReportChart[];
  findings: AuditFinding[];
  slaMetrics: SLAMetric[];
  riskScore: number;
  complianceScore: number;
  financialSummary?: FinancialAuditSummary;
}

export interface ReportMetric {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface ReportChart {
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  data: Record<string, string | number>[];
  xKey: string;
  yKeys: string[];
}

export interface AuditFinding {
  id: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
  description: string;
  module: string;
  detectedAt: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Won\'t Fix';
  assignedTo: string | null;
  remediation: string | null;
  dueDate: string | null;
}

export interface SLAMetric {
  module: string;
  slaTarget: number;
  slaAchieved: number;
  violations: number;
  period: string;
}

export interface FinancialAuditSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  outstandingInvoices: number;
  overduePayments: number;
  discrepancies: number;
  riskFlags: string[];
}

export interface ComplianceRecord {
  id: string;
  companyId: string;
  type: 'Customs' | 'License' | 'Regulatory' | 'Safety';
  referenceNumber: string;
  status: 'Compliant' | 'Pending' | 'Non-Compliant' | 'Expired';
  issuedDate: string;
  expiryDate: string | null;
  issuingAuthority: string;
  description: string;
  documents: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  lastReviewed: string;
  reviewedBy: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuspiciousActivity {
  id: string;
  companyId: string;
  timestamp: string;
  type: 'Unusual Access' | 'Bulk Export' | 'Failed Auth' | 'Data Anomaly' | 'Permission Escalation';
  description: string;
  actor: string;
  ipAddress: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Investigating' | 'Resolved' | 'False Positive';
  resolvedAt: string | null;
}

export interface DashboardFinding {
  id: string;
  companyId: string;
  module: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved';
  detectedAt: string;
  assignedTo: string | null;
}

export interface AuditDashboardStats {
  companiesAudited: number;
  totalCompanies: number;
  openFindings: number;
  resolvedFindings: number;
  reportsThisMonth: number;
  accessLogAlerts: number;
  shipmentComplianceRate: number;
  financialRiskScore: number;
  pendingReviews: number;
  customsViolations: number;
  criticalFindings: number;
  highRiskFlags: number;
}

export const AUDIT_MODULES = [
  'Shipments',
  'Dispatches',
  'Fleet',
  'Warehouse',
  'Invoices',
  'Payments',
  'Expenses',
  'Customs',
  'Licenses',
  'Users',
  'Settings',
  'Reports',
] as const;

export const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'VIEW',
  'EXPORT',
  'LOGIN',
  'LOGOUT',
  'IMPORT',
  'BULK_UPDATE',
] as const;

export type AuditModule = typeof AUDIT_MODULES[number];
export type AuditAction = typeof AUDIT_ACTIONS[number];

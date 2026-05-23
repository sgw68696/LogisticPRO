import type {
  AuditLog,
  AccessLog,
  ErrorLog,
  AuditReport,
  DashboardFinding,
  SuspiciousActivity,
  ComplianceRecord,
  AuditDashboardStats,
} from '@/types/audit';

const SEVERITIES = ['Info', 'Warning', 'Critical'] as const;
const ACCESS_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
const LOG_MODULES = [
  'Shipments', 'Dispatches', 'Fleet', 'Warehouse',
  'Invoices', 'Payments', 'Expenses',
  'Customs', 'Licenses',
  'Users', 'Settings', 'Reports', 'Compliance',
] as const;
const AUDIT_ACTIONS = [
  'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT',
  'LOGIN', 'LOGOUT', 'BULK_UPDATE', 'IMPORT',
] as const;
const ACCESS_ACTIONS = [
  'Page Access', 'API Call', 'Data Export', 'File Download',
  'Login Attempt', 'Password Change', 'Settings Change',
  'Bulk Operation', 'Report Generation',
] as const;
const ACCESS_RESOURCES = [
  '/audit/dashboard', '/audit/shipments', '/audit/finance/invoices',
  '/audit/reports', '/audit/logs', '/audit/compliance/customs',
  '/api/shipments', '/api/finance', '/api/users',
  '/api/reports/generate', '/api/settings',
] as const;
const ERROR_CODES = [
  'ERR_AUTH_FAILED', 'ERR_API_TIMEOUT', 'ERR_INVALID_DATA',
  'ERR_PERMISSION_DENIED', 'ERR_RESOURCE_NOT_FOUND',
  'ERR_VALIDATION_FAILED', 'ERR_SERVICE_UNAVAILABLE',
  'ERR_RATE_LIMIT_EXCEEDED', 'ERR_DATABASE_CONNECTION',
  'ERR_THIRD_PARTY_TIMEOUT',
] as const;
const ERROR_MESSAGES = [
  'Failed to authenticate user session token expired',
  'API request timed out after 30 seconds',
  'Invalid data format received from upstream service',
  'User does not have permission to access this resource',
  'Requested shipment record not found in database',
  'Validation failed for required fields: origin, destination',
  'Shipment tracking service is temporarily unavailable',
  'Rate limit exceeded for API endpoint /api/v2/shipments',
  'Database connection pool exhausted',
  'Third-party customs clearance API timeout',
];
const FINDING_TYPES = [
  { module: 'Shipments', title: 'Missing Proof of Delivery', severity: 'High' as const },
  { module: 'Shipments', title: 'Shipment Status Discrepancy', severity: 'Medium' as const },
  { module: 'Dispatches', title: 'Unassigned Dispatch Queue', severity: 'Medium' as const },
  { module: 'Fleet', title: 'Overdue Vehicle Maintenance', severity: 'High' as const },
  { module: 'Fleet', title: 'Insurance Expiry Imminent', severity: 'Critical' as const },
  { module: 'Warehouse', title: 'Inventory Discrepancy', severity: 'Medium' as const },
  { module: 'Invoices', title: 'Unpaid Invoices Over 30 Days', severity: 'High' as const },
  { module: 'Invoices', title: 'Invoice Amount Mismatch', severity: 'Critical' as const },
  { module: 'Payments', title: 'Duplicate Payment Detected', severity: 'High' as const },
  { module: 'Expenses', title: 'Unapproved Expense Claim', severity: 'Medium' as const },
  { module: 'Customs', title: 'Missing Customs Documentation', severity: 'Critical' as const },
  { module: 'Customs', title: 'HS Code Misclassification', severity: 'High' as const },
  { module: 'Licenses', title: 'Expired Operating License', severity: 'Critical' as const },
  { module: 'Compliance', title: 'SLA Breach Detected', severity: 'Medium' as const },
  { module: 'Compliance', title: 'Regulatory Filing Overdue', severity: 'High' as const },
  { module: 'Users', title: 'Inactive User Accounts', severity: 'Low' as const },
  { module: 'Settings', title: 'Security Config Drift', severity: 'High' as const },
];
const SUSPICIOUS_EVENTS = [
  { type: 'Unusual Access' as const, description: 'Multiple login attempts from unknown IP range' },
  { type: 'Bulk Export' as const, description: 'Bulk export of 500+ shipment records by non-admin user' },
  { type: 'Failed Auth' as const, description: 'Repeated failed authentication attempts from single IP' },
  { type: 'Data Anomaly' as const, description: 'Unusual spike in data modification frequency' },
  { type: 'Permission Escalation' as const, description: 'Attempted privilege escalation detected' },
  { type: 'Unusual Access' as const, description: 'Access from geographic location outside normal pattern' },
  { type: 'Bulk Export' as const, description: 'Mass download of financial reports after hours' },
  { type: 'Failed Auth' as const, description: 'Brute force pattern detected on API gateway' },
];
const COMPLIANCE_TYPES = [
  { type: 'Customs' as const, status: 'Compliant' as const, risk: 'Low' as const, authority: 'Indian Customs Department' },
  { type: 'Customs' as const, status: 'Pending' as const, risk: 'Medium' as const, authority: 'DGFT' },
  { type: 'License' as const, status: 'Compliant' as const, risk: 'Low' as const, authority: 'Ministry of Commerce' },
  { type: 'License' as const, status: 'Non-Compliant' as const, risk: 'High' as const, authority: 'RTO' },
  { type: 'Regulatory' as const, status: 'Compliant' as const, risk: 'Low' as const, authority: 'FSSAI' },
  { type: 'Safety' as const, status: 'Expired' as const, risk: 'High' as const, authority: 'DG Shipping' },
  { type: 'Customs' as const, status: 'Pending' as const, risk: 'Medium' as const, authority: 'Customs Commissionerate' },
  { type: 'License' as const, status: 'Compliant' as const, risk: 'Low' as const, authority: 'BIS' },
  { type: 'Regulatory' as const, status: 'Non-Compliant' as const, risk: 'Critical' as const, authority: 'SEBI' },
  { type: 'Safety' as const, status: 'Compliant' as const, risk: 'Low' as const, authority: 'Fire Department' },
  { type: 'Customs' as const, status: 'Pending' as const, risk: 'Medium' as const, authority: 'Port Trust' },
  { type: 'License' as const, status: 'Expired' as const, risk: 'High' as const, authority: 'Ministry of Civil Aviation' },
];

const ACTORS = [
  'Kavya Iyer', 'Rajesh Kumar', 'Priya Sharma', 'Amit Patel',
  'Sunita Reddy', 'Ananya Gupta', 'Vikram Singh', 'Neha Tripathi',
  'Arjun Mehta', 'Deepa Nair', 'System Bot', 'External User',
];
const IP_ADDRESSES = [
  '192.168.1.100', '192.168.1.101', '10.0.0.45', '10.0.0.88',
  '203.0.113.42', '198.51.100.7', '172.16.0.55', '192.168.2.200',
  '45.33.32.156', '103.235.46.89',
];
const LOCATIONS = [
  'Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Pune, India',
  'Chennai, India', 'Hyderabad, India', 'Singapore', 'Dubai, UAE',
  'London, UK', 'New York, USA',
];
const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) Safari/17.2',
  'PostmanRuntime/7.36.0', 'curl/8.4.0',
  'Mozilla/5.0 (X11; Linux x86_64) Chrome/119.0.0.0',
  'Python-urllib/3.11', 'Apache-HttpClient/4.5.14',
];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - rand(0, daysBack));
  d.setHours(rand(0, 23), rand(0, 59), rand(0, 59));
  return d.toISOString();
}

function generateAuditLogs(): AuditLog[] {
  return Array.from({ length: 150 }, (_, i) => ({
    id: `audit-log-${String(i + 1).padStart(3, '0')}`,
    companyId: `cmp-${String(rand(1, 5)).padStart(3, '0')}`,
    timestamp: randomDate(30),
    actor: pick(ACTORS),
    actorId: `usr-${String(rand(1, 15)).padStart(3, '0')}`,
    action: pick(AUDIT_ACTIONS),
    module: pick(LOG_MODULES),
    entityType: pick(['Shipment', 'Invoice', 'Dispatch', 'User', 'Report', 'Vehicle', 'Warehouse']),
    entityId: `${pick(['shp', 'inv', 'dsp', 'usr', 'rpt', 'veh', 'wh'])}-${String(rand(1, 100)).padStart(3, '0')}`,
    description: pick([
      'User viewed shipment details',
      'Invoice status changed to Paid',
      'New dispatch assignment created',
      'User role permissions updated',
      'Report generated for monthly audit',
      'Bulk status update on shipments',
      'Export of financial data initiated',
      'Customs document uploaded for verification',
      'User login from new device',
      'Password change request processed',
    ]),
    ipAddress: pick(IP_ADDRESSES),
    userAgent: pick(USER_AGENTS),
    severity: pick(SEVERITIES),
  }));
}

function generateAccessLogs(): AccessLog[] {
  return Array.from({ length: 120 }, (_, i) => ({
    id: `access-log-${String(i + 1).padStart(3, '0')}`,
    companyId: `cmp-${String(rand(1, 5)).padStart(3, '0')}`,
    timestamp: randomDate(14),
    actor: pick(ACTORS),
    actorId: `usr-${String(rand(1, 15)).padStart(3, '0')}`,
    action: pick(ACCESS_ACTIONS),
    resource: pick(ACCESS_RESOURCES),
    ipAddress: pick(IP_ADDRESSES),
    userAgent: pick(USER_AGENTS),
    location: pick(LOCATIONS),
    status: pick(['Granted', 'Denied', 'Blocked'] as const),
    severity: pick(ACCESS_SEVERITIES),
    details: pick([
      'Access granted to audit dashboard',
      'API call to shipment service from authorized IP',
      'Blocked access attempt from blacklisted IP',
      'Data export of 250 records completed',
      'Login attempt from unrecognized device',
      'Password change initiated via forgot password flow',
      'Settings modification by company admin',
      'Bulk operation on 50+ shipment records',
      'Report generation for Q4 financial audit',
      'Access denied due to missing permissions',
    ]),
  }));
}

function generateErrorLogs(): ErrorLog[] {
  return Array.from({ length: 100 }, (_, i) => {
    const codeIdx = rand(0, ERROR_CODES.length - 1);
    const resolved = Math.random() > 0.4;
    return {
      id: `error-log-${String(i + 1).padStart(3, '0')}`,
      companyId: `cmp-${String(rand(1, 5)).padStart(3, '0')}`,
      timestamp: randomDate(7),
      module: pick(LOG_MODULES),
      errorCode: ERROR_CODES[codeIdx],
      message: ERROR_MESSAGES[codeIdx],
      stackTrace: `at ApiClient.request (api-client.ts:123)\nat ShipmentService.list (shipment-service.ts:45)\nat PageComponent (shipments/page.tsx:89)`,
      severity: pick(ACCESS_SEVERITIES),
      resolved,
      resolvedAt: resolved ? randomDate(3) : null,
      resolvedBy: resolved ? pick(ACTORS) : null,
      ipAddress: pick(IP_ADDRESSES),
      userId: Math.random() > 0.3 ? `usr-${String(rand(1, 15)).padStart(3, '0')}` : null,
      userAgent: pick(USER_AGENTS),
    };
  });
}

function generateFindings(): DashboardFinding[] {
  return FINDING_TYPES.map((f, i) => ({
    id: `finding-${String(i + 1).padStart(3, '0')}`,
    companyId: `cmp-${String(rand(1, 5)).padStart(3, '0')}`,
    module: f.module,
    title: f.title,
    description: `Audit identified ${f.title.toLowerCase()} that requires attention`,
    severity: f.severity,
    status: pick(['Open', 'In Progress', 'Resolved'] as const),
    detectedAt: randomDate(60),
    assignedTo: Math.random() > 0.3 ? pick(ACTORS) : null,
  }));
}

function generateSuspiciousActivities(): SuspiciousActivity[] {
  return SUSPICIOUS_EVENTS.map((e, i) => ({
    id: `sus-${String(i + 1).padStart(3, '0')}`,
    companyId: `cmp-${String(rand(1, 5)).padStart(3, '0')}`,
    timestamp: randomDate(14),
    type: e.type,
    description: e.description,
    actor: pick(ACTORS),
    ipAddress: pick(IP_ADDRESSES),
    severity: pick(ACCESS_SEVERITIES),
    status: pick(['Investigating', 'Resolved', 'False Positive'] as const),
    resolvedAt: Math.random() > 0.5 ? randomDate(7) : null,
  }));
}

function generateComplianceRecords(): ComplianceRecord[] {
  return COMPLIANCE_TYPES.map((c, i) => ({
    id: `compliance-${String(i + 1).padStart(3, '0')}`,
    companyId: `cmp-${String(rand(1, 5)).padStart(3, '0')}`,
    type: c.type,
    referenceNumber: `${c.type === 'Customs' ? 'CUS' : c.type === 'License' ? 'LIC' : c.type === 'Regulatory' ? 'REG' : 'SFT'}-${String(rand(1000, 9999))}`,
    status: c.status,
    issuedDate: randomDate(365),
    expiryDate: c.status === 'Expired' ? randomDate(30) : Math.random() > 0.3 ? randomDate(90) : null,
    issuingAuthority: c.authority,
    description: `${c.type} compliance record for ${c.authority}`,
    documents: Array.from({ length: rand(1, 3) }, (_, j) => `doc-${String(rand(100, 999))}.pdf`),
    riskLevel: c.risk,
    lastReviewed: randomDate(30),
    reviewedBy: pick(ACTORS),
    notes: pick(['All documentation in order', 'Pending additional review', 'Follow-up required', 'Compliance confirmed', 'Awaiting renewal']),
    createdAt: randomDate(365),
    updatedAt: randomDate(30),
  }));
}

function generateReports(): AuditReport[] {
  const reportTemplates = [
    { title: 'Monthly Compliance Audit', type: 'Compliance' as const },
    { title: 'Q1 Financial Audit Summary', type: 'Financial' as const },
    { title: 'Operational Risk Assessment', type: 'Operational' as const },
    { title: 'Security Audit Report', type: 'Security' as const },
    { title: 'Annual Regulatory Compliance', type: 'Compliance' as const },
    { title: 'Cross-Company Audit Review', type: 'Custom' as const },
    { title: 'Customs Declaration Audit', type: 'Compliance' as const },
    { title: 'SLA Performance Report', type: 'Operational' as const },
    { title: 'Invoice Reconciliation Audit', type: 'Financial' as const },
    { title: 'Access Control Review', type: 'Security' as const },
    { title: 'Fleet Compliance Assessment', type: 'Compliance' as const },
    { title: 'Warehouse Operations Audit', type: 'Operational' as const },
  ];

  return reportTemplates.map((r, i) => ({
    id: `report-${String(i + 1).padStart(3, '0')}`,
    companyId: `cmp-${String(rand(1, 5)).padStart(3, '0')}`,
    title: r.title,
    type: r.type,
    period: `Jan 2026 - ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][rand(0, 5)]} 2026`,
    generatedAt: randomDate(30),
    generatedBy: pick(ACTORS),
    format: pick(['PDF', 'CSV', 'XLSX'] as const),
    status: pick(['Draft', 'Final', 'Archived'] as const),
    summary: pick([
      'Comprehensive audit across all modules showing 94.2% compliance rate',
      'Financial review identified minor discrepancies in invoice reconciliation',
      'Operational risks identified in fleet maintenance scheduling',
      'Security audit found 3 critical vulnerabilities that have been patched',
      'All customs declarations compliant with current regulations',
    ]),
    metrics: [
      { label: 'Compliance Rate', value: `${(Math.random() * 15 + 82).toFixed(1)}%`, trend: Math.random() > 0.5 ? 'up' as const : 'down' as const, change: Number((Math.random() * 8).toFixed(1)) },
      { label: 'Findings', value: rand(5, 25), trend: 'down' as const, change: -rand(1, 5) },
      { label: 'SLA Achievement', value: `${(Math.random() * 10 + 88).toFixed(1)}%`, trend: 'up' as const, change: Number((Math.random() * 5).toFixed(1)) },
      { label: 'Risk Score', value: `${(Math.random() * 30 + 15).toFixed(0)}`, trend: 'down' as const, change: -rand(1, 10) },
    ],
    charts: [
      {
        type: 'bar',
        title: 'Compliance by Module',
        data: [
          { module: 'Shipments', score: 96 },
          { module: 'Dispatches', score: 92 },
          { module: 'Fleet', score: 78 },
          { module: 'Warehouse', score: 88 },
          { module: 'Invoices', score: 94 },
          { module: 'Payments', score: 90 },
          { module: 'Customs', score: 85 },
          { module: 'Licenses', score: 72 },
        ],
        xKey: 'module',
        yKeys: ['score'],
      },
      {
        type: 'line',
        title: 'Monthly Trend',
        data: Array.from({ length: 6 }, (_, j) => ({
          month: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'][j],
          compliance: rand(80, 98),
          violations: rand(2, 15),
        })),
        xKey: 'month',
        yKeys: ['compliance', 'violations'],
      },
    ],
    findings: Array.from({ length: rand(3, 8) }, (_, j) => ({
      id: `rpt-finding-${i}-${j}`,
      severity: pick(['Low', 'Medium', 'High', 'Critical'] as const),
      category: pick(['Documentation', 'Process', 'Security', 'Compliance', 'Financial']),
      description: pick([
        'Missing signatures on customs declarations',
        'SLA breach detected in shipment processing',
        'Inconsistent invoice numbering detected',
        'Vehicle insurance renewal overdue',
        'Warehouse inventory discrepancy noted',
        'User access review not completed',
      ]),
      module: pick(LOG_MODULES),
      detectedAt: randomDate(60),
      status: pick(['Open', 'In Progress', 'Resolved'] as const),
      assignedTo: Math.random() > 0.3 ? pick(ACTORS) : null,
      remediation: Math.random() > 0.4 ? pick([
        'Update standard operating procedures',
        'Implement automated SLA tracking',
        'Conduct user access review',
        'Schedule vehicle maintenance',
        'Reconcile inventory counts',
      ]) : null,
      dueDate: Math.random() > 0.3 ? randomDate(14) : null,
    })),
    slaMetrics: [
      { module: 'Shipment Processing', slaTarget: 99.5, slaAchieved: 97.2, violations: 12, period: 'Monthly' },
      { module: 'Dispatch Response', slaTarget: 98.0, slaAchieved: 95.8, violations: 8, period: 'Monthly' },
      { module: 'Invoice Generation', slaTarget: 99.0, slaAchieved: 98.5, violations: 3, period: 'Monthly' },
      { module: 'Customs Clearance', slaTarget: 96.0, slaAchieved: 91.3, violations: 15, period: 'Monthly' },
      { module: 'Report Delivery', slaTarget: 99.9, slaAchieved: 99.2, violations: 2, period: 'Monthly' },
    ],
    riskScore: rand(15, 55),
    complianceScore: rand(72, 98),
    financialSummary: r.type === 'Financial' ? {
      totalRevenue: rand(10000000, 50000000),
      totalExpenses: rand(6000000, 30000000),
      netProfit: rand(2000000, 15000000),
      outstandingInvoices: rand(5, 50),
      overduePayments: rand(2, 20),
      discrepancies: rand(0, 8),
      riskFlags: pick([
        ['High value unpaid invoices', 'Multiple credit notes issued'],
        ['Payment reconciliation pending', 'Unusual refund pattern'],
        ['Expense approval breaches detected'],
        [],
      ]),
    } : undefined,
  }));
}

function generateDashboardStats(): AuditDashboardStats {
  return {
    companiesAudited: 24,
    totalCompanies: 32,
    openFindings: 7,
    resolvedFindings: 43,
    reportsThisMonth: 18,
    accessLogAlerts: 3,
    shipmentComplianceRate: 94.5,
    financialRiskScore: 22,
    pendingReviews: 5,
    customsViolations: 2,
    criticalFindings: 3,
    highRiskFlags: 8,
  };
}

export const auditLogs = generateAuditLogs();
export const accessLogs = generateAccessLogs();
export const errorLogs = generateErrorLogs();
export const mockFindings = generateFindings();
export const mockSuspiciousActivities = generateSuspiciousActivities();
export const mockComplianceRecords = generateComplianceRecords();
export const mockAuditReports = generateReports();
export const mockDashboardStats = generateDashboardStats();

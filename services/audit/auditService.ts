import { APP_CONFIG } from '@/config/appConfig';
import {
  auditLogs,
  accessLogs,
  errorLogs,
  mockFindings,
  mockSuspiciousActivities,
  mockComplianceRecords,
  mockAuditReports,
  mockDashboardStats,
} from '@/data/audit';
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
import { mockInvoices } from '@/data/mockData';
import type { Invoice } from '@/types/invoice';

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function filterByCompany<T extends { companyId: string }>(
  items: T[],
  companyId?: string
): T[] {
  if (!companyId || companyId === 'all') return items;
  return items.filter(i => i.companyId === companyId);
}

function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): { items: T[]; total: number; totalPages: number } {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    totalPages: Math.ceil(items.length / pageSize),
  };
}

function searchIn<T>(
  items: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter(item =>
    fields.some(field => {
      const val = item[field];
      return val != null && String(val).toLowerCase().includes(q);
    })
  );
}

export const auditService = {
  async getDashboardStats(companyId?: string): Promise<AuditDashboardStats> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(200);
      return { ...mockDashboardStats };
    }
    const params = new URLSearchParams();
    if (companyId) params.set('companyId', companyId);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/audit/dashboard/stats?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  },

  async getAuditLogs(params?: {
    companyId?: string;
    module?: string;
    severity?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }): Promise<{ items: AuditLog[]; total: number; totalPages: number }> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let result = [...auditLogs];
      if (params?.companyId) result = filterByCompany(result, params.companyId);
      if (params?.module) result = result.filter(l => l.module === params.module);
      if (params?.severity) result = result.filter(l => l.severity === params.severity);
      if (params?.search) {
        result = searchIn(result, params.search, ['actor', 'action', 'module', 'description']);
      }
      if (params?.sortBy) {
        const dir = params.sortDir === 'asc' ? 1 : -1;
        result.sort((a, b) => {
          const aVal = (a as any)[params.sortBy!];
          const bVal = (b as any)[params.sortBy!];
          return String(aVal).localeCompare(String(bVal)) * dir;
        });
      } else {
        result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
      return paginate(result, params?.page || 1, params?.pageSize || 20);
    }
    const searchParams = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/audit/logs?${searchParams}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  },

  async getAccessLogs(params?: {
    companyId?: string;
    severity?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }): Promise<{ items: AccessLog[]; total: number; totalPages: number }> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let result = [...accessLogs];
      if (params?.companyId) result = filterByCompany(result, params.companyId);
      if (params?.severity) result = result.filter(l => l.severity === params.severity);
      if (params?.status) result = result.filter(l => l.status === params.status);
      if (params?.search) {
        result = searchIn(result, params.search, ['actor', 'action', 'resource', 'ipAddress']);
      }
      if (params?.sortBy) {
        const dir = params.sortDir === 'asc' ? 1 : -1;
        result.sort((a, b) => {
          const aVal = (a as any)[params.sortBy!];
          const bVal = (b as any)[params.sortBy!];
          return String(aVal).localeCompare(String(bVal)) * dir;
        });
      } else {
        result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
      return paginate(result, params?.page || 1, params?.pageSize || 20);
    }
    const searchParams = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/audit/access-logs?${searchParams}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  },

  async getErrorLogs(params?: {
    companyId?: string;
    severity?: string;
    module?: string;
    resolved?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }): Promise<{ items: ErrorLog[]; total: number; totalPages: number }> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let result = [...errorLogs];
      if (params?.companyId) result = filterByCompany(result, params.companyId);
      if (params?.severity) result = result.filter(l => l.severity === params.severity);
      if (params?.module) result = result.filter(l => l.module === params.module);
      if (params?.resolved !== undefined) result = result.filter(l => l.resolved === params.resolved);
      if (params?.search) {
        result = searchIn(result, params.search, ['errorCode', 'message', 'module']);
      }
      if (params?.sortBy) {
        const dir = params.sortDir === 'asc' ? 1 : -1;
        result.sort((a, b) => {
          const aVal = (a as any)[params.sortBy!];
          const bVal = (b as any)[params.sortBy!];
          return String(aVal).localeCompare(String(bVal)) * dir;
        });
      } else {
        result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
      return paginate(result, params?.page || 1, params?.pageSize || 20);
    }
    const searchParams = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/audit/error-logs?${searchParams}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  },

  async getFindings(companyId?: string): Promise<DashboardFinding[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(200);
      return filterByCompany(mockFindings, companyId);
    }
    const params = new URLSearchParams();
    if (companyId) params.set('companyId', companyId);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/audit/findings?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  },

  async getSuspiciousActivities(companyId?: string): Promise<SuspiciousActivity[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(200);
      return filterByCompany(mockSuspiciousActivities, companyId);
    }
    const params = new URLSearchParams();
    if (companyId) params.set('companyId', companyId);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/audit/suspicious-activities?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  },

  async getComplianceRecords(params?: {
    companyId?: string;
    type?: string;
    status?: string;
    search?: string;
  }): Promise<ComplianceRecord[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let result = [...mockComplianceRecords];
      if (params?.companyId) result = filterByCompany(result, params.companyId);
      if (params?.type) result = result.filter(r => r.type === params.type);
      if (params?.status) result = result.filter(r => r.status === params.status);
      if (params?.search) {
        result = searchIn(result, params.search, ['referenceNumber', 'description', 'issuingAuthority']);
      }
      return result;
    }
    const searchParams = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/audit/compliance?${searchParams}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  },

  async getReports(params?: {
    companyId?: string;
    type?: string;
    status?: string;
    search?: string;
  }): Promise<AuditReport[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(300);
      let result = [...mockAuditReports];
      if (params?.companyId) result = filterByCompany(result, params.companyId);
      if (params?.type) result = result.filter(r => r.type === params.type);
      if (params?.status) result = result.filter(r => r.status === params.status);
      if (params?.search) {
        result = searchIn(result, params.search, ['title', 'summary', 'type']);
      }
      return result;
    }
    const searchParams = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/audit/reports?${searchParams}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  },

  async getReportById(id: string): Promise<AuditReport | null> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(200);
      return mockAuditReports.find(r => r.id === id) || null;
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/audit/reports/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!res.ok) return null;
    return res.json();
  },

  async getInvoices(params?: {
    companyId?: string;
    status?: string;
    search?: string;
  }): Promise<Invoice[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(300);
      let result = [...mockInvoices];
      if (params?.status) result = result.filter(i => i.status === params.status);
      if (params?.search) {
        const q = params.search.toLowerCase();
        result = result.filter(i =>
          i.invoiceId.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q)
        );
      }
      return result;
    }
    const searchParams = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/audit/finance/invoices?${searchParams}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  },
};

export const {
  getDashboardStats,
  getAuditLogs,
  getAccessLogs,
  getErrorLogs,
  getFindings,
  getSuspiciousActivities,
  getComplianceRecords,
  getReports,
  getReportById,
  getInvoices,
} = auditService;

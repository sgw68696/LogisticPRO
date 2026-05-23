import { APP_CONFIG } from '@/config/appConfig';
import { mockDb } from '@/data/mock-db';
import type { AuditLogEntry, UserRole, PaginatedResponse } from '@/data/mock-db';
import { mockDelay, fetchWithAuth } from './shared/utils';

export interface AuditFilters {
  companyId?: string;
  organizationId?: string;
  userId?: string;
  module?: string;
  action?: 'create' | 'update' | 'delete' | 'status_change' | 'view' | 'export' | 'import';
  entityType?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const auditService = {
  async list(companyId: string, filters?: AuditFilters): Promise<PaginatedResponse<AuditLogEntry>> {
    if (APP_CONFIG.USE_MOCK) {
      await mockDelay();

      let results = mockDb.getAuditLogs(companyId, {
        userId: filters?.userId,
        module: filters?.module,
        action: filters?.action,
        entityType: filters?.entityType,
      });

      if (filters?.entityId) {
        results = results.filter((l) => l.entityId === filters.entityId);
      }

      if (filters?.dateFrom) {
        results = results.filter(
          (l) => new Date(l.timestamp) >= new Date(filters.dateFrom!)
        );
      }
      if (filters?.dateTo) {
        results = results.filter(
          (l) => new Date(l.timestamp) <= new Date(filters.dateTo!)
        );
      }

      if (filters?.search) {
        const q = filters.search.toLowerCase();
        results = results.filter(
          (l) =>
            l.entityLabel.toLowerCase().includes(q) ||
            l.userName.toLowerCase().includes(q) ||
            l.notes?.toLowerCase().includes(q)
        );
      }

      const page = filters?.page || 1;
      const pageSize = filters?.pageSize || 50;

      return mockDb.paginate(results, page, pageSize);
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.append(k, String(v));
      });
    }

    const res = await fetchWithAuth(`/audit/logs?${params}`);
    return res.json();
  },

  async getById(id: string): Promise<AuditLogEntry | null> {
    if (APP_CONFIG.USE_MOCK) {
      await mockDelay();
      return mockDb.auditLogs.find((l) => l.id === id) || null;
    }

    const res = await fetchWithAuth(`/audit/logs/${id}`);
    if (!res.ok) return null;
    return res.json();
  },

  async getEntityHistory(
    companyId: string,
    entityType: string,
    entityId: string
  ): Promise<AuditLogEntry[]> {
    if (APP_CONFIG.USE_MOCK) {
      await mockDelay();
      return mockDb.auditLogs
        .filter(
          (l) =>
            l.companyId === companyId &&
            l.entityType === entityType &&
            l.entityId === entityId
        )
        .sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }

    const res = await fetchWithAuth(
      `/audit/entity/${entityType}/${entityId}/history`
    );
    return res.json();
  },

  async getUserActivity(
    companyId: string,
    userId: string,
    limit?: number
  ): Promise<AuditLogEntry[]> {
    if (APP_CONFIG.USE_MOCK) {
      await mockDelay();
      return mockDb.getAuditLogs(companyId, { userId, limit });
    }

    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));

    const res = await fetchWithAuth(`/audit/user/${userId}/activity?${params}`);
    return res.json();
  },

  async getModuleStats(companyId: string, module: string): Promise<{
    total: number;
    byAction: Record<string, number>;
    last7Days: { date: string; count: number }[];
  }> {
    if (APP_CONFIG.USE_MOCK) {
      await mockDelay();
      const logs = mockDb.getAuditLogs(companyId, { module });

      const byAction: Record<string, number> = {};
      logs.forEach((l) => {
        byAction[l.action] = (byAction[l.action] || 0) + 1;
      });

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const count = logs.filter(
          (l) => l.timestamp.startsWith(dateStr)
        ).length;
        return { date: dateStr, count };
      });

      return {
        total: logs.length,
        byAction,
        last7Days,
      };
    }

    const res = await fetchWithAuth(`/audit/stats/${module}`);
    return res.json();
  },

  async createLog(options: {
    companyId: string;
    organizationId?: string;
    userId: string;
    userName: string;
    userRole: UserRole;
    action: 'create' | 'update' | 'delete' | 'status_change' | 'view' | 'export' | 'import';
    module: string;
    entityType: string;
    entityId: string;
    entityLabel: string;
    changes?: { field: string; oldValue: unknown; newValue: unknown }[];
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    notes?: string;
    success?: boolean;
    errorMessage?: string;
  }): Promise<AuditLogEntry> {
    if (APP_CONFIG.USE_MOCK) {
      await mockDelay();
      return mockDb.createAuditLog(options);
    }

    const res = await fetchWithAuth(`/audit/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    return res.json();
  },

  async exportLogs(
    companyId: string,
    filters?: AuditFilters
  ): Promise<{ url: string; format: string }> {
    if (APP_CONFIG.USE_MOCK) {
      await mockDelay();
      return {
        url: `data:application/json;base64,${btoa(
          JSON.stringify({ exportedAt: new Date().toISOString(), filters })
        )}`,
        format: 'json',
      };
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.append(k, String(v));
      });
    }

    const res = await fetchWithAuth(`/audit/export?${params}`);
    return res.json();
  },
};

export const {
  list: getAuditLogs,
  getById: getAuditLogById,
  getEntityHistory,
  getUserActivity,
  getModuleStats,
  createLog: createAuditLog,
  exportLogs: exportAuditLogs,
} = auditService;

export type { AuditLogEntry, AuditFilters };

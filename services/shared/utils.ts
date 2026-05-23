import { APP_CONFIG } from '@/config/appConfig';
import { mockDb, generateId, now } from '@/data/mock-db';
import type { PaginatedResponse, UserRole } from '@/data/mock-db';

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockDelay(): Promise<void> {
  return delay(Math.random() * 200 + 150);
}

export interface ServiceListOptions {
  companyId?: string;
  search?: string;
  searchFields?: string[];
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface AuditLogOptions {
  userId: string;
  userName: string;
  userRole: UserRole;
  module: string;
  entityType: string;
  companyId: string;
  organizationId?: string;
}

export function filterByCompany<T extends { companyId?: string | null }>(
  items: T[],
  companyId?: string
): T[] {
  if (!companyId || companyId === 'all') return items;
  return items.filter((i) => i.companyId === companyId);
}

export function searchIn<T>(
  items: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  if (!query) return items;
  const lq = query.toLowerCase();
  return items.filter((item) =>
    fields.some((f) => {
      const v = item[f];
      return v != null && String(v).toLowerCase().includes(lq);
    })
  );
}

export function buildPagination<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  return mockDb.paginate(items, page, pageSize);
}

export function recordAuditLog(
  options: AuditLogOptions & {
    action: 'create' | 'update' | 'delete' | 'status_change' | 'view' | 'export' | 'import';
    entityId: string;
    entityLabel: string;
    changes?: { field: string; oldValue: unknown; newValue: unknown }[];
    notes?: string;
    success?: boolean;
    errorMessage?: string;
  }
): void {
  if (!APP_CONFIG.USE_MOCK) return;

  mockDb.createAuditLog({
    companyId: options.companyId,
    organizationId: options.organizationId || null,
    userId: options.userId,
    userName: options.userName,
    userRole: options.userRole,
    action: options.action,
    module: options.module,
    entityType: options.entityType,
    entityId: options.entityId,
    entityLabel: options.entityLabel,
    changes: options.changes,
    notes: options.notes,
    success: options.success ?? true,
    errorMessage: options.errorMessage,
  });
}

export function createGlobalNotification(options: {
  companyId: string;
  type: string;
  severity?: 'Info' | 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  message: string;
  module: string;
  referenceId?: string;
  referenceType?: string;
  actionUrl?: string;
  createdByRole?: UserRole;
  visibleToRoles?: UserRole[];
  metadata?: Record<string, unknown>;
}): void {
  if (!APP_CONFIG.USE_MOCK) return;

  mockDb.createNotification({
    companyId: options.companyId,
    type: options.type as any,
    severity: options.severity || 'Info',
    title: options.title,
    message: options.message,
    module: options.module,
    referenceId: options.referenceId || null,
    referenceType: options.referenceType || null,
    actionUrl: options.actionUrl || null,
    createdByRole: options.createdByRole,
    visibleToRoles: options.visibleToRoles,
    metadata: options.metadata,
  });
}

export function addActivityFeed(options: {
  companyId: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  userId: string;
  userName: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
}): void {
  if (!APP_CONFIG.USE_MOCK) return;

  mockDb.addActivity(options.companyId, {
    type: options.type,
    title: options.title,
    description: options.description,
    icon: options.icon,
    userId: options.userId,
    userName: options.userName,
    entityType: options.entityType,
    entityId: options.entityId,
    actionUrl: options.actionUrl,
  });
}

export async function fetchWithAuth(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${APP_CONFIG.API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
}

export function generateEntityId(prefix: string, existingList: { id: string }[]): string {
  return `${prefix}-${String(existingList.length + 1).padStart(3, '0')}`;
}

export function generatePublicId(prefix: string, count: number, year?: number): string {
  const y = year || new Date().getFullYear();
  return `${prefix}-${y}-${String(1000 + count).padStart(5, '0')}`;
}

export type { PaginatedResponse };

import {
  mockCompanies,
  mockOrganizations,
  mockShipments,
  mockOrders,
  mockCustomers,
  mockInvoices,
  mockNotifications,
  mockDrivers,
  mockVehicles,
  type User,
} from '@/data/mockData';

import { mockConsolidatedShipments, mockContainers } from '@/data/shipments';
import {
  mockWarehouses,
  mockGRNs,
  mockGDNs,
  mockWarehouseInventory,
  mockWarehouseLocations,
  mockDamageReports,
  mockStockMovements,
  mockWHNotifications,
} from '@/data/warehouse';

import {
  mockVessels,
  mockFlights,
  mockBerths,
  mockManifests,
  mockPortCharges,
  mockPortDocuments,
  mockPortNotifications,
} from '@/data/port';

import type {
  GlobalNotification,
  AuditLogEntry,
  ActivityFeedItem,
  UserRole,
} from './types';

function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

function now(): string {
  return new Date().toISOString();
}

function ensureCompanyId<T extends { companyId?: string | null }>(
  items: T[],
  defaultCompanyId = 'cmp-001'
): (T & { companyId: string })[] {
  return items.map((item) => ({
    ...item,
    companyId: item.companyId || defaultCompanyId,
  })) as (T & { companyId: string })[];
}

class MockDatabase {
  private static instance: MockDatabase;

  companies = [...mockCompanies];
  organizations = [...mockOrganizations];

  shipments: any[] = ensureCompanyId([...mockConsolidatedShipments], 'cmp-001');
  legacyShipments: any[] = ensureCompanyId([...mockShipments], 'cmp-001');
  orders: any[] = ensureCompanyId([...mockOrders], 'cmp-001');
  customers: any[] = ensureCompanyId([...mockCustomers], 'cmp-001');
  invoices: any[] = ensureCompanyId([...mockInvoices], 'cmp-001');
  drivers: any[] = ensureCompanyId([...mockDrivers], 'cmp-001');
  vehicles: any[] = ensureCompanyId([...mockVehicles], 'cmp-001');
  containers: any[] = ensureCompanyId([...mockContainers], 'cmp-001');

  warehouses: any[] = [...mockWarehouses];
  grns: any[] = [...mockGRNs];
  gdns: any[] = [...mockGDNs];
  warehouseInventory: any[] = [...mockWarehouseInventory];
  warehouseLocations: any[] = [...mockWarehouseLocations];
  damageReports: any[] = [...mockDamageReports];
  stockMovements: any[] = [...mockStockMovements];

  vessels: any[] = [...mockVessels];
  flights: any[] = [...mockFlights];
  berths: any[] = [...mockBerths];
  manifests: any[] = [...mockManifests];
  portCharges: any[] = [...mockPortCharges];
  portDocuments: any[] = [...mockPortDocuments];

  notifications: GlobalNotification[];
  auditLogs: AuditLogEntry[];
  activityFeed: ActivityFeedItem[];

  private subscribers: Map<string, Set<() => void>> = new Map();

  private constructor() {
    this.notifications = this.initializeGlobalNotifications();
    this.auditLogs = [];
    this.activityFeed = [];
  }

  static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  private initializeGlobalNotifications(): GlobalNotification[] {
    const allNotifs: GlobalNotification[] = [
      ...mockNotifications.map((n) => ({
        id: n.id,
        companyId: 'cmp-001',
        type: this.mapNotifType(n.type) as any,
        severity: this.getSeverityForType(n.type) as any,
        title: n.title,
        message: n.message,
        module: this.getModuleForType(n.type),
        referenceId: n.actionUrl ? n.actionUrl.split('/').pop() || null : null,
        referenceType: this.getReferenceType(n.type),
        actionUrl: n.actionUrl,
        timestamp: n.timestamp,
        read: n.read,
        readBy: n.read ? ['sys-user'] : [],
        createdByRole: 'System' as UserRole,
        visibleToRoles: [
          'SuperAdmin',
          'OrganizationAdmin',
          'CompanyAdmin',
          'Manager',
          'PortAgent',
          'AuditorReadOnly',
        ] as UserRole[],
      })),
      ...mockWHNotifications.map((n: any) => ({
        id: n.id,
        companyId: n.companyId || 'cmp-001',
        type: (n.type === 'Low Stock'
          ? 'low_stock'
          : n.type === 'Critical Stock'
            ? 'critical_stock'
            : 'system') as any,
        severity: (n.severity || 'Info') as any,
        title: n.title,
        message: n.message,
        module: 'warehouse',
        referenceId: n.referenceId,
        referenceType: n.referenceType || 'inventory',
        actionUrl: n.actionUrl,
        timestamp: n.timestamp,
        read: n.read,
        readBy: n.read ? ['sys-user'] : [],
        createdByRole: 'System' as UserRole,
        visibleToRoles: [
          'SuperAdmin',
          'CompanyAdmin',
          'Manager',
          'Operator',
          'AuditorReadOnly',
        ] as UserRole[],
      })),
      ...mockPortNotifications.map((n: any) => ({
        id: n.id,
        companyId: n.companyId || 'cmp-001',
        type: (n.type === 'vessel_arrival'
          ? 'shipment_updated'
          : n.type === 'container_delayed'
            ? 'shipment_delayed'
            : 'system') as any,
        severity: (n.severity || 'Info') as any,
        title: n.title,
        message: n.message,
        module: 'port',
        referenceId: n.referenceId,
        referenceType: n.type || 'system',
        actionUrl: n.actionUrl,
        timestamp: n.timestamp,
        read: n.read,
        readBy: n.read ? ['sys-user'] : [],
        createdByRole: 'System' as UserRole,
        visibleToRoles: [
          'SuperAdmin',
          'CompanyAdmin',
          'PortAgent',
          'AuditorReadOnly',
        ] as UserRole[],
      })),
    ];

    return allNotifs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  private mapNotifType(type: string): string {
    const map: Record<string, string> = {
      shipment_delayed: 'shipment_delayed',
      payment_overdue: 'invoice_overdue',
      maintenance_due: 'system',
      driver_off_duty: 'system',
      new_order: 'system',
      low_stock: 'low_stock',
    };
    return map[type] || 'system';
  }

  private getSeverityForType(type: string): string {
    const map: Record<string, string> = {
      shipment_delayed: 'High',
      payment_overdue: 'High',
      new_order: 'Medium',
      low_stock: 'Medium',
      critical_stock: 'Critical',
      sla_breach: 'Critical',
    };
    return map[type] || 'Info';
  }

  private getModuleForType(type: string): string {
    if (type.includes('shipment') || type.includes('delivery')) return 'shipments';
    if (type.includes('invoice') || type.includes('payment')) return 'finance';
    if (type.includes('stock')) return 'warehouse';
    if (type.includes('sla')) return 'operations';
    if (type.includes('driver') || type.includes('maintenance')) return 'fleet';
    if (type.includes('order')) return 'orders';
    return 'system';
  }

  private getReferenceType(type: string): string {
    if (type.includes('shipment')) return 'shipment';
    if (type.includes('invoice') || type.includes('payment')) return 'invoice';
    if (type.includes('stock')) return 'inventory';
    if (type.includes('order')) return 'order';
    return 'system';
  }

  subscribe(entity: string, callback: () => void): () => void {
    if (!this.subscribers.has(entity)) {
      this.subscribers.set(entity, new Set());
    }
    this.subscribers.get(entity)!.add(callback);
    return () => {
      this.subscribers.get(entity)?.delete(callback);
    };
  }

  notify(entity: string): void {
    this.subscribers.get(entity)?.forEach((cb) => cb());
    this.subscribers.get('*')?.forEach((cb) => cb());
  }

  createNotification(data: Partial<GlobalNotification>): GlobalNotification {
    const notif: GlobalNotification = {
      id: generateId('notif'),
      companyId: data.companyId || 'cmp-001',
      type: (data.type || 'system') as any,
      severity: (data.severity || 'Info') as any,
      title: data.title || '',
      message: data.message || '',
      module: data.module || 'system',
      referenceId: data.referenceId || null,
      referenceType: data.referenceType || null,
      actionUrl: data.actionUrl || null,
      timestamp: now(),
      read: false,
      readBy: [],
      createdByRole: (data.createdByRole || 'System') as UserRole,
      visibleToRoles: (data.visibleToRoles || [
        'SuperAdmin',
        'CompanyAdmin',
        'Manager',
        'AuditorReadOnly',
      ]) as UserRole[],
      metadata: data.metadata,
    };
    this.notifications.unshift(notif);
    this.notify('notifications');
    return notif;
  }

  markNotificationRead(notifId: string, userId?: string): boolean {
    const idx = this.notifications.findIndex((n) => n.id === notifId);
    if (idx === -1) return false;
    this.notifications[idx].read = true;
    if (userId && !this.notifications[idx].readBy.includes(userId)) {
      this.notifications[idx].readBy.push(userId);
    }
    this.notifications[idx].readAt = now();
    this.notify('notifications');
    return true;
  }

  markAllNotificationsRead(companyId: string): void {
    this.notifications.forEach((n) => {
      if (n.companyId === companyId) {
        n.read = true;
        n.readAt = now();
      }
    });
    this.notify('notifications');
  }

  getNotificationsForRole(
    companyId: string,
    role: UserRole,
    options?: { unreadOnly?: boolean; limit?: number }
  ): GlobalNotification[] {
    let results = this.notifications.filter(
      (n) =>
        n.companyId === companyId &&
        (n.visibleToRoles.includes(role) ||
          n.visibleToRoles.includes('SuperAdmin' as UserRole))
    );

    if (options?.unreadOnly) {
      results = results.filter((n) => !n.read);
    }

    if (options?.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  createAuditLog(data: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const log: AuditLogEntry = {
      id: generateId('audit'),
      timestamp: now(),
      ...data,
    };
    this.auditLogs.unshift(log);
    this.notify('auditLogs');
    return log;
  }

  getAuditLogs(
    companyId: string,
    options?: {
      userId?: string;
      module?: string;
      action?: string;
      entityType?: string;
      limit?: number;
    }
  ): AuditLogEntry[] {
    let results = this.auditLogs.filter((l) => l.companyId === companyId);

    if (options?.userId) {
      results = results.filter((l) => l.userId === options.userId);
    }
    if (options?.module) {
      results = results.filter((l) => l.module === options.module);
    }
    if (options?.action) {
      results = results.filter((l) => l.action === options.action);
    }
    if (options?.entityType) {
      results = results.filter((l) => l.entityType === options.entityType);
    }
    if (options?.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  addActivity(
    companyId: string,
    activity: Omit<ActivityFeedItem, 'id' | 'companyId' | 'timestamp'>
  ): ActivityFeedItem {
    const item: ActivityFeedItem = {
      id: generateId('act'),
      companyId,
      timestamp: now(),
      ...activity,
    };
    this.activityFeed.unshift(item);
    this.notify('activityFeed');
    return item;
  }

  getActivityFeed(
    companyId: string,
    options?: { limit?: number; entityType?: string }
  ): ActivityFeedItem[] {
    let results = this.activityFeed.filter((a) => a.companyId === companyId);

    if (options?.entityType) {
      results = results.filter((a) => a.entityType === options.entityType);
    }

    if (options?.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  listByCompany<T extends { companyId: string }>(
    items: T[],
    companyId?: string,
    options?: { search?: string; searchFields?: (keyof T)[]; sortBy?: keyof T; sortDir?: 'asc' | 'desc' }
  ): T[] {
    let result = [...items];

    if (companyId && companyId !== 'all') {
      result = result.filter((i) => i.companyId === companyId);
    }

    if (options?.search && options?.searchFields) {
      const q = options.search.toLowerCase();
      result = result.filter((item) =>
        options.searchFields!.some((f) => {
          const v = item[f];
          return v != null && String(v).toLowerCase().includes(q);
        })
      );
    }

    if (options?.sortBy) {
      const dir = options.sortDir === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        const aVal = a[options.sortBy!];
        const bVal = b[options.sortBy!];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * dir;
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * dir;
        }
        return 0;
      });
    }

    return result;
  }

  paginate<T>(
    items: T[],
    page: number,
    pageSize: number
  ): {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  } {
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total,
      page,
      pageSize,
      totalPages,
      hasMore: page < totalPages,
    };
  }
}

export const mockDb = MockDatabase.getInstance();
export { generateId, now, ensureCompanyId };

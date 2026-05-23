import { APP_CONFIG } from '@/config/appConfig';
import { mockDb } from '@/data/mock-db';
import type { GlobalNotification, UserRole, PaginatedResponse } from '@/data/mock-db';
import { mockDelay, fetchWithAuth } from './shared/utils';

export interface NotificationFilters {
  companyId?: string;
  unreadOnly?: boolean;
  type?: string;
  severity?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const notificationService = {
  async list(
    companyId: string,
    role: UserRole,
    filters?: NotificationFilters
  ): Promise<PaginatedResponse<GlobalNotification>> {
    if (APP_CONFIG.USE_MOCK) {
      await mockDelay();

      let results = mockDb.getNotificationsForRole(companyId, role, {
        unreadOnly: filters?.unreadOnly,
      });

      if (filters?.type) {
        results = results.filter((n) => n.type === filters.type);
      }
      if (filters?.severity) {
        results = results.filter((n) => n.severity === filters.severity);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        results = results.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.message.toLowerCase().includes(q)
        );
      }

      const page = filters?.page || 1;
      const pageSize = filters?.pageSize || 20;

      return mockDb.paginate(results, page, pageSize);
    }

    const params = new URLSearchParams();
    if (filters) {
      if (filters.unreadOnly) params.set('unreadOnly', 'true');
      if (filters.type) params.set('type', filters.type);
      if (filters.severity) params.set('severity', filters.severity);
      if (filters.search) params.set('search', filters.search);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
    }

    const res = await fetchWithAuth(`/notifications?${params}`);
    return res.json();
  },

  async getUnreadCount(companyId: string, role: UserRole): Promise<number> {
    if (APP_CONFIG.USE_MOCK) {
      await mockDelay();
      const unread = mockDb.getNotificationsForRole(companyId, role, {
        unreadOnly: true,
      });
      return unread.length;
    }

    const res = await fetchWithAuth(`/notifications/unread-count`);
    const data = await res.json();
    return data.count;
  },

  async markRead(notificationId: string, userId?: string): Promise<boolean> {
    if (APP_CONFIG.USE_MOCK) {
      await mockDelay();
      return mockDb.markNotificationRead(notificationId, userId);
    }

    const res = await fetchWithAuth(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
    return res.ok;
  },

  async markAllRead(companyId: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) {
      await mockDelay();
      mockDb.markAllNotificationsRead(companyId);
      return;
    }

    await fetchWithAuth(`/notifications/mark-all-read`, {
      method: 'PATCH',
    });
  },

  async create(options: {
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
  }): Promise<GlobalNotification> {
    if (APP_CONFIG.USE_MOCK) {
      await mockDelay();
      return mockDb.createNotification(options);
    }

    const res = await fetchWithAuth(`/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    return res.json();
  },

  async getById(id: string): Promise<GlobalNotification | null> {
    if (APP_CONFIG.USE_MOCK) {
      await mockDelay();
      return mockDb.notifications.find((n) => n.id === id) || null;
    }

    const res = await fetchWithAuth(`/notifications/${id}`);
    if (!res.ok) return null;
    return res.json();
  },
};

export const {
  list: getNotifications,
  getUnreadCount,
  markRead: markNotificationRead,
  markAllRead: markAllNotificationsRead,
  create: createNotification,
  getById: getNotificationById,
} = notificationService;

export type { GlobalNotification };

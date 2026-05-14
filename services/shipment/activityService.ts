import { APP_CONFIG } from '@/config/appConfig';
import { getMockActivityLog } from '@/data/shipments';
import type { MockActivityLog } from '@/data/shipments';

export interface ActivityFilters {
  shipmentId?: string;
  userId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const activityService = {
  async list(filters?: ActivityFilters): Promise<MockActivityLog[]> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(r => setTimeout(r, 200));
      let result = getMockActivityLog(filters?.shipmentId);
      if (filters) {
        if (filters.userId) result = result.filter(a => a.userId === filters.userId);
        if (filters.action) result = result.filter(a => a.action === filters.action);
        if (filters.dateFrom) result = result.filter(a => new Date(a.timestamp) >= new Date(filters.dateFrom!));
        if (filters.dateTo) result = result.filter(a => new Date(a.timestamp) <= new Date(filters.dateTo!));
      }
      return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    const params = new URLSearchParams();
    if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/activities?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  },
};

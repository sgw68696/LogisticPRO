import { APP_CONFIG } from '@/config/appConfig';
import { mockContainers, mockCustomsRecords } from '@/data/shipments';

export interface PortDashboardStats {
  totalContainers: number;
  loaded: number;
  unloading: number;
  onHold: number;
  damaged: number;
  customsPending: number;
  customsCleared: number;
}

export const portService = {
  async getDashboardStats(): Promise<PortDashboardStats> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(r => setTimeout(r, 200));
      return {
        totalContainers: mockContainers.length,
        loaded: mockContainers.filter(c => c.status === 'Loaded').length,
        unloading: mockContainers.filter(c => c.status === 'Unloading').length,
        onHold: mockContainers.filter(c => c.customsHold).length,
        damaged: mockContainers.filter(c => c.damage).length,
        customsPending: mockCustomsRecords.filter(c => c.status === 'Pending' || c.status === 'Hold').length,
        customsCleared: mockCustomsRecords.filter(c => c.status === 'Cleared' || c.status === 'Released').length,
      };
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/dashboard-stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  },
};

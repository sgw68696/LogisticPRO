import { APP_CONFIG } from '@/config/appConfig';
import { mockCustomsRecords } from '@/data/shipments';
import type { MockCustomsRecord } from '@/data/shipments';

export interface CustomsFilters {
  status?: string;
  search?: string;
  hsCode?: string;
}

export const customsService = {
  async list(filters?: CustomsFilters): Promise<MockCustomsRecord[]> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      let result = [...mockCustomsRecords];
      if (filters) {
        if (filters.status) result = result.filter(c => c.status === filters.status);
        if (filters.hsCode) result = result.filter(c => c.hsCode.startsWith(filters.hsCode!));
        if (filters.search) {
          const q = filters.search.toLowerCase();
          result = result.filter(c =>
            c.declarationNumber.toLowerCase().includes(q) ||
            c.hsCode.toLowerCase().includes(q) ||
            c.examiner.toLowerCase().includes(q)
          );
        }
      }
      return result;
    }
    const params = new URLSearchParams();
    if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/customs?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  },

  async getByShipmentId(shipmentId: string): Promise<MockCustomsRecord | null> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(r => setTimeout(r, 200));
      return mockCustomsRecords.find(c => c.shipmentId === shipmentId) || null;
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/customs/shipment/${shipmentId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!res.ok) return null;
    return res.json();
  },

  async updateStatus(id: string, status: string, notes?: string): Promise<MockCustomsRecord> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      const idx = mockCustomsRecords.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Customs record not found');
      mockCustomsRecords[idx] = { ...mockCustomsRecords[idx], status: status as any, notes: notes || mockCustomsRecords[idx].notes };
      if (status === 'Cleared' || status === 'Released') mockCustomsRecords[idx].clearedAt = new Date().toISOString();
      return mockCustomsRecords[idx];
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/customs/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ status, notes }),
    });
    return res.json();
  },
};

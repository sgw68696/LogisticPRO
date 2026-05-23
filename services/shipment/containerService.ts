import { APP_CONFIG } from '@/config/appConfig';
import { mockContainers } from '@/data/shipments';
import type { Container, ContainerStatus, ContainerSize } from '@/types/container';

export interface ContainerFilters {
  status?: ContainerStatus | 'All';
  size?: ContainerSize | 'All';
  search?: string;
  vessel?: string;
  yard?: string;
  customsHold?: boolean;
  damaged?: boolean;
}

export const containerService = {
  async list(filters?: ContainerFilters): Promise<Container[]> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      let result = [...mockContainers];
      if (filters) {
        if (filters.status && filters.status !== 'All') result = result.filter(c => c.status === filters.status);
        if (filters.size && filters.size !== 'All') result = result.filter(c => c.size === filters.size);
        if (filters.customsHold !== undefined) result = result.filter(c => c.customsHold === filters.customsHold);
        if (filters.damaged !== undefined) result = result.filter(c => c.damage === filters.damaged);
        if (filters.search) {
          const q = filters.search.toLowerCase();
          result = result.filter(c =>
            c.containerId.toLowerCase().includes(q) ||
            c.vessel.toLowerCase().includes(q) ||
            c.origin.toLowerCase().includes(q) ||
            c.destination.toLowerCase().includes(q)
          );
        }
      }
      return result;
    }
    const params = new URLSearchParams();
    if (filters) Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'All') params.append(k, v); });
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/containers?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  },

  async getById(id: string): Promise<Container | null> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(r => setTimeout(r, 200));
      return mockContainers.find(c => c.id === c.id || c.containerId === id) || null;
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/containers/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!res.ok) return null;
    return res.json();
  },

  async create(data: Partial<Container>): Promise<Container> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(r => setTimeout(r, 400));
      const container: Container = {
        id: `ctr-${String(mockContainers.length + 1).padStart(3, '0')}`,
        containerId: `NEW${String(1000000 + mockContainers.length).slice(-7)}`,
        size: '20ft',
        type: 'Dry Van',
        status: 'Empty',
        vessel: '',
        voyage: '',
        origin: '',
        destination: '',
        yard: '',
        operator: '',
        gateIn: new Date().toISOString(),
        gateOut: null,
        customsHold: false,
        damage: false,
        sealNumber: '',
        weight: 0,
        lastInspection: new Date().toISOString(),
        ...data,
      };
      return container;
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/containers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async update(id: string, updates: Partial<Container>): Promise<Container> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      const idx = mockContainers.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Container not found');
      mockContainers[idx] = { ...mockContainers[idx], ...updates };
      return mockContainers[idx];
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/containers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async remove(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      const idx = mockContainers.findIndex(c => c.id === id);
      if (idx !== -1) mockContainers.splice(idx, 1);
      return;
    }
    await fetch(`${APP_CONFIG.API_BASE_URL}/containers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  },
};

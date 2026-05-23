import { APP_CONFIG } from '@/config/appConfig';
import {
  mockVessels,
  mockFlights,
  mockBerths,
  mockManifests,
  mockPortCharges,
  mockCargoOps,
  mockPortDocuments,
  mockPortNotifications,
  mockPortDashboardStats,
} from '@/data/port';
import { mockContainers } from '@/data/shipments/container-data';
import { mockInvoices } from '@/data/mockData';
import type {
  Vessel, VesselStatus, Flight, FlightStatus,
  Berth, BerthStatus, PortManifest, ManifestStatus,
  PortCharge, ChargeCategory, ChargeStatus,
  CargoOperation, CargoOpType, CargoOpStatus,
  PortDocument, PortDocCategory, PortDocStatus,
  PortNotification, PortNotifType, PortNotifSeverity,
  PortDashboardStats,
} from '@/types/port';
import type { Container } from '@/types/container';
import type { Invoice } from '@/types/invoice';

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function filterByCompany<T extends { companyId: string }>(items: T[], companyId?: string): T[] {
  if (!companyId || companyId === 'all') return items;
  return items.filter(i => i.companyId === companyId);
}

function paginate<T>(items: T[], page: number, pageSize: number): { items: T[]; total: number; totalPages: number } {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, totalPages: Math.ceil(items.length / pageSize) };
}

function searchIn<T>(items: T[], query: string, fields: (keyof T)[]): T[] {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter(item => fields.some(f => { const v = item[f]; return v != null && String(v).toLowerCase().includes(q); }));
}

export const portService = {
  async getDashboardStats(companyId?: string): Promise<PortDashboardStats> {
    if (APP_CONFIG.USE_MOCK) { await delay(200); return { ...mockPortDashboardStats }; }
    const params = new URLSearchParams(); if (companyId) params.set('companyId', companyId);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/dashboard/stats?${params}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  // Vessels
  async listVessels(params?: { companyId?: string; status?: string; port?: string; search?: string }): Promise<Vessel[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let result = [...mockVessels];
      if (params?.companyId) result = filterByCompany(result, params.companyId);
      if (params?.status && params.status !== 'All') result = result.filter(v => v.status === params.status);
      if (params?.port) result = result.filter(v => v.port.toLowerCase().includes(params.port!.toLowerCase()));
      if (params?.search) result = searchIn(result, params.search, ['name', 'imo', 'voyage', 'carrier', 'port']);
      return result;
    }
    const sp = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/vessels?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  async getVesselById(id: string): Promise<Vessel | null> {
    if (APP_CONFIG.USE_MOCK) { await delay(150); return mockVessels.find(v => v.id === id || v.vesselId === id) || null; }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/vessels/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    if (!res.ok) return null; return res.json();
  },

  async createVessel(data: Partial<Vessel>): Promise<Vessel> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(400);
      const vessel: Vessel = { id: `ves-${String(mockVessels.length + 1).padStart(3, '0')}`, vesselId: `VSL-${String(1000 + mockVessels.length)}`, companyId: data.companyId || 'cmp-001', status: 'Expected', cargoUnit: 'TEU', timeline: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as Vessel;
      (mockVessels as any).push(vessel); return vessel;
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/vessels`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(data) });
    return res.json();
  },

  async updateVessel(id: string, updates: Partial<Vessel>): Promise<Vessel> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(300);
      const idx = mockVessels.findIndex(v => v.id === id || v.vesselId === id);
      if (idx === -1) throw new Error('Vessel not found');
      (mockVessels as any)[idx] = { ...mockVessels[idx], ...updates, updatedAt: new Date().toISOString() };
      return (mockVessels as any)[idx];
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/vessels/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(updates) });
    return res.json();
  },

  async deleteVessel(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) { await delay(300); const idx = mockVessels.findIndex(v => v.id === id || v.vesselId === id); if (idx !== -1) (mockVessels as any).splice(idx, 1); return; }
    await fetch(`${APP_CONFIG.API_BASE_URL}/port/vessels/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  },

  // Flights
  async listFlights(params?: { companyId?: string; type?: string; status?: string; search?: string }): Promise<Flight[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let result = [...mockFlights];
      if (params?.companyId) result = filterByCompany(result, params.companyId);
      if (params?.type && params.type !== 'All') result = result.filter(f => f.type === params.type);
      if (params?.status && params.status !== 'All') result = result.filter(f => f.status === params.status);
      if (params?.search) result = searchIn(result, params.search, ['flightNumber', 'airline', 'origin', 'destination', 'carrier']);
      return result;
    }
    const sp = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/flights?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  async createFlight(data: Partial<Flight>): Promise<Flight> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(400);
      const flight: Flight = { id: `flt-${String(mockFlights.length + 1).padStart(3, '0')}`, flightId: `FLT-${String(1000 + mockFlights.length)}`, companyId: data.companyId || 'cmp-001', type: 'Arrival', status: 'Scheduled', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as Flight;
      (mockFlights as any).push(flight); return flight;
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/flights`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(data) });
    return res.json();
  },

  async updateFlight(id: string, updates: Partial<Flight>): Promise<Flight> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(300);
      const idx = mockFlights.findIndex(f => f.id === id);
      if (idx === -1) throw new Error('Flight not found');
      (mockFlights as any)[idx] = { ...mockFlights[idx], ...updates, updatedAt: new Date().toISOString() };
      return (mockFlights as any)[idx];
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/flights/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(updates) });
    return res.json();
  },

  async deleteFlight(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) { await delay(300); const idx = mockFlights.findIndex(f => f.id === id); if (idx !== -1) (mockFlights as any).splice(idx, 1); return; }
    await fetch(`${APP_CONFIG.API_BASE_URL}/port/flights/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  },

  // Berths
  async listBerths(params?: { companyId?: string; status?: string; type?: string; search?: string }): Promise<Berth[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let result = [...mockBerths];
      if (params?.companyId) result = filterByCompany(result, params.companyId);
      if (params?.status && params.status !== 'All') result = result.filter(b => b.status === params.status);
      if (params?.type && params.type !== 'All') result = result.filter(b => b.type === params.type);
      if (params?.search) result = searchIn(result, params.search, ['name', 'operator', 'currentVessel']);
      return result;
    }
    const sp = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/berths?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  async updateBerth(id: string, updates: Partial<Berth>): Promise<Berth> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(300);
      const idx = mockBerths.findIndex(b => b.id === id);
      if (idx === -1) throw new Error('Berth not found');
      (mockBerths as any)[idx] = { ...mockBerths[idx], ...updates, updatedAt: new Date().toISOString() };
      return (mockBerths as any)[idx];
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/berths/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(updates) });
    return res.json();
  },

  // Manifests
  async listManifests(params?: { companyId?: string; type?: string; status?: string; search?: string }): Promise<PortManifest[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let result = [...mockManifests];
      if (params?.companyId) result = filterByCompany(result, params.companyId);
      if (params?.type && params.type !== 'All') result = result.filter(m => m.type === params.type);
      if (params?.status && params.status !== 'All') result = result.filter(m => m.status === params.status);
      if (params?.search) result = searchIn(result, params.search, ['manifestId', 'vessel', 'voyage', 'carrier', 'customsReference']);
      return result;
    }
    const sp = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/manifests?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  async updateManifest(id: string, updates: Partial<PortManifest>): Promise<PortManifest> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(300);
      const idx = mockManifests.findIndex(m => m.id === id);
      if (idx === -1) throw new Error('Manifest not found');
      (mockManifests as any)[idx] = { ...mockManifests[idx], ...updates, updatedAt: new Date().toISOString() };
      return (mockManifests as any)[idx];
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/manifests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(updates) });
    return res.json();
  },

  async deleteManifest(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) { await delay(300); const idx = mockManifests.findIndex(m => m.id === id); if (idx !== -1) (mockManifests as any).splice(idx, 1); return; }
    await fetch(`${APP_CONFIG.API_BASE_URL}/port/manifests/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  },

  // Charges
  async listCharges(params?: { companyId?: string; status?: string; category?: string; search?: string }): Promise<PortCharge[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let result = [...mockPortCharges];
      if (params?.companyId) result = filterByCompany(result, params.companyId);
      if (params?.status && params.status !== 'All') result = result.filter(c => c.status === params.status);
      if (params?.category && params.category !== 'All') result = result.filter(c => c.type === params.category);
      if (params?.search) result = searchIn(result, params.search, ['chargeId', 'invoiceRef', 'vessel', 'description', 'payer']);
      return result;
    }
    const sp = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/charges?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  async updateCharge(id: string, updates: Partial<PortCharge>): Promise<PortCharge> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(300);
      const idx = mockPortCharges.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Charge not found');
      (mockPortCharges as any)[idx] = { ...mockPortCharges[idx], ...updates, updatedAt: new Date().toISOString() };
      return (mockPortCharges as any)[idx];
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/charges/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(updates) });
    return res.json();
  },

  // Cargo Operations
  async listCargoOps(params?: { companyId?: string; type?: string; status?: string; search?: string }): Promise<CargoOperation[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let result = [...mockCargoOps];
      if (params?.companyId) result = filterByCompany(result, params.companyId);
      if (params?.type && params.type !== 'All') result = result.filter(o => o.type === params.type);
      if (params?.status && params.status !== 'All') result = result.filter(o => o.status === params.status);
      if (params?.search) result = searchIn(result, params.search, ['operationId', 'vessel', 'berth', 'operator', 'cargoType']);
      return result;
    }
    const sp = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/cargo-ops?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  async updateCargoOp(id: string, updates: Partial<CargoOperation>): Promise<CargoOperation> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(300);
      const idx = mockCargoOps.findIndex(o => o.id === id);
      if (idx === -1) throw new Error('Cargo operation not found');
      (mockCargoOps as any)[idx] = { ...mockCargoOps[idx], ...updates, updatedAt: new Date().toISOString() };
      return (mockCargoOps as any)[idx];
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/cargo-ops/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(updates) });
    return res.json();
  },

  // Documents
  async listDocuments(params?: { companyId?: string; status?: string; category?: string; search?: string }): Promise<PortDocument[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let result = [...mockPortDocuments];
      if (params?.companyId) result = filterByCompany(result, params.companyId);
      if (params?.status && params.status !== 'All') result = result.filter(d => d.status === params.status);
      if (params?.category && params.category !== 'All') result = result.filter(d => d.category === params.category);
      if (params?.search) result = searchIn(result, params.search, ['title', 'referenceNumber', 'vessel', 'uploadedBy']);
      return result;
    }
    const sp = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/documents?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  async createDocument(data: Partial<PortDocument>): Promise<PortDocument> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(400);
      const doc: PortDocument = { id: `pdoc-${String(mockPortDocuments.length + 1).padStart(3, '0')}`, documentId: `PDOC-${String(1000 + mockPortDocuments.length)}`, companyId: data.companyId || 'cmp-001', status: 'Draft', type: 'PDF', version: 1, tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data } as PortDocument;
      (mockPortDocuments as any).push(doc); return doc;
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/documents`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(data) });
    return res.json();
  },

  async updateDocument(id: string, updates: Partial<PortDocument>): Promise<PortDocument> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(300);
      const idx = mockPortDocuments.findIndex(d => d.id === id);
      if (idx === -1) throw new Error('Document not found');
      (mockPortDocuments as any)[idx] = { ...mockPortDocuments[idx], ...updates, updatedAt: new Date().toISOString() };
      return (mockPortDocuments as any)[idx];
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/documents/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(updates) });
    return res.json();
  },

  async deleteDocument(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) { await delay(300); const idx = mockPortDocuments.findIndex(d => d.id === id); if (idx !== -1) (mockPortDocuments as any).splice(idx, 1); return; }
    await fetch(`${APP_CONFIG.API_BASE_URL}/port/documents/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  },

  // Notifications
  async listNotifications(params?: { companyId?: string; type?: string; severity?: string; unread?: boolean }): Promise<PortNotification[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(200);
      let result = [...mockPortNotifications];
      if (params?.companyId) result = filterByCompany(result, params.companyId);
      if (params?.type && params.type !== 'All') result = result.filter(n => n.type === params.type);
      if (params?.severity && params.severity !== 'All') result = result.filter(n => n.severity === params.severity);
      if (params?.unread) result = result.filter(n => !n.read);
      return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    const sp = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/notifications?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) { await delay(100); const n = mockPortNotifications.find(n => n.id === id); if (n) (n as any).read = true; return; }
    await fetch(`${APP_CONFIG.API_BASE_URL}/port/notifications/${id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  },

  async markAllNotificationsRead(): Promise<void> {
    if (APP_CONFIG.USE_MOCK) { await delay(200); mockPortNotifications.forEach(n => (n as any).read = true); return; }
    await fetch(`${APP_CONFIG.API_BASE_URL}/port/notifications/read-all`, { method: 'PATCH', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  },

  // Containers (shared from containerService)
  async listContainers(params?: { companyId?: string; status?: string; size?: string; search?: string }): Promise<Container[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let result = [...mockContainers];
      if (params?.status && params.status !== 'All') result = result.filter(c => c.status === params.status);
      if (params?.size && params.size !== 'All') result = result.filter(c => c.size === params.size);
      if (params?.search) {
        const q = params.search.toLowerCase();
        result = result.filter(c => c.containerId.toLowerCase().includes(q) || c.sealNumber.toLowerCase().includes(q) || c.vessel.toLowerCase().includes(q) || c.yard.toLowerCase().includes(q));
      }
      return result;
    }
    const sp = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/containers?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  // Global invoices reference
  async listGlobalInvoices(): Promise<Invoice[]> {
    if (APP_CONFIG.USE_MOCK) { await delay(200); return [...mockInvoices]; }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/finance/invoices`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  // Reports data
  async getReportsData(companyId?: string) {
    if (APP_CONFIG.USE_MOCK) {
      await delay(300);
      const vessels = companyId ? filterByCompany(mockVessels, companyId) : mockVessels;
      const berths = companyId ? filterByCompany(mockBerths, companyId) : mockBerths;
      const ops = companyId ? filterByCompany(mockCargoOps, companyId) : mockCargoOps;
      const charges = companyId ? filterByCompany(mockPortCharges, companyId) : mockPortCharges;
      const completedOps = ops.filter(o => o.status === 'Completed');
      const totalDuration = completedOps.reduce((s, o) => s + (o.duration || 0), 0);
      return {
        vesselSummary: { total: vessels.length, arrived: vessels.filter(v => v.status === 'Arrived' || v.status === 'Docked').length, departed: vessels.filter(v => v.status === 'Departed').length, delayed: vessels.filter(v => v.status === 'Delayed').length },
        cargoThroughput: { totalOps: ops.length, completed: completedOps.length, totalWeight: ops.reduce((s, o) => s + o.cargoWeight, 0), totalVolume: ops.reduce((s, o) => s + o.cargoVolume, 0) },
        berthUtilization: { total: berths.length, occupied: berths.filter(b => b.status === 'Occupied').length, avgOccupancyRate: Math.round(berths.reduce((s, b) => s + b.occupancyRate, 0) / berths.length) },
        revenue: { total: charges.reduce((s, c) => s + c.amount, 0), collected: charges.filter(c => c.status === 'Collected').reduce((s, c) => s + c.amount, 0), pending: charges.filter(c => c.status === 'Pending' || c.status === 'Overdue').reduce((s, c) => s + c.amount, 0) },
        performance: { avgTurnaround: completedOps.length > 0 ? Math.round(totalDuration / completedOps.length) : 0, totalOps: ops.length },
        monthlyTrend: Array.from({ length: 6 }, (_, i) => ({ month: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'][i], vesselCalls: Math.floor(Math.random() * 15) + 20, cargoVolume: Math.floor(Math.random() * 50000) + 100000, revenue: Math.floor(Math.random() * 2000000) + 3000000 })),
      };
    }
    const params = new URLSearchParams(); if (companyId) params.set('companyId', companyId);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/reports?${params}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  // Additional CRUD: Berth Create/Delete
  async createBerth(data: Partial<Berth>): Promise<Berth> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(400);
      const berth: Berth = {
        id: `brt-${String(mockBerths.length + 1).padStart(3, '0')}`,
        berthId: `BRT-${String(100 + mockBerths.length)}`,
        companyId: data.companyId || 'cmp-001',
        status: 'Available',
        depth: 12, length: 300, maxDraft: 14, maxVesselLength: 320, maxVesselBeam: 45,
        craneCapacity: '50T', craneCount: 2, occupancyRate: 0, equipment: [], services: [],
        operator: data.operator || 'Port Authority',
        currentVessel: null, currentVesselId: null,
        occupancyStart: null, occupancyEnd: null,
        notes: '', type: 'Container',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        ...data,
      } as Berth;
      (mockBerths as any).push(berth); return berth;
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/berths`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(data) });
    return res.json();
  },

  async deleteBerth(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) { await delay(300); const idx = mockBerths.findIndex(b => b.id === id); if (idx !== -1) (mockBerths as any).splice(idx, 1); return; }
    await fetch(`${APP_CONFIG.API_BASE_URL}/port/berths/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  },

  // Manifest Create
  async createManifest(data: Partial<PortManifest>): Promise<PortManifest> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(400);
      const manifest: PortManifest = {
        id: `mft-${String(mockManifests.length + 1).padStart(3, '0')}`,
        manifestId: `MFT-${new Date().getFullYear()}-${String(1000 + mockManifests.length)}`,
        companyId: data.companyId || 'cmp-001', type: 'Import', status: 'Draft',
        vessel: '', vesselId: '', voyage: '', carrier: '',
        portOfLoading: '', portOfDischarge: '',
        containerCount: 0, totalWeight: 0, weightUnit: 'kg',
        hazmatCount: 0, reeferCount: 0, containers: [], shipmentIds: [],
        filedDate: new Date().toISOString(), filedBy: '',
        approvedDate: null, approvedBy: null, customsReference: '',
        notes: '',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        ...data,
      } as PortManifest;
      (mockManifests as any).push(manifest); return manifest;
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/manifests`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(data) });
    return res.json();
  },

  // Cargo Ops Create/Delete
  async createCargoOp(data: Partial<CargoOperation>): Promise<CargoOperation> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(400);
      const op: CargoOperation = {
        id: `cgo-${String(mockCargoOps.length + 1).padStart(3, '0')}`,
        operationId: `OP-${new Date().getFullYear()}-${String(100 + mockCargoOps.length)}`,
        companyId: data.companyId || 'cmp-001', type: 'Load', status: 'Scheduled',
        vessel: '', vesselId: '', berth: '', berthId: '',
        manifest: null, manifestId: null, containerId: null,
        cargoType: 'General Cargo', cargoWeight: 0, cargoVolume: 0,
        quantity: 0, unit: 'TEU',
        startTime: new Date().toISOString(), endTime: null, duration: null,
        operator: '', supervisor: '', equipment: [], notes: '',
        timeline: [],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        ...data,
      } as CargoOperation;
      (mockCargoOps as any).push(op); return op;
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/cargo-ops`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(data) });
    return res.json();
  },

  async deleteCargoOp(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) { await delay(300); const idx = mockCargoOps.findIndex(o => o.id === id); if (idx !== -1) (mockCargoOps as any).splice(idx, 1); return; }
    await fetch(`${APP_CONFIG.API_BASE_URL}/port/cargo-ops/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  },

  // Charges Create/Delete
  async createCharge(data: Partial<PortCharge>): Promise<PortCharge> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(400);
      const charge: PortCharge = {
        id: `pch-${String(mockPortCharges.length + 1).padStart(3, '0')}`,
        chargeId: `PCH-${String(1000 + mockPortCharges.length)}`,
        invoiceRef: `PINV-${new Date().getFullYear()}-${String(1000 + mockPortCharges.length)}`,
        companyId: data.companyId || 'cmp-001', type: 'Berth Hire', status: 'Pending',
        vessel: '', vesselId: '', voyage: '', description: '',
        payer: '', quantity: 1, rate: 0, currency: 'USD', amount: 0,
        issuedDate: new Date().toISOString(), dueDate: new Date().toISOString(),
        paidDate: null, invoiceLink: null, notes: '',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        ...data,
      } as PortCharge;
      (mockPortCharges as any).push(charge); return charge;
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/charges`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(data) });
    return res.json();
  },

  async deleteCharge(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) { await delay(300); const idx = mockPortCharges.findIndex(c => c.id === id); if (idx !== -1) (mockPortCharges as any).splice(idx, 1); return; }
    await fetch(`${APP_CONFIG.API_BASE_URL}/port/charges/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  },

  // Notification create
  async createNotification(data: Partial<PortNotification>): Promise<PortNotification> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(200);
      const notif: PortNotification = {
        id: `pnotif-${String(mockPortNotifications.length + 1).padStart(3, '0')}`,
        companyId: data.companyId || 'cmp-001',
        type: 'System', severity: 'Info',
        title: '', message: '', module: '',
        referenceId: null, timestamp: new Date().toISOString(),
        read: false, actionUrl: null,
        createdAt: new Date().toISOString(),
        ...data,
      } as PortNotification;
      (mockPortNotifications as any).unshift(notif); return notif;
    }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/notifications`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(data) });
    return res.json();
  },

  // Get by ID helpers
  async getBerthById(id: string): Promise<Berth | null> {
    if (APP_CONFIG.USE_MOCK) { await delay(150); return mockBerths.find(b => b.id === id || b.berthId === id) || null; }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/berths/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    if (!res.ok) return null; return res.json();
  },

  async getManifestById(id: string): Promise<PortManifest | null> {
    if (APP_CONFIG.USE_MOCK) { await delay(150); return mockManifests.find(m => m.id === id || m.manifestId === id) || null; }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/manifests/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    if (!res.ok) return null; return res.json();
  },

  async getCargoOpById(id: string): Promise<CargoOperation | null> {
    if (APP_CONFIG.USE_MOCK) { await delay(150); return mockCargoOps.find(o => o.id === id || o.operationId === id) || null; }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/cargo-ops/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    if (!res.ok) return null; return res.json();
  },

  async getChargeById(id: string): Promise<PortCharge | null> {
    if (APP_CONFIG.USE_MOCK) { await delay(150); return mockPortCharges.find(c => c.id === id || c.chargeId === id) || null; }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/charges/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    if (!res.ok) return null; return res.json();
  },

  async getDocumentById(id: string): Promise<PortDocument | null> {
    if (APP_CONFIG.USE_MOCK) { await delay(150); return mockPortDocuments.find(d => d.id === id || d.documentId === id) || null; }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/documents/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    if (!res.ok) return null; return res.json();
  },

  async getContainerById(id: string): Promise<Container | null> {
    if (APP_CONFIG.USE_MOCK) { await delay(150); return mockContainers.find(c => c.id === id || c.containerId === id) || null; }
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/port/containers/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    if (!res.ok) return null; return res.json();
  },

  // Timeline events
  async addVesselTimelineEvent(vesselId: string, event: { status: string; location: string; notes: string }): Promise<void> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(200);
      const idx = mockVessels.findIndex(v => v.id === vesselId || v.vesselId === vesselId);
      if (idx !== -1) {
        const timeline = mockVessels[idx].timeline || [];
        timeline.push({ id: `${vesselId}-tl-${timeline.length + 1}`, vesselId, status: event.status, timestamp: new Date().toISOString(), location: event.location, notes: event.notes });
        (mockVessels as any)[idx].timeline = timeline;
        (mockVessels as any)[idx].updatedAt = new Date().toISOString();
      }
      return;
    }
    await fetch(`${APP_CONFIG.API_BASE_URL}/port/vessels/${vesselId}/timeline`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(event) });
  },

  async addCargoOpTimelineEvent(operationId: string, event: { status: string; notes: string }): Promise<void> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(200);
      const idx = mockCargoOps.findIndex(o => o.id === operationId || o.operationId === operationId);
      if (idx !== -1) {
        const timeline = mockCargoOps[idx].timeline || [];
        timeline.push({ id: `${operationId}-tl-${timeline.length + 1}`, operationId, status: event.status, timestamp: new Date().toISOString(), notes: event.notes });
        (mockCargoOps as any)[idx].timeline = timeline;
        (mockCargoOps as any)[idx].updatedAt = new Date().toISOString();
      }
      return;
    }
    await fetch(`${APP_CONFIG.API_BASE_URL}/port/cargo-ops/${operationId}/timeline`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(event) });
  },
};

  // Backward-compatible named exports
export const {
  getDashboardStats,
  listVessels, getVesselById, createVessel, updateVessel, deleteVessel,
  listFlights, createFlight, updateFlight, deleteFlight,
  listBerths, updateBerth, createBerth, deleteBerth, getBerthById,
  listManifests, createManifest, updateManifest, deleteManifest, getManifestById,
  listCharges, createCharge, updateCharge, deleteCharge, getChargeById,
  listCargoOps, createCargoOp, updateCargoOp, deleteCargoOp, getCargoOpById,
  listDocuments, createDocument, updateDocument, deleteDocument, getDocumentById,
  listNotifications, createNotification, markNotificationRead, markAllNotificationsRead,
  listContainers, listGlobalInvoices, getContainerById,
  getReportsData,
  addVesselTimelineEvent, addCargoOpTimelineEvent,
} = portService;

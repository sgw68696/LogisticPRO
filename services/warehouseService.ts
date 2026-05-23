import { APP_CONFIG } from '@/config/appConfig';
import {
  mockWarehouses, mockGRNs, mockGDNs,
  mockWarehouseInventory, mockWarehouseLocations,
  mockDamageReports, mockStockMovements,
  mockWHNotifications, mockWHDashboardStats,
  getWarehouseCompanies,
} from '@/data/warehouse';
import type {
  Warehouse, InventoryItem, GoodsReceivedNote, GRNItem,
  GoodsDispatchNote, GDNItem, WarehouseLocation,
  DamageReport, StockMovement, WarehouseDashboardStats, WarehouseNotification,
  GRNStatus, GDNStatus, DamageStatus, DamageSeverity, WHActivityEvent, WHNotifType, WHNotifSeverity,
} from '@/types/warehouse';
import { mockConsolidatedShipments as mockShipments } from '@/data/shipment-mock-data';

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
function filterByCompany<T extends { companyId: string }>(items: T[], cid?: string) {
  if (!cid || cid === 'all') return items;
  return items.filter(i => i.companyId === cid);
}
function searchIn<T>(items: T[], q: string, fields: (keyof T)[]) {
  if (!q) return items;
  const lq = q.toLowerCase();
  return items.filter(i => fields.some(f => { const v = i[f]; return v != null && String(v).toLowerCase().includes(lq); }));
}

function generateId(prefix: string, list: { id: string }[]) {
  return `${prefix}-${String(list.length + 1).padStart(3, '0')}`;
}

export const warehouseService = {
  // ---- Dashboard ----
  async getDashboardStats(companyId?: string): Promise<WarehouseDashboardStats> {
    if (APP_CONFIG.USE_MOCK) { await delay(200); return { ...mockWHDashboardStats }; }
    const p = new URLSearchParams(); if (companyId) p.set('companyId', companyId);
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/dashboard?${p}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return r.json();
  },

  // ---- Warehouses ----
  async listWarehouses(params?: { companyId?: string; city?: string; search?: string }): Promise<Warehouse[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let r = [...mockWarehouses];
      if (params?.city) r = r.filter(w => w.city === params.city);
      if (params?.search) r = searchIn(r, params.search, ['name', 'warehouseId', 'city', 'manager']);
      return r;
    }
    const sp = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouses?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  async getWarehouseById(id: string): Promise<Warehouse | null> {
    if (APP_CONFIG.USE_MOCK) { await delay(150); return mockWarehouses.find(w => w.id === id || w.warehouseId === id) || null; }
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouses/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    if (!r.ok) return null; return r.json();
  },

  // ---- GRN (Goods Received Note) ----
  async listGRNs(params?: { companyId?: string; status?: string; vendor?: string; search?: string }): Promise<GoodsReceivedNote[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let r = [...mockGRNs];
      if (params?.companyId) r = filterByCompany(r, params.companyId);
      if (params?.status && params.status !== 'All') r = r.filter(g => g.status === params.status);
      if (params?.vendor) r = r.filter(g => g.vendor === params.vendor);
      if (params?.search) r = searchIn(r, params.search, ['grnId', 'poReference', 'vendor', 'warehouseName']);
      return r;
    }
    const sp = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/grns?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  async getGRNById(id: string): Promise<GoodsReceivedNote | null> {
    if (APP_CONFIG.USE_MOCK) { await delay(150); return mockGRNs.find(g => g.id === id || g.grnId === id) || null; }
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/grns/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    if (!r.ok) return null; return r.json();
  },

  async createGRN(data: Partial<GoodsReceivedNote>): Promise<GoodsReceivedNote> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(400);
      const grn: GoodsReceivedNote = {
        id: generateId('grn', mockGRNs),
        grnId: `GRN-2025-${String(1000 + mockGRNs.length)}`,
        companyId: data.companyId || 'cmp-001',
        poReference: '', vendor: '', vendorContact: '', warehouseId: '', warehouseName: '',
        dock: '', receivedDate: new Date().toISOString(), items: [], totalItems: 0, totalQuantity: 0,
        status: 'Draft', receivedBy: '', approvedBy: null, notes: '', timeline: [],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        ...data,
      } as GoodsReceivedNote;
      (mockGRNs as any).push(grn);
      return grn;
    }
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/grns`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(data) });
    return r.json();
  },

  async updateGRN(id: string, updates: Partial<GoodsReceivedNote>): Promise<GoodsReceivedNote> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(300);
      const idx = mockGRNs.findIndex(g => g.id === id || g.grnId === id);
      if (idx === -1) throw new Error('GRN not found');
      (mockGRNs as any)[idx] = { ...mockGRNs[idx], ...updates, updatedAt: new Date().toISOString() };
      return (mockGRNs as any)[idx];
    }
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/grns/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(updates) });
    return r.json();
  },

  async deleteGRN(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) { await delay(300); const idx = mockGRNs.findIndex(g => g.id === id || g.grnId === id); if (idx !== -1) (mockGRNs as any).splice(idx, 1); return; }
    await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/grns/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  },

  // ---- GDN (Goods Dispatch Note) ----
  async listGDNs(params?: { companyId?: string; status?: string; customer?: string; search?: string }): Promise<GoodsDispatchNote[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let r = [...mockGDNs];
      if (params?.companyId) r = filterByCompany(r, params.companyId);
      if (params?.status && params.status !== 'All') r = r.filter(g => g.status === params.status);
      if (params?.customer) r = r.filter(g => g.customer === params.customer);
      if (params?.search) r = searchIn(r, params.search, ['gdnId', 'orderRef', 'customer', 'warehouseName']);
      return r;
    }
    const sp = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/gdns?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  async getGDNById(id: string): Promise<GoodsDispatchNote | null> {
    if (APP_CONFIG.USE_MOCK) { await delay(150); return mockGDNs.find(g => g.id === id || g.gdnId === id) || null; }
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/gdns/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    if (!r.ok) return null; return r.json();
  },

  async createGDN(data: Partial<GoodsDispatchNote>): Promise<GoodsDispatchNote> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(400);
      const gdn: GoodsDispatchNote = {
        id: generateId('gdn', mockGDNs),
        gdnId: `GDN-2025-${String(1000 + mockGDNs.length)}`,
        companyId: data.companyId || 'cmp-001',
        orderRef: '', customer: '', customerContact: '', warehouseId: '', warehouseName: '',
        dock: '', dispatchDate: new Date().toISOString(), items: [], totalItems: 0, totalQuantity: 0,
        status: 'Draft', pickedBy: null, packedBy: null, checkedBy: null,
        vehicleNo: '', driverName: '', driverContact: '', notes: '', timeline: [],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        ...data,
      } as GoodsDispatchNote;
      (mockGDNs as any).push(gdn);
      return gdn;
    }
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/gdns`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(data) });
    return r.json();
  },

  async updateGDN(id: string, updates: Partial<GoodsDispatchNote>): Promise<GoodsDispatchNote> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(300);
      const idx = mockGDNs.findIndex(g => g.id === id || g.gdnId === id);
      if (idx === -1) throw new Error('GDN not found');
      (mockGDNs as any)[idx] = { ...mockGDNs[idx], ...updates, updatedAt: new Date().toISOString() };
      return (mockGDNs as any)[idx];
    }
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/gdns/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(updates) });
    return r.json();
  },

  async deleteGDN(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) { await delay(300); const idx = mockGDNs.findIndex(g => g.id === id || g.gdnId === id); if (idx !== -1) (mockGDNs as any).splice(idx, 1); return; }
    await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/gdns/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  },

  // ---- Locations ----
  async listLocations(params?: { companyId?: string; zone?: string; status?: string; search?: string }): Promise<WarehouseLocation[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let r = [...mockWarehouseLocations];
      if (params?.companyId) r = filterByCompany(r, params.companyId);
      if (params?.zone && params.zone !== 'All') r = r.filter(l => l.zone === params.zone);
      if (params?.status && params.status !== 'All') r = r.filter(l => l.status === params.status);
      if (params?.search) r = searchIn(r, params.search, ['locationId', 'barcode', 'currentSku', 'currentProduct']);
      return r;
    }
    const sp = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/locations?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  async updateLocation(id: string, updates: Partial<WarehouseLocation>): Promise<WarehouseLocation> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(300);
      const idx = mockWarehouseLocations.findIndex(l => l.id === id);
      if (idx === -1) throw new Error('Location not found');
      (mockWarehouseLocations as any)[idx] = { ...mockWarehouseLocations[idx], ...updates, updatedAt: new Date().toISOString() };
      return (mockWarehouseLocations as any)[idx];
    }
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/locations/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(updates) });
    return r.json();
  },

  // ---- Damage Reports ----
  async listDamageReports(params?: { companyId?: string; status?: string; severity?: string; search?: string }): Promise<DamageReport[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let r = [...mockDamageReports];
      if (params?.companyId) r = filterByCompany(r, params.companyId);
      if (params?.status && params.status !== 'All') r = r.filter(d => d.status === params.status);
      if (params?.severity && params.severity !== 'All') r = r.filter(d => d.severity === params.severity);
      if (params?.search) r = searchIn(r, params.search, ['damageId', 'sku', 'productName', 'reportedBy']);
      return r;
    }
    const sp = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/damage?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  async getDamageReportById(id: string): Promise<DamageReport | null> {
    if (APP_CONFIG.USE_MOCK) { await delay(150); return mockDamageReports.find(d => d.id === id || d.damageId === id) || null; }
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/damage/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    if (!r.ok) return null; return r.json();
  },

  async createDamageReport(data: Partial<DamageReport>): Promise<DamageReport> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(400);
      const rpt: DamageReport = {
        id: generateId('dmr', mockDamageReports),
        damageId: `DMR-2025-${String(100 + mockDamageReports.length)}`,
        companyId: data.companyId || 'cmp-001',
        sku: '', productName: '', category: '', quantity: 0, unit: 'pcs',
        location: '', locationId: '', warehouseId: '', warehouseName: '',
        severity: 'Minor', status: 'Reported', description: '', cause: '',
        reportedBy: '', reportedDate: new Date().toISOString(),
        inspectedBy: null, inspectedDate: null, approvedBy: null, approvedDate: null,
        images: [], linkedGRN: null, linkedGDN: null,
        disposition: '', notes: '', timeline: [],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        ...data,
      } as DamageReport;
      (mockDamageReports as any).push(rpt);
      return rpt;
    }
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/damage`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(data) });
    return r.json();
  },

  async updateDamageReport(id: string, updates: Partial<DamageReport>): Promise<DamageReport> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(300);
      const idx = mockDamageReports.findIndex(d => d.id === id || d.damageId === id);
      if (idx === -1) throw new Error('Damage report not found');
      (mockDamageReports as any)[idx] = { ...mockDamageReports[idx], ...updates, updatedAt: new Date().toISOString() };
      return (mockDamageReports as any)[idx];
    }
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/damage/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(updates) });
    return r.json();
  },

  async deleteDamageReport(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) { await delay(300); const idx = mockDamageReports.findIndex(d => d.id === id || d.damageId === id); if (idx !== -1) (mockDamageReports as any).splice(idx, 1); return; }
    await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/damage/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  },

  // ---- Stock Movements ----
  async listStockMovements(params?: { companyId?: string; type?: string; search?: string }): Promise<StockMovement[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let r = [...mockStockMovements];
      if (params?.companyId) r = filterByCompany(r, params.companyId);
      if (params?.type && params.type !== 'All') r = r.filter(m => m.type === params.type);
      if (params?.search) r = searchIn(r, params.search, ['sku', 'productName', 'referenceId', 'userName']);
      return r;
    }
    const sp = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/stock-movements?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  async recordStockMovement(data: Partial<StockMovement>): Promise<StockMovement> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(200);
      const sm: StockMovement = {
        id: generateId('sm', mockStockMovements),
        companyId: data.companyId || 'cmp-001',
        sku: '', productName: '', type: 'Adjustment', quantity: 0,
        fromLocation: '', toLocation: '', referenceId: '', referenceType: '',
        userId: 'user-001', userName: 'System', timestamp: new Date().toISOString(), notes: '',
        ...data,
      } as StockMovement;
      (mockStockMovements as any).unshift(sm);
      return sm;
    }
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/stock-movements`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(data) });
    return r.json();
  },

  // ---- Inventory ----
  async listInventory(params?: { category?: string; search?: string; lowStock?: boolean }): Promise<InventoryItem[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let r = [...mockWarehouseInventory];
      if (params?.category && params.category !== 'All') r = r.filter(i => i.category === params.category);
      if (params?.lowStock) r = r.filter(i => i.quantity < 20);
      if (params?.search) r = searchIn(r, params.search, ['sku', 'productName', 'location']);
      return r;
    }
    const sp = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/inventory?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  async adjustInventory(id: string, newQuantity: number): Promise<InventoryItem> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(200);
      const idx = mockWarehouseInventory.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('Inventory item not found');
      (mockWarehouseInventory as any)[idx] = { ...mockWarehouseInventory[idx], quantity: newQuantity, lastUpdated: new Date().toISOString() };
      await this.recordStockMovement({
        sku: mockWarehouseInventory[idx].sku,
        productName: mockWarehouseInventory[idx].productName,
        type: 'Adjustment',
        quantity: newQuantity - mockWarehouseInventory[idx].quantity,
        fromLocation: mockWarehouseInventory[idx].location,
        toLocation: mockWarehouseInventory[idx].location,
        referenceId: id,
        referenceType: 'Adjustment',
        userName: 'Warehouse Operator',
        notes: `Quantity adjusted from ${mockWarehouseInventory[idx].quantity} to ${newQuantity}`,
      });
      return (mockWarehouseInventory as any)[idx];
    }
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/inventory/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ quantity: newQuantity }) });
    return r.json();
  },

  // ---- Notifications ----
  async listNotifications(params?: { companyId?: string; type?: string; unread?: boolean }): Promise<WarehouseNotification[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(200);
      let r = [...mockWHNotifications];
      if (params?.companyId) r = filterByCompany(r, params.companyId);
      if (params?.type && params.type !== 'All') r = r.filter(n => n.type === params.type);
      if (params?.unread) r = r.filter(n => !n.read);
      return r.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    const sp = new URLSearchParams(params as any);
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/notifications?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) { await delay(100); const n = mockWHNotifications.find(n => n.id === id); if (n) (n as any).read = true; return; }
    await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/notifications/${id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  },

  async markAllNotificationsRead(): Promise<void> {
    if (APP_CONFIG.USE_MOCK) { await delay(200); mockWHNotifications.forEach(n => (n as any).read = true); return; }
    await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/notifications/read-all`, { method: 'PATCH', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  },

  async createNotification(data: Partial<WarehouseNotification>): Promise<WarehouseNotification> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(200);
      const notif: WarehouseNotification = {
        id: generateId('whn', mockWHNotifications),
        companyId: data.companyId || 'cmp-001', type: 'System', severity: 'Info',
        title: '', message: '', module: '', referenceId: null,
        timestamp: new Date().toISOString(), read: false, actionUrl: null,
        createdAt: new Date().toISOString(), ...data,
      } as WarehouseNotification;
      (mockWHNotifications as any).unshift(notif);
      return notif;
    }
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/notifications`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(data) });
    return r.json();
  },

  // ---- Reports Data ----
  async getReportsData(companyId?: string) {
    if (APP_CONFIG.USE_MOCK) {
      await delay(300);
      const grns = companyId ? filterByCompany(mockGRNs, companyId) : mockGRNs;
      const gdns = companyId ? filterByCompany(mockGDNs, companyId) : mockGDNs;
      const damage = companyId ? filterByCompany(mockDamageReports, companyId) : mockDamageReports;
      const completedGRNs = grns.filter(g => g.status === 'Completed');
      const completedGDNs = gdns.filter(g => g.status === 'Delivered');
      const totalInboundQty = completedGRNs.reduce((s, g) => s + g.totalQuantity, 0);
      const totalOutboundQty = completedGDNs.reduce((s, g) => s + g.totalQuantity, 0);
      return {
        inboundSummary: { total: grns.length, completed: completedGRNs.length, totalItems: totalInboundQty, pending: grns.filter(g => g.status !== 'Completed' && g.status !== 'Cancelled').length },
        outboundSummary: { total: gdns.length, completed: completedGDNs.length, totalItems: totalOutboundQty, pending: gdns.filter(g => g.status !== 'Delivered' && g.status !== 'Cancelled').length },
        damageSummary: { total: damage.length, bySeverity: { Minor: damage.filter(d => d.severity === 'Minor').length, Moderate: damage.filter(d => d.severity === 'Moderate').length, Severe: damage.filter(d => d.severity === 'Severe').length, Critical: damage.filter(d => d.severity === 'Critical').length }, approved: damage.filter(d => d.status === 'Approved' || d.status === 'Compensated').length },
        warehouseUtilization: mockWarehouses.map(w => ({ name: w.name, capacity: w.capacity, currentStock: w.currentStock, utilization: Math.round((w.currentStock / w.capacity) * 100) })),
        monthlyTrend: Array.from({ length: 6 }, (_, i) => ({ month: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'][i], inbound: Math.floor(Math.random() * 1000) + 500, outbound: Math.floor(Math.random() * 800) + 400, damage: Math.floor(Math.random() * 20) + 5 })),
      };
    }
    const p = new URLSearchParams(); if (companyId) p.set('companyId', companyId);
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/reports?${p}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return r.json();
  },

  // ---- Activity ----
  async getActivities(params?: { entityType?: string; limit?: number }): Promise<WHActivityEvent[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(200);
      const allActivities = [
        ...mockGRNs.flatMap(g => g.timeline),
        ...mockGDNs.flatMap(g => g.timeline),
        ...mockDamageReports.flatMap(d => d.timeline),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      if (params?.entityType) return allActivities.filter(a => a.entityType === params.entityType).slice(0, params.limit || 20);
      return allActivities.slice(0, params?.limit || 20);
    }
    const sp = new URLSearchParams(params as any);
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/activities?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return r.json();
  },

  // ---- Shipments (warehouse-scoped) ----
  async listWarehouseShipments(params?: { status?: string; search?: string }): Promise<any[]> {
    if (APP_CONFIG.USE_MOCK) {
      await delay(250);
      let r = [...mockShipments];
      if (params?.status && params.status !== 'All') r = r.filter((s: any) => s.status === params.status);
      if (params?.search) {
        const q = params.search.toLowerCase();
        r = r.filter((s: any) => s.trackingNumber?.toLowerCase().includes(q) || s.customerName?.toLowerCase().includes(q));
      }
      return r.slice(0, 50);
    }
    const sp = new URLSearchParams(params as any);
    const r = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouse/shipments?${sp}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    return r.json();
  },
};

export const {
  getDashboardStats,
  listWarehouses, getWarehouseById,
  listGRNs, getGRNById, createGRN, updateGRN, deleteGRN,
  listGDNs, getGDNById, createGDN, updateGDN, deleteGDN,
  listLocations, updateLocation,
  listDamageReports, getDamageReportById, createDamageReport, updateDamageReport, deleteDamageReport,
  listStockMovements, recordStockMovement,
  listInventory, adjustInventory,
  listNotifications, markNotificationRead, markAllNotificationsRead, createNotification,
  getReportsData,
  getActivities,
  listWarehouseShipments,
} = warehouseService;

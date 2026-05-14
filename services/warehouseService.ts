import { APP_CONFIG } from "@/config/appConfig";
import { mockWarehouses } from "@/data/mockData";
import type { Warehouse, InventoryItem } from "@/types/warehouse";

export interface WarehouseFilters {
  city?: string;
  search?: string;
}

export const warehouseService = {
  async list(filters?: WarehouseFilters): Promise<Warehouse[]> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));

      let result = [...mockWarehouses];

      if (filters) {
        if (filters.city) {
          result = result.filter(w => w.city === filters.city);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          result = result.filter(w =>
            w.name.toLowerCase().includes(search) ||
            w.warehouseId.toLowerCase().includes(search) ||
            w.city.toLowerCase().includes(search)
          );
        }
      }

      return result;
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouses?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },

  async getById(id: string): Promise<Warehouse | null> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockWarehouses.find(w => w.id === id) || null;
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouses/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (!response.ok) return null;
    return response.json();
  },

  async create(data: Partial<Warehouse>): Promise<Warehouse> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const newWarehouse: Warehouse = {
        ...data,
        id: `wh-${String(mockWarehouses.length + 1).padStart(3, '0')}`,
        warehouseId: `WH-${String(mockWarehouses.length + 1).padStart(3, '0')}`,
        currentStock: 0,
        inventory: [],
        inboundLogs: [],
        outboundLogs: [],
      } as Warehouse;
      mockWarehouses.push(newWarehouse);
      return newWarehouse;
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  async update(id: string, updates: Partial<Warehouse>): Promise<Warehouse> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockWarehouses.findIndex(w => w.id === id);
      if (index !== -1) {
        mockWarehouses[index] = { ...mockWarehouses[index], ...updates };
        return mockWarehouses[index];
      }
      throw new Error('Warehouse not found');
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouses/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(updates),
    });

    return response.json();
  },

  async remove(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockWarehouses.findIndex(w => w.id === id);
      if (index !== -1) {
        mockWarehouses.splice(index, 1);
      }
      return;
    }

    await fetch(`${APP_CONFIG.API_BASE_URL}/warehouses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  async updateInventory(warehouseId: string, inventory: InventoryItem[]): Promise<Warehouse> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockWarehouses.findIndex(w => w.id === warehouseId);
      if (index !== -1) {
        mockWarehouses[index].inventory = inventory;
        mockWarehouses[index].currentStock = inventory.reduce((sum, item) => sum + item.quantity, 0);
        return mockWarehouses[index];
      }
      throw new Error('Warehouse not found');
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouses/${warehouseId}/inventory`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ inventory }),
    });

    return response.json();
  },

  async transferInventory(
    sourceWarehouseId: string,
    destinationWarehouseId: string,
    items: { sku: string; quantity: number }[]
  ): Promise<{ success: boolean }> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouses/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ sourceWarehouseId, destinationWarehouseId, items }),
    });

    return response.json();
  },

  async getLowStockItems(): Promise<{ warehouse: string; items: InventoryItem[] }[]> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockWarehouses.map(w => ({
        warehouse: w.name,
        items: w.inventory.filter(item => item.quantity < 50),
      })).filter(w => w.items.length > 0);
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouses/low-stock`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },
};

// Backward-compatible named exports
export const getWarehouses = (filters?: WarehouseFilters) => warehouseService.list(filters);
export const getWarehouseById = (id: string) => warehouseService.getById(id);
export const updateWarehouseInventory = (warehouseId: string, inventory: InventoryItem[]) =>
  warehouseService.updateInventory(warehouseId, inventory);
export const transferInventory = (
  sourceWarehouseId: string,
  destinationWarehouseId: string,
  items: { sku: string; quantity: number }[]
) => warehouseService.transferInventory(sourceWarehouseId, destinationWarehouseId, items);
export const getLowStockItems = () => warehouseService.getLowStockItems();
export type { Warehouse, InventoryItem };

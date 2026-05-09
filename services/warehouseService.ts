import { APP_CONFIG } from "@/config/appConfig";
import { mockWarehouses, type Warehouse, type InventoryItem } from "@/data/mockData";

export interface WarehouseFilters {
  city?: string;
  search?: string;
}

export const getWarehouses = async (filters?: WarehouseFilters): Promise<Warehouse[]> => {
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
};

export const getWarehouseById = async (id: string): Promise<Warehouse | null> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockWarehouses.find(w => w.id === id) || null;
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/warehouses/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  
  if (!response.ok) return null;
  return response.json();
};

export const updateWarehouseInventory = async (warehouseId: string, inventory: InventoryItem[]): Promise<Warehouse> => {
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
};

export const transferInventory = async (
  sourceWarehouseId: string,
  destinationWarehouseId: string,
  items: { sku: string; quantity: number }[]
): Promise<{ success: boolean }> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock transfer logic would go here
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
};

export const getLowStockItems = async (): Promise<{ warehouse: string; items: InventoryItem[] }[]> => {
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
};

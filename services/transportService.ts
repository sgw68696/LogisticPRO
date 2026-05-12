import { APP_CONFIG } from '@/config/appConfig';
import {
  mockTransportTypes,
  mockTransportCategories,
  mockTransportItems,
  type TransportType,
  type TransportCategory,
  type TransportItem,
} from '@/data/mockData';

// Transport Type Services
export const transportTypeService = {
  getTypesByCompany: async (companyId: string): Promise<TransportType[]> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockTransportTypes.filter(t => t.companyId === companyId);
    }

    const response = await fetch(
      `${APP_CONFIG.API_BASE_URL}/transport-types?companyId=${companyId}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
    return response.json();
  },

  createType: async (
    companyId: string,
    name: 'Land' | 'Air' | 'Water'
  ): Promise<{ success: boolean; typeId?: string; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const newType: TransportType = {
        id: `tt-${Date.now()}`,
        companyId,
        name,
        status: 'Active',
        createdAt: new Date().toISOString(),
      };

      (mockTransportTypes as any).push(newType);
      return { success: true, typeId: newType.id };
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/transport-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ companyId, name }),
    });

    return response.json();
  },

  deleteType: async (typeId: string): Promise<{ success: boolean; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const index = mockTransportTypes.findIndex(t => t.id === typeId);
      if (index > -1) {
        mockTransportTypes.splice(index, 1);
        return { success: true };
      }
      return { success: false, error: 'Transport type not found' };
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/transport-types/${typeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },
};

// Transport Category Services
export const transportCategoryService = {
  getCategoriesByCompany: async (
    companyId: string,
    transportTypeId?: string
  ): Promise<TransportCategory[]> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));

      let filtered = mockTransportCategories.filter(c => c.companyId === companyId);
      if (transportTypeId) {
        filtered = filtered.filter(c => c.transportTypeId === transportTypeId);
      }
      return filtered;
    }

    const params = new URLSearchParams({ companyId });
    if (transportTypeId) params.append('transportTypeId', transportTypeId);

    const response = await fetch(
      `${APP_CONFIG.API_BASE_URL}/transport-categories?${params}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
    return response.json();
  },

  createCategory: async (
    companyId: string,
    data: {
      transportTypeId: string;
      name: string;
      description: string;
      specifications: Record<string, string | number | boolean>;
      capacity: number;
      capacityUnit: string;
      maxSpeed?: number | null;
      fuelType?: string | null;
    }
  ): Promise<{ success: boolean; categoryId?: string; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const newCategory: TransportCategory = {
        id: `tc-${Date.now()}`,
        companyId,
        transportTypeId: data.transportTypeId,
        name: data.name,
        description: data.description,
        specifications: data.specifications,
        capacity: data.capacity,
        capacityUnit: data.capacityUnit as any,
        maxSpeed: data.maxSpeed || null,
        fuelType: data.fuelType || null,
        createdAt: new Date().toISOString(),
      };

      (mockTransportCategories as any).push(newCategory);
      return { success: true, categoryId: newCategory.id };
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/transport-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ companyId, ...data }),
    });

    return response.json();
  },

  updateCategory: async (
    categoryId: string,
    data: Partial<TransportCategory>
  ): Promise<{ success: boolean; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const category = mockTransportCategories.find(c => c.id === categoryId);
      if (category) {
        Object.assign(category, data);
        return { success: true };
      }
      return { success: false, error: 'Category not found' };
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/transport-categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  deleteCategory: async (categoryId: string): Promise<{ success: boolean; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const index = mockTransportCategories.findIndex(c => c.id === categoryId);
      if (index > -1) {
        mockTransportCategories.splice(index, 1);
        return { success: true };
      }
      return { success: false, error: 'Category not found' };
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/transport-categories/${categoryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },
};

// Transport Item Services
export const transportItemService = {
  getItemsByCategory: async (
    companyId: string,
    categoryId?: string
  ): Promise<TransportItem[]> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));

      let filtered = mockTransportItems.filter(i => i.companyId === companyId);
      if (categoryId) {
        filtered = filtered.filter(i => i.categoryId === categoryId);
      }
      return filtered;
    }

    const params = new URLSearchParams({ companyId });
    if (categoryId) params.append('categoryId', categoryId);

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/transport-items?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return response.json();
  },

  createItem: async (
    companyId: string,
    data: {
      categoryId: string;
      name: string;
      description: string;
      quantity: number;
      unit: string;
      specification: Record<string, string | number>;
      price: number;
    }
  ): Promise<{ success: boolean; itemId?: string; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const newItem: TransportItem = {
        id: `ti-${Date.now()}`,
        companyId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        quantity: data.quantity,
        unit: data.unit,
        specification: data.specification,
        price: data.price,
        createdAt: new Date().toISOString(),
      };

      (mockTransportItems as any).push(newItem);
      return { success: true, itemId: newItem.id };
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/transport-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ companyId, ...data }),
    });

    return response.json();
  },

  updateItem: async (
    itemId: string,
    data: Partial<TransportItem>
  ): Promise<{ success: boolean; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const item = mockTransportItems.find(i => i.id === itemId);
      if (item) {
        Object.assign(item, data);
        return { success: true };
      }
      return { success: false, error: 'Item not found' };
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/transport-items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  deleteItem: async (itemId: string): Promise<{ success: boolean; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const index = mockTransportItems.findIndex(i => i.id === itemId);
      if (index > -1) {
        mockTransportItems.splice(index, 1);
        return { success: true };
      }
      return { success: false, error: 'Item not found' };
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/transport-items/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },

  // Update item quantity
  updateQuantity: async (itemId: string, quantity: number): Promise<{ success: boolean; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const item = mockTransportItems.find(i => i.id === itemId);
      if (item) {
        item.quantity = quantity;
        return { success: true };
      }
      return { success: false, error: 'Item not found' };
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/transport-items/${itemId}/quantity`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ quantity }),
    });

    return response.json();
  },
};

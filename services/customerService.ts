import { APP_CONFIG } from "@/config/appConfig";
import { mockCustomers } from "@/data/mockData";
import type { Customer } from "@/types/customer";

export interface CustomerFilters {
  type?: 'Individual' | 'Business';
  city?: string;
  search?: string;
}

export const customerService = {
  async list(filters?: CustomerFilters): Promise<Customer[]> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));

      let result = [...mockCustomers];

      if (filters) {
        if (filters.type) {
          result = result.filter(c => c.type === filters.type);
        }
        if (filters.city) {
          result = result.filter(c => c.city === filters.city);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          result = result.filter(c =>
            c.name.toLowerCase().includes(search) ||
            c.customerId.toLowerCase().includes(search) ||
            c.email.toLowerCase().includes(search)
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

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/customers?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },

  async getById(id: string): Promise<Customer | null> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockCustomers.find(c => c.id === id) || null;
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/customers/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (!response.ok) return null;
    return response.json();
  },

  async create(data: Partial<Customer>): Promise<Customer> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const newCustomer: Customer = {
        ...data,
        id: `cust-${String(mockCustomers.length + 1).padStart(3, '0')}`,
        customerId: `CUST-${String(1000 + mockCustomers.length + 1).padStart(5, '0')}`,
        totalShipments: 0,
        outstandingBalance: 0,
        createdAt: new Date().toISOString(),
      } as Customer;
      mockCustomers.push(newCustomer);
      return newCustomer;
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockCustomers.findIndex(c => c.id === id);
      if (index !== -1) {
        mockCustomers[index] = { ...mockCustomers[index], ...updates };
        return mockCustomers[index];
      }
      throw new Error('Customer not found');
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/customers/${id}`, {
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
      const index = mockCustomers.findIndex(c => c.id === id);
      if (index !== -1) {
        mockCustomers.splice(index, 1);
      }
      return;
    }

    await fetch(`${APP_CONFIG.API_BASE_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },
};

// Backward-compatible named exports
export const getCustomers = (filters?: CustomerFilters) => customerService.list(filters);
export const getCustomerById = (id: string) => customerService.getById(id);
export const createCustomer = (data: Partial<Customer>) => customerService.create(data);
export const updateCustomer = (id: string, updates: Partial<Customer>) => customerService.update(id, updates);
export const deleteCustomer = (id: string) => customerService.remove(id);
export type { Customer };

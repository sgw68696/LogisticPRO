import { APP_CONFIG } from "@/config/appConfig";
import { mockCustomers } from "@/data/mockData";
import { mockDb } from "@/data/mock-db";
import type { Customer } from "@/types/customer";
import type { PaginatedResponse } from "@/data/mock-db";

export interface CustomerFilters {
  companyId?: string;
  type?: 'Individual' | 'Business';
  city?: string;
  search?: string;
  sortBy?: 'name' | 'customerId' | 'city' | 'totalShipments' | 'createdAt';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

function applyCustomerFilters(customers: Customer[], filters?: CustomerFilters): Customer[] {
  let result = [...customers];

  if (filters?.companyId && filters.companyId !== 'all') {
    result = result.filter((c: any) => c.companyId === filters!.companyId);
  }

  if (filters?.type) {
    result = result.filter(c => c.type === filters!.type);
  }

  if (filters?.city) {
    result = result.filter(c => c.city === filters!.city);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.customerId.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  }

  if (filters?.sortBy) {
    const dir = filters.sortDir === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      const aVal = (a as any)[filters!.sortBy!];
      const bVal = (b as any)[filters!.sortBy!];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * dir;
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * dir;
      }
      return 0;
    });
  } else {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return result;
}

export const customerService = {
  async list(filters?: CustomerFilters): Promise<Customer[]> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return applyCustomerFilters(mockCustomers, filters);
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/customers?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },

  async listPaginated(filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;

    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const filtered = applyCustomerFilters(mockCustomers, filters);
      return mockDb.paginate(filtered, page, pageSize);
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });
    }
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));

    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/customers?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  },

  async getStats(companyId?: string): Promise<{
    total: number;
    individuals: number;
    businesses: number;
    active: number;
    withOutstanding: number;
    totalOutstanding: number;
    topCities: { city: string; count: number }[];
  }> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      let customers = [...mockCustomers];
      if (companyId && companyId !== 'all') {
        customers = customers.filter((c: any) => c.companyId === companyId);
      }

      const cityCounts: Record<string, number> = {};
      customers.forEach(c => {
        cityCounts[c.city] = (cityCounts[c.city] || 0) + 1;
      });

      const topCities = Object.entries(cityCounts)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        total: customers.length,
        individuals: customers.filter(c => c.type === 'Individual').length,
        businesses: customers.filter(c => c.type === 'Business').length,
        active: customers.filter(c => c.totalShipments > 0).length,
        withOutstanding: customers.filter(c => (c.outstandingBalance ?? 0) > 0).length,
        totalOutstanding: customers.reduce((sum, c) => sum + (c.outstandingBalance ?? 0), 0),
        topCities,
      };
    }

    const params = new URLSearchParams();
    if (companyId) params.set('companyId', companyId);

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/customers/stats?${params}`, {
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

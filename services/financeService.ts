import { APP_CONFIG } from "@/config/appConfig";
import { mockInvoices, mockAnalytics } from "@/data/mockData";
import type { Invoice, InvoiceStatus } from "@/types/invoice";

export interface InvoiceFilters {
  status?: InvoiceStatus;
  customerId?: string;
  search?: string;
}

export const financeService = {
  async list(filters?: InvoiceFilters): Promise<Invoice[]> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));

      let result = [...mockInvoices];

      if (filters) {
        if (filters.status) {
          result = result.filter(i => i.status === filters.status);
        }
        if (filters.customerId) {
          result = result.filter(i => i.customerId === filters.customerId);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          result = result.filter(i =>
            i.invoiceId.toLowerCase().includes(search) ||
            i.customerName.toLowerCase().includes(search)
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

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/invoices?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },

  async getById(id: string): Promise<Invoice | null> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockInvoices.find(i => i.id === id) || null;
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/invoices/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (!response.ok) return null;
    return response.json();
  },

  async create(data: Partial<Invoice>): Promise<Invoice> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const newInvoice: Invoice = {
        ...data,
        id: `inv-${String(mockInvoices.length + 1).padStart(3, '0')}`,
        invoiceId: `INV-2025-${String(1000 + mockInvoices.length + 1).padStart(5, '0')}`,
        status: 'Unpaid',
        createdAt: new Date().toISOString(),
      } as Invoice;
      mockInvoices.push(newInvoice);
      return newInvoice;
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  async update(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockInvoices.findIndex(i => i.id === id);
      if (index !== -1) {
        mockInvoices[index] = { ...mockInvoices[index], ...updates };
        return mockInvoices[index];
      }
      throw new Error('Invoice not found');
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/invoices/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(updates),
    });

    return response.json();
  },

  async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockInvoices.findIndex(i => i.id === id);
      if (index !== -1) {
        mockInvoices[index].status = status;
        if (status === 'Paid') {
          mockInvoices[index].paidDate = new Date().toISOString();
        }
        return mockInvoices[index];
      }
      throw new Error('Invoice not found');
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/invoices/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ status }),
    });

    return response.json();
  },

  async remove(id: string): Promise<void> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockInvoices.findIndex(i => i.id === id);
      if (index !== -1) {
        mockInvoices.splice(index, 1);
      }
      return;
    }

    await fetch(`${APP_CONFIG.API_BASE_URL}/invoices/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  async getRevenueData(): Promise<typeof mockAnalytics.monthlyRevenue> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockAnalytics.monthlyRevenue;
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/finance/revenue`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },

  async getExpenseData(): Promise<{ fuel: number; maintenance: number; staff: number; other: number }> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        fuel: 250000,
        maintenance: 150000,
        staff: 450000,
        other: 80000,
      };
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/finance/expenses`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },
};

// Backward-compatible named exports
export const getInvoices = (filters?: InvoiceFilters) => financeService.list(filters);
export const getInvoiceById = (id: string) => financeService.getById(id);
export const createInvoice = (data: Partial<Invoice>) => financeService.create(data);
export const updateInvoiceStatus = (id: string, status: InvoiceStatus) => financeService.updateStatus(id, status);
export const getRevenueData = () => financeService.getRevenueData();
export const getExpenseData = () => financeService.getExpenseData();
export type { Invoice, InvoiceStatus };

import { APP_CONFIG } from "@/config/appConfig";
import { mockInvoices, mockAnalytics } from "@/data/mockData";
import { mockDb } from "@/data/mock-db";
import type { Invoice, InvoiceStatus } from "@/types/invoice";
import type { PaginatedResponse } from "@/data/mock-db";

export interface InvoiceFilters {
  companyId?: string;
  status?: InvoiceStatus;
  customerId?: string;
  search?: string;
  sortBy?: 'invoiceId' | 'customerName' | 'amount' | 'dueDate' | 'createdAt' | 'status';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

function applyInvoiceFilters(invoices: Invoice[], filters?: InvoiceFilters): Invoice[] {
  let result = [...invoices];

  if (filters?.companyId && filters.companyId !== 'all') {
    result = result.filter((i: any) => i.companyId === filters!.companyId);
  }

  if (filters?.status) {
    result = result.filter(i => i.status === filters!.status);
  }

  if (filters?.customerId) {
    result = result.filter(i => i.customerId === filters!.customerId);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(i =>
      i.invoiceId.toLowerCase().includes(q) ||
      i.customerName.toLowerCase().includes(q)
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

export const financeService = {
  async list(filters?: InvoiceFilters): Promise<Invoice[]> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return applyInvoiceFilters(mockInvoices, filters);
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/invoices?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },

  async listPaginated(filters?: InvoiceFilters): Promise<PaginatedResponse<Invoice>> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;

    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const filtered = applyInvoiceFilters(mockInvoices, filters);
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

    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/invoices?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
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

  async getStats(companyId?: string): Promise<{
    total: number;
    totalAmount: number;
    paid: number;
    paidAmount: number;
    unpaid: number;
    overdue: number;
    overdueAmount: number;
    cancelled: number;
  }> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      let invoices = [...mockInvoices];
      if (companyId && companyId !== 'all') {
        invoices = invoices.filter((i: any) => i.companyId === companyId);
      }

      const paidInvoices = invoices.filter(i => i.status === 'Paid');
      const unpaidInvoices = invoices.filter(i => i.status === 'Unpaid');
      const overdueInvoices = invoices.filter(i => i.status === 'Overdue');
      const cancelledInvoices = invoices.filter(i => i.status === 'Cancelled');

      return {
        total: invoices.length,
        totalAmount: invoices.reduce((sum, i) => sum + i.amount, 0),
        paid: paidInvoices.length,
        paidAmount: paidInvoices.reduce((sum, i) => sum + i.amount, 0),
        unpaid: unpaidInvoices.length,
        overdue: overdueInvoices.length,
        overdueAmount: overdueInvoices.reduce((sum, i) => sum + i.amount, 0),
        cancelled: cancelledInvoices.length,
      };
    }

    const params = new URLSearchParams();
    if (companyId) params.set('companyId', companyId);

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/finance/invoices/stats?${params}`, {
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

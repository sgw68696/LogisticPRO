import { APP_CONFIG } from "@/config/appConfig";
import { mockOrders } from "@/data/mockData";
import { mockDb } from "@/data/mock-db";
import type { Order, OrderStatus, PaymentStatus } from "@/types/order";
import type { PaginatedResponse } from "@/data/mock-db";

export interface OrderFilters {
  companyId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  search?: string;
  sortBy?: 'orderId' | 'customerName' | 'createdAt' | 'status';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

function applyOrderFilters(orders: Order[], filters?: OrderFilters): Order[] {
  let result = [...orders];

  if (filters?.companyId && filters.companyId !== 'all') {
    result = result.filter((o: any) => o.companyId === filters!.companyId);
  }

  if (filters?.status) {
    result = result.filter(o => o.status === filters!.status);
  }

  if (filters?.paymentStatus) {
    result = result.filter(o => o.paymentStatus === filters!.paymentStatus);
  }

  if (filters?.customerId) {
    result = result.filter(o => o.customerId === filters!.customerId);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(o =>
      o.orderId.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q)
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
      return 0;
    });
  } else {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return result;
}

export const orderService = {
  async list(filters?: OrderFilters): Promise<Order[]> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return applyOrderFilters(mockOrders, filters);
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/orders?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },

  async listPaginated(filters?: OrderFilters): Promise<PaginatedResponse<Order>> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;

    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const filtered = applyOrderFilters(mockOrders, filters);
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

    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/orders?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  },

  async getStats(companyId?: string): Promise<{
    total: number;
    draft: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    returned: number;
    pendingPayment: number;
    paid: number;
  }> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      let orders = [...mockOrders];
      if (companyId && companyId !== 'all') {
        orders = orders.filter((o: any) => o.companyId === companyId);
      }

      return {
        total: orders.length,
        draft: orders.filter(o => o.status === 'Draft').length,
        confirmed: orders.filter(o => o.status === 'Confirmed').length,
        processing: orders.filter(o => o.status === 'Processing').length,
        shipped: orders.filter(o => o.status === 'Shipped').length,
        delivered: orders.filter(o => o.status === 'Delivered').length,
        returned: orders.filter(o => o.status === 'Returned').length,
        pendingPayment: orders.filter(o => o.paymentStatus === 'Pending').length,
        paid: orders.filter(o => o.paymentStatus === 'Paid').length,
      };
    }

    const params = new URLSearchParams();
    if (companyId) params.set('companyId', companyId);

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/orders/stats?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },

  async getById(id: string): Promise<Order | null> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockOrders.find(o => o.id === id) || null;
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/orders/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (!response.ok) return null;
    return response.json();
  },

  async create(data: Partial<Order>): Promise<Order> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const newOrder: Order = {
        ...data,
        id: `ord-${String(mockOrders.length + 1).padStart(3, '0')}`,
        orderId: `ORD-2025-${String(1000 + mockOrders.length + 1).padStart(5, '0')}`,
        status: 'Draft',
        paymentStatus: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Order;
      mockOrders.push(newOrder);
      return newOrder;
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  async update(id: string, updates: Partial<Order>): Promise<Order> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockOrders.findIndex(o => o.id === id);
      if (index !== -1) {
        mockOrders[index] = { ...mockOrders[index], ...updates, updatedAt: new Date().toISOString() };
        return mockOrders[index];
      }
      throw new Error('Order not found');
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/orders/${id}`, {
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
      const index = mockOrders.findIndex(o => o.id === id);
      if (index !== -1) {
        mockOrders.splice(index, 1);
      }
      return;
    }

    await fetch(`${APP_CONFIG.API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },
};

// Backward-compatible named exports
export const getOrders = (filters?: OrderFilters) => orderService.list(filters);
export const getOrderById = (id: string) => orderService.getById(id);
export const createOrder = (data: Partial<Order>) => orderService.create(data);
export const updateOrder = (id: string, updates: Partial<Order>) => orderService.update(id, updates);
export const deleteOrder = (id: string) => orderService.remove(id);
export type { Order, OrderStatus, PaymentStatus };

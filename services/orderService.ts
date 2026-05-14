import { APP_CONFIG } from "@/config/appConfig";
import { mockOrders } from "@/data/mockData";
import type { Order, OrderStatus, PaymentStatus } from "@/types/order";

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  search?: string;
}

export const orderService = {
  async list(filters?: OrderFilters): Promise<Order[]> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));

      let result = [...mockOrders];

      if (filters) {
        if (filters.status) {
          result = result.filter(o => o.status === filters.status);
        }
        if (filters.paymentStatus) {
          result = result.filter(o => o.paymentStatus === filters.paymentStatus);
        }
        if (filters.customerId) {
          result = result.filter(o => o.customerId === filters.customerId);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          result = result.filter(o =>
            o.orderId.toLowerCase().includes(search) ||
            o.customerName.toLowerCase().includes(search)
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

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/orders?${params}`, {
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

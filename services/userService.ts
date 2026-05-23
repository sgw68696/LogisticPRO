import { APP_CONFIG } from "@/config/appConfig";
import { mockUsers, rolePermissions } from "@/data/mockData";
import { mockDb } from "@/data/mock-db";
import type { User, UserRole } from "@/types/user";
import type { PaginatedResponse } from "@/data/mock-db";

export interface UserFilters {
  companyId?: string;
  role?: UserRole;
  status?: 'Active' | 'Inactive';
  search?: string;
  sortBy?: 'name' | 'role' | 'status' | 'createdAt';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

function applyUserFilters(users: User[], filters?: UserFilters): User[] {
  let result = [...users].map(u => ({ ...u, password: '' }));

  if (filters?.companyId && filters.companyId !== 'all') {
    result = result.filter((u: any) => u.companyId === filters!.companyId);
  }

  if (filters?.role) {
    result = result.filter(u => u.role === filters!.role);
  }

  if (filters?.status) {
    result = result.filter(u => u.status === filters!.status);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }

  if (filters?.sortBy) {
    const dir = filters.sortDir === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      const aVal = (a as any)[filters!.sortBy!];
      const bVal = (b as any)[filters!.sortBy!];
      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal) * dir;
      }
      return 0;
    });
  } else {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return result;
}

export const userService = {
  async list(filters?: UserFilters): Promise<User[]> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return applyUserFilters(mockUsers, filters);
    }

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/users?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },

  async listPaginated(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;

    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const filtered = applyUserFilters(mockUsers, filters);
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

    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/users?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.json();
  },

  async getStats(companyId?: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: { role: string; count: number }[];
    recentlyAdded: number;
  }> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      let users = [...mockUsers];
      if (companyId && companyId !== 'all') {
        users = users.filter((u: any) => u.companyId === companyId);
      }

      const roleCounts: Record<string, number> = {};
      users.forEach(u => {
        roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
      });

      const byRole = Object.entries(roleCounts)
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      return {
        total: users.length,
        active: users.filter(u => u.status === 'Active').length,
        inactive: users.filter(u => u.status === 'Inactive').length,
        byRole,
        recentlyAdded: users.filter(u => new Date(u.createdAt) > oneWeekAgo).length,
      };
    }

    const params = new URLSearchParams();
    if (companyId) params.set('companyId', companyId);

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/users/stats?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },

  async getById(id: string): Promise<User | null> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const user = mockUsers.find(u => u.id === id);
      return user ? { ...user, password: '' } : null;
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (!response.ok) return null;
    return response.json();
  },

  async create(data: Partial<User>): Promise<User> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const newUser: User = {
        ...data,
        id: `usr-${String(mockUsers.length + 1).padStart(3, '0')}`,
        status: 'Active',
        lastLogin: '',
        createdAt: new Date().toISOString(),
        avatar: data.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
      } as User;
      mockUsers.push(newUser);
      return { ...newUser, password: '' };
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockUsers.findIndex(u => u.id === id);
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...updates };
        return { ...mockUsers[index], password: '' };
      }
      throw new Error('User not found');
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/users/${id}`, {
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
      const index = mockUsers.findIndex(u => u.id === id);
      if (index !== -1) {
        mockUsers.splice(index, 1);
      }
      return;
    }

    await fetch(`${APP_CONFIG.API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  },

  async getRolePermissions(role: UserRole) {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return rolePermissions[role];
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/roles/${role}/permissions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },

  async updateRolePermissions(
    role: UserRole,
    permissions: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>
  ): Promise<void> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      (rolePermissions as Record<UserRole, Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>>)[role] = permissions;
      return;
    }

    await fetch(`${APP_CONFIG.API_BASE_URL}/roles/${role}/permissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ permissions }),
    });
  },

  async getActivityLog(): Promise<{ user: string; action: string; timestamp: string; details: string }[]> {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        { user: 'Rajesh Kumar', action: 'Login', timestamp: '2025-01-15T09:30:00Z', details: 'Logged in from 192.168.1.100' },
        { user: 'Priya Sharma', action: 'Shipment Created', timestamp: '2025-01-15T09:15:00Z', details: 'Created shipment LOG-2025-10056' },
        { user: 'Amit Patel', action: 'Driver Assigned', timestamp: '2025-01-15T08:45:00Z', details: 'Assigned driver DRV-005 to shipment LOG-2025-10045' },
        { user: 'Ananya Gupta', action: 'Invoice Generated', timestamp: '2025-01-15T08:30:00Z', details: 'Generated invoice INV-2025-01046 for Tech Solutions Pvt Ltd' },
        { user: 'Vikram Singh', action: 'Customer Updated', timestamp: '2025-01-15T08:00:00Z', details: 'Updated contact details for customer CUST-01015' },
      ];
    }

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/activity-log`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    return response.json();
  },
};

// Backward-compatible named exports
export const getUsers = (filters?: UserFilters) => userService.list(filters);
export const getUserById = (id: string) => userService.getById(id);
export const createUser = (data: Partial<User>) => userService.create(data);
export const updateUser = (id: string, updates: Partial<User>) => userService.update(id, updates);
export const deleteUser = (id: string) => userService.remove(id);
export const getRolePermissions = (role: UserRole) => userService.getRolePermissions(role);
export const updateRolePermissions = (
  role: UserRole,
  permissions: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>
) => userService.updateRolePermissions(role, permissions);
export const getActivityLog = () => userService.getActivityLog();
export type { User, UserRole };

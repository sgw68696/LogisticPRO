import { APP_CONFIG } from "@/config/appConfig";
import { mockUsers, rolePermissions, type User, type UserRole } from "@/data/mockData";

export interface UserFilters {
  role?: UserRole;
  status?: 'Active' | 'Inactive';
  search?: string;
}

export const getUsers = async (filters?: UserFilters): Promise<User[]> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let result = mockUsers.map(u => ({ ...u, password: '' }));
    
    if (filters) {
      if (filters.role) {
        result = result.filter(u => u.role === filters.role);
      }
      if (filters.status) {
        result = result.filter(u => u.status === filters.status);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        result = result.filter(u => 
          u.name.toLowerCase().includes(search) ||
          u.username.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
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
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/users?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  
  return response.json();
};

export const getUserById = async (id: string): Promise<User | null> => {
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
};

export const createUser = async (user: Partial<User>): Promise<User> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newUser: User = {
      ...user,
      id: `usr-${String(mockUsers.length + 1).padStart(3, '0')}`,
      status: 'Active',
      lastLogin: '',
      createdAt: new Date().toISOString(),
      avatar: user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
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
    body: JSON.stringify(user),
  });
  
  return response.json();
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<User> => {
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
};

export const deleteUser = async (id: string): Promise<void> => {
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
};

export const getRolePermissions = async (role: UserRole) => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return rolePermissions[role];
  }
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/roles/${role}/permissions`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  
  return response.json();
};

export const updateRolePermissions = async (
  role: UserRole,
  permissions: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>
): Promise<void> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    (rolePermissions as Record<UserRole, typeof permissions>)[role] = permissions;
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
};

export const getActivityLog = async (): Promise<{ user: string; action: string; timestamp: string; details: string }[]> => {
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
};

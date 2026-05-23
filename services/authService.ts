import { APP_CONFIG } from "@/config/appConfig";
import { ROLE_DASHBOARD_MAP, mockUsers, type User, type UserRole } from "@/data/mockData";

export { ROLE_DASHBOARD_MAP };

interface NavigationRouter {
  push: (href: string) => void;
}

interface StoredLoggedInUser {
  role?: User['role'];
  dashboardRoute?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

const ROLE_SLUG_MAP: Record<string, UserRole> = {
  superadmin: 'SuperAdmin',
  organizationadmin: 'OrganizationAdmin',
  companyadmin: 'CompanyAdmin',
  manager: 'Manager',
  dispatcher: 'Dispatcher',
  operator: 'Operator',
  agent: 'Agent',
  staff: 'Staff',
  customsagent: 'CustomsAgent',
  portagent: 'PortAgent',
  customerportal: 'CustomerPortal',
  auditorreadonly: 'AuditorReadOnly',
};

const mapRoleSlug = (slug: string): UserRole => {
  return ROLE_SLUG_MAP[slug.toLowerCase()] || 'Staff';
};

const mapBackendUser = (backendUser: any): User => {
  const role = mapRoleSlug(backendUser.role || backendUser.role_slug || 'staff');
  const name = backendUser.firstName
    ? `${backendUser.firstName} ${backendUser.lastName || ''}`.trim()
    : backendUser.name || backendUser.email || 'User';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return {
    id: backendUser.uuid || backendUser.id,
    name,
    username: backendUser.username || backendUser.email,
    password: '',
    email: backendUser.email,
    phone: backendUser.phone || '',
    role,
    agentType: (backendUser.agentType as any) || undefined,
    status: backendUser.status === 'active' ? 'Active' : 'Inactive',
    companyId: backendUser.companyId || backendUser.company_id || null,
    organizationId: backendUser.organizationId || null,
    agentId: backendUser.agentId || null,
    avatar: backendUser.avatar || initials,
    dashboardRoute: ROLE_DASHBOARD_MAP[role] || '/login',
    menuAccess: [],
    assignedMenus: backendUser.assignedMenus || undefined,
    assignedModules: backendUser.assignedModules || undefined,
    lastLogin: backendUser.lastLoginAt || backendUser.last_login_at || new Date().toISOString(),
    createdAt: backendUser.createdAt || backendUser.created_at || new Date().toISOString(),
  };
};

export const login = async (credentials: LoginCredentials, router?: NavigationRouter): Promise<AuthResponse> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockUsers.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (user) {
      const token = `mock-jwt-token-${user.id}-${Date.now()}`;
      const storedUser = {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        agentType: user.agentType ?? null,
        avatar: user.avatar,
        companyId: user.companyId,
        organizationId: user.organizationId,
        dashboardRoute: user.dashboardRoute,
      };

      localStorage.setItem('loggedInUser', JSON.stringify(storedUser));
      router?.push(user.dashboardRoute);

      return {
        success: true,
        user: { ...user, password: '' },
        token,
      };
    }

    return {
      success: false,
      error: 'Invalid username or password',
    };
  }

  try {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: credentials.username, password: credentials.password }),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      return {
        success: false,
        error: json.message || json.errors?.[0] || 'Login failed',
      };
    }

    const backendUser = json.data?.user;
    if (!backendUser) {
      return { success: false, error: 'Invalid response from server' };
    }

    const user = mapBackendUser(backendUser);
    const token = json.data.accessToken;

    router?.push(user.dashboardRoute);

    return { success: true, user, token };
  } catch (error) {
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
};

export const logout = async (): Promise<void> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return;
  }

  try {
    await fetch(`${APP_CONFIG.API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  } catch {
    // Silently fail — we clear local state anyway
  }
};

export const getCompanyRouteRedirect = (): string | null => {
  const storedUser = localStorage.getItem('loggedInUser') ?? localStorage.getItem('user');
  if (!storedUser) return '/login';

  try {
    const parsedUser = JSON.parse(storedUser) as StoredLoggedInUser;
    if (parsedUser.role === 'CompanyAdmin') return null;
    return parsedUser.dashboardRoute ?? '/login';
  } catch {
    return '/login';
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (APP_CONFIG.USE_MOCK) {
    const storedUser = localStorage.getItem('user') ?? localStorage.getItem('loggedInUser');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }

  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await response.json();

    if (!response.ok || !json.success) return null;

    return mapBackendUser(json.data);
  } catch {
    return null;
  }
};

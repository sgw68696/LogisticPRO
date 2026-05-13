import { APP_CONFIG } from "@/config/appConfig";
import { ROLE_DASHBOARD_MAP, mockUsers, type User } from "@/data/mockData";

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

export const login = async (credentials: LoginCredentials, router?: NavigationRouter): Promise<AuthResponse> => {
  if (APP_CONFIG.USE_MOCK) {
    // Simulate network delay
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
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  
  return response.json();
};

export const logout = async (): Promise<void> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return;
  }
  
  await fetch(`${APP_CONFIG.API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
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
  
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) return null;
  return response.json();
};

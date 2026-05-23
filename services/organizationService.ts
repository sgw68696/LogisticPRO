import { APP_CONFIG } from '@/config/appConfig';
import { mockOrganizations, type Organization, type CompanyStatus } from '@/data/mockData';
import { apiClient, type ApiResponse } from '@/lib/apiClient';

export interface BackendOrganization {
  id: number;
  uuid: string;
  name: string;
  registration_number: string | null;
  tax_id: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  subscription_status: string;
  max_companies: number;
  max_users_per_company: number;
  status: string;
  is_verified: boolean;
  verified_by: number | null;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  total_companies?: number;
  total_users?: number;
  created_by_name?: string;
  created_by_lastname?: string;
}

export interface CreateOrganizationRequest {
  name: string;
  email: string;
  phone?: string;
  registration_number?: string;
  tax_id?: string;
  website?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  subscription_status?: 'trial' | 'active' | 'suspended' | 'cancelled';
  max_companies?: number;
  max_users_per_company?: number;
  status?: 'pending' | 'active' | 'suspended' | 'inactive';
  // User creation fields
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
  user_username?: string;
  user_password?: string;
  user_phone?: string;
  user_role_slug?: string;
  user_department?: string;
}

export interface UpdateOrganizationRequest extends Partial<CreateOrganizationRequest> {}

export interface OrganizationListResponse {
  organizations: Organization[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function mapBackendToMock(org: BackendOrganization): Organization {
  return {
    id: org.uuid,
    companyId: 'cmp-001',
    name: org.name,
    type: 'Regional',
    status: (org.status === 'active' ? 'Active' : org.status === 'pending' ? 'Pending' : org.status === 'suspended' ? 'Suspended' : 'Inactive') as CompanyStatus,
    parentOrganizationId: null,
    address: [org.address_line1, org.address_line2].filter(Boolean).join(', ') || 'N/A',
    city: org.city || 'N/A',
    state: org.state || 'N/A',
    pincode: org.postal_code || 'N/A',
    managerId: String(org.created_by || ''),
    agentCount: org.total_users || 0,
    createdAt: org.created_at,
    updatedAt: org.updated_at,
  };
}

export interface SimpleOrganization {
  id: number;
  uuid: string;
  name: string;
  status: string;
}

export const organizationService = {
  listAll: async (): Promise<SimpleOrganization[]> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return [
        { id: 1, uuid: 'org-001', name: 'Global Logistics Inc.', status: 'active' },
        { id: 2, uuid: 'org-002', name: 'Sunrise Logistics', status: 'active' },
        { id: 9, uuid: 'org-009', name: 'test2', status: 'pending' },
      ];
    }

    const response = await apiClient.get<SimpleOrganization[]>('/organizations/list');
    if (!response.success) return [];
    return response.data || [];
  },
  getOrganizations: async (
    page: number = 1,
    limit: number = 10,
    filters?: { search?: string; status?: string }
  ): Promise<OrganizationListResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      let filtered = [...mockOrganizations];
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(o => o.name.toLowerCase().includes(q) || o.city.toLowerCase().includes(q));
      }
      if (filters?.status) {
        filtered = filtered.filter(o => o.status === filters.status);
      }
      const start = (page - 1) * limit;
      return {
        organizations: filtered.slice(start, start + limit),
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      };
    }

    const response = await apiClient.get<{ organizations: BackendOrganization[] }>('/organizations', {
      page,
      limit,
      search: filters?.search,
      status: filters?.status,
    });

    if (!response.success) {
      return { organizations: [], total: 0, page, limit, totalPages: 0 };
    }

    const backendOrgs = response.data.organizations || [];
    return {
      organizations: backendOrgs.map(mapBackendToMock),
      total: response.meta?.total || 0,
      page: response.meta?.page || page,
      limit: response.meta?.limit || limit,
      totalPages: response.meta?.totalPages || 1,
    };
  },

  getOrganizationById: async (id: string): Promise<Organization | null> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockOrganizations.find(o => o.id === id) || null;
    }

    const response = await apiClient.get<BackendOrganization>(`/organizations/${id}`);
    if (!response.success) return null;
    return mapBackendToMock(response.data);
  },

  createOrganization: async (data: CreateOrganizationRequest): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newOrg: Organization = {
        id: `org-${Date.now()}`,
        companyId: 'cmp-001',
        name: data.name,
        type: 'Regional',
        status: 'Active',
        parentOrganizationId: null,
        address: data.address_line1 || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.postal_code || '',
        managerId: '',
        agentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (mockOrganizations as any).push(newOrg);
      return { success: true, message: 'Organization created', data: newOrg };
    }

    return apiClient.post('/organizations', data);
  },

  updateOrganization: async (id: string, data: UpdateOrganizationRequest): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const org = mockOrganizations.find(o => o.id === id);
      if (org) {
        Object.assign(org, data, { updatedAt: new Date().toISOString() });
        return { success: true, message: 'Organization updated', data: org };
      }
      return { success: false, message: 'Organization not found' };
    }

    return apiClient.put(`/organizations/${id}`, data);
  },

  deleteOrganization: async (id: string): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockOrganizations.findIndex(o => o.id === id);
      if (index > -1) {
        mockOrganizations.splice(index, 1);
        return { success: true, message: 'Organization deleted' };
      }
      return { success: false, message: 'Organization not found' };
    }

    return apiClient.delete(`/organizations/${id}`);
  },

  activateOrganization: async (id: string): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const org = mockOrganizations.find(o => o.id === id);
      if (org) { org.status = 'Active'; org.updatedAt = new Date().toISOString(); }
      return { success: true, message: 'Organization activated', data: org };
    }

    return apiClient.patch(`/organizations/${id}/activate`);
  },

  deactivateOrganization: async (id: string): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const org = mockOrganizations.find(o => o.id === id);
      if (org) { org.status = 'Inactive'; org.updatedAt = new Date().toISOString(); }
      return { success: true, message: 'Organization deactivated', data: org };
    }

    return apiClient.patch(`/organizations/${id}/deactivate`);
  },

  getOrganizationCompanies: async (id: string, page = 1, limit = 10): Promise<any> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { companies: [], total: 0, page, limit, totalPages: 0 };
    }

    return apiClient.get(`/organizations/${id}/companies`, { page, limit });
  },

  getOrganizationUsers: async (id: string, page = 1, limit = 10): Promise<any> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { users: [], total: 0, page, limit, totalPages: 0 };
    }

    return apiClient.get(`/organizations/${id}/users`, { page, limit });
  },
};

import { APP_CONFIG } from '@/config/appConfig';
import { apiClient, type ApiResponse } from '@/lib/apiClient';

export interface BackendCompanyUser {
  id: number;
  uuid: string;
  company_id: number | null;
  organization_id: number | null;
  role_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  username: string;
  status: string;
  approval_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  approved_at: string | null;
  approved_by: number | null;
  rejected_at: string | null;
  rejected_by: number | null;
  suspended_at: string | null;
  suspended_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  role_name?: string;
  role_slug?: string;
  company_name?: string;
  company_uuid?: string;
  organization_name?: string;
  organization_uuid?: string;
}

export interface CompanyUserItem {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  username: string;
  status: string;
  approvalStatus: string;
  roleName: string;
  roleSlug: string;
  companyName: string;
  organizationName: string;
  createdAt: string;
}

export interface CreateCompanyUserRequest {
  company_id: number;
  organization_id: number;
  role_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  username: string;
  password: string;
  status?: 'active' | 'inactive';
}

export interface CompanyUserListResponse {
  companyUsers: CompanyUserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function mapBackendToCompanyUser(user: BackendCompanyUser): CompanyUserItem {
  return {
    id: user.id,
    uuid: user.uuid,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phone: user.phone,
    username: user.username,
    status: user.status,
    approvalStatus: user.approval_status,
    roleName: user.role_name || '',
    roleSlug: user.role_slug || '',
    companyName: user.company_name || '',
    organizationName: user.organization_name || '',
    createdAt: user.created_at,
  };
}

export const companyUserService = {
  getCompanyUsers: async (
    page: number = 1,
    limit: number = 10,
    filters?: { company_id?: number; organization_id?: number; approval_status?: string; search?: string }
  ): Promise<CompanyUserListResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const mockUsers: CompanyUserItem[] = [
        {
          id: 1, uuid: 'cu-001', firstName: 'John', lastName: 'Doe', email: 'john@company.com',
          phone: '+91 9876543210', username: 'johndoe', status: 'active', approvalStatus: 'approved',
          roleName: 'Company Admin', roleSlug: 'companyadmin', companyName: 'TechLogistics',
          organizationName: 'Bangalore Office', createdAt: '2025-01-10T00:00:00Z',
        },
        {
          id: 2, uuid: 'cu-002', firstName: 'Jane', lastName: 'Smith', email: 'jane@company.com',
          phone: '+91 9876543211', username: 'janesmith', status: 'active', approvalStatus: 'pending',
          roleName: 'Manager', roleSlug: 'manager', companyName: 'TechLogistics',
          organizationName: 'Mumbai Office', createdAt: '2025-01-12T00:00:00Z',
        },
      ];
      return { companyUsers: mockUsers, total: mockUsers.length, page, limit, totalPages: 1 };
    }

    const response = await apiClient.get<{ companyUsers: BackendCompanyUser[] }>('/company-users', {
      page,
      limit,
      ...filters,
    });

    if (!response.success) {
      return { companyUsers: [], total: 0, page, limit, totalPages: 0 };
    }

    const backendUsers = response.data.companyUsers || [];
    return {
      companyUsers: backendUsers.map(mapBackendToCompanyUser),
      total: response.meta?.total || 0,
      page: response.meta?.page || page,
      limit: response.meta?.limit || limit,
      totalPages: response.meta?.totalPages || 1,
    };
  },

  createCompanyUser: async (data: CreateCompanyUserRequest): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, message: 'Company user created successfully' };
    }

    return apiClient.post('/company-users', data);
  },

  updateCompanyUser: async (id: number, data: Partial<CreateCompanyUserRequest>): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, message: 'Company user updated successfully' };
    }

    return apiClient.put(`/company-users/${id}`, data);
  },

  deleteCompanyUser: async (id: number): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, message: 'Company user deleted successfully' };
    }

    return apiClient.delete(`/company-users/${id}`);
  },

  approveCompanyUser: async (id: number): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, message: 'Company user approved successfully' };
    }

    return apiClient.patch(`/company-users/${id}/approve`);
  },

  rejectCompanyUser: async (id: number): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, message: 'Company user rejected successfully' };
    }

    return apiClient.patch(`/company-users/${id}/reject`);
  },

  suspendCompanyUser: async (id: number): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, message: 'Company user suspended successfully' };
    }

    return apiClient.patch(`/company-users/${id}/suspend`);
  },

  reactivateCompanyUser: async (id: number): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, message: 'Company user reactivated successfully' };
    }

    return apiClient.patch(`/company-users/${id}/reactivate`);
  },

  getPendingApprovals: async (): Promise<CompanyUserItem[]> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return [
        {
          id: 2, uuid: 'cu-002', firstName: 'Jane', lastName: 'Smith', email: 'jane@company.com',
          phone: '+91 9876543211', username: 'janesmith', status: 'active', approvalStatus: 'pending',
          roleName: 'Manager', roleSlug: 'manager', companyName: 'TechLogistics',
          organizationName: 'Mumbai Office', createdAt: '2025-01-12T00:00:00Z',
        },
      ];
    }

    const response = await apiClient.get<BackendCompanyUser[]>('/company-users/pending-approvals');
    if (!response.success) return [];
    return (response.data as BackendCompanyUser[]).map(mapBackendToCompanyUser);
  },
};

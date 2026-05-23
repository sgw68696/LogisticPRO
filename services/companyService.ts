import { APP_CONFIG } from '@/config/appConfig';
import { mockCompanies, type Company, type RegistrationStatus, type CompanyStatus } from '@/data/mockData';
import { apiClient, type ApiResponse } from '@/lib/apiClient';

export interface BackendCompany {
  id: number;
  uuid: string;
  organization_id: number;
  company_type_id: number;
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
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  status: string;
  is_verified: boolean;
  verified_at: string | null;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  company_type_name?: string;
  company_type_slug?: string;
  organization_name?: string;
  organization_uuid?: string;
  total_users?: number;
}

export interface CreateCompanyRequest {
  organization_id: number;
  company_type_id: number;
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
  status?: 'pending' | 'active' | 'suspended' | 'inactive';
  operational_type?: string;
  plan?: string;
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

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {}

export interface CompanyListResponse {
  companies: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function mapBackendToMock(company: BackendCompany): Company {
  return {
    id: company.uuid,
    name: company.name,
    registrationType: 'admin-created',
    registrationStatus: company.is_verified ? 'Approved' : 'Submitted',
    status: (company.status === 'active' ? 'Active' : company.status === 'pending' ? 'Pending' : company.status === 'suspended' ? 'Suspended' : 'Inactive') as CompanyStatus,
    email: company.email,
    phone: company.phone || '',
    registeredAddress: [company.address_line1, company.address_line2].filter(Boolean).join(', ') || '',
    city: company.city || '',
    state: company.state || '',
    pincode: company.postal_code || '',
    country: company.country || '',
    taxId: company.tax_id || '',
    businessType: (company.company_type_name || 'Logistics') as Company['businessType'],
    registrationDate: company.created_at,
    approvalDate: company.verified_at,
    approvedBy: company.is_verified ? 'admin' : null,
    logo: null,
    website: company.website,
    contactPerson: '',
    contactPhone: company.phone || '',
    maxOrganizations: 5,
    maxAgents: 50,
    currentOrganizations: 0,
    currentAgents: 0,
    billingCycle: 'Monthly',
    plan: company.subscription_status === 'active' ? 'Professional' : 'Starter',
    documents: [],
    createdAt: company.created_at,
    updatedAt: company.updated_at,
  };
}

export const companyService = {
  getCompanies: async (
    page: number = 1,
    limit: number = 10,
    filters?: { search?: string; status?: string; organization_id?: number; company_type_id?: number }
  ): Promise<CompanyListResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let filtered = [...mockCompanies];
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q));
      }
      if (filters?.status) {
        filtered = filtered.filter(c => c.status === filters.status);
      }
      const start = (page - 1) * limit;
      return {
        companies: filtered.slice(start, start + limit),
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      };
    }

    const response = await apiClient.get<{ companies: BackendCompany[] }>('/companies', {
      page,
      limit,
      search: filters?.search,
      status: filters?.status,
      organization_id: filters?.organization_id,
      company_type_id: filters?.company_type_id,
    });

    if (!response.success) {
      return { companies: [], total: 0, page, limit, totalPages: 0 };
    }

    const backendCompanies = response.data.companies || [];
    return {
      companies: backendCompanies.map(mapBackendToMock),
      total: response.meta?.total || 0,
      page: response.meta?.page || page,
      limit: response.meta?.limit || limit,
      totalPages: response.meta?.totalPages || 1,
    };
  },

  getCompanyById: async (id: string): Promise<Company | null> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockCompanies.find(c => c.id === id) || null;
    }

    const response = await apiClient.get<BackendCompany>(`/companies/${id}`);
    if (!response.success) return null;
    return mapBackendToMock(response.data);
  },

  createCompany: async (data: CreateCompanyRequest): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newCompany: Company = {
        id: `cmp-${Date.now()}`,
        name: data.name,
        registrationType: 'admin-created',
        registrationStatus: 'Submitted',
        status: 'Pending',
        email: data.email,
        phone: data.phone || '',
        registeredAddress: data.address_line1 || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.postal_code || '',
        country: data.country || '',
        taxId: data.tax_id || '',
        businessType: 'Logistics',
        registrationDate: new Date().toISOString(),
        approvalDate: null,
        approvedBy: null,
        logo: null,
        website: data.website || null,
        contactPerson: '',
        contactPhone: data.phone || '',
        maxOrganizations: 5,
        maxAgents: 50,
        currentOrganizations: 0,
        currentAgents: 0,
        billingCycle: 'Monthly',
        plan: 'Starter',
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (mockCompanies as any).push(newCompany);
      return { success: true, message: 'Company created', data: newCompany };
    }

    return apiClient.post('/companies', data);
  },

  updateCompany: async (id: string, data: UpdateCompanyRequest): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const company = mockCompanies.find(c => c.id === id);
      if (company) {
        Object.assign(company, data, { updatedAt: new Date().toISOString() });
        return { success: true, message: 'Company updated', data: company };
      }
      return { success: false, message: 'Company not found' };
    }

    return apiClient.put(`/companies/${id}`, data);
  },

  deleteCompany: async (id: string): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockCompanies.findIndex(c => c.id === id);
      if (index > -1) {
        mockCompanies.splice(index, 1);
        return { success: true, message: 'Company deleted' };
      }
      return { success: false, message: 'Company not found' };
    }

    return apiClient.delete(`/companies/${id}`);
  },

  activateCompany: async (id: string): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const company = mockCompanies.find(c => c.id === id);
      if (company) { company.status = 'Active'; company.updatedAt = new Date().toISOString(); }
      return { success: true, message: 'Company activated', data: company };
    }

    return apiClient.patch(`/companies/${id}/activate`);
  },

  deactivateCompany: async (id: string): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const company = mockCompanies.find(c => c.id === id);
      if (company) { company.status = 'Inactive'; company.updatedAt = new Date().toISOString(); }
      return { success: true, message: 'Company deactivated', data: company };
    }

    return apiClient.patch(`/companies/${id}/deactivate`);
  },

  verifyCompany: async (id: string): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const company = mockCompanies.find(c => c.id === id);
      if (company) {
        company.registrationStatus = 'Approved';
        company.status = 'Active';
        company.approvalDate = new Date().toISOString();
        company.updatedAt = new Date().toISOString();
      }
      return { success: true, message: 'Company verified', data: company };
    }

    return apiClient.patch(`/companies/${id}/verify`);
  },

  getCompanyUsers: async (companyId: string, page = 1, limit = 10): Promise<any> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { users: [], total: 0, page, limit, totalPages: 0 };
    }

    return apiClient.get(`/companies/${companyId}/users`, { page, limit });
  },
};

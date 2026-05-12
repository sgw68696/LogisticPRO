import { APP_CONFIG } from '@/config/appConfig';
import { mockCompanies, type Company, type RegistrationStatus, type CompanyStatus } from '@/data/mockData';

export interface CreateCompanyRequest {
  name: string;
  email: string;
  phone: string;
  registeredAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  taxId: string;
  businessType: 'Freight' | 'Express' | 'Courier' | 'Logistics' | 'Mixed';
  contactPerson: string;
  contactPhone: string;
  website?: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  billingCycle: 'Monthly' | 'Quarterly' | 'Yearly';
}

export interface CompanyListResponse {
  companies: Company[];
  total: number;
  page: number;
  pageSize: number;
}

export const companyService = {
  // Get all companies (SuperAdmin only)
  getCompanies: async (
    page: number = 1,
    pageSize: number = 10,
    filters?: { status?: CompanyStatus; registrationStatus?: RegistrationStatus }
  ): Promise<CompanyListResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filtered = [...mockCompanies];
      
      if (filters?.status) {
        filtered = filtered.filter(c => c.status === filters.status);
      }
      if (filters?.registrationStatus) {
        filtered = filtered.filter(c => c.registrationStatus === filters.registrationStatus);
      }
      
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      
      return {
        companies: filtered.slice(start, end),
        total: filtered.length,
        page,
        pageSize,
      };
    }
    
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.registrationStatus && { registrationStatus: filters.registrationStatus }),
    });
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/companies?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    
    return response.json();
  },

  // Get company by ID
  getCompanyById: async (companyId: string): Promise<Company | null> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockCompanies.find(c => c.id === companyId) || null;
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/companies/${companyId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    
    if (!response.ok) return null;
    return response.json();
  },

  // Self-serve company registration
  registerCompany: async (data: CreateCompanyRequest): Promise<{ success: boolean; companyId?: string; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newCompany: Company = {
        id: `cmp-${Date.now()}`,
        name: data.name,
        registrationType: 'self-service',
        registrationStatus: 'Submitted',
        status: 'Pending',
        email: data.email,
        phone: data.phone,
        registeredAddress: data.registeredAddress,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
        taxId: data.taxId,
        businessType: data.businessType,
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        registrationDate: new Date().toISOString(),
        approvalDate: null,
        approvedBy: null,
        logo: null,
        website: data.website || null,
        maxOrganizations: data.plan === 'Starter' ? 2 : data.plan === 'Professional' ? 5 : 10,
        maxAgents: data.plan === 'Starter' ? 10 : data.plan === 'Professional' ? 50 : 200,
        currentOrganizations: 0,
        currentAgents: 0,
        billingCycle: data.billingCycle,
        plan: data.plan,
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      (mockCompanies as any).push(newCompany);
      return { success: true, companyId: newCompany.id };
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/companies/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  // Approve company registration (SuperAdmin only)
  approveCompany: async (companyId: string, approvedBy: string): Promise<{ success: boolean; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const company = mockCompanies.find(c => c.id === companyId);
      if (company) {
        company.registrationStatus = 'Approved';
        company.status = 'Active';
        company.approvalDate = new Date().toISOString();
        company.approvedBy = approvedBy;
        company.updatedAt = new Date().toISOString();
        return { success: true };
      }
      return { success: false, error: 'Company not found' };
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/companies/${companyId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ approvedBy }),
    });
    
    return response.json();
  },

  // Reject company registration (SuperAdmin only)
  rejectCompany: async (companyId: string, reason: string): Promise<{ success: boolean; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const company = mockCompanies.find(c => c.id === companyId);
      if (company) {
        company.registrationStatus = 'Rejected';
        company.status = 'Inactive';
        company.updatedAt = new Date().toISOString();
        return { success: true };
      }
      return { success: false, error: 'Company not found' };
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/companies/${companyId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ reason }),
    });
    
    return response.json();
  },

  // Update company status
  updateCompanyStatus: async (companyId: string, status: CompanyStatus): Promise<{ success: boolean; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const company = mockCompanies.find(c => c.id === companyId);
      if (company) {
        company.status = status;
        company.updatedAt = new Date().toISOString();
        return { success: true };
      }
      return { success: false, error: 'Company not found' };
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/companies/${companyId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ status }),
    });
    
    return response.json();
  },

  // Delete company (SuperAdmin only)
  deleteCompany: async (companyId: string): Promise<{ success: boolean; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = mockCompanies.findIndex(c => c.id === companyId);
      if (index > -1) {
        mockCompanies.splice(index, 1);
        return { success: true };
      }
      return { success: false, error: 'Company not found' };
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/companies/${companyId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    
    return response.json();
  },
};

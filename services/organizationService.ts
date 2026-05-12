import { APP_CONFIG } from '@/config/appConfig';
import { mockOrganizations, type Organization, type CompanyStatus } from '@/data/mockData';

export interface CreateOrganizationRequest {
  companyId: string;
  name: string;
  type: 'Regional' | 'Department' | 'Branch' | 'Division';
  parentOrganizationId?: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  managerId: string;
}

export interface OrganizationListResponse {
  organizations: Organization[];
  total: number;
  page: number;
  pageSize: number;
}

export const organizationService = {
  // Get organizations by company
  getOrganizationsByCompany: async (
    companyId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<OrganizationListResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const filtered = mockOrganizations.filter(o => o.companyId === companyId);
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      
      return {
        organizations: filtered.slice(start, end),
        total: filtered.length,
        page,
        pageSize,
      };
    }
    
    const params = new URLSearchParams({
      companyId,
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/organizations?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    
    return response.json();
  },

  // Get organization by ID
  getOrganizationById: async (organizationId: string): Promise<Organization | null> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockOrganizations.find(o => o.id === organizationId) || null;
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/organizations/${organizationId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    
    if (!response.ok) return null;
    return response.json();
  },

  // Create organization (CompanyAdmin only)
  createOrganization: async (data: CreateOrganizationRequest): Promise<{ success: boolean; organizationId?: string; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newOrganization: Organization = {
        id: `org-${Date.now()}`,
        companyId: data.companyId,
        name: data.name,
        type: data.type,
        status: 'Active',
        parentOrganizationId: data.parentOrganizationId || null,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        managerId: data.managerId,
        agentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      (mockOrganizations as any).push(newOrganization);
      return { success: true, organizationId: newOrganization.id };
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  // Update organization
  updateOrganization: async (organizationId: string, data: Partial<CreateOrganizationRequest>): Promise<{ success: boolean; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const organization = mockOrganizations.find(o => o.id === organizationId);
      if (organization) {
        Object.assign(organization, data, { updatedAt: new Date().toISOString() });
        return { success: true };
      }
      return { success: false, error: 'Organization not found' };
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/organizations/${organizationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  // Update organization status
  updateOrganizationStatus: async (organizationId: string, status: CompanyStatus): Promise<{ success: boolean; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const organization = mockOrganizations.find(o => o.id === organizationId);
      if (organization) {
        organization.status = status;
        organization.updatedAt = new Date().toISOString();
        return { success: true };
      }
      return { success: false, error: 'Organization not found' };
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/organizations/${organizationId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ status }),
    });
    
    return response.json();
  },

  // Delete organization
  deleteOrganization: async (organizationId: string): Promise<{ success: boolean; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = mockOrganizations.findIndex(o => o.id === organizationId);
      if (index > -1) {
        mockOrganizations.splice(index, 1);
        return { success: true };
      }
      return { success: false, error: 'Organization not found' };
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/organizations/${organizationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    
    return response.json();
  },

  // Get child organizations (for hierarchical view)
  getChildOrganizations: async (parentId: string): Promise<Organization[]> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockOrganizations.filter(o => o.parentOrganizationId === parentId);
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/organizations/${parentId}/children`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    
    if (!response.ok) return [];
    return response.json();
  },
};

import { APP_CONFIG } from '@/config/appConfig';
import { apiClient } from '@/lib/apiClient';

export interface CompanyType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export const companyTypeService = {
  listAll: async (): Promise<CompanyType[]> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return [
        { id: 1, name: 'Logistics', slug: 'logistics', description: 'Logistics company' },
        { id: 2, name: 'Freight', slug: 'freight', description: 'Freight company' },
        { id: 3, name: 'Express', slug: 'express', description: 'Express delivery' },
        { id: 4, name: 'Courier', slug: 'courier', description: 'Courier services' },
        { id: 5, name: 'Mixed', slug: 'mixed', description: 'Mixed services' },
      ];
    }

    const response = await apiClient.get<CompanyType[]>('/company-types/list');
    if (!response.success) return [];
    return response.data || [];
  },

  getCompanyTypes: async (page = 1, limit = 10): Promise<{ companyTypes: CompanyType[]; total: number; page: number; limit: number; totalPages: number }> => {
    if (APP_CONFIG.USE_MOCK) {
      const all = await companyTypeService.listAll();
      const start = (page - 1) * limit;
      return {
        companyTypes: all.slice(start, start + limit),
        total: all.length,
        page,
        limit,
        totalPages: Math.ceil(all.length / limit),
      };
    }

    const response = await apiClient.get<{ companyTypes: CompanyType[] }>('/company-types', { page, limit });
    if (!response.success) return { companyTypes: [], total: 0, page, limit, totalPages: 0 };
    return {
      companyTypes: response.data.companyTypes || [],
      total: response.meta?.total || 0,
      page: response.meta?.page || page,
      limit: response.meta?.limit || limit,
      totalPages: response.meta?.totalPages || 1,
    };
  },
};

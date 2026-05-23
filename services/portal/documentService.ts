import { APP_CONFIG } from '@/config/appConfig';
import { portalMockDocuments } from '@/data/portal-mock-data';
import type { PortalDocument, PortalDocumentType } from '@/types/portal';

export interface DocumentFilters {
  type?: PortalDocumentType | 'All';
  status?: string | 'All';
  search?: string;
}

export const getPortalDocuments = async (filters?: DocumentFilters): Promise<PortalDocument[]> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    let result = [...portalMockDocuments];
    if (filters) {
      if (filters.type && filters.type !== 'All') result = result.filter(d => d.type === filters.type);
      if (filters.status && filters.status !== 'All') result = result.filter(d => d.status === filters.status);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(d =>
          d.title.toLowerCase().includes(q) ||
          d.docRef.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
        );
      }
    }
    return result;
  }
  const params = new URLSearchParams();
  if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/portal/documents?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return res.json();
};

import { APP_CONFIG } from '@/config/appConfig';
import { portalInvoices } from '@/data/portal-mock-data';
import type { Invoice, InvoiceStatus } from '@/data/mockData';

export interface InvoiceFilters {
  status?: InvoiceStatus | 'All';
  search?: string;
}

export const getPortalInvoices = async (filters?: InvoiceFilters): Promise<Invoice[]> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    let result = [...portalInvoices];
    if (filters) {
      if (filters.status && filters.status !== 'All') result = result.filter(inv => inv.status === filters.status);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(inv =>
          inv.invoiceId.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q)
        );
      }
    }
    return result;
  }
  const params = new URLSearchParams();
  if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/portal/invoices?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return res.json();
};

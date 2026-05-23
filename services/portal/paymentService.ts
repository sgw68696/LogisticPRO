import { APP_CONFIG } from '@/config/appConfig';
import { portalMockPayments } from '@/data/portal-mock-data';
import type { PortalPayment, PortalPaymentStatus } from '@/types/portal';

export interface PaymentFilters {
  status?: PortalPaymentStatus | 'All';
  search?: string;
}

export const getPortalPayments = async (filters?: PaymentFilters): Promise<PortalPayment[]> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    let result = [...portalMockPayments];
    if (filters) {
      if (filters.status && filters.status !== 'All') result = result.filter(p => p.status === filters.status);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(p =>
          p.paymentRef.toLowerCase().includes(q) ||
          p.invoiceRef.toLowerCase().includes(q) ||
          p.method.toLowerCase().includes(q) ||
          p.transactionId.toLowerCase().includes(q)
        );
      }
    }
    return result;
  }
  const params = new URLSearchParams();
  if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/portal/payments?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return res.json();
};

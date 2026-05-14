import { APP_CONFIG } from '@/config/appConfig';
import { portalMockBookings } from '@/data/portal-mock-data';
import type { PortalBooking, PortalBookingStatus } from '@/types/portal';

export interface BookingFilters {
  status?: PortalBookingStatus | 'All';
  search?: string;
}

export const getPortalBookings = async (filters?: BookingFilters): Promise<PortalBooking[]> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    let result = [...portalMockBookings];
    if (filters) {
      if (filters.status && filters.status !== 'All') result = result.filter(b => b.status === filters.status);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(b =>
          b.bookingRef.toLowerCase().includes(q) ||
          b.pickupAddress.toLowerCase().includes(q) ||
          b.deliveryAddress.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
        );
      }
    }
    return result;
  }
  const params = new URLSearchParams();
  if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/portal/bookings?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return res.json();
};

export const getPortalBookingById = async (id: string): Promise<PortalBooking | null> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    return portalMockBookings.find(b => b.id === id || b.bookingRef === id) || null;
  }
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/portal/bookings/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  if (!res.ok) return null;
  return res.json();
};

export const createPortalBooking = async (data: Partial<PortalBooking>): Promise<PortalBooking> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 600));
    const booking: PortalBooking = {
      id: `pb-${Date.now()}`,
      bookingRef: `BK-2026-${String(portalMockBookings.length + 1).padStart(5, '0')}`,
      customerId: 'cust-001',
      serviceType: 'Standard',
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [],
      estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString(),
      actualDelivery: null,
      quotedPrice: 0,
      finalPrice: null,
      pieces: 1,
      notes: '',
      packageWeight: 0,
      packageDimensions: '',
      packageType: 'Box',
      description: '',
      pickupAddress: '',
      deliveryAddress: '',
      createdBy: 'Customer',
      ...data,
    };
    return booking;
  }
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/portal/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify(data),
  });
  return res.json();
};

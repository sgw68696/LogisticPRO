import { APP_CONFIG } from '@/config/appConfig';
import { portalMockTrackingEvents } from '@/data/portal-mock-data';
import type { PortalTrackingEvent } from '@/types/portal';

export const getTrackingEvents = async (trackingNumber: string): Promise<PortalTrackingEvent[]> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return portalMockTrackingEvents
      .filter(e => e.trackingNumber === trackingNumber)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/portal/tracking/${trackingNumber}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return res.json();
};

export const searchTracking = async (query: string): Promise<string[]> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    const matches = portalMockTrackingEvents
      .filter(e => e.trackingNumber.toLowerCase().includes(query.toLowerCase()))
      .map(e => e.trackingNumber);
    return [...new Set(matches)];
  }
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/portal/tracking/search?q=${query}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return res.json();
};

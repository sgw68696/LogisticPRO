import { APP_CONFIG } from '@/config/appConfig';
import { portalMockNotifications } from '@/data/portal-mock-data';

export const getPortalNotifications = async () => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    return [...portalMockNotifications].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/portal/notifications`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return res.json();
};

export const markNotificationRead = async (id: string): Promise<void> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 100));
    const n = portalMockNotifications.find(n => n.id === id);
    if (n) n.read = true;
    return;
  }
  await fetch(`${APP_CONFIG.API_BASE_URL}/portal/notifications/${id}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
};

export const markAllNotificationsRead = async (): Promise<void> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    portalMockNotifications.forEach(n => { n.read = true; });
    return;
  }
  await fetch(`${APP_CONFIG.API_BASE_URL}/portal/notifications/read-all`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
};

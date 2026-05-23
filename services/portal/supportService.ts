import { APP_CONFIG } from '@/config/appConfig';
import { portalMockTickets } from '@/data/portal-mock-data';
import type { PortalSupportTicket, PortalTicketStatus, PortalSupportCategory } from '@/types/portal';

export interface TicketFilters {
  status?: PortalTicketStatus | 'All';
  search?: string;
  category?: PortalSupportCategory | 'All';
}

export const getPortalTickets = async (filters?: TicketFilters): Promise<PortalSupportTicket[]> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    let result = [...portalMockTickets];
    if (filters) {
      if (filters.status && filters.status !== 'All') result = result.filter(t => t.status === filters.status);
      if (filters.category && filters.category !== 'All') result = result.filter(t => t.category === filters.category);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(t =>
          t.ticketRef.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
        );
      }
    }
    return result;
  }
  const params = new URLSearchParams();
  if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/portal/support?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return res.json();
};

export const getPortalTicketById = async (id: string): Promise<PortalSupportTicket | null> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 200));
    return portalMockTickets.find(t => t.id === id || t.ticketRef === id) || null;
  }
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/portal/support/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  if (!res.ok) return null;
  return res.json();
};

export const createPortalTicket = async (data: Partial<PortalSupportTicket>): Promise<PortalSupportTicket> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, 500));
    const ticket: PortalSupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketRef: `TKT-2026-${String(portalMockTickets.length + 1).padStart(4, '0')}`,
      customerId: 'cust-001',
      customerName: 'Tech Solutions Pvt Ltd',
      status: 'Open',
      messages: [],
      attachments: [],
      createdBy: 'Customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
      ...data,
    } as PortalSupportTicket;
    if (data.description) {
      ticket.messages = [{ from: ticket.customerName, message: data.description, timestamp: ticket.createdAt, isStaff: false }];
    }
    return ticket;
  }
  const res = await fetch(`${APP_CONFIG.API_BASE_URL}/portal/support`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify(data),
  });
  return res.json();
};

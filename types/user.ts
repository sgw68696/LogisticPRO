import type { UserRole, AgentType, CompanyOperationalType } from './enums';

export type { UserRole, AgentType, CompanyOperationalType };

export interface MockUser {
  id: string;
  name: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  role: UserRole;
  agentType?: AgentType;
  companyType?: CompanyOperationalType;
  status: 'Active' | 'Inactive';
  companyId: string | null;
  organizationId: string | null;
  agentId: string | null;
  avatar: string;
  dashboardRoute: string;
  menuAccess: string[];
  lastLogin: string;
  createdAt: string;
}

export type User = MockUser;

export interface Notification {
  id: string;
  type: 'shipment_delayed' | 'payment_overdue' | 'maintenance_due' | 'driver_off_duty' | 'new_order' | 'low_stock';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl: string | null;
}

export interface PortalNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: string;
  actionUrl: string | null;
}

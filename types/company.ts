import type { CompanyStatus, RegistrationStatus, UserRole } from './enums';
import type { PermissionAction } from './enums';

export type { CompanyStatus, RegistrationStatus };

export interface Company {
  id: string;
  name: string;
  registrationType: 'self-service' | 'admin-created';
  registrationStatus: RegistrationStatus;
  status: CompanyStatus;
  email: string;
  phone: string;
  registeredAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  taxId: string;
  businessType: 'Freight' | 'Express' | 'Courier' | 'Logistics' | 'Mixed';
  registrationDate: string;
  approvalDate: string | null;
  approvedBy: string | null;
  logo: string | null;
  website: string | null;
  contactPerson: string;
  contactPhone: string;
  maxOrganizations: number;
  maxAgents: number;
  currentOrganizations: number;
  currentAgents: number;
  billingCycle: 'Monthly' | 'Quarterly' | 'Yearly';
  plan: 'Starter' | 'Professional' | 'Enterprise';
  documents: { type: string; url: string; verified: boolean; uploadedAt: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  companyId: string;
  name: string;
  type: 'Regional' | 'Department' | 'Branch' | 'Division';
  status: CompanyStatus;
  parentOrganizationId: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  managerId: string;
  agentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  companyId: string;
  organizationId: string | null;
  name: string;
  email: string;
  phone: string;
  username: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  roleAssignments: AgentRole[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface AgentRole {
  id: string;
  agentId: string;
  roleType: UserRole;
  permissions: AgentPermission[];
  assignedAt: string;
  assignedBy: string;
  scope: 'company' | 'organization' | 'department';
  scopeId: string | null;
}

export interface AgentPermission {
  module: string;
  action: PermissionAction;
  allowed: boolean;
  grantedAt: string;
}

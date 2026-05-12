import { type User, type UserRole, type PermissionAction, rolePermissions } from '@/data/mockData';

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  user: User | null,
  module: string,
  action: PermissionAction
): boolean {
  if (!user) return false;
  
  const permissions = rolePermissions[user.role as UserRole];
  if (!permissions) return false;
  
  return permissions[module]?.[action] ?? false;
}

/**
 * Check if user can manage companies (SuperAdmin only)
 */
export function canManageCompanies(user: User | null): boolean {
  return user?.role === 'SuperAdmin';
}

/**
 * Check if user can manage organizations in their company
 */
export function canManageOrganizations(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'CompanyAdmin' || user.role === 'SuperAdmin';
}

/**
 * Check if user can manage agents in their company
 */
export function canManageAgents(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'CompanyAdmin' || user.role === 'Manager' || user.role === 'SuperAdmin';
}

/**
 * Check if user can manage users/agents in their company
 */
export function canManageUsers(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'CompanyAdmin' || user.role === 'SuperAdmin';
}

/**
 * Check if user can view dashboard analytics
 */
export function canViewDashboard(user: User | null): boolean {
  if (!user) return false;
  return hasPermission(user, 'dashboard', 'view');
}

/**
 * Check if user can create transport configurations
 */
export function canManageTransport(user: User | null): boolean {
  if (!user) return false;
  return hasPermission(user, 'transport', 'create') || user.role === 'CompanyAdmin';
}

/**
 * Get list of modules user can access
 */
export function getAccessibleModules(user: User | null): string[] {
  if (!user) return [];
  
  const permissions = rolePermissions[user.role as UserRole];
  if (!permissions) return [];
  
  return Object.keys(permissions).filter(module => permissions[module].view);
}

/**
 * Check if user belongs to a specific company
 */
export function belongsToCompany(user: User | null, companyId: string): boolean {
  if (!user) return false;
  if (user.role === 'SuperAdmin') return true;
  return user.companyId === companyId;
}

/**
 * Check if user belongs to a specific organization
 */
export function belongsToOrganization(user: User | null, organizationId: string): boolean {
  if (!user) return false;
  if (user.role === 'SuperAdmin' || user.role === 'CompanyAdmin') return true;
  return user.organizationId === organizationId;
}

/**
 * Check if user can view a specific resource based on company/org context
 */
export function canViewResource(
  user: User | null,
  resourceCompanyId: string,
  resourceOrgId?: string | null
): boolean {
  if (!user) return false;
  if (user.role === 'SuperAdmin') return true;
  
  // User must belong to the same company
  if (user.companyId !== resourceCompanyId) return false;
  
  // If resource is organization-scoped and user has org info, check org match
  if (resourceOrgId && user.organizationId && user.organizationId !== resourceOrgId) {
    return false;
  }
  
  return true;
}

/**
 * Check if a role has admin-level access
 */
export function isAdminRole(role: UserRole): boolean {
  return role === 'SuperAdmin' || role === 'CompanyAdmin' || role === 'Admin';
}

/**
 * Check if a role is a management role
 */
export function isManagementRole(role: UserRole): boolean {
  return role === 'Manager' || isAdminRole(role);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    'SuperAdmin': 'Super Administrator',
    'CompanyAdmin': 'Company Administrator',
    'Manager': 'Manager',
    'Dispatcher': 'Dispatcher',
    'Agent': 'Agent',
    'Staff': 'Staff',
    'Operator': 'Operator',
    'Admin': 'Administrator',
  };
  
  return roleNames[role] || role;
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    'SuperAdmin': 'Full access to all companies and system features',
    'CompanyAdmin': 'Full access to company data and agent management',
    'Manager': 'Can manage shipments, fleet, and teams',
    'Dispatcher': 'Can manage dispatch and vehicle routing',
    'Agent': 'Can create and manage shipments and orders',
    'Staff': 'Can view and manage basic operational data',
    'Operator': 'Can manage dispatch operations',
    'Admin': 'Full access to system features',
  };
  
  return descriptions[role] || '';
}

/**
 * Get available roles for creating agents (based on creator's role)
 */
export function getAvailableRolesForAgentCreation(creatorRole: UserRole): UserRole[] {
  const availableRoles: Record<UserRole, UserRole[]> = {
    'SuperAdmin': ['CompanyAdmin', 'Manager', 'Dispatcher', 'Agent', 'Staff', 'Operator'],
    'CompanyAdmin': ['Manager', 'Dispatcher', 'Agent', 'Staff', 'Operator'],
    'Manager': ['Agent', 'Staff'],
    'Dispatcher': [],
    'Agent': [],
    'Staff': [],
    'Operator': [],
    'Admin': ['Manager', 'Dispatcher', 'Agent', 'Staff'],
  };
  
  return availableRoles[creatorRole] || [];
}

/**
 * Get color for role badge
 */
export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    'SuperAdmin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'CompanyAdmin': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Manager': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Dispatcher': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Agent': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Staff': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    'Operator': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'Admin': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };
  
  return colors[role] || colors['Staff'];
}

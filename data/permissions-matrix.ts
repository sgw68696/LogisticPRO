import { UserRole } from './mockData';

export interface PermissionMatrixEntry {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export?: boolean;
  import?: boolean;
}

export interface RolePermissions {
  [module: string]: PermissionMatrixEntry;
}

/**
 * Comprehensive Permission Matrix for all roles
 * Defines access control at module level with granular actions
 */
export const PERMISSION_MATRIX: Record<UserRole, RolePermissions> = {
  // SuperAdmin: Complete platform access
  SuperAdmin: {
    companies: { view: true, create: true, edit: true, delete: true, export: true, import: true },
    organizations: { view: true, create: true, edit: true, delete: true, export: true },
    agents: { view: true, create: true, edit: true, delete: true, export: true },
    transport: { view: true, create: true, edit: true, delete: true, export: true },
    dashboard: { view: true, create: false, edit: false, delete: false },
    shipments: { view: true, create: true, edit: true, delete: false, export: true },
    orders: { view: true, create: true, edit: true, delete: true, export: true },
    fleet: { view: true, create: true, edit: true, delete: true, export: true },
    drivers: { view: true, create: true, edit: true, delete: true, export: true },
    dispatch: { view: true, create: true, edit: true, delete: true, export: true },
    warehouse: { view: true, create: true, edit: true, delete: true, export: true },
    customers: { view: true, create: true, edit: true, delete: true, export: true },
    finance: { view: true, create: true, edit: true, delete: true, export: true },
    reports: { view: true, create: true, edit: true, delete: false, export: true },
    users: { view: true, create: true, edit: true, delete: true, export: true },
    settings: { view: true, create: true, edit: true, delete: true },
    notifications: { view: true, create: false, edit: false, delete: false },
  },

  // CompanyAdmin: Full control within company
  CompanyAdmin: {
    companies: { view: true, create: false, edit: true, delete: false },
    organizations: { view: true, create: true, edit: true, delete: true, export: true },
    agents: { view: true, create: true, edit: true, delete: true, export: true },
    transport: { view: true, create: true, edit: true, delete: true, export: true },
    dashboard: { view: true, create: false, edit: false, delete: false },
    shipments: { view: true, create: true, edit: true, delete: false, export: true },
    orders: { view: true, create: true, edit: true, delete: true, export: true },
    fleet: { view: true, create: true, edit: true, delete: true, export: true },
    drivers: { view: true, create: true, edit: true, delete: true, export: true },
    dispatch: { view: true, create: true, edit: true, delete: true, export: true },
    warehouse: { view: true, create: true, edit: true, delete: true, export: true },
    customers: { view: true, create: true, edit: true, delete: true, export: true },
    finance: { view: true, create: true, edit: true, delete: true, export: true },
    reports: { view: true, create: true, edit: true, delete: false, export: true },
    users: { view: true, create: true, edit: true, delete: true, export: true },
    settings: { view: true, create: true, edit: true, delete: false },
    notifications: { view: true, create: false, edit: false, delete: false },
  },

  // Manager: Team and operation management
  Manager: {
    companies: { view: true, create: false, edit: false, delete: false },
    organizations: { view: true, create: false, edit: false, delete: false },
    agents: { view: true, create: true, edit: true, delete: false, export: true },
    transport: { view: true, create: false, edit: false, delete: false },
    dashboard: { view: true, create: false, edit: false, delete: false },
    shipments: { view: true, create: true, edit: true, delete: false, export: true },
    orders: { view: true, create: true, edit: true, delete: false, export: true },
    fleet: { view: true, create: true, edit: true, delete: false, export: true },
    drivers: { view: true, create: true, edit: true, delete: false, export: true },
    dispatch: { view: true, create: true, edit: true, delete: false, export: true },
    warehouse: { view: true, create: true, edit: true, delete: false, export: true },
    customers: { view: true, create: true, edit: true, delete: false, export: true },
    finance: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, create: true, edit: false, delete: false, export: true },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: true, create: false, edit: true, delete: false },
    notifications: { view: true, create: false, edit: false, delete: false },
  },

  // Dispatcher: Dispatch and routing operations
  Dispatcher: {
    companies: { view: false, create: false, edit: false, delete: false },
    organizations: { view: false, create: false, edit: false, delete: false },
    agents: { view: false, create: false, edit: false, delete: false },
    transport: { view: false, create: false, edit: false, delete: false },
    dashboard: { view: true, create: false, edit: false, delete: false },
    shipments: { view: true, create: false, edit: true, delete: false, export: true },
    orders: { view: true, create: false, edit: false, delete: false },
    fleet: { view: true, create: false, edit: false, delete: false },
    drivers: { view: true, create: false, edit: false, delete: false },
    dispatch: { view: true, create: true, edit: true, delete: false, export: true },
    warehouse: { view: false, create: false, edit: false, delete: false },
    customers: { view: false, create: false, edit: false, delete: false },
    finance: { view: false, create: false, edit: false, delete: false },
    reports: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
    notifications: { view: true, create: false, edit: false, delete: false },
  },

  // Operator: Vehicle/transport operations
  Operator: {
    companies: { view: false, create: false, edit: false, delete: false },
    organizations: { view: false, create: false, edit: false, delete: false },
    agents: { view: false, create: false, edit: false, delete: false },
    transport: { view: false, create: false, edit: false, delete: false },
    dashboard: { view: true, create: false, edit: false, delete: false },
    shipments: { view: true, create: false, edit: true, delete: false, export: false },
    orders: { view: true, create: false, edit: false, delete: false },
    fleet: { view: true, create: false, edit: false, delete: false },
    drivers: { view: true, create: false, edit: false, delete: false },
    dispatch: { view: true, create: true, edit: true, delete: false },
    warehouse: { view: false, create: false, edit: false, delete: false },
    customers: { view: false, create: false, edit: false, delete: false },
    finance: { view: false, create: false, edit: false, delete: false },
    reports: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
    notifications: { view: true, create: false, edit: false, delete: false },
  },

  // Agent: General operational access
  Agent: {
    companies: { view: false, create: false, edit: false, delete: false },
    organizations: { view: false, create: false, edit: false, delete: false },
    agents: { view: false, create: false, edit: false, delete: false },
    transport: { view: false, create: false, edit: false, delete: false },
    dashboard: { view: true, create: false, edit: false, delete: false },
    shipments: { view: true, create: true, edit: true, delete: false, export: true },
    orders: { view: true, create: true, edit: true, delete: false, export: true },
    fleet: { view: false, create: false, edit: false, delete: false },
    drivers: { view: false, create: false, edit: false, delete: false },
    dispatch: { view: false, create: false, edit: false, delete: false },
    warehouse: { view: true, create: true, edit: true, delete: false, export: true },
    customers: { view: true, create: true, edit: true, delete: false, export: true },
    finance: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, create: false, edit: false, delete: false, export: true },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
    notifications: { view: true, create: false, edit: false, delete: false },
  },

  // Staff: Limited operational access
  Staff: {
    companies: { view: false, create: false, edit: false, delete: false },
    organizations: { view: false, create: false, edit: false, delete: false },
    agents: { view: false, create: false, edit: false, delete: false },
    transport: { view: false, create: false, edit: false, delete: false },
    dashboard: { view: true, create: false, edit: false, delete: false },
    shipments: { view: true, create: true, edit: true, delete: false },
    orders: { view: true, create: true, edit: true, delete: false },
    fleet: { view: false, create: false, edit: false, delete: false },
    drivers: { view: false, create: false, edit: false, delete: false },
    dispatch: { view: false, create: false, edit: false, delete: false },
    warehouse: { view: true, create: true, edit: true, delete: false },
    customers: { view: true, create: true, edit: false, delete: false },
    finance: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
    notifications: { view: true, create: false, edit: false, delete: false },
  },

  // Legacy Admin role (treated as CompanyAdmin)
  Admin: {
    companies: { view: true, create: false, edit: true, delete: false },
    organizations: { view: true, create: true, edit: true, delete: true, export: true },
    agents: { view: true, create: true, edit: true, delete: true, export: true },
    transport: { view: true, create: true, edit: true, delete: true, export: true },
    dashboard: { view: true, create: false, edit: false, delete: false },
    shipments: { view: true, create: true, edit: true, delete: false, export: true },
    orders: { view: true, create: true, edit: true, delete: true, export: true },
    fleet: { view: true, create: true, edit: true, delete: true, export: true },
    drivers: { view: true, create: true, edit: true, delete: true, export: true },
    dispatch: { view: true, create: true, edit: true, delete: true, export: true },
    warehouse: { view: true, create: true, edit: true, delete: true, export: true },
    customers: { view: true, create: true, edit: true, delete: true, export: true },
    finance: { view: true, create: true, edit: true, delete: true, export: true },
    reports: { view: true, create: true, edit: true, delete: false, export: true },
    users: { view: true, create: true, edit: true, delete: true, export: true },
    settings: { view: true, create: true, edit: true, delete: true },
    notifications: { view: true, create: false, edit: false, delete: false },
  },
};

/**
 * Get all modules with permissions
 */
export const ALL_MODULES = [
  'companies',
  'organizations',
  'agents',
  'transport',
  'dashboard',
  'shipments',
  'orders',
  'fleet',
  'drivers',
  'dispatch',
  'warehouse',
  'customers',
  'finance',
  'reports',
  'users',
  'settings',
  'notifications',
] as const;

export type ModuleName = typeof ALL_MODULES[number];

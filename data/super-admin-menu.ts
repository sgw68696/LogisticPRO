import {
  LayoutDashboard,
  Building2,
  Users,
  Lock,
  Shield,
  Anchor,
  Plane,
  Box,
  Globe,
  TrendingUp,
  Zap,
  BarChart3,
  Settings,
  Eye,
  FileText,
  AlertCircle,
  Calendar,
  Calculator,
  FileCheck,
  Scale,
  ClipboardCheck,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
  children?: MenuItem[];
  description?: string;
}

export const superAdminMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
    description: 'Platform overview and KPIs',
  },

  // Organization Management
  {
    id: 'organization-management',
    label: 'Organization Management',
    icon: Building2,
    description: 'Manage companies and organizations',
    children: [
      {
        id: 'companies',
        label: 'Companies',
        icon: Building2,
        href: '/admin/org/companies',
        description: 'View and manage all companies',
      },
      {
        id: 'organizations',
        label: 'Organizations',
        icon: Building2,
        href: '/admin/org/organizations',
        description: 'View and manage organizations',
      },
      {
        id: 'company-types',
        label: 'Company Types',
        icon: Building2,
        href: '/admin/org/company-types',
        description: 'Define company types and categories',
      },
      {
        id: 'subscription-plans',
        label: 'Subscription Plans',
        icon: TrendingUp,
        href: '/admin/org/subscription-plans',
        description: 'Manage subscription tiers and pricing',
      },
      {
        id: 'approvals',
        label: 'Approvals',
        icon: Shield,
        href: '/admin/org/approvals',
        description: 'Approve pending registrations',
      },
    ],
  },

  // User & Access
  {
    id: 'user-access',
    label: 'User & Access',
    icon: Lock,
    description: 'User management and access control',
    children: [
      {
        id: 'users',
        label: 'Users',
        icon: Users,
        href: '/admin/users/all',
        description: 'Manage all platform users',
      },
      {
        id: 'roles-permissions',
        label: 'Roles & Permissions',
        icon: Lock,
        href: '/admin/users/roles',
        description: 'Define roles and permissions',
      },
      {
        id: 'rbac-matrix',
        label: 'RBAC Matrix',
        icon: Shield,
        href: '/admin/users/rbac-matrix',
        description: 'View permission matrix',
      },
      {
        id: 'login-activity',
        label: 'Login Activity',
        icon: Eye,
        href: '/admin/users/login-activity',
        description: 'Track user login history',
      },
    ],
  },

  // Logistics Masters
  {
    id: 'logistics-masters',
    label: 'Logistics Masters',
    icon: Globe,
    description: 'Configure logistics entities',
    children: [
      {
        id: 'carriers',
        label: 'Carriers',
        icon: TrendingUp,
        href: '/admin/logistics/carriers',
        description: 'Manage shipping carriers',
      },
      {
        id: 'ports',
        label: 'Ports',
        icon: Anchor,
        href: '/admin/logistics/ports',
        description: 'Manage seaports',
      },
      {
        id: 'airports',
        label: 'Airports',
        icon: Plane,
        href: '/admin/logistics/airports',
        description: 'Manage airports',
      },
      {
        id: 'container-types',
        label: 'Container Types',
        icon: Box,
        href: '/admin/logistics/container-types',
        description: 'Define container specifications',
      },
      {
        id: 'incoterms',
        label: 'Incoterms',
        icon: FileText,
        href: '/admin/logistics/incoterms',
        description: 'Manage trade terms',
      },
      {
        id: 'transport-modes',
        label: 'Transport Modes',
        icon: TrendingUp,
        href: '/admin/logistics/transport-modes',
        description: 'Configure transport methods',
      },
    ],
  },

  // Operations Monitoring
  {
    id: 'operations-monitoring',
    label: 'Operations Monitoring',
    icon: Eye,
    description: 'Monitor logistics operations',
    children: [
      {
        id: 'all-shipments',
        label: 'All Shipments',
        icon: Box,
        href: '/admin/ops/shipments',
        description: 'View all shipments',
      },
      {
        id: 'container-tracking',
        label: 'Container Tracking',
        icon: Box,
        href: '/admin/ops/container-tracking',
        description: 'Track containers',
      },
      {
        id: 'bol-monitoring',
        label: 'BOL Monitoring',
        icon: FileText,
        href: '/admin/ops/bol-monitoring',
        description: 'Monitor bills of lading',
      },
      {
        id: 'carrier-tracking',
        label: 'Carrier Tracking',
        icon: TrendingUp,
        href: '/admin/ops/carrier-tracking',
        description: 'Track carrier performance',
      },
      {
        id: 'dispatch-monitoring',
        label: 'Dispatch Monitoring',
        icon: Eye,
        href: '/admin/ops/dispatch-monitoring',
        description: 'Monitor dispatches',
      },
      {
        id: 'fleet-monitoring',
        label: 'Fleet Monitoring',
        icon: TrendingUp,
        href: '/admin/ops/fleet-monitoring',
        description: 'Monitor fleet operations',
      },
      {
        id: 'warehouse-monitoring',
        label: 'Warehouse Monitoring',
        icon: Building2,
        href: '/admin/ops/warehouse-monitoring',
        description: 'Monitor warehouse operations',
      },
    ],
  },

  // Finance & Billing
  {
    id: 'finance-billing',
    label: 'Finance & Billing',
    icon: TrendingUp,
    description: 'Financial management',
    children: [
      {
        id: 'subscription-billing',
        label: 'Subscription Billing',
        icon: TrendingUp,
        href: '/admin/finance/subscription-billing',
        description: 'Manage subscriptions',
      },
      {
        id: 'invoices',
        label: 'Invoices',
        icon: FileText,
        href: '/admin/finance/invoices',
        description: 'View and manage invoices',
      },
      {
        id: 'revenue',
        label: 'Revenue',
        icon: TrendingUp,
        href: '/admin/finance/revenue',
        description: 'Revenue analytics',
      },
      {
        id: 'taxes',
        label: 'Taxes',
        icon: FileText,
        href: '/admin/finance/taxes',
        description: 'Tax management',
      },
    ],
  },

  // Bookings & Rates
  {
    id: 'bookings-rates',
    label: 'Bookings & Rates',
    icon: Calendar,
    description: 'Manage bookings and pricing',
    children: [
      {
        id: 'all-bookings',
        label: 'All Bookings',
        icon: Calendar,
        href: '/admin/bookings',
        description: 'View all bookings across companies',
      },
      {
        id: 'rate-cards',
        label: 'Rate Cards',
        icon: Calculator,
        href: '/admin/rates/cards',
        description: 'Manage global rate cards',
      },
      {
        id: 'contract-rates',
        label: 'Contract Rates',
        icon: FileCheck,
        href: '/admin/rates/contracts',
        description: 'Manage carrier contracts',
      },
    ],
  },

  // Compliance & Customs
  {
    id: 'compliance-customs',
    label: 'Compliance & Customs',
    icon: Scale,
    description: 'Regulatory compliance management',
    children: [
      {
        id: 'customs-declarations',
        label: 'Customs Declarations',
        icon: FileText,
        href: '/admin/compliance/customs',
        description: 'Monitor all customs declarations',
      },
      {
        id: 'import-export-licenses',
        label: 'Import/Export Licenses',
        icon: FileCheck,
        href: '/admin/compliance/licenses',
        description: 'Manage licenses and permits',
      },
      {
        id: 'compliance-reports',
        label: 'Compliance Reports',
        icon: ClipboardCheck,
        href: '/admin/compliance/reports',
        description: 'Regulatory compliance reports',
      },
    ],
  },

  // Reports & Analytics
  {
    id: 'reports-analytics',
    label: 'Reports & Analytics',
    icon: BarChart3,
    description: 'Generate reports',
    children: [
      {
        id: 'platform-reports',
        label: 'Platform Reports',
        icon: BarChart3,
        href: '/admin/reports/platform',
        description: 'Platform-wide reports',
      },
      {
        id: 'shipment-analytics',
        label: 'Shipment Analytics',
        icon: BarChart3,
        href: '/admin/reports/shipment-analytics',
        description: 'Shipment analysis',
      },
      {
        id: 'revenue-analytics',
        label: 'Revenue Analytics',
        icon: BarChart3,
        href: '/admin/reports/revenue-analytics',
        description: 'Revenue analysis',
      },
      {
        id: 'sla-reports',
        label: 'SLA Reports',
        icon: BarChart3,
        href: '/admin/reports/sla',
        description: 'SLA compliance reports',
      },
    ],
  },

  // Workflow & Customization
  {
    id: 'workflow-customization',
    label: 'Workflow & Customization',
    icon: Zap,
    description: 'Customize workflows',
    children: [
      {
        id: 'custom-fields',
        label: 'Custom Fields',
        icon: Settings,
        href: '/admin/workflow/custom-fields',
        description: 'Define custom fields',
      },
      {
        id: 'custom-statuses',
        label: 'Custom Statuses',
        icon: Settings,
        href: '/admin/workflow/custom-statuses',
        description: 'Create custom statuses',
      },
      {
        id: 'workflow-builder',
        label: 'Workflow Builder',
        icon: Zap,
        href: '/admin/workflow/builder',
        description: 'Build custom workflows',
      },
      {
        id: 'email-templates',
        label: 'Email Templates',
        icon: FileText,
        href: '/admin/workflow/email-templates',
        description: 'Manage email templates',
      },
      {
        id: 'notification-templates',
        label: 'Notification Templates',
        icon: FileText,
        href: '/admin/workflow/notification-templates',
        description: 'Manage notifications',
      },
    ],
  },

  // System Configuration
  {
    id: 'system-configuration',
    label: 'System Configuration',
    icon: Settings,
    description: 'Configure system settings',
    children: [
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        href: '/admin/system/settings',
        description: 'Global settings',
      },
      {
        id: 'integrations',
        label: 'Integrations',
        icon: Zap,
        href: '/admin/system/integrations',
        description: 'Manage integrations',
      },
      {
        id: 'api-config',
        label: 'API Config',
        icon: Settings,
        href: '/admin/system/api-config',
        description: 'API configuration',
      },
      {
        id: 'security-settings',
        label: 'Security Settings',
        icon: Shield,
        href: '/admin/system/security',
        description: 'Security configuration',
      },
    ],
  },

  // Audit & Security
  {
    id: 'audit-security',
    label: 'Audit & Security',
    icon: Shield,
    description: 'Audit and security logs',
    children: [
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        icon: FileText,
        href: '/admin/audit/logs',
        description: 'View audit logs',
      },
      {
        id: 'error-logs',
        label: 'Error Logs',
        icon: AlertCircle,
        href: '/admin/audit/error-logs',
        description: 'View error logs',
      },
      {
        id: 'access-logs',
        label: 'Access Logs',
        icon: Eye,
        href: '/admin/audit/access-logs',
        description: 'View access logs',
      },
      {
        id: 'system-activity',
        label: 'System Activity',
        icon: Eye,
        href: '/admin/audit/system-activity',
        description: 'Monitor system activity',
      },
    ],
  },
];

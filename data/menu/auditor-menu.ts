import {
  LayoutDashboard,
  Package,
  Truck,
  Warehouse,
  FileText,
  CreditCard,
  Receipt,
  Scale,
  FileCheck,
  ClipboardList,
  LogIn,
  AlertTriangle,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

export interface AuditorMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: AuditorMenuItem[];
  description?: string;
}

export const auditorMenu: AuditorMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/audit/dashboard',
    description: 'Audit activity overview',
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: Package,
    description: 'Read-only operations view',
    children: [
      {
        id: 'all-shipments',
        label: 'All Shipments',
        icon: Package,
        href: '/audit/shipments',
        description: 'Read-only view of all shipments',
      },
      {
        id: 'all-dispatches',
        label: 'All Dispatches',
        icon: Truck,
        href: '/audit/dispatches',
        description: 'Read-only dispatch records',
      },
      {
        id: 'fleet-records',
        label: 'Fleet Records',
        icon: Truck,
        href: '/audit/fleet',
        description: 'Read-only fleet data',
      },
      {
        id: 'warehouse-records',
        label: 'Warehouse Records',
        icon: Warehouse,
        href: '/audit/warehouse',
        description: 'Read-only warehouse data',
      },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: CreditCard,
    description: 'Read-only finance view',
    children: [
      {
        id: 'invoices',
        label: 'Invoices',
        icon: FileText,
        href: '/audit/finance/invoices',
        description: 'Read-only invoice view',
      },
      {
        id: 'payments',
        label: 'Payments',
        icon: CreditCard,
        href: '/audit/finance/payments',
        description: 'Read-only payment records',
      },
      {
        id: 'expenses',
        label: 'Expenses',
        icon: Receipt,
        href: '/audit/finance/expenses',
        description: 'Read-only expense records',
      },
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: Scale,
    description: 'Read-only compliance view',
    children: [
      {
        id: 'customs-declarations',
        label: 'Customs Declarations',
        icon: FileCheck,
        href: '/audit/compliance/customs',
        description: 'Read-only customs data',
      },
      {
        id: 'license-records',
        label: 'License Records',
        icon: FileCheck,
        href: '/audit/compliance/licenses',
        description: 'Read-only license data',
      },
    ],
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    icon: ClipboardList,
    description: 'System audit trails',
    children: [
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        icon: ClipboardList,
        href: '/audit/logs',
        description: 'Full audit trail',
      },
      {
        id: 'access-logs',
        label: 'Access Logs',
        icon: LogIn,
        href: '/audit/access-logs',
        description: 'User access history',
      },
      {
        id: 'error-logs',
        label: 'Error Logs',
        icon: AlertTriangle,
        href: '/audit/error-logs',
        description: 'System error records',
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    description: 'Audit reports',
    children: [
      {
        id: 'audit-reports',
        label: 'Audit Reports',
        icon: BarChart3,
        href: '/audit/reports',
        description: 'Compliance and audit reports',
      },
    ],
  },
];

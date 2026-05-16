import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  FileText,
  BarChart3,
  Bell,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: MenuItem[];
  description?: string;
}

export const staffMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/staff/dashboard',
    description: 'Staff task overview',
  },
  {
    id: 'shipments',
    label: 'Shipments',
    icon: Package,
    description: 'Shipment management',
    children: [
      {
        id: 'shipments-list',
        label: 'Shipments',
        icon: Package,
        href: '/staff/shipments',
        description: 'View shipments + create pending entries',
      },
      {
        id: 'orders',
        label: 'Orders',
        icon: ShoppingCart,
        href: '/staff/orders',
        description: 'View and assist with orders',
      },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    href: '/staff/customers',
    description: 'View customer records',
  },
  {
    id: 'warehouse',
    label: 'Warehouse',
    icon: Warehouse,
    description: 'Warehouse operations',
    children: [
      {
        id: 'warehouse-view',
        label: 'Warehouse',
        icon: Warehouse,
        href: '/staff/warehouse',
        description: 'View warehouse data',
      },
      {
        id: 'damage',
        label: 'Damage Reports',
        icon: AlertTriangle,
        href: '/staff/warehouse/damage',
        description: 'File damage report (pending approval)',
      },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    href: '/staff/documents',
    description: 'Upload shipment documents',
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: FileText,
    description: 'Financial view',
    children: [
      {
        id: 'invoices',
        label: 'Invoices',
        icon: FileText,
        href: '/staff/finance/invoices',
        description: 'View invoices (read only)',
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    href: '/staff/reports',
    description: 'View available reports',
  },
  {
    id: 'misc',
    label: 'Misc',
    icon: Bell,
    description: 'Notifications',
    children: [
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        href: '/staff/notifications',
        description: 'Notifications and alerts',
      },
    ],
  },
];

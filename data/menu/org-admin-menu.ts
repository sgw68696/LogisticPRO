import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Users,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: MenuItem[];
}

export const orgAdminMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard as LucideIcon,
    href: '/orgadmin/dashboard',
  },
  {
    id: 'companies',
    label: 'Companies',
    icon: Building2 as LucideIcon,
    href: '/orgadmin/companies',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3 as LucideIcon,
    href: '/orgadmin/analytics',
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users as LucideIcon,
    href: '/orgadmin/users',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings as LucideIcon,
    href: '/orgadmin/settings',
  },
];

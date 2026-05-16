import {
  LayoutDashboard,
  Ship,
  Plane,
  Anchor,
  Package,
  FileText,
  ArrowLeftRight,
  DollarSign,
  Folder,
  BarChart2,
  Bell,
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

export const portMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/port/dashboard',
    description: 'Port activity overview',
  },
  {
    id: 'arrivals-departures',
    label: 'Arrivals & Departures',
    icon: Ship,
    description: 'Manage arrivals and departures',
    children: [
      { id: 'vessels', label: 'Vessel Schedule', icon: Ship, href: '/port/vessels', description: 'Vessel arrival and departure schedule' },
      { id: 'flights', label: 'Flight Schedule', icon: Plane, href: '/port/flights', description: 'Flight arrival and departure schedule' },
      { id: 'berths', label: 'Berth Allocation', icon: Anchor, href: '/port/berths', description: 'Manage berth assignments' },
    ],
  },
  {
    id: 'cargo',
    label: 'Cargo',
    icon: Package,
    description: 'Cargo operations',
    children: [
      { id: 'containers', label: 'Container List', icon: Package, href: '/port/containers', description: 'Containers in port' },
      { id: 'manifests', label: 'Cargo Manifest', icon: FileText, href: '/port/manifests', description: 'View cargo manifests' },
      { id: 'cargo-log', label: 'Offload / Load Log', icon: ArrowLeftRight, href: '/port/cargo-log', description: 'Cargo handling records' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    description: 'Financial operations',
    children: [
      { id: 'charges', label: 'Port Charges', icon: DollarSign, href: '/port/charges', description: 'Port handling charges' },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: Folder,
    description: 'Document management',
    children: [
      { id: 'port-docs', label: 'Port Documents', icon: Folder, href: '/port/documents', description: 'Arrival notices, manifests' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart2,
    description: 'Port reports',
    children: [
      { id: 'port-reports', label: 'Port Reports', icon: BarChart2, href: '/port/reports', description: 'Port activity reports' },
    ],
  },
  {
    id: 'misc',
    label: 'Misc',
    icon: Bell,
    description: 'Notifications',
    children: [
      { id: 'notifications', label: 'Notifications', icon: Bell, href: '/port/notifications', description: 'Port alerts and updates' },
    ],
  },
];

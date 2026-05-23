import {
  LayoutDashboard,
  Box,
  AlertCircle,
  Truck,
  Users,
  TrendingUp,
  Map,
  FileText,
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

export const opsMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/ops/dashboard',
    description: 'Dispatch and fleet overview',
  },
  {
    id: 'shipments',
    label: 'Shipments',
    icon: Box,
    description: 'Shipment management',
    children: [
      { id: 'shipments-list', label: 'Shipments', icon: Box, href: '/ops/shipments', description: 'View assigned shipments' },
      { id: 'container-tracking', label: 'Container Tracking', icon: Box, href: '/ops/container-tracking', description: 'Track container movements' },
      { id: 'sla-alerts', label: 'SLA Alerts', icon: AlertCircle, href: '/ops/sla-alerts', description: 'Active breach and delay alerts' },
    ],
  },
  {
    id: 'dispatch',
    label: 'Dispatch',
    icon: Truck,
    description: 'Dispatch management',
    children: [
      { id: 'dispatch-board', label: 'Dispatch Board', icon: Truck, href: '/ops/dispatch', description: 'Manage dispatch assignments' },
      { id: 'drivers', label: 'Drivers', icon: Users, href: '/ops/drivers', description: 'View driver status and assignments' },
      { id: 'fleet', label: 'Fleet', icon: TrendingUp, href: '/ops/fleet', description: 'View fleet and vehicle status' },
      { id: 'live-map', label: 'Live Map', icon: Map, href: '/ops/live-map', description: 'Real-time vehicle tracking map' },
      { id: 'trip-history', label: 'Trip History', icon: TrendingUp, href: '/ops/fleet/trips', description: 'Completed trip logs' },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    href: '/ops/documents',
    description: 'View shipment documents (read only)',
  },
  {
    id: 'misc',
    label: 'Misc',
    icon: Bell,
    description: 'Notifications',
    children: [
      { id: 'notifications', label: 'Notifications', icon: Bell, href: '/ops/notifications', description: 'Operational notifications' },
    ],
  },
];

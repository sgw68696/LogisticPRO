import {
  LayoutDashboard, Route, Package, Navigation,
  FileCheck, Wallet, Bell, User, MapPin,
  Truck, Clock, type LucideIcon,
} from 'lucide-react';
import type { MenuItem } from '@/components/layout/Sidebar/AppSidebar.types';

export const driverMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/driver/dashboard',
  },
  {
    id: 'trips',
    label: 'My Trips',
    icon: Route,
    href: '/driver/trips',
  },
  {
    id: 'deliveries',
    label: 'Deliveries',
    icon: Package,
    description: 'Current assignments',
    children: [
      {
        id: 'current-deliveries',
        label: 'Current Deliveries',
        icon: Package,
        href: '/driver/deliveries',
      },
      {
        id: 'pod',
        label: 'Proof of Delivery',
        icon: FileCheck,
        href: '/driver/pod',
      },
    ],
  },
  {
    id: 'earnings',
    label: 'Earnings',
    icon: Wallet,
    href: '/driver/earnings',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    href: '/driver/profile',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    href: '/driver/notifications',
  },
];

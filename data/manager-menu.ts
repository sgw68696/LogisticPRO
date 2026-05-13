import {
  LayoutDashboard,
  Calendar,
  Package,
  Truck,
  FileText,
  Map,
  AlertTriangle,
  Users,
  Wrench,
  Warehouse,
  Building2,
  ShieldCheck,
  DollarSign,
  BarChart3,
  Bell,
  Settings,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
  children?: MenuItem[];
  description?: string;
}

export const managerMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/manager/dashboard',
    description: 'Operational overview and KPIs',
  },

  // Bookings
  {
    id: 'bookings',
    label: 'Bookings',
    icon: Calendar,
    description: 'Manage bookings and rates',
    children: [
      {
        id: 'new-booking',
        label: 'New Booking',
        icon: Calendar,
        href: '/manager/bookings/new',
        description: 'Create a new shipment booking',
      },
      {
        id: 'all-bookings',
        label: 'All Bookings',
        icon: Package,
        href: '/manager/bookings',
        description: 'View and manage bookings',
      },
      {
        id: 'rate-cards',
        label: 'Rate Cards',
        icon: DollarSign,
        href: '/manager/rates/cards',
        description: 'View available rate cards',
      },
    ],
  },

  // Shipments
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
        href: '/manager/shipments',
        description: 'View and manage shipments',
      },
      {
        id: 'orders',
        label: 'Orders',
        icon: FileText,
        href: '/manager/orders',
        description: 'View and manage orders',
      },
      {
        id: 'bol',
        label: 'BOL',
        icon: FileText,
        href: '/manager/bol',
        description: 'Bill of lading management',
      },
      {
        id: 'live-map',
        label: 'Live Map',
        icon: Map,
        href: '/manager/live-map',
        description: 'Real-time shipment and fleet map',
      },
      {
        id: 'sla-alerts',
        label: 'SLA Alerts',
        icon: AlertTriangle,
        href: '/manager/sla-alerts',
        description: 'Live breach and delay alerts',
      },
    ],
  },

  // Documents
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    description: 'Document management',
    children: [
      {
        id: 'all-documents',
        label: 'Documents',
        icon: FileText,
        href: '/manager/documents',
        description: 'View all shipment documents',
      },
    ],
  },

  // Dispatch & Fleet
  {
    id: 'dispatch-fleet',
    label: 'Dispatch & Fleet',
    icon: Truck,
    description: 'Dispatch and fleet management',
    children: [
      {
        id: 'dispatch-board',
        label: 'Dispatch Board',
        icon: Truck,
        href: '/manager/dispatch',
        description: 'Manage dispatch assignments',
      },
      {
        id: 'drivers',
        label: 'Drivers',
        icon: Users,
        href: '/manager/drivers',
        description: 'View and manage drivers',
      },
      {
        id: 'fleet',
        label: 'Fleet',
        icon: Truck,
        href: '/manager/fleet',
        description: 'View and manage fleet',
      },
      {
        id: 'live-gps',
        label: 'Live GPS',
        icon: Map,
        href: '/manager/fleet/live-map',
        description: 'Real-time vehicle tracking',
      },
      {
        id: 'trip-history',
        label: 'Trip History',
        icon: FileText,
        href: '/manager/fleet/trips',
        description: 'Completed trip logs',
      },
      {
        id: 'maintenance',
        label: 'Maintenance',
        icon: Wrench,
        href: '/manager/fleet/maintenance',
        description: 'Maintenance schedule',
      },
      {
        id: 'fuel-logs',
        label: 'Fuel Logs',
        icon: DollarSign,
        href: '/manager/fleet/fuel',
        description: 'Fuel consumption records',
      },
    ],
  },

  // Warehouse
  {
    id: 'warehouse',
    label: 'Warehouse',
    icon: Warehouse,
    description: 'Warehouse operations',
    children: [
      {
        id: 'inbound',
        label: 'Inbound (GRN)',
        icon: Warehouse,
        href: '/manager/warehouse/inbound',
        description: 'Goods received notes',
      },
      {
        id: 'outbound',
        label: 'Outbound (GDN)',
        icon: Warehouse,
        href: '/manager/warehouse/outbound',
        description: 'Goods dispatch notes',
      },
      {
        id: 'stock',
        label: 'Stock Positions',
        icon: Package,
        href: '/manager/warehouse/stock',
        description: 'Current stock levels',
      },
      {
        id: 'damage',
        label: 'Damage Reports',
        icon: AlertTriangle,
        href: '/manager/warehouse/damage',
        description: 'Damage records',
      },
    ],
  },

  // Customers
  {
    id: 'customers',
    label: 'Customers',
    icon: Building2,
    description: 'Customer management',
    children: [
      {
        id: 'customers-list',
        label: 'Customers',
        icon: Building2,
        href: '/manager/customers',
        description: 'View and manage customers',
      },
    ],
  },

  // Compliance
  {
    id: 'compliance',
    label: 'Compliance',
    icon: ShieldCheck,
    description: 'Compliance management',
    children: [
      {
        id: 'customs',
        label: 'Customs Declarations',
        icon: FileText,
        href: '/manager/compliance/customs',
        description: 'View customs status',
      },
      {
        id: 'dg',
        label: 'Dangerous Goods',
        icon: AlertTriangle,
        href: '/manager/compliance/dg',
        description: 'DG shipment view',
      },
    ],
  },

  // Finance
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    description: 'Financial overview',
    children: [
      {
        id: 'financial-overview',
        label: 'Financial Overview',
        icon: DollarSign,
        href: '/manager/finance/overview',
        description: 'P&L at org level',
      },
    ],
  },

  // Reports
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    description: 'Reports and analytics',
    children: [
      {
        id: 'shipment-reports',
        label: 'Shipment Reports',
        icon: BarChart3,
        href: '/manager/reports/shipments',
        description: 'Shipment-level reporting',
      },
      {
        id: 'performance-reports',
        label: 'Performance Reports',
        icon: BarChart3,
        href: '/manager/reports/performance',
        description: 'Team performance KPIs',
      },
      {
        id: 'carrier-performance',
        label: 'Carrier Performance',
        icon: BarChart3,
        href: '/manager/reports/carrier-performance',
        description: 'Carrier score and SLA',
      },
      {
        id: 'sla-reports',
        label: 'SLA Reports',
        icon: BarChart3,
        href: '/manager/reports/sla',
        description: 'SLA compliance tracking',
      },
    ],
  },

  // Misc
  {
    id: 'misc',
    label: 'Misc',
    icon: Bell,
    description: 'Notifications and settings',
    children: [
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        href: '/manager/notifications',
        description: 'Manage notifications',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        href: '/manager/settings',
        description: 'Profile settings only',
      },
    ],
  },
];

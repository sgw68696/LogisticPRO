import {
  LayoutDashboard,
  Package,
  MapPin,
  PlusCircle,
  ClipboardList,
  FileText,
  CreditCard,
  Receipt,
  MessageSquare,
  Bell,
  type LucideIcon,
} from 'lucide-react';

export interface CustomerPortalMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: CustomerPortalMenuItem[];
  description?: string;
}

export const customerPortalMenu: CustomerPortalMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/portal/dashboard',
    description: 'Shipment and invoice overview',
  },
  {
    id: 'my-shipments',
    label: 'My Shipments',
    icon: Package,
    description: 'Track and manage shipments',
    children: [
      {
        id: 'shipments',
        label: 'Shipments',
        icon: Package,
        href: '/portal/shipments',
        description: 'Track all my shipments',
      },
      {
        id: 'live-tracking',
        label: 'Live Tracking',
        icon: MapPin,
        href: '/portal/tracking',
        description: 'Real-time shipment location',
      },
    ],
  },
  {
    id: 'bookings',
    label: 'Bookings',
    icon: ClipboardList,
    description: 'Manage bookings',
    children: [
      {
        id: 'new-booking',
        label: 'New Booking',
        icon: PlusCircle,
        href: '/portal/bookings/new',
        description: 'Request a new shipment booking',
      },
      {
        id: 'my-bookings',
        label: 'My Bookings',
        icon: ClipboardList,
        href: '/portal/bookings',
        description: 'View all my bookings',
      },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    description: 'Access your documents',
    children: [
      {
        id: 'my-documents',
        label: 'My Documents',
        icon: FileText,
        href: '/portal/documents',
        description: 'Download BOL, invoice, POD',
      },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: CreditCard,
    description: 'View financial records',
    children: [
      {
        id: 'my-invoices',
        label: 'My Invoices',
        icon: Receipt,
        href: '/portal/invoices',
        description: 'View and download invoices',
      },
      {
        id: 'payment-history',
        label: 'Payment History',
        icon: CreditCard,
        href: '/portal/payments',
        description: 'View payment records',
      },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    icon: MessageSquare,
    description: 'Get help and support',
    children: [
      {
        id: 'raise-query',
        label: 'Raise a Query',
        icon: PlusCircle,
        href: '/portal/support/new',
        description: 'Submit a new query or complaint',
      },
      {
        id: 'my-queries',
        label: 'My Queries',
        icon: MessageSquare,
        href: '/portal/support',
        description: 'Track open and closed queries',
      },
    ],
  },
  {
    id: 'misc',
    label: 'Misc',
    icon: Bell,
    description: 'Notifications and alerts',
    children: [
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        href: '/portal/notifications',
        description: 'Shipment and invoice alerts',
      },
    ],
  },
];

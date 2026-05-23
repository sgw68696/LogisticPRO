import {
  LayoutDashboard,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  BadgeCheck,
  AlertTriangle,
  Globe,
  Folder,
  Receipt,
  Award,
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

export const customsMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/customs/dashboard',
    description: 'Customs activity overview',
  },
  {
    id: 'customs',
    label: 'Customs',
    icon: FileText,
    description: 'Customs operations',
    children: [
      { id: 'declarations', label: 'Declarations', icon: FileText, href: '/customs/declarations', description: 'View and file customs declarations' },
      { id: 'pending', label: 'Pending Clearance', icon: Clock, href: '/customs/pending', description: 'Shipments awaiting clearance' },
      { id: 'cleared', label: 'Cleared Shipments', icon: CheckCircle, href: '/customs/cleared', description: 'Completed clearances' },
      { id: 'holds', label: 'Holds & Queries', icon: AlertCircle, href: '/customs/holds', description: 'Shipments on hold or queried' },
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: BadgeCheck,
    description: 'Compliance management',
    children: [
      { id: 'hs-codes', label: 'HS Code Lookup', icon: Search, href: '/customs/hs-codes', description: 'Search and apply HS codes' },
      { id: 'licenses', label: 'Import/Export Licenses', icon: BadgeCheck, href: '/customs/licenses', description: 'View applicable licenses' },
      { id: 'dg', label: 'Dangerous Goods', icon: AlertTriangle, href: '/customs/dg', description: 'DG declarations and rules' },
      { id: 'restrictions', label: 'Country Restrictions', icon: Globe, href: '/customs/restrictions', description: 'View import/export restrictions' },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: Folder,
    description: 'Document management',
    children: [
      { id: 'customs-docs', label: 'Customs Documents', icon: Folder, href: '/customs/documents', description: 'Declarations, COO, DGD' },
      { id: 'invoices', label: 'Commercial Invoices', icon: Receipt, href: '/customs/documents/invoices', description: 'View commercial invoices' },
      { id: 'coo', label: 'Certificates of Origin', icon: Award, href: '/customs/documents/coo', description: 'View and file COO' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart2,
    description: 'Customs reports',
    children: [
      { id: 'clearance-reports', label: 'Clearance Reports', icon: BarChart2, href: '/customs/reports', description: 'Customs activity reports' },
    ],
  },
  {
    id: 'misc',
    label: 'Misc',
    icon: Bell,
    description: 'Notifications',
    children: [
      { id: 'notifications', label: 'Notifications', icon: Bell, href: '/customs/notifications', description: 'Customs alerts and updates' },
    ],
  },
];

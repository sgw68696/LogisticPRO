import {
  ClipboardList,
  LayoutPanelTop,
  Container,
  Truck,
  FileSpreadsheet,
  Map,
  FileText,
  Network,
  ClipboardCheck,
  Calendar,
  BarChart3,
  Home,
  type LucideIcon,
} from 'lucide-react';
import type { MenuItem } from '@/components/layout/Sidebar/AppSidebar.types';
import type { CompanyOperationalType } from '@/types/company-operational-types';

const COMPANY_TYPE_MODULES: MenuItem[] = [
  { id: 'ct-home', label: 'Home', icon: Home as LucideIcon, href: '/company/home' },
  { id: 'ct-planning', label: 'Planning List', icon: ClipboardList as LucideIcon, href: '/company/planning' },
  { id: 'ct-production', label: 'Production Line List', icon: LayoutPanelTop as LucideIcon, href: '/company/production-lines' },
  { id: 'ct-shipment-lines', label: 'Shipment Line List', icon: Container as LucideIcon, href: '/company/shipment-lines' },
  { id: 'ct-delivery-lines', label: 'Delivery Line List', icon: Truck as LucideIcon, href: '/company/delivery-lines' },
  { id: 'ct-documents', label: 'Operational Documents', icon: FileSpreadsheet as LucideIcon, href: '/company/operational-documents' },
  { id: 'ct-carrier-tracking', label: 'Carrier Tracking', icon: Map as LucideIcon, href: '/company/carrier-tracking' },
  { id: 'ct-contracts', label: 'Contract Holders', icon: FileText as LucideIcon, href: '/company/contract-holders' },
  { id: 'ct-edi', label: 'EDI List', icon: Network as LucideIcon, href: '/company/edi' },
  { id: 'ct-container-reports', label: 'Container Report', icon: ClipboardCheck as LucideIcon, href: '/company/container-reports' },
  { id: 'ct-ata-update', label: 'Update ATA', icon: Calendar as LucideIcon, href: '/company/ata-update' },
  { id: 'ct-reporting', label: 'Reporting', icon: BarChart3 as LucideIcon, href: '/company/reporting' },
];

export const COMPANY_TYPE_MENU_MAP: Record<CompanyOperationalType, MenuItem[]> = {
  standard: [],
  custom_agent: COMPANY_TYPE_MODULES,
  destination_agent: COMPANY_TYPE_MODULES,
  origin_agent: COMPANY_TYPE_MODULES,
  transporter: COMPANY_TYPE_MODULES,
  trucking_agent: COMPANY_TYPE_MODULES,
};

export const ENABLED_MODULES_BY_TYPE: Record<CompanyOperationalType, string[]> = {
  standard: [],
  custom_agent: COMPANY_TYPE_MODULES.map((m) => m.id),
  destination_agent: COMPANY_TYPE_MODULES.map((m) => m.id),
  origin_agent: COMPANY_TYPE_MODULES.map((m) => m.id),
  transporter: COMPANY_TYPE_MODULES.map((m) => m.id),
  trucking_agent: COMPANY_TYPE_MODULES.map((m) => m.id),
};

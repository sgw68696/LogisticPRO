import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: MenuItem[];
}

export interface SidebarRoleConfig {
  roleLabel: string;
  brandName: string;
  brandHighlight?: string;
  logoSrc: string;
  homeHref: string;
  accentColor?: string;
}
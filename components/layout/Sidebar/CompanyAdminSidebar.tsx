'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Archive,
  Bell,
  Boxes,
  BriefcaseBusiness,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileArchive,
  FileCheck2,
  FileCog,
  FileText,
  Fuel,
  Gauge,
  Landmark,
  LayoutDashboard,
  LogOut,
  Map,
  MapPinned,
  PackageCheck,
  PackagePlus,
  ReceiptText,
  Route,
  Settings,
  ShieldCheck,
  ShipWheel,
  Truck,
  Users,
  Warehouse,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface CompanyMenuItem {
  id: string;
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: CompanyMenuItem[];
}

const companyAdminMenu: CompanyMenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/company/dashboard', icon: LayoutDashboard },
  {
    id: 'bookings-rates',
    label: 'Bookings & Rates',
    icon: PackagePlus,
    children: [
      { id: 'new-booking', label: 'New Booking', href: '/company/bookings/new', icon: PackagePlus },
      { id: 'booking-requests', label: 'Booking Requests', href: '/company/bookings/requests', icon: ClipboardList },
      { id: 'all-bookings', label: 'All Bookings', href: '/company/bookings', icon: PackageCheck },
      { id: 'rate-cards', label: 'Rate Cards', href: '/company/rates/cards', icon: ReceiptText },
      { id: 'spot-rates', label: 'Spot Rate Requests', href: '/company/rates/spot', icon: Gauge },
      { id: 'contract-rates', label: 'Contract Rates', href: '/company/rates/contracts', icon: FileCheck2 },
    ],
  },
  {
    id: 'shipments',
    label: 'Shipments',
    icon: Truck,
    children: [
      { id: 'shipments-all', label: 'Shipments', href: '/company/shipments', icon: Truck },
      { id: 'orders', label: 'Orders', href: '/company/orders', icon: ClipboardCheck },
      { id: 'bol', label: 'Bill of Lading', href: '/company/bol', icon: FileText },
      { id: 'container-tracking', label: 'Container Tracking', href: '/company/container-tracking', icon: Boxes },
      { id: 'live-map', label: 'Live Map', href: '/company/live-map', icon: Map },
      { id: 'sla-alerts', label: 'SLA Alerts', href: '/company/sla-alerts', icon: Bell },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileArchive,
    children: [
      { id: 'documents-all', label: 'All Documents', href: '/company/documents', icon: FileArchive },
      { id: 'documents-bol', label: 'BOL', href: '/company/documents/bol', icon: FileText },
      { id: 'packing-lists', label: 'Packing Lists', href: '/company/documents/packing-lists', icon: Archive },
      { id: 'commercial-invoices', label: 'Commercial Invoices', href: '/company/documents/commercial-invoices', icon: ReceiptText },
      { id: 'coo', label: 'Certificates of Origin', href: '/company/documents/coo', icon: ShieldCheck },
      { id: 'insurance', label: 'Insurance Certificates', href: '/company/documents/insurance', icon: FileCheck2 },
      { id: 'pod', label: 'POD', href: '/company/documents/pod', icon: ClipboardCheck },
    ],
  },
  {
    id: 'compliance-customs',
    label: 'Compliance & Customs',
    icon: ShieldCheck,
    children: [
      { id: 'customs-declarations', label: 'Customs Declarations', href: '/company/compliance/customs', icon: FileCog },
      { id: 'hs-codes', label: 'HS Codes', href: '/company/compliance/hs-codes', icon: ReceiptText },
      { id: 'licenses', label: 'Import/Export Licenses', href: '/company/compliance/licenses', icon: FileCheck2 },
      { id: 'dangerous-goods', label: 'Dangerous Goods', href: '/company/compliance/dg', icon: ShieldCheck },
    ],
  },
  {
    id: 'dispatch-fleet',
    label: 'Dispatch & Fleet',
    icon: Route,
    children: [
      { id: 'dispatch-board', label: 'Dispatch Board', href: '/company/dispatch', icon: Route },
      { id: 'drivers', label: 'Drivers', href: '/company/drivers', icon: Users },
      { id: 'driver-docs', label: 'Driver Documents', href: '/company/fleet/driver-docs', icon: FileCheck2 },
      { id: 'fleet', label: 'Fleet', href: '/company/fleet', icon: Truck },
      { id: 'vehicle-docs', label: 'Vehicle Documents', href: '/company/fleet/vehicle-docs', icon: FileText },
      { id: 'fleet-live-map', label: 'Live GPS Tracking', href: '/company/fleet/live-map', icon: MapPinned },
      { id: 'trips', label: 'Trip History', href: '/company/fleet/trips', icon: Route },
      { id: 'maintenance', label: 'Maintenance', href: '/company/fleet/maintenance', icon: Wrench },
      { id: 'fuel', label: 'Fuel Logs', href: '/company/fleet/fuel', icon: Fuel },
    ],
  },
  {
    id: 'warehouse',
    label: 'Warehouse',
    icon: Warehouse,
    children: [
      { id: 'inbound', label: 'Inbound (GRN)', href: '/company/warehouse/inbound', icon: PackagePlus },
      { id: 'outbound', label: 'Outbound (GDN)', href: '/company/warehouse/outbound', icon: PackageCheck },
      { id: 'stock', label: 'Stock Positions', href: '/company/warehouse/stock', icon: Boxes },
      { id: 'locations', label: 'Bin / Rack Locations', href: '/company/warehouse/locations', icon: MapPinned },
      { id: 'cycle-count', label: 'Cycle Count', href: '/company/warehouse/cycle-count', icon: ClipboardCheck },
      { id: 'damage', label: 'Damage Reports', href: '/company/warehouse/damage', icon: FileCog },
      { id: 'cold-chain', label: 'Cold Chain', href: '/company/warehouse/cold-chain', icon: Gauge },
      { id: 'inventory', label: 'Inventory', href: '/company/inventory', icon: Archive },
    ],
  },
  {
    id: 'customers-agents',
    label: 'Customers & Agents',
    icon: BriefcaseBusiness,
    children: [
      { id: 'customers', label: 'Customers', href: '/company/customers', icon: BriefcaseBusiness },
      { id: 'agents', label: 'Agents', href: '/company/agents', icon: Users },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: Landmark,
    children: [
      { id: 'invoices', label: 'Invoices', href: '/company/finance/invoices', icon: ReceiptText },
      { id: 'payments', label: 'Payments', href: '/company/finance/payments', icon: CreditCard },
      { id: 'expenses', label: 'Expenses', href: '/company/finance/expenses', icon: FileText },
      { id: 'reconciliation', label: 'Reconciliation', href: '/company/finance/reconciliation', icon: ClipboardCheck },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: Gauge,
    children: [
      { id: 'shipment-reports', label: 'Shipment Reports', href: '/company/reports/shipments', icon: Truck },
      { id: 'revenue-reports', label: 'Revenue Reports', href: '/company/reports/revenue', icon: Landmark },
      { id: 'performance-reports', label: 'Performance Reports', href: '/company/reports/performance', icon: Gauge },
      { id: 'carrier-performance', label: 'Carrier Performance', href: '/company/reports/carrier-performance', icon: ShipWheel },
      { id: 'warehouse-throughput', label: 'Warehouse Throughput', href: '/company/reports/warehouse', icon: Warehouse },
    ],
  },
  {
    id: 'users-settings',
    label: 'Users & Settings',
    icon: Settings,
    children: [
      { id: 'company-users', label: 'Company Users', href: '/company/users', icon: Users },
      { id: 'roles', label: 'Roles', href: '/company/roles', icon: ShieldCheck },
      { id: 'notifications', label: 'Notifications', href: '/company/notifications', icon: Bell },
      { id: 'settings', label: 'Settings', href: '/company/settings', icon: Settings },
    ],
  },
];

export function CompanyAdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const toggleMenu = (menuId: string) => {
    const nextExpanded = new Set(expandedMenus);
    if (nextExpanded.has(menuId)) {
      nextExpanded.delete(menuId);
    } else {
      nextExpanded.add(menuId);
    }
    setExpandedMenus(nextExpanded);
  };

  const isMenuActive = (item: CompanyMenuItem): boolean => {
    if (item.href) {
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }
    return item.children?.some(child => isMenuActive(child)) ?? false;
  };

  const itemClassName = (isActive: boolean) => cn(
    "group relative flex items-center gap-2.5 rounded-[10px] text-sm font-medium",
    "transition-all duration-200 overflow-hidden text-left",
    collapsed ? "px-0 py-2.5 justify-center" : "px-3.5 py-2.5",
    isActive
      ? "bg-white/10 text-white border border-white/15"
      : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100"
  );

  const activeRail = (isActive: boolean) => (
    <span
      className={cn(
        "absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm bg-slate-200 transition-opacity duration-200",
        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-80"
      )}
    />
  );

  const withCollapsedTooltip = (label: string, children: React.ReactNode) => {
    if (!collapsed) return children;
    return (
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="bg-zinc-900 text-zinc-100 border-white/10">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  };

  const renderMenuItems = (items: CompanyMenuItem[]) => items.map((item) => {
    const isActive = isMenuActive(item);
    const isExpanded = expandedMenus.has(item.id);
    const children = item.children ?? [];
    const hasChildren = children.length > 0;
    const Icon = item.icon;

    return (
      <div key={item.id}>
        {hasChildren ? withCollapsedTooltip(
          item.label,
          <button onClick={() => toggleMenu(item.id)} className={itemClassName(isActive)}>
            {activeRail(isActive)}
            <Icon className="w-[17px] h-[17px] flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="whitespace-nowrap flex-1">{item.label}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-180")} />
              </>
            )}
          </button>
        ) : withCollapsedTooltip(
          item.label,
          <Link href={item.href!} className={itemClassName(isActive)}>
            {activeRail(isActive)}
            <Icon className="w-[17px] h-[17px] flex-shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </Link>
        )}

        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-2 mt-1 border-l border-white/10 pl-2">
            {renderMenuItems(children)}
          </div>
        )}
      </div>
    );
  });

  return (
    <TooltipProvider delayDuration={0}>
      <style>{`
        .company-sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .company-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .company-sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 99px; }
        .company-sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
        .company-sidebar-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.18) transparent; }
      `}</style>

      <aside
        className={cn(
          "relative flex flex-col h-screen overflow-visible transition-all duration-300 ease-out",
          "bg-zinc-950 border-r border-white/10",
          collapsed ? "w-[72px]" : "w-[280px]"
        )}
      >
        <div
          className={cn(
            "relative z-10 flex items-center h-16 border-b border-white/10 flex-shrink-0",
            collapsed ? "justify-center px-2" : "px-4"
          )}
        >
          <Link href="/company/dashboard" className={cn("flex items-center overflow-hidden transition-all duration-300", collapsed ? "justify-center" : "gap-3")}>
            <div className="brand flex items-center justify-center">
              <Image src="/LogisticsProLogo-bg.png" alt="Logo" width={100} height={100} className="bg-white/20 rounded-lg" />
            </div>
            <div className={cn("flex flex-col leading-tight transition-all duration-300 origin-left", collapsed ? "w-0 opacity-0 scale-95 -translate-x-2" : "w-auto opacity-100 scale-100 translate-x-0")}>
              <span className="text-[1.02rem] font-extrabold text-zinc-50 tracking-tight whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Logistics<span className="text-zinc-300">Pro</span>
              </span>
              <span className="text-[0.58rem] text-zinc-400 uppercase tracking-[1.8px] font-medium whitespace-nowrap">
                CompanyAdmin
              </span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 flex-1 min-h-0 py-3">
          <div className={cn("company-sidebar-scroll h-full overflow-y-auto", collapsed ? "px-2" : "px-3")}>
            <nav className="flex flex-col gap-1">{renderMenuItems(companyAdminMenu)}</nav>
          </div>
        </div>

        <div className={cn("relative z-10 border-t border-white/10 flex-shrink-0", collapsed ? "p-2" : "p-4")}>
          {!collapsed && user && (
            <div className="mb-2.5 px-3 py-2 rounded-[10px] bg-white/[0.04] border border-white/10">
              <p className="text-[0.85rem] font-semibold text-zinc-100 truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {user.name}
              </p>
              <p className="text-[0.68rem] text-zinc-400 uppercase tracking-[0.5px] font-medium">
                CompanyAdmin
              </p>
            </div>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className={cn(
                  "group w-full flex items-center gap-2.5 rounded-[10px]",
                  "bg-white/[0.04] border border-white/10",
                  "text-slate-400 text-[0.85rem] font-medium",
                  "transition-all duration-200 cursor-pointer",
                  "hover:bg-red-500/10 hover:border-red-500/25 hover:text-red-200",
                  collapsed ? "justify-center p-2.5" : "px-3 py-2.5"
                )}
              >
                <LogOut className="w-[17px] h-[17px] flex-shrink-0" />
                {!collapsed && <span>Logout</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" sideOffset={12} className="bg-zinc-900 text-zinc-100 border-white/10">
                Logout
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute top-[72px] -right-3 z-20",
            "w-6 h-6 rounded-full flex items-center justify-center",
            "bg-zinc-900 border border-white/15 text-zinc-300",
            "shadow-[0_2px_8px_rgba(0,0,0,0.4)]",
            "transition-all duration-200 cursor-pointer",
            "hover:bg-zinc-800 hover:border-white/30 hover:scale-110"
          )}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>
    </TooltipProvider>
  );
}

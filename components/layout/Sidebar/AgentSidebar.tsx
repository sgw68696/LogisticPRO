'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  ChevronLeft, ChevronRight, LogOut, ChevronDown,
  Package, ClipboardList, PackagePlus, PackageMinus, LayoutGrid, MapPin, AlertTriangle,
  Route, FileCheck, Navigation, Receipt,
  FileText, CreditCard, RefreshCcw,
  Users, Folder, BarChart2, Bell,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: MenuItem[];
  visibleFor?: ('warehouse' | 'driver' | 'finance')[];
}

const agentMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/agent/dashboard',
    icon: Package,
    visibleFor: ['warehouse', 'driver', 'finance'],
  },
  {
    id: 'shipments',
    label: 'Shipments',
    icon: Package,
    visibleFor: ['warehouse', 'driver', 'finance'],
    children: [
      {
        id: 'my-shipments',
        label: 'My Shipments',
        href: '/agent/shipments',
        icon: Package,
        visibleFor: ['warehouse', 'driver', 'finance'],
      },
      {
        id: 'orders',
        label: 'Orders',
        href: '/agent/orders',
        icon: ClipboardList,
        visibleFor: ['warehouse', 'finance'],
      },
    ],
  },
  {
    id: 'warehouse',
    label: 'Warehouse',
    icon: Package,
    visibleFor: ['warehouse'],
    children: [
      {
        id: 'inbound',
        label: 'Inbound (GRN)',
        href: '/agent/warehouse/inbound',
        icon: PackagePlus,
        visibleFor: ['warehouse'],
      },
      {
        id: 'outbound',
        label: 'Outbound (GDN)',
        href: '/agent/warehouse/outbound',
        icon: PackageMinus,
        visibleFor: ['warehouse'],
      },
      {
        id: 'stock',
        label: 'Stock Positions',
        href: '/agent/warehouse/stock',
        icon: LayoutGrid,
        visibleFor: ['warehouse'],
      },
      {
        id: 'locations',
        label: 'Bin / Rack Locations',
        href: '/agent/warehouse/locations',
        icon: MapPin,
        visibleFor: ['warehouse'],
      },
      {
        id: 'damage',
        label: 'Damage Reports',
        href: '/agent/warehouse/damage',
        icon: AlertTriangle,
        visibleFor: ['warehouse'],
      },
    ],
  },
  {
    id: 'driver',
    label: 'Driver',
    icon: Route,
    visibleFor: ['driver'],
    children: [
      {
        id: 'trips',
        label: 'My Trips',
        href: '/agent/trips',
        icon: Route,
        visibleFor: ['driver'],
      },
      {
        id: 'pod',
        label: 'POD Upload',
        href: '/agent/pod',
        icon: FileCheck,
        visibleFor: ['driver'],
      },
      {
        id: 'map',
        label: 'Live Navigation',
        href: '/agent/map',
        icon: Navigation,
        visibleFor: ['driver'],
      },
      {
        id: 'expenses',
        label: 'Fuel / Expense Claims',
        href: '/agent/expenses',
        icon: Receipt,
        visibleFor: ['driver'],
      },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: CreditCard,
    visibleFor: ['finance'],
    children: [
      {
        id: 'invoices',
        label: 'Invoices',
        href: '/agent/finance/invoices',
        icon: FileText,
        visibleFor: ['finance'],
      },
      {
        id: 'payments',
        label: 'Payments',
        href: '/agent/finance/payments',
        icon: CreditCard,
        visibleFor: ['finance'],
      },
      {
        id: 'reconciliation',
        label: 'Reconciliation',
        href: '/agent/finance/reconciliation',
        icon: RefreshCcw,
        visibleFor: ['finance'],
      },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    href: '/agent/customers',
    icon: Users,
    visibleFor: ['warehouse', 'finance'],
  },
  {
    id: 'misc',
    label: 'Misc',
    icon: Folder,
    visibleFor: ['warehouse', 'driver', 'finance'],
    children: [
      {
        id: 'documents',
        label: 'Documents',
        href: '/agent/documents',
        icon: Folder,
        visibleFor: ['warehouse', 'driver', 'finance'],
      },
      {
        id: 'reports',
        label: 'My Reports',
        href: '/agent/reports',
        icon: BarChart2,
        visibleFor: ['warehouse', 'driver', 'finance'],
      },
      {
        id: 'notifications',
        label: 'Notifications',
        href: '/agent/notifications',
        icon: Bell,
        visibleFor: ['warehouse', 'driver', 'finance'],
      },
    ],
  },
];

export function AgentSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  // Get agentType from localStorage
  const agentType = useMemo(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      return parsed.agentType as 'warehouse' | 'driver' | 'finance';
    }
    return 'warehouse';
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const toggleMenu = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const isMenuActive = (item: MenuItem): boolean => {
    if (item.href) {
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }
    if (item.children) {
      return item.children.some(child => isMenuActive(child));
    }
    return false;
  };

  const isItemVisible = (item: MenuItem): boolean => {
    if (!item.visibleFor) return true;
    return item.visibleFor.includes(agentType);
  };

  const getVisibleChildren = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => isItemVisible(item));
  };

  const renderMenuItems = (items: MenuItem[], level = 0) => {
    const visibleItems = getVisibleChildren(items);
    
    return visibleItems.map((item) => {
      const isActive = isMenuActive(item);
      const isExpanded = expandedMenus.has(item.id);
      const children = item.children ? getVisibleChildren(item.children) : [];
      const hasChildren = children.length > 0;
      const Icon = item.icon;

      return (
        <div key={item.id}>
          {hasChildren ? (
            <button
              onClick={() => toggleMenu(item.id)}
              className={cn(
                "group relative w-full flex items-center gap-2.5 rounded-[10px] text-sm font-medium",
                "transition-all duration-200 overflow-hidden text-left",
                collapsed ? "px-0 py-2.5 justify-center" : "px-3.5 py-2.5",
                isActive
                  ? "bg-[rgba(14,165,233,0.15)] text-[#7dd3fc] border border-[rgba(14,165,233,0.25)]"
                  : "text-[rgba(148,163,184,0.8)] hover:bg-[rgba(14,165,233,0.08)] hover:text-[#e0f2fe]"
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                style={{ background: 'linear-gradient(180deg, #0ea5e9, #6366f1)' }}
              />
              <Icon className="w-[17px] h-[17px] flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="whitespace-nowrap flex-1">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      "w-[16px] h-[16px] transition-transform duration-200 flex-shrink-0",
                      isExpanded ? 'rotate-180' : ''
                    )}
                  />
                </>
              )}
            </button>
          ) : (
            <Link
              href={item.href || '#'}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-[10px] text-sm font-medium",
                "transition-all duration-200 overflow-hidden",
                collapsed ? "px-0 py-2.5 justify-center" : "px-3.5 py-2.5",
                isActive
                  ? "bg-[rgba(14,165,233,0.15)] text-[#7dd3fc] border border-[rgba(14,165,233,0.25)]"
                  : "text-[rgba(148,163,184,0.8)] hover:bg-[rgba(14,165,233,0.08)] hover:text-[#e0f2fe]"
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                style={{ background: 'linear-gradient(180deg, #0ea5e9, #6366f1)' }}
              />
              {collapsed ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Icon className="w-[17px] h-[17px] flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-[#1e293b] text-[#e0f2fe] border-0">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Icon className="w-[17px] h-[17px] flex-shrink-0" />
              )}
              {!collapsed && <span className="whitespace-nowrap flex-1">{item.label}</span>}
            </Link>
          )}

          {hasChildren && isExpanded && !collapsed && (
            <div className="flex flex-col gap-1.5 mt-1.5 ml-2.5 pl-2.5 border-l border-[rgba(14,165,233,0.2)]">
              {renderMenuItems(children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "flex flex-col bg-[#0f172a] border-r border-[rgba(14,165,233,0.1)]",
          "transition-all duration-200 overflow-hidden",
          collapsed ? "w-[70px]" : "w-[250px]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[rgba(14,165,233,0.1)]">
          {!collapsed && <span className="text-xs font-semibold text-[#e0f2fe] uppercase">Agent</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-[rgba(14,165,233,0.1)] rounded-md transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-[#7dd3fc]" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-[#7dd3fc]" />
            )}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {renderMenuItems(agentMenuItems)}
        </nav>

        {/* Footer - Logout */}
        <div className="px-3 py-4 border-t border-[rgba(14,165,233,0.1)]">
          <button
            onClick={handleLogout}
            className={cn(
              "group relative w-full flex items-center gap-2.5 rounded-[10px] text-sm font-medium",
              "transition-all duration-200 text-[rgba(148,163,184,0.8)] hover:bg-[rgba(239,68,68,0.1)] hover:text-[#fca5a5]",
              collapsed ? "px-0 py-2.5 justify-center" : "px-3.5 py-2.5"
            )}
          >
            <LogOut className="w-[17px] h-[17px] flex-shrink-0" />
            {!collapsed && <span className="whitespace-nowrap flex-1">Logout</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

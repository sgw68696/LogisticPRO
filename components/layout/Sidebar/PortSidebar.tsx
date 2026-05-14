'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  ChevronLeft, ChevronRight, LogOut, ChevronDown,
  LayoutDashboard, Ship, Plane, Anchor, Package, FileText,
  ArrowLeftRight, DollarSign, Folder, BarChart2, Bell, Plus,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
  children?: MenuItem[];
}

const portMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/port/dashboard',
  },
  {
    id: 'arrivals-departures',
    label: 'Arrivals & Departures',
    icon: Ship,
    children: [
      { id: 'vessels', label: 'Vessel Schedule', icon: Ship, href: '/port/arrivals-departures/vessels' },
      { id: 'flights', label: 'Flight Schedule', icon: Plane, href: '/port/arrivals-departures/flights' },
      { id: 'berths', label: 'Berth Allocation', icon: Anchor, href: '/port/arrivals-departures/berths' },
    ],
  },
  {
    id: 'cargo',
    label: 'Cargo',
    icon: Package,
    children: [
      { id: 'containers', label: 'Container List', icon: Package, href: '/port/containers' },
      { id: 'register-container', label: 'Register Container', icon: Plus, href: '/port/containers/register' },
      { id: 'manifests', label: 'Cargo Manifest', icon: FileText, href: '/port/manifests' },
      { id: 'cargo-log', label: 'Offload / Load Log', icon: ArrowLeftRight, href: '/port/cargo-log' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    children: [
      { id: 'charges', label: 'Port Charges', icon: DollarSign, href: '/port/charges' },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: Folder,
    children: [
      { id: 'port-docs', label: 'Port Documents', icon: Folder, href: '/port/documents' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart2,
    children: [
      { id: 'port-reports', label: 'Port Reports', icon: BarChart2, href: '/port/reports' },
    ],
  },
  {
    id: 'misc',
    label: 'Misc',
    icon: Bell,
    children: [
      { id: 'notifications', label: 'Notifications', icon: Bell, href: '/port/notifications' },
    ],
  },
];

export function PortSidebar() {
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

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'bg-slate-900 text-white border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col overflow-hidden',
          collapsed ? 'w-20' : 'w-64',
        )}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-semibold text-sm">LogisticPRO</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {portMenu.map((item) => (
            <div key={item.id}>
              {item.children ? (
                <>
                  {!collapsed && (
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className={cn(
                        'w-full px-4 py-2 flex items-center justify-between text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors',
                        isMenuActive(item) && 'text-white bg-slate-800',
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {item.label}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform',
                          expandedMenus.has(item.id) ? 'rotate-180' : '',
                        )}
                      />
                    </button>
                  )}
                  {collapsed && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => toggleMenu(item.id)}
                          className={cn(
                            'w-full px-4 py-2 flex items-center justify-center text-slate-300 hover:bg-slate-800 transition-colors',
                            isMenuActive(item) && 'text-white bg-slate-800',
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  )}

                  {expandedMenus.has(item.id) && !collapsed && (
                    <div className="bg-slate-800/30">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href || '#'}
                          className={cn(
                            'w-full px-4 py-2 pl-12 flex items-center gap-3 text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors',
                            isMenuActive(child) && 'text-white bg-slate-800 border-l-2 border-blue-600',
                          )}
                        >
                          <child.icon className="w-4 h-4 flex-shrink-0" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href || '#'}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors',
                    isMenuActive(item) && 'text-white bg-slate-800 border-l-2 border-blue-600',
                    collapsed && 'justify-center px-0',
                  )}
                >
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <item.icon className="w-5 h-5" />
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {item.label}
                    </>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-slate-800 p-4">
          {!collapsed && (
            <div className="mb-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors',
              collapsed && 'justify-center px-0',
            )}
          >
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <LogOut className="w-5 h-5" />
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <LogOut className="w-5 h-5 flex-shrink-0" />
                Logout
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

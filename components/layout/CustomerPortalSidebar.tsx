'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { customerPortalMenu, type CustomerPortalMenuItem } from '@/data/customer-portal-menu';
import {
  ChevronLeft, ChevronRight, LogOut, ChevronDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';

export function CustomerPortalSidebar() {
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

  const isMenuActive = (item: CustomerPortalMenuItem): boolean => {
    if (item.href) {
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }
    if (item.children) {
      return item.children.some(child => isMenuActive(child));
    }
    return false;
  };

  const renderMenuItems = (items: CustomerPortalMenuItem[], level = 0) => {
    return items.map((item) => {
      const isActive = isMenuActive(item);
      const isExpanded = expandedMenus.has(item.id);
      const children = item.children ?? [];
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
                  ? "bg-[rgba(34,197,94,0.12)] text-[#86efac] border border-[rgba(34,197,94,0.2)]"
                  : "text-[rgba(148,163,184,0.8)] hover:bg-[rgba(34,197,94,0.06)] hover:text-[#e0f2fe]"
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                style={{ background: 'linear-gradient(180deg, #22c55e, #14b8a6)' }}
              />
              <Icon className="w-[17px] h-[17px] flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="whitespace-nowrap flex-1">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isExpanded ? "rotate-180" : ""
                    )}
                  />
                </>
              )}
            </button>
          ) : (
            <Link
              href={item.href!}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-[10px] text-sm font-medium",
                "transition-all duration-200 overflow-hidden",
                collapsed ? "px-0 py-2.5 justify-center" : "px-3.5 py-2.5",
                isActive
                  ? "bg-[rgba(34,197,94,0.12)] text-[#86efac] border border-[rgba(34,197,94,0.2)]"
                  : "text-[rgba(148,163,184,0.8)] hover:bg-[rgba(34,197,94,0.06)] hover:text-[#e0f2fe]"
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                style={{ background: 'linear-gradient(180deg, #22c55e, #14b8a6)' }}
              />
              <Icon className="w-[17px] h-[17px] flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          )}

          {hasChildren && isExpanded && !collapsed && (
            <div className="ml-2 mt-1 border-l border-[rgba(34,197,94,0.1)] pl-2">
              {renderMenuItems(children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <style>{`
        .sidebar-nav-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-nav-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-nav-scroll::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.2);
          border-radius: 99px;
          transition: background 0.2s;
        }
        .sidebar-nav-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.45);
        }
        .sidebar-nav-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(34, 197, 94, 0.2) transparent;
        }
      `}</style>

      <aside
        className={cn(
          "relative flex flex-col h-screen overflow-visible transition-all duration-300 ease-out",
          "bg-[#0a1628] border-r border-[rgba(34,197,94,0.1)]",
          collapsed ? "w-[72px]" : "w-[280px]"
        )}
      >
        {/* Ambient orbs - lighter */}
        <div className="absolute -top-20 -left-16 w-60 h-60 bg-emerald-600 rounded-full blur-[80px] opacity-[0.05] pointer-events-none z-0" />
        <div className="absolute -bottom-16 -right-10 w-48 h-48 bg-teal-500 rounded-full blur-[80px] opacity-[0.04] pointer-events-none z-0" />

        {/* Logo */}
        <div
          className={cn(
            "relative z-10 flex items-center h-16 border-b border-[rgba(34,197,94,0.1)] flex-shrink-0",
            collapsed ? "justify-center px-2" : "px-4"
          )}
        >
          <Link
            href="/portal/dashboard"
            className={cn(
              "flex items-center overflow-hidden transition-all duration-300",
              collapsed ? "justify-center" : "gap-3"
            )}
          >
            <div className="brand flex items-center justify-center">
              <Image src="/LogisticsProLogo-bg.png" alt="Logo" width={100} height={100} className='bg-white bg-opacity-20 rounded-lg' />
            </div>

            <div
              className={cn(
                "flex flex-col leading-tight transition-all duration-300 origin-left",
                collapsed
                  ? "w-0 opacity-0 scale-95 -translate-x-2"
                  : "w-auto opacity-100 scale-100 translate-x-0"
              )}
            >
              <span
                className="text-[1.02rem] font-extrabold text-[#f0f9ff] tracking-tight whitespace-nowrap"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Logistics<span className="text-[#90EE90]">Pro</span>
              </span>
              <span className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[0.58rem] text-[#4ade80] uppercase tracking-[1.8px] font-medium whitespace-nowrap">
                  Customer
                </span>
                <Badge variant="outline" className="text-[0.5rem] px-1 py-0 h-4 border-[rgba(74,222,128,0.3)] text-[rgba(74,222,128,0.6)] font-medium">
                  Portal
                </Badge>
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="relative z-10 flex-1 min-h-0 py-3">
          <div
            className={cn(
              "sidebar-nav-scroll h-full overflow-y-auto",
              collapsed ? "px-2" : "px-3"
            )}
          >
            <nav className="flex flex-col gap-1">
              {renderMenuItems(customerPortalMenu)}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className={cn(
          "relative z-10 border-t border-[rgba(34,197,94,0.1)] flex-shrink-0",
          collapsed ? "p-2" : "p-4"
        )}>
          {!collapsed && user && (
            <div className="mb-2.5 px-3 py-2 rounded-[10px] bg-[rgba(255,255,255,0.04)] border border-[rgba(34,197,94,0.08)]">
              <p className="text-[0.85rem] font-semibold text-[#e0f2fe] truncate"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {user.name}
              </p>
              <p className="text-[0.68rem] text-[#4ade80] uppercase tracking-[0.5px] font-medium">
                Customer Portal
              </p>
            </div>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className={cn(
                  "group w-full flex items-center gap-2.5 rounded-[10px]",
                  "bg-[rgba(255,255,255,0.04)] border border-[rgba(34,197,94,0.08)]",
                  "text-[rgba(148,163,184,0.8)] text-[0.85rem] font-medium",
                  "transition-all duration-200 cursor-pointer",
                  "hover:bg-[rgba(239,68,68,0.1)] hover:border-[rgba(239,68,68,0.25)] hover:text-[#fca5a5]",
                  collapsed ? "justify-center p-2.5" : "px-3 py-2.5"
                )}
              >
                <LogOut className="w-[17px] h-[17px] flex-shrink-0" />
                {!collapsed && <span>Logout</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent
                side="right"
                sideOffset={12}
                className="bg-[#0d1f38] text-[#e0f2fe] border border-[rgba(34,197,94,0.15)]"
              >
                Logout
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute top-[72px] -right-3 z-20",
            "w-6 h-6 rounded-full flex items-center justify-center",
            "bg-[#0d1f38] border border-[rgba(34,197,94,0.2)] text-[#4ade80]",
            "shadow-[0_2px_8px_rgba(0,0,0,0.4)]",
            "transition-all duration-200 cursor-pointer",
            "hover:bg-[rgba(34,197,94,0.12)] hover:border-[rgba(34,197,94,0.4)] hover:scale-110"
          )}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>
    </TooltipProvider>
  );
}

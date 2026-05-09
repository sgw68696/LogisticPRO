"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Package, Truck, Users, Settings,
  ChevronLeft, ChevronRight, LogOut, MapPin, ShoppingCart,
  UserCircle, DollarSign, BarChart3, Bell, Warehouse,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AnimatedLogo2 from '../../app/Animatedlogo2';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'shipments', label: 'Shipments', icon: Package, href: '/shipments' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/orders' },
  { id: 'fleet', label: 'Fleet', icon: Truck, href: '/fleet' },
  { id: 'drivers', label: 'Drivers', icon: Users, href: '/drivers' },
  { id: 'dispatch', label: 'Dispatch', icon: MapPin, href: '/dispatch' },
  { id: 'warehouse', label: 'Warehouse', icon: Warehouse, href: '/warehouse' },
  { id: 'customers', label: 'Customers', icon: UserCircle, href: '/customers' },
  { id: 'finance', label: 'Finance', icon: DollarSign, href: '/finance' },
  { id: 'reports', label: 'Reports', icon: BarChart3, href: '/reports' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/notifications' },
  { id: 'users', label: 'Users', icon: Users, href: '/users' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { allowedMenuItems, logout, user } = useAuth();
  const filteredMenuItems = menuItems.filter(item => allowedMenuItems.includes(item.id));

  return (
    <TooltipProvider delayDuration={0}>
      {/* ── Custom scrollbar styles scoped to sidebar ── */}
      <style>{`
        .sidebar-nav-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-nav-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-nav-scroll::-webkit-scrollbar-thumb {
          background: rgba(14, 165, 233, 0.25);
          border-radius: 99px;
          transition: background 0.2s;
        }
        .sidebar-nav-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(14, 165, 233, 0.55);
        }
        /* Firefox */
        .sidebar-nav-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(14, 165, 233, 0.25) transparent;
        }
      `}</style>

      <aside
        className={cn(
          "relative flex flex-col h-screen overflow-visible transition-all duration-300 ease-out",
          "bg-[#050d1a] border-r border-[rgba(14,165,233,0.12)]",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Ambient orbs */}
        <div className="absolute -top-20 -left-16 w-60 h-60 bg-indigo-600 rounded-full blur-[80px] opacity-[0.07] pointer-events-none z-0" />
        <div className="absolute -bottom-16 -right-10 w-48 h-48 bg-cyan-500 rounded-full blur-[80px] opacity-[0.06] pointer-events-none z-0" />

        {/* ── Logo ── */}
        <div
          className={cn(
            "relative z-10 flex items-center h-16 border-b border-[rgba(14,165,233,0.12)] flex-shrink-0",
            collapsed ? "justify-center px-2" : "px-4"
          )}
        >
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center overflow-hidden transition-all duration-300",
              collapsed ? "justify-center" : "gap-3"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center flex-shrink-0 transition-all duration-300",
                collapsed ? "w-10 h-10" : "w-12 h-12"
              )}
            >
              <AnimatedLogo2 />
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
                Logistics<span className="text-[#38bdf8]">Pro</span>
              </span>
              <span className="text-[0.58rem] text-[#38bdf8] uppercase tracking-[1.8px] font-medium whitespace-nowrap">
                Enterprise
              </span>
            </div>
          </Link>
        </div>

        {/* ── Navigation with custom scrollbar ── */}
        <div className="relative z-10 flex-1 min-h-0 py-3">
          <div
            className={cn(
              "sidebar-nav-scroll h-full overflow-y-auto",
              collapsed ? "px-2" : "px-3"
            )}
          >
            <nav className="flex flex-col gap-1">
              {filteredMenuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                const linkContent = (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-[10px] text-sm font-medium",
                      "transition-all duration-200 overflow-hidden",
                      collapsed ? "px-0 py-2.5 justify-center" : "px-3.5 py-2.5",
                      isActive
                        ? "bg-[rgba(14,165,233,0.15)] text-[#7dd3fc] border border-[rgba(14,165,233,0.25)] shadow-[inset_0_0_20px_rgba(14,165,233,0.05)]"
                        : "text-[rgba(148,163,184,0.8)] hover:bg-[rgba(14,165,233,0.08)] hover:text-[#e0f2fe] hover:translate-x-0.5"
                    )}
                  >
                    {/* Left accent bar */}
                    <span
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm transition-opacity duration-200",
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}
                      style={{ background: 'linear-gradient(180deg, #0ea5e9, #6366f1)' }}
                    />
                    <Icon className={cn(
                      "flex-shrink-0 transition-transform duration-200",
                      collapsed ? "w-5 h-5" : "w-[17px] h-[17px]",
                      !isActive && "group-hover:scale-110"
                    )} />
                    {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent
                        side="right"
                        sideOffset={12}
                        className="bg-[#0d1f38] text-[#e0f2fe] border border-[rgba(14,165,233,0.2)] text-[0.82rem] font-medium"
                      >
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return linkContent;
              })}
            </nav>
          </div>
        </div>

        {/* ── Footer: User + Logout ── */}
        <div className={cn(
          "relative z-10 border-t border-[rgba(14,165,233,0.12)] flex-shrink-0",
          collapsed ? "p-2" : "p-4"
        )}>
          {!collapsed && user && (
            <div className="mb-2.5 px-3 py-2 rounded-[10px] bg-[rgba(255,255,255,0.04)] border border-[rgba(14,165,233,0.1)]">
              <p className="text-[0.85rem] font-semibold text-[#e0f2fe] truncate"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {user.name}
              </p>
              <p className="text-[0.68rem] text-[#38bdf8] uppercase tracking-[0.5px] font-medium truncate">
                {user.role}
              </p>
            </div>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={logout}
                className={cn(
                  "group w-full flex items-center gap-2.5 rounded-[10px]",
                  "bg-[rgba(255,255,255,0.04)] border border-[rgba(14,165,233,0.1)]",
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
                className="bg-[#0d1f38] text-[#e0f2fe] border border-[rgba(14,165,233,0.2)] text-[0.82rem] font-medium"
              >
                Logout
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* ── Collapse toggle ── */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute top-[72px] -right-3 z-20",
            "w-6 h-6 rounded-full flex items-center justify-center",
            "bg-[#0d1f38] border border-[rgba(14,165,233,0.25)] text-[#38bdf8]",
            "shadow-[0_2px_8px_rgba(0,0,0,0.4)]",
            "transition-all duration-200 cursor-pointer",
            "hover:bg-[rgba(14,165,233,0.15)] hover:border-[rgba(14,165,233,0.5)] hover:scale-110"
          )}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>
    </TooltipProvider>
  );
}
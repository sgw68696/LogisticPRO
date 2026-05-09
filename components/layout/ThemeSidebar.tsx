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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const menuItems = [
  { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard, href: '/dashboard' },
  { id: 'shipments',     label: 'Shipments',     icon: Package,         href: '/shipments' },
  { id: 'orders',        label: 'Orders',        icon: ShoppingCart,    href: '/orders' },
  { id: 'fleet',         label: 'Fleet',         icon: Truck,           href: '/fleet' },
  { id: 'drivers',       label: 'Drivers',       icon: Users,           href: '/drivers' },
  { id: 'dispatch',      label: 'Dispatch',      icon: MapPin,          href: '/dispatch' },
  { id: 'warehouse',     label: 'Warehouse',     icon: Warehouse,       href: '/warehouse' },
  { id: 'customers',     label: 'Customers',     icon: UserCircle,      href: '/customers' },
  { id: 'finance',       label: 'Finance',       icon: DollarSign,      href: '/finance' },
  { id: 'reports',       label: 'Reports',       icon: BarChart3,       href: '/reports' },
  { id: 'notifications', label: 'Notifications', icon: Bell,            href: '/notifications' },
  { id: 'users',         label: 'Users',         icon: Users,           href: '/users' },
  { id: 'settings',      label: 'Settings',      icon: Settings,        href: '/settings' },
];

export function ThemeSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname  = usePathname();
  const { allowedMenuItems, logout, user } = useAuth();

  const filteredMenuItems = menuItems.filter(item => allowedMenuItems.includes(item.id));

  return (
    <>
      <style>{`
        .tsb-root {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #050d1a;
          border-right: 1px solid rgba(14,165,233,0.12);
          transition: width 0.3s ease;
          overflow: visible;
        }
        /* Ambient orbs */
        .tsb-root::before {
          content: '';
          position: absolute;
          top: -80px; left: -60px;
          width: 240px; height: 240px;
          background: #6366f1;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.07;
          pointer-events: none;
          z-index: 0;
        }
        .tsb-root::after {
          content: '';
          position: absolute;
          bottom: -60px; right: -40px;
          width: 200px; height: 200px;
          background: #0ea5e9;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.06;
          pointer-events: none;
          z-index: 0;
        }

        /* Logo bar */
        .tsb-logo {
          position: relative; z-index: 1;
          display: flex;
          align-items: center;
          height: 64px;
          border-bottom: 1px solid rgba(14,165,233,0.12);
          flex-shrink: 0;
        }
        .tsb-logo a {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .tsb-brand-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px rgba(14,165,233,0.3);
          flex-shrink: 0;
        }
        .tsb-brand-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.05rem; font-weight: 800;
          color: #f0f9ff; letter-spacing: -0.3px;
          line-height: 1.2;
        }
        .tsb-brand-sub {
          font-size: 0.62rem; color: #38bdf8;
          text-transform: uppercase;
          letter-spacing: 0.8px; font-weight: 500;
        }

        /* Nav scroll area */
        .tsb-scroll {
          position: relative; z-index: 1;
          flex: 1; overflow-y: auto; padding: 12px 0;
        }
        .tsb-scroll::-webkit-scrollbar { width: 4px; }
        .tsb-scroll::-webkit-scrollbar-track { background: transparent; }
        .tsb-scroll::-webkit-scrollbar-thumb {
          background: rgba(14,165,233,0.2); border-radius: 4px;
        }

        /* Nav item */
        .tsb-nav-item {
          display: flex; align-items: center; gap: 10px;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative; overflow: hidden;
          color: rgba(148,163,184,0.8);
          font-size: 0.875rem; font-weight: 500;
          white-space: nowrap;
        }
        .tsb-nav-item::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #0ea5e9, #6366f1);
          border-radius: 0 2px 2px 0;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .tsb-nav-item:hover {
          background: rgba(14,165,233,0.08);
          color: #e0f2fe;
          transform: translateX(2px);
        }
        .tsb-nav-item:hover::before { opacity: 1; }
        .tsb-nav-item.active {
          background: linear-gradient(135deg,rgba(14,165,233,0.18),rgba(99,102,241,0.18));
          color: #7dd3fc;
          border: 1px solid rgba(14,165,233,0.25);
        }
        .tsb-nav-item.active::before { opacity: 1; }
        .tsb-nav-item.collapsed-item {
          justify-content: center;
          padding: 10px;
        }

        /* Footer */
        .tsb-footer {
          position: relative; z-index: 1;
          border-top: 1px solid rgba(14,165,233,0.12);
          flex-shrink: 0;
        }
        .tsb-user-box {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(14,165,233,0.12);
          border-radius: 10px;
          padding: 10px 12px;
          margin-bottom: 10px;
        }
        .tsb-user-name {
          font-size: 0.85rem; font-weight: 600;
          color: #e0f2fe;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .tsb-user-role {
          font-size: 0.7rem; color: #38bdf8;
          text-transform: uppercase;
          letter-spacing: 0.5px; font-weight: 500;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .tsb-logout-btn {
          width: 100%;
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(14,165,233,0.12);
          border-radius: 10px;
          color: rgba(148,163,184,0.8);
          font-size: 0.85rem; font-weight: 500;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          padding: 9px 12px;
          transition: all 0.2s ease;
        }
        .tsb-logout-btn:hover {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.25);
          color: #fca5a5;
        }
        .tsb-logout-btn.icon-only {
          justify-content: center;
          padding: 10px;
        }

        /* Collapse toggle */
        .tsb-toggle {
          position: absolute;
          top: 72px; right: -12px;
          width: 24px; height: 24px;
          border-radius: 50%;
          background: #0d1f38;
          border: 1px solid rgba(14,165,233,0.25);
          color: #38bdf8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          transition: all 0.2s ease;
          z-index: 10;
        }
        .tsb-toggle:hover {
          background: rgba(14,165,233,0.15);
          border-color: rgba(14,165,233,0.5);
          transform: scale(1.1);
        }

        /* Tooltip override */
        .tsb-tooltip {
          background: #0d1f38 !important;
          border: 1px solid rgba(14,165,233,0.2) !important;
          color: #e0f2fe !important;
          font-size: 0.82rem !important;
          font-weight: 500 !important;
        }
      `}</style>

      <TooltipProvider delayDuration={0}>
        <aside
          className="tsb-root"
          style={{ width: collapsed ? '72px' : '260px' }}
        >
          {/* Logo */}
          <div
            className="tsb-logo"
            style={{ padding: collapsed ? '0 16px' : '0 20px', justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <Link href="/dashboard">
              <div className="tsb-brand-icon">
                <Truck size={22} color="white" />
              </div>
              {!collapsed && (
                <div>
                  <div className="tsb-brand-name">LogisticsPro</div>
                  <div className="tsb-brand-sub">Enterprise</div>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <div className="tsb-scroll">
            <nav style={{ padding: collapsed ? '0 8px' : '0 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {filteredMenuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                const linkContent = (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn('tsb-nav-item', isActive && 'active', collapsed && 'collapsed-item')}
                    style={!collapsed ? { padding: '9px 14px' } : undefined}
                  >
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={12} className="tsb-tooltip">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return linkContent;
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="tsb-footer" style={{ padding: collapsed ? '12px 8px' : '12px 16px' }}>
            {!collapsed && user && (
              <div className="tsb-user-box">
                <div className="tsb-user-name">{user.name}</div>
                <div className="tsb-user-role">{user.role}</div>
              </div>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn('tsb-logout-btn', collapsed && 'icon-only')}
                  onClick={logout}
                >
                  <LogOut size={17} style={{ flexShrink: 0 }} />
                  {!collapsed && <span>Logout</span>}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" sideOffset={12} className="tsb-tooltip">
                  Logout
                </TooltipContent>
              )}
            </Tooltip>
          </div>

          {/* Collapse toggle */}
          <button className="tsb-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </aside>
      </TooltipProvider>
    </>
  );
}
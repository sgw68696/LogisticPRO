"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Bell, ChevronRight, Sun, Moon,
  Search, Zap, Settings, LogOut
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useTheme } from 'next-themes';
import { formatDate } from '@/lib/utils';
import { APP_CONFIG } from '@/config/appConfig';

const pathLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  shipments: 'Shipments',
  orders: 'Orders',
  fleet: 'Fleet Management',
  drivers: 'Drivers',
  dispatch: 'Dispatch',
  warehouse: 'Warehouse',
  customers: 'Customers',
  finance: 'Finance',
  reports: 'Reports',
  notifications: 'Notifications',
  users: 'Users',
  settings: 'Settings',
};

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { theme, setTheme } = useTheme();

  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => ({
    label: pathLabels[part] || part.charAt(0).toUpperCase() + part.slice(1),
    href: '/' + pathParts.slice(0, index + 1).join('/'),
    isLast: index === pathParts.length - 1,
  }));

  const recentNotifications = notifications.slice(0, 5);

  return (
    <header className="
  sticky top-0 z-40 h-16
  bg-background/80 backdrop-blur-xl

  /* ── Border ── */
  border-b border-sky-500/30
  dark:border-sky-400/25

  /* ── Light mode shadow ── */
  shadow-[
    0_1px_0_rgba(14,165,233,0.15),
    0_4px_24px_rgba(14,165,233,0.08),
    0_1px_3px_rgba(0,0,0,0.06)
  ]

  /* ── Dark mode: always-on blue glow (no hover needed) ── */
  dark:shadow-[
    0_1px_0_rgba(255,255,255,0.04),
    0_1px_0_rgba(56,189,248,0.30),
    0_4px_32px_rgba(14,165,233,0.28),
    0_8px_64px_rgba(99,102,241,0.20),
    0_16px_80px_rgba(14,165,233,0.12),
    0_1px_3px_rgba(0,0,0,0.55)
  ]

  transition-all duration-300
">
      {/* Blue glow line — always visible in dark mode */}
      <div className="
    absolute bottom-0 inset-x-0 h-[1px] pointer-events-none
    bg-gradient-to-r
    from-transparent
    via-sky-400/30
    to-transparent
    dark:via-sky-400/70
  " />
      <div className="flex items-center justify-between h-full px-6">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-0 text-[0.85rem]">
          <Link
            href="/dashboard"
            className="
              text-muted-foreground font-medium no-underline
              hover:text-primary transition-colors duration-200
            "
          >
            Home
          </Link>

          {breadcrumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center">
              <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-muted-foreground/40" />
              {crumb.isLast ? (
                <span className="nb-crumb-active">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="
                    text-muted-foreground font-medium no-underline
                    hover:text-primary transition-colors duration-200
                  "
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* ── Demo Mode Badge ── */}
        {/* {APP_CONFIG.USE_MOCK && (
          <div className="
            absolute left-1/2 -translate-x-1/2
            flex items-center gap-1.5
            px-3.5 py-[5px]
            bg-warning/10 border border-warning/30
            rounded-full nb-demo-pulse
          ">
            <Zap size={11} className="text-warning" />
            <span className="
              text-[0.72rem] font-bold text-warning
              tracking-[1.2px] font-display uppercase
            ">
              DEMO MODE
            </span>
          </div>
        )} */}

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-1.5">

          {/* Search */}
          <div className="relative hidden lg:flex">
            <Search className="
              absolute left-2.5 top-1/2 -translate-y-1/2
              w-[15px] h-[15px] text-muted-foreground pointer-events-none
            " />
            <input
              type="text"
              placeholder="Search..."
              className="
                nb-search h-9 pl-9 pr-3
                bg-muted/40 border border-border
                rounded-[10px] text-sm text-foreground
                outline-none placeholder:text-muted-foreground
                focus:border-sky-400/60 focus:bg-sky-500/5
                focus:shadow-[0_0_0_3px_rgba(14,165,233,0.12)]
              "
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="
              relative w-9 h-9 flex items-center justify-center
              bg-muted/40 border border-border
              rounded-[10px] cursor-pointer
              text-muted-foreground
              transition-all duration-200
              hover:bg-sky-500/10 hover:border-sky-400/40
              hover:text-sky-400 hover:-translate-y-px
              hover:shadow-[0_0_14px_rgba(14,165,233,0.25)]
            "
          >
            <Sun size={16} className="block dark:hidden" />
            <Moon size={16} className="hidden dark:block" />
          </button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Notifications"
                className="
                  relative w-9 h-9 flex items-center justify-center
                  bg-muted/40 border border-border
                  rounded-[10px] cursor-pointer
                  text-muted-foreground
                  transition-all duration-200
                  hover:bg-sky-500/10 hover:border-sky-400/40
                  hover:text-sky-400 hover:-translate-y-px
                  hover:shadow-[0_0_14px_rgba(14,165,233,0.25)]
                "
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="
                    nb-notif-pop nb-unread-dot absolute -top-[3px] -right-[3px]
                    min-w-[18px] h-[18px] px-1
                    flex items-center justify-center
                    text-white text-[9px] font-black
                    rounded-full border-[1.5px] border-background
                  ">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 nb-dropdown">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="nb-crumb-active text-[0.9rem]">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="
                    px-2.5 py-0.5 rounded-full
                    text-[0.72rem] font-bold text-primary
                    bg-primary/10 border border-primary/25
                  ">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <DropdownMenuSeparator className="bg-border/50 my-1" />

              {recentNotifications.length > 0 ? (
                <>
                  {recentNotifications.map((notif) => (
                    <DropdownMenuItem
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className="
                        flex flex-col items-start gap-0 p-0
                        rounded-[9px] cursor-pointer
                        hover:bg-primary/8 focus:bg-primary/8
                        transition-colors duration-150
                      "
                    >
                      <div className="w-full px-3 py-2.5">
                        <div className="flex items-center gap-2 w-full">
                          <span className={`
                            w-[7px] h-[7px] rounded-full flex-shrink-0
                            ${notif.read ? 'bg-muted-foreground/30' : 'nb-unread-dot'}
                          `} />
                          <span className="
                            text-[0.82rem] font-semibold flex-1 truncate
                            text-foreground
                          ">
                            {notif.title}
                          </span>
                        </div>
                        <p className="
                          text-[0.75rem] text-muted-foreground
                          mt-0.5 pl-[15px] line-clamp-2
                        ">
                          {notif.message}
                        </p>
                        <span className="
                          block text-[0.67rem] text-muted-foreground/70
                          font-medium mt-0.5 pl-[15px]
                        ">
                          {formatDate(notif.timestamp, 'datetime')}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator className="bg-border/50 my-1" />

                  <DropdownMenuItem asChild className="p-0">
                    <Link href="/notifications" className="nb-view-all">
                      View all notifications →
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <div className="py-6 text-center">
                  <Bell className="w-7 h-7 mx-auto mb-2 text-muted-foreground opacity-20" />
                  <p className="text-[0.82rem] text-muted-foreground">
                    No new notifications
                  </p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="User menu"
                className="
                  flex items-center gap-2.5 pl-1 pr-2.5 h-11
                  bg-muted/40 border border-border
                  rounded-xl cursor-pointer
                  transition-all duration-200
                  hover:bg-sky-500/8 hover:border-sky-400/35
                  hover:shadow-[0_0_18px_rgba(14,165,233,0.18)]
                "
              >
                <div
                  className="
                    w-8 h-8 rounded-lg flex-shrink-0
                    flex items-center justify-center
                    text-white text-[0.8rem] font-bold font-display
                    overflow-hidden
                    shadow-[0_0_12px_rgba(14,165,233,0.4)]
                  "
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                >
                  {user?.avatar || (user?.name?.[0] ?? 'U')}
                </div>

                <div className="hidden md:flex flex-col items-start">
                  <span className="
                    text-[0.85rem] font-bold font-display
                    text-foreground leading-tight
                  ">
                    {user?.name}
                  </span>
                  <span className="
                    text-[0.65rem] font-semibold
                    text-sky-400 tracking-[0.8px] uppercase
                  ">
                    {user?.role}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 nb-dropdown">
              <div className="px-3 py-2.5">
                <p className="text-[0.88rem] font-bold font-display text-foreground">
                  {user?.name}
                </p>
                <p className="text-[0.75rem] text-muted-foreground mt-0.5">
                  {user?.email}
                </p>
              </div>

              <DropdownMenuSeparator className="bg-border/50" />

              <DropdownMenuItem asChild className="p-0 mx-1 rounded-lg">
                <Link
                  href="/settings"
                  className="
                    flex items-center gap-2 px-2.5 py-2 w-full
                    rounded-[8px] no-underline
                    text-[0.84rem] font-semibold text-muted-foreground
                    transition-colors duration-150
                    hover:text-foreground hover:bg-primary/8
                  "
                >
                  <Settings size={14} className="opacity-60" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border/50" />

              <DropdownMenuItem
                onClick={logout}
                className="
                  flex items-center gap-2 mx-1 mb-1 px-2.5 py-2
                  rounded-[8px] cursor-pointer
                  text-[0.84rem] font-bold text-destructive
                  transition-colors duration-150
                  hover:bg-destructive/8 hover:text-destructive
                  focus:bg-destructive/8
                "
              >
                <LogOut size={14} className="opacity-80" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}
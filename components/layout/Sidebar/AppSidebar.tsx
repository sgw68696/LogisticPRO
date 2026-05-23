'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  ChevronDown,
  X,
  Circle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Image from 'next/image';
import type { MenuItem, SidebarRoleConfig } from './AppSidebar.types';

interface AppSidebarProps {
  role: SidebarRoleConfig;
  menuItems: MenuItem[];
  isOpen?: boolean;
  onClose?: () => void;
}

const SIDEBAR_WIDTH_EXPANDED = 288;
const SIDEBAR_WIDTH_COLLAPSED = 76;

export function AppSidebar({
  role,
  menuItems,
  isOpen: externalIsOpen,
  onClose,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setMobileOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  useEffect(() => {
    if (isMobile && mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, mobileOpen]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleMobileNavClick = () => {
    if (isMobile) {
      setMobileOpen(false);
      onClose?.();
    }
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      next.has(menuId) ? next.delete(menuId) : next.add(menuId);
      return next;
    });
  };

  const isMenuActive = (item: MenuItem): boolean => {
    if (item.href) {
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }
    return item.children?.some(isMenuActive) ?? false;
  };

  const isAnyChildActive = (item: MenuItem): boolean => {
    return item.children?.some((child) => isMenuActive(child)) ?? false;
  };

  const renderMenuItems = (items: MenuItem[], level = 0) =>
    items.map((item) => {
      const isActive = isMenuActive(item);
      const hasActiveChild = isAnyChildActive(item);
      const isExpanded = expandedMenus.has(item.id) || hasActiveChild;
      const children = item.children ?? [];
      const hasChildren = children.length > 0;
      const Icon = item.icon;

      const sharedItemClass = cn(
        'group relative flex items-center gap-2.5 rounded-lg text-sm font-medium',
        'transition-all duration-200 overflow-hidden',
        collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5',
        isActive
          ? 'bg-cyan-500/10 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)]'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:translate-x-[2px]'
      );

      const ActiveIndicator = isActive ? (
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-r" />
      ) : null;

      const itemContent = (
        <>
          {ActiveIndicator}
          <Icon
            className={cn(
              'w-[18px] h-[18px] flex-shrink-0 transition-colors duration-200',
              isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
            )}
          />
          {!collapsed && (
            <>
              <span className="whitespace-nowrap flex-1">{item.label}</span>
              {hasChildren && (
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-all duration-200 text-slate-500',
                    isExpanded && 'rotate-180',
                    hasActiveChild && !isExpanded && 'text-cyan-400'
                  )}
                />
              )}
            </>
          )}
        </>
      );

      return (
        <div key={item.id}>
          {hasChildren ? (
            <button
              onClick={() => toggleMenu(item.id)}
              className={cn(sharedItemClass, 'w-full text-left')}
            >
              {itemContent}
            </button>
          ) : (
            <Link
              href={item.href!}
              onClick={handleMobileNavClick}
              className={cn(
                sharedItemClass,
                isActive &&
                  !collapsed &&
                  'border-l-2 border-cyan-400 pl-[10px]'
              )}
            >
              {itemContent}
            </Link>
          )}

          {hasChildren && isExpanded && !collapsed && (
            <div className="ml-4 mt-1 pl-3">
              {renderMenuItems(children, level + 1)}
            </div>
          )}
        </div>
      );
    });

  const highlight = role.brandHighlight ?? '';
  const brandMain = highlight
    ? role.brandName.replace(highlight, '')
    : role.brandName;

  const sidebarContent = (
    <aside
      className={cn(
        'relative flex flex-col h-[100dvh] overflow-hidden transition-all duration-300 ease-out',
        'bg-[#050d1a] border-r border-white/5',
        collapsed ? `w-[${SIDEBAR_WIDTH_COLLAPSED}px]` : `w-[${SIDEBAR_WIDTH_EXPANDED}px]`
      )}
      style={{
        width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
      }}
    >
      <style>{`
        .sidebar-nav-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-nav-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-nav-scroll::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.2); border-radius: 99px;
        }
        .sidebar-nav-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.4);
        }
        .sidebar-nav-scroll { scrollbar-width: thin; scrollbar-color: rgba(56, 189, 248, 0.2) transparent; }
      `}</style>

      <div className="absolute -top-20 -left-16 w-60 h-60 bg-indigo-600 rounded-full blur-[80px] opacity-[0.07] pointer-events-none z-0" />
      <div className="absolute -bottom-16 -right-10 w-48 h-48 bg-cyan-500 rounded-full blur-[80px] opacity-[0.06] pointer-events-none z-0" />

      {isMobile && (
        <button
          onClick={() => {
            setMobileOpen(false);
            onClose?.();
          }}
          className="absolute top-4 right-4 z-30 p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div
        className={cn(
          'relative z-10 flex items-center h-16 border-b border-white/5 flex-shrink-0',
          collapsed ? 'justify-center px-2' : 'px-4'
        )}
      >
        <Link
          href={role.homeHref}
          onClick={handleMobileNavClick}
          className={cn(
            'flex items-center overflow-hidden transition-all duration-300',
            collapsed ? 'justify-center' : 'gap-3'
          )}
        >
          <div className="flex items-center justify-center">
            <Image
              src={role.logoSrc}
              alt={`${role.brandName} Logo`}
              width={100}
              height={100}
              className="bg-white/10 rounded-lg w-8 h-8"
              style={{ width: 32, height: 32 }}
            />
          </div>

          <div
            className={cn(
              'flex flex-col leading-tight transition-all duration-300 origin-left',
              collapsed
                ? 'w-0 opacity-0 scale-95 -translate-x-2'
                : 'w-auto opacity-100 scale-100 translate-x-0'
            )}
          >
            <span
              className="text-[1rem] font-extrabold text-sky-50 tracking-tight whitespace-nowrap"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {brandMain}
              {highlight && (
                <span style={{ color: role.accentColor ?? '#38bdf8' }}>
                  {highlight}
                </span>
              )}
            </span>
            <span
              className="text-[0.55rem] uppercase tracking-[1.8px] font-medium whitespace-nowrap"
              style={{ color: role.accentColor ?? '#38bdf8' }}
            >
              {role.roleLabel}
            </span>
          </div>
        </Link>
      </div>

      <div className="relative z-10 flex-1 min-h-0 py-3 flex flex-col">
        <div
          className={cn(
            'sidebar-nav-scroll h-full overflow-y-auto flex-1',
            collapsed ? 'px-2' : 'px-3'
          )}
        >
          <nav className="flex flex-col gap-0.5">{renderMenuItems(menuItems)}</nav>
        </div>
      </div>

      <div
        className={cn(
          'relative z-10 border-t border-white/5 flex-shrink-0',
          collapsed ? 'p-2' : 'p-3'
        )}
      >
        {!collapsed && user && (
          <div className="mb-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#050d1a]">
                  <Circle className="w-full h-full text-emerald-300 fill-emerald-300" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[0.8rem] font-semibold text-slate-200 truncate"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {user.name}
                </p>
                <p
                  className="text-[0.6rem] uppercase tracking-[0.5px] font-medium"
                  style={{ color: role.accentColor ?? '#38bdf8' }}
                >
                  {role.roleLabel}
                </p>
              </div>
            </div>
          </div>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleLogout}
              className={cn(
                'group w-full flex items-center gap-2.5 rounded-lg',
                'bg-white/[0.03] border border-white/5',
                'text-slate-400 text-[0.85rem] font-medium',
                'transition-all duration-200 cursor-pointer',
                'hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400',
                collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
              )}
            >
              <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent
              side="right"
              sideOffset={12}
              className="bg-[#0b1728] text-slate-200 border border-cyan-500/20"
            >
              Logout
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'absolute top-[72px] -right-3 z-20',
            'w-6 h-6 rounded-full flex items-center justify-center',
            'bg-[#0b1728] border border-cyan-500/25 text-cyan-400',
            'shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
            'transition-all duration-200 cursor-pointer',
            'hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:scale-110'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </aside>
  );

  if (isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => {
              setMobileOpen(false);
              onClose?.();
            }}
          />
        )}

        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {sidebarContent}
        </div>
      </TooltipProvider>
    );
  }

  return <TooltipProvider delayDuration={0}>{sidebarContent}</TooltipProvider>;
}

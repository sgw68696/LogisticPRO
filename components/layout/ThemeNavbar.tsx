"use client";

import { Bell, Search, Settings, User, Menu } from 'lucide-react';
import { ThemeButton } from '@/components/ui/theme-button';
import { ThemeInput } from '@/components/ui/theme-input';
import { useAuth } from '@/context/AuthContext';

export function ThemeNavbar() {
  const { user } = useAuth();

  return (
    <header className="theme-bg-card border-b border-theme-border-primary h-16 flex items-center justify-between px-6 shadow-sm">
      {/* Left side - Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <ThemeInput
            placeholder="Search shipments, orders, customers..."
            icon={<Search className="w-4 h-4" />}
            className="pl-10"
          />
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <ThemeButton variant="outline" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-theme-bg-card"></span>
        </ThemeButton>

        {/* Settings */}
        <ThemeButton variant="outline" size="icon">
          <Settings className="w-5 h-5" />
        </ThemeButton>

        {/* User menu */}
        <div className="flex items-center gap-3 pl-3 border-l border-theme-border-primary">
          <div className="text-right">
            <p className="theme-text-secondary text-sm font-medium">{user?.name}</p>
            <p className="theme-text-dim text-xs">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-xl theme-gradient-brand flex items-center justify-center text-white shadow-lg shadow-accent-primary/25">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}

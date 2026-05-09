"use client";

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ThemePageWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function ThemePageWrapper({ 
  title, 
  description, 
  children, 
  className,
  actions 
}: ThemePageWrapperProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Page Header */}
      <div className="theme-animate-slide-up flex items-center justify-between">
        <div>
          <h1 className="theme-text-display text-3xl font-bold mb-2">
            {title}
          </h1>
          {description && (
            <p className="theme-text-muted text-lg">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="theme-animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {actions}
          </div>
        )}
      </div>

      {/* Page Content */}
      <div className="theme-animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {children}
      </div>
    </div>
  );
}

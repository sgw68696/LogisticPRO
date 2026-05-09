"use client";

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ThemeKPICardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

export function ThemeKPICard({ 
  title, 
  value, 
  icon, 
  trend, 
  description, 
  className 
}: ThemeKPICardProps) {
  return (
    <div className={cn(
      "theme-bg-card p-6 transition-all duration-200 hover:shadow-xl hover:scale-[1.02]",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="theme-text-muted text-sm font-medium uppercase tracking-wide">
            {title}
          </p>
          <p className="theme-text-display text-2xl font-bold mt-2">
            {value}
          </p>
          {(trend || description) && (
            <div className="flex items-center gap-2 mt-3">
              {trend && (
                <span
                  className={cn(
                    "flex items-center text-xs font-semibold",
                    trend.isPositive 
                      ? "text-green-400" 
                      : "text-red-400"
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {trend.value}%
                </span>
              )}
              {description && (
                <span className="theme-text-dim text-xs">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 theme-gradient-primary text-white shadow-lg shadow-accent-primary/25">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

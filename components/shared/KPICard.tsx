"use client";

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
  iconColor?: 'cyan' | 'indigo' | 'teal' | 'amber' | 'green' | 'red';
}

const iconColorMap = {
  cyan:   'bg-sky-500/10   border-sky-500/15   text-sky-400',
  indigo: 'bg-indigo-500/10 border-indigo-500/15 text-indigo-400',
  teal:   'bg-teal-500/10  border-teal-500/15  text-teal-400',
  amber:  'bg-amber-500/10 border-amber-500/15 text-amber-400',
  green:  'bg-green-500/10 border-green-500/15 text-green-400',
  red:    'bg-red-500/10   border-red-500/15   text-red-400',
};

export function KPICard({
  title,
  value,
  icon,
  trend,
  description,
  className,
  iconColor = 'indigo',
}: KPICardProps) {
  return (
    <div
      className={cn(
        // Base
        'group relative overflow-hidden rounded-xl',
        // Background — dark: glass surface | light: white card
        'bg-card border border-border/60',
        // Subtle top-edge gradient line
        'before:absolute before:inset-x-0 before:top-0 before:h-px',
        'before:bg-gradient-to-r before:from-transparent before:via-primary/30 before:to-transparent',
        'before:opacity-0 before:transition-opacity before:duration-300',
        'hover:before:opacity-100',
        // Hover lift + glow
        'shadow-soft transition-all duration-300',
        'hover:-translate-y-0.5',
        'hover:border-primary/30',
        'hover:shadow-[0_8px_28px_oklch(var(--primary)/0.1)]',
        className,
      )}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">

          {/* ── Left: Text content ── */}
          <div className="flex-1 min-w-0">

            {/* Title */}
            <p className="
              text-[0.72rem] font-semibold uppercase tracking-[0.7px]
              text-muted-foreground truncate
            ">
              {title}
            </p>

            {/* Value */}
            <p className="
              text-[1.65rem] font-extrabold font-display
              text-foreground tracking-tight leading-none
              mt-2.5 truncate
            ">
              {value}
            </p>

            {/* Trend + Description */}
            {(trend || description) && (
              <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                {trend && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5',
                      'px-1.5 py-0.5 rounded-full',
                      'text-[0.7rem] font-bold',
                      trend.isPositive
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10   text-red-400   border border-red-500/20',
                    )}
                  >
                    {trend.isPositive
                      ? <TrendingUp className="w-2.5 h-2.5" />
                      : <TrendingDown className="w-2.5 h-2.5" />
                    }
                    {trend.value}%
                  </span>
                )}
                {description && (
                  <span className="text-[0.72rem] text-muted-foreground">
                    {description}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Icon ── */}
          {icon && (
            <div
              className={cn(
                'flex items-center justify-center',
                'w-11 h-11 rounded-xl flex-shrink-0',
                'border transition-all duration-300',
                'group-hover:scale-110',
                iconColorMap[iconColor],
              )}
            >
              {icon}
            </div>
          )}
        </div>

        {/* ── Bottom progress shimmer bar (decorative) ── */}
        <div className="
          mt-4 h-[2px] rounded-full
          bg-gradient-to-r from-primary/20 via-primary/40 to-primary/10
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
        " />
      </div>
    </div>
  );
}
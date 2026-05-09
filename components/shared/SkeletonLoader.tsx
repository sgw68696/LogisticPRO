"use client";

import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  variant?: 'card' | 'table' | 'list' | 'text';
  count?: number;
  className?: string;
}

export function SkeletonLoader({ variant = 'card', count = 1, className }: SkeletonLoaderProps) {
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
        {items.map((_, i) => (
          <div key={i} className="p-6 bg-card rounded-xl border border-border">
            <div className="space-y-3">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="h-10 bg-muted rounded animate-pulse" />
        {items.map((_, i) => (
          <div key={i} className="h-14 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn("space-y-4", className)}>
        {items.map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((_, i) => (
        <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }} />
      ))}
    </div>
  );
}

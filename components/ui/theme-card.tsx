"use client";

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ThemeCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function ThemeCard({ children, className, hover = true }: ThemeCardProps) {
  return (
    <div
      className={cn(
        "theme-bg-card p-6 transition-all duration-200",
        hover && "hover:shadow-xl hover:scale-[1.02]",
        className
      )}
    >
      {children}
    </div>
  );
}

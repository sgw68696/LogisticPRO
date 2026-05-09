"use client";

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ThemeInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const ThemeInput = forwardRef<HTMLInputElement, ThemeInputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="theme-label">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            className={cn(
              "theme-input",
              icon && "pl-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

ThemeInput.displayName = 'ThemeInput';

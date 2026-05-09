"use client";

import React, { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ThemeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: ReactNode;
  asChild?: boolean;
}

export const ThemeButton = forwardRef<HTMLButtonElement, ThemeButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    className,
    disabled,
    asChild = false,
    ...props
  }, ref) => {
    const baseClasses = "relative overflow-hidden transition-all duration-300 font-semibold cursor-pointer outline-none inline-flex items-center justify-center";
    
    const variants = {
      primary: "theme-button-primary text-white",
      secondary: "theme-bg-tertiary theme-text-secondary hover:bg-opacity-10 border border-theme-border-primary",
      outline: "bg-transparent border border-theme-border-primary theme-text-primary hover:bg-theme-bg-tertiary"
    };
    
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
      icon: "p-2"
    };

    const buttonContent = (
      <>
        {loading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        {icon && !loading && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        
        {/* Gradient overlay for hover effect */}
        {variant === 'primary' && (
          <span className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
        )}
      </>
    );

    if (asChild) {
      // For now, render as regular button but pass the asChild prop
      // This can be enhanced later with proper Radix UI integration
      return (
        <button
          className={cn(
            baseClasses,
            variants[variant],
            sizes[size],
            (disabled || loading) && "opacity-65 cursor-not-allowed",
            className
          )}
          disabled={disabled || loading}
          ref={ref}
          {...props}
        >
          {buttonContent}
        </button>
      );
    }

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          (disabled || loading) && "opacity-65 cursor-not-allowed",
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

ThemeButton.displayName = 'ThemeButton';

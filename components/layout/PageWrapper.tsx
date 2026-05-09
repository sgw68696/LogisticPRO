"use client";

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageWrapper({ children, title, description, actions, className }: PageWrapperProps) {
  return (
    <div className={cn("flex flex-col min-h-[calc(100vh-4rem)]", className)}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            {title && <h1 className="text-2xl font-semibold text-foreground">{title}</h1>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}

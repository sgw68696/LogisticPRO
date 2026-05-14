import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  rows?: number;
  message?: string;
}

export function LoadingState({ rows = 5, message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">{message}</span>
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-16 bg-muted/50 rounded-lg" />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 animate-pulse space-y-3">
      <div className="h-5 bg-muted/50 rounded w-3/4" />
      <div className="h-4 bg-muted/50 rounded w-1/2" />
      <div className="flex gap-2">
        <div className="h-6 bg-muted/50 rounded w-16" />
        <div className="h-6 bg-muted/50 rounded w-20" />
      </div>
      <div className="h-4 bg-muted/50 rounded w-full" />
    </div>
  );
}

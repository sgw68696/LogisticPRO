'use client';

import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  type?: 'create' | 'update' | 'delete' | 'view' | 'export' | 'warning' | 'error';
  actor?: string;
}

interface AuditTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const typeConfig: Record<string, { dot: string; bg: string; icon: string }> = {
  create: { dot: 'bg-emerald-400', bg: 'bg-emerald-500/10', icon: '●' },
  update: { dot: 'bg-blue-400', bg: 'bg-blue-500/10', icon: '◐' },
  delete: { dot: 'bg-red-400', bg: 'bg-red-500/10', icon: '○' },
  view: { dot: 'bg-gray-400', bg: 'bg-gray-500/10', icon: '○' },
  export: { dot: 'bg-purple-400', bg: 'bg-purple-500/10', icon: '◎' },
  warning: { dot: 'bg-amber-400', bg: 'bg-amber-500/10', icon: '⚠' },
  error: { dot: 'bg-red-500', bg: 'bg-red-500/20', icon: '✕' },
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function AuditTimeline({ events, className }: AuditTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-muted-foreground">
        <p className="text-sm">No timeline events</p>
      </div>
    );
  }

  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className={cn('space-y-0', className)}>
      {sorted.map((event, index) => {
        const config = typeConfig[event.type || 'view'] || typeConfig.view;
        const isLast = index === sorted.length - 1;
        return (
          <div key={event.id} className="relative flex gap-4 pb-6">
            {!isLast && (
              <div className="absolute left-[11px] top-5 bottom-0 w-px bg-border/50" />
            )}
            <div className={cn(
              'relative z-10 flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 mt-0.5',
              'border border-border/40',
              config.bg,
            )}>
              <span className={cn('w-2 h-2 rounded-full', config.dot)} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{event.title}</p>
                <span className="text-[0.6rem] text-muted-foreground whitespace-nowrap">
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>
              {event.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
              )}
              {event.actor && (
                <p className="text-[0.6rem] text-muted-foreground/60 mt-0.5">by {event.actor}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

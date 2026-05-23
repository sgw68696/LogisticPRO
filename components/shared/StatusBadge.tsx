import { getStatusStyle } from '@/config/statusConfig';

interface StatusBadgeProps {
  status: string;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ status, dot = true, className = '' }: StatusBadgeProps) {
  const style = getStatusStyle(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} ${style.border} border ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {style.label}
    </span>
  );
}

interface StatusPillProps {
  status: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}

export function StatusPill({ status, count, active, onClick }: StatusPillProps) {
  const style = getStatusStyle(status);
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${active ? `${style.bg} ${style.text} ${style.border} border` : 'bg-card border border-border/60 text-muted-foreground hover:bg-secondary/50'}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? style.dot : 'bg-muted-foreground'}`} />
      {style.label}
      {count !== undefined && <span className="opacity-60">({count})</span>}
    </button>
  );
}

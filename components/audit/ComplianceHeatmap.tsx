'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HeatmapData {
  module: string;
  score: number;
  status: 'compliant' | 'warning' | 'non-compliant' | 'critical';
}

interface ComplianceHeatmapProps {
  data: HeatmapData[];
  title?: string;
}

function getHeatColor(status: string, score: number): string {
  if (status === 'critical') return 'bg-red-500/20 text-red-400 border-red-500/30';
  if (status === 'non-compliant') return 'bg-orange-500/15 text-orange-400 border-orange-500/25';
  if (status === 'warning') return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
  return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
}

function getBarColor(score: number): string {
  if (score >= 90) return 'bg-emerald-400';
  if (score >= 75) return 'bg-amber-400';
  if (score >= 60) return 'bg-orange-400';
  return 'bg-red-400';
}

export function ComplianceHeatmap({ data, title = 'Compliance by Module' }: ComplianceHeatmapProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.module} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{item.module}</span>
                <span className={cn(
                  'text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full border',
                  getHeatColor(item.status, item.score)
                )}>
                  {item.score}%
                </span>
              </div>
              <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    getBarColor(item.score)
                  )}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[0.6rem] text-muted-foreground">Compliant (90%+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[0.6rem] text-muted-foreground">Warning (75-89%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-[0.6rem] text-muted-foreground">Critical (&lt;75%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

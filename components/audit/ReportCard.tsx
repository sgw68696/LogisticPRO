'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, Download, Eye, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { AuditReport } from '@/types/audit';

interface ReportCardProps {
  report: AuditReport;
  onView?: (report: AuditReport) => void;
  onDownload?: (report: AuditReport) => void;
}

const typeColors: Record<string, string> = {
  Compliance: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Financial: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Operational: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Security: 'bg-red-500/10 text-red-400 border-red-500/20',
  Custom: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const statusColors: Record<string, string> = {
  Draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Final: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Archived: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

function TrendIcon({ trend, change }: { trend: 'up' | 'down' | 'stable'; change: number }) {
  if (trend === 'up') return <TrendingUp className="w-3 h-3 text-emerald-400" />;
  if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-400" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}

export function ReportCard({ report, onView, onDownload }: ReportCardProps) {
  return (
    <Card className="group hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#a855f7] to-[#6366f1]/60 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold leading-tight">{report.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{report.period}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={cn('text-[0.6rem] px-1.5 py-0', typeColors[report.type])}>
              {report.type}
            </Badge>
            <Badge variant="outline" className={cn('text-[0.6rem] px-1.5 py-0', statusColors[report.status])}>
              {report.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{report.summary}</p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {report.metrics.slice(0, 4).map((metric) => (
            <div key={metric.label} className="flex items-center gap-1.5 p-1.5 rounded-md bg-muted/20">
              <TrendIcon trend={metric.trend} change={metric.change} />
              <div className="min-w-0">
                <p className="text-[0.6rem] text-muted-foreground truncate">{metric.label}</p>
                <p className="text-xs font-semibold text-foreground">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className={cn(
                'w-1.5 h-1.5 rounded-full',
                report.riskScore > 40 ? 'bg-red-400' : report.riskScore > 25 ? 'bg-amber-400' : 'bg-emerald-400'
              )} />
              <span className="text-[0.6rem] text-muted-foreground">Risk: {report.riskScore}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn(
                'w-1.5 h-1.5 rounded-full',
                report.complianceScore > 90 ? 'bg-emerald-400' : report.complianceScore > 75 ? 'bg-amber-400' : 'bg-red-400'
              )} />
              <span className="text-[0.6rem] text-muted-foreground">Compliance: {report.complianceScore}%</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => onView?.(report)}>
              <Eye className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => onDownload?.(report)}>
              <Download className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

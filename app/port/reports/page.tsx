'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  BarChart2, Search, FileText, CheckCircle2, AlertTriangle, Clock,
  Download, Printer, X, TrendingUp, TrendingDown, Ship, DollarSign,
  Package, Anchor, ArrowRight, CalendarDays, Eye, Percent,
} from 'lucide-react';

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

interface Report {
  id: string;
  title: string;
  type: string;
  period: ReportPeriod;
  generated: string;
  records: number;
  status: 'Ready' | 'Generating' | 'Failed' | 'Scheduled';
  description: string;
}

const reports: Report[] = [
  { id: 'RPT-001', title: 'Daily Vessel Traffic Report', type: 'Operations', period: 'daily', generated: '14 May 2026 06:00', records: 12, status: 'Ready', description: 'Vessel arrivals, departures, berth occupancy for 14 May' },
  { id: 'RPT-002', title: 'Cargo Throughput Report', type: 'Operations', period: 'daily', generated: '14 May 2026 06:00', records: 345, status: 'Ready', description: 'Total cargo volume handled across all berths (TEU + tonnes)' },
  { id: 'RPT-003', title: 'Berth Utilization Summary', type: 'Operations', period: 'weekly', generated: '12 May 2026', records: 6, status: 'Ready', description: 'Berth occupancy rates, idle time, and efficiency metrics for week 19' },
  { id: 'RPT-004', title: 'Port Revenue Summary', type: 'Finance', period: 'monthly', generated: '01 May 2026', records: 284, status: 'Ready', description: 'Monthly revenue from port charges, berthage, wharfage, and services' },
  { id: 'RPT-005', title: 'Port Performance KPIs', type: 'Analytics', period: 'monthly', generated: '01 May 2026', records: 24, status: 'Ready', description: 'Key performance indicators: turnaround time, crane moves/h, dwell time' },
  { id: 'RPT-006', title: 'Customs Clearance Report', type: 'Compliance', period: 'weekly', generated: '12 May 2026', records: 98, status: 'Ready', description: 'Customs cleared vs pending vs rejected for week 19' },
  { id: 'RPT-007', title: 'Container Dwell Time Analysis', type: 'Analytics', period: 'monthly', generated: '01 May 2026', records: 1248, status: 'Ready', description: 'Average dwell time by container type, origin, and destination' },
  { id: 'RPT-008', title: 'Monthly Financial Statement', type: 'Finance', period: 'monthly', generated: '—', records: 0, status: 'Scheduled', description: 'Pending month-end close — auto-generates on 31 May' },
  { id: 'RPT-009', title: 'Equipment Utilization Report', type: 'Operations', period: 'weekly', generated: '12 May 2026', records: 18, status: 'Ready', description: 'STS crane, RTG, reach stacker utilization and downtime' },
  { id: 'RPT-010', title: 'Port Safety & Incident Report', type: 'Compliance', period: 'monthly', generated: '01 May 2026', records: 3, status: 'Ready', description: 'Safety incidents, near misses, and corrective actions for April' },
];

const summaryCards = [
  { label: 'Vessels This Month', value: '142', change: '+12%', positive: true, icon: Ship },
  { label: 'Cargo Volume (TEU)', value: '38,450', change: '+8.2%', positive: true, icon: Package },
  { label: 'Avg Turnaround', value: '14.2h', change: '-1.5h', positive: true, icon: Clock },
  { label: 'Revenue This Month', value: '$1.24M', change: '+15.3%', positive: true, icon: DollarSign },
  { label: 'Berth Utilization', value: '72%', change: '-3%', positive: false, icon: Anchor },
  { label: 'Customs Clearance Rate', value: '94%', change: '+2.1%', positive: true, icon: CheckCircle2 },
];

export default function ReportsPage() {
  const [search, setSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let result = [...reports];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r => r.title.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    if (periodFilter !== 'All') result = result.filter(r => r.period === periodFilter);
    return result;
  }, [search, periodFilter]);

  return (
    <PageWrapper
      title="Port Reports"
      description="Operational, financial, and compliance reports with analytics and performance metrics"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 rounded-[9px]"><CalendarDays className="w-4 h-4" />Schedule</Button>
          <Button className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:from-sky-600 hover:to-indigo-600 rounded-[10px] gap-2">
            <BarChart2 className="w-4 h-4" />Generate Report
          </Button>
        </div>
      }
    >
      {/* ── KPI Summary Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {summaryCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-card border border-border/60 rounded-xl p-3.5 shadow-soft hover:border-primary/25 transition-all duration-200">
              <div className="flex items-center justify-between mb-1.5">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className={`flex items-center gap-0.5 text-[0.65rem] font-bold ${card.positive ? 'text-emerald-400' : 'text-destructive'}`}>
                  {card.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {card.change}
                </span>
              </div>
              <p className="text-[0.60rem] font-bold uppercase tracking-wide text-muted-foreground">{card.label}</p>
              <p className="text-[1.1rem] font-extrabold text-foreground mt-0.5">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* ── Filter Bar ────────────────────────────────────────── */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => { setSearch(e.target.value); setLoading(true); setTimeout(() => setLoading(false), 300); }} placeholder="Search reports by title, type, or description..." className="w-full h-9 pl-9 pr-3 bg-muted/40 border border-border rounded-[9px] text-[0.84rem] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-primary/5 focus:shadow-[0_0_0_3px_oklch(var(--primary)/0.1)] transition-all duration-200" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
          </div>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[150px] h-9 bg-muted/40 border-border rounded-[9px] text-[0.84rem]"><SelectValue placeholder="Period" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Periods</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(search || periodFilter !== 'All') && <p className="text-[0.72rem] text-muted-foreground mt-2.5 ml-1">{filtered.length} report(s) found</p>}
      </div>

      {/* ── Report Cards ──────────────────────────────────────── */}
      {loading ? <SkeletonLoader variant="card" count={4} /> : filtered.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-xl shadow-soft py-20 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/50 flex items-center justify-center"><BarChart2 className="w-7 h-7 text-muted-foreground/30" /></div>
          <p className="text-[0.88rem] font-semibold text-foreground">No reports found</p>
          <p className="text-[0.78rem] text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 px-4 py-2 mb-4 bg-card border border-border/60 rounded-lg shadow-soft text-[0.78rem] text-muted-foreground">
            <span className="flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5" />{filtered.length} reports</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(report => (
              <div key={report.id} className="group bg-card border border-border/60 rounded-xl shadow-soft p-4 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)] hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <BarChart2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-[0.88rem] font-semibold text-foreground">{report.title}</h3>
                        <p className="text-[0.72rem] text-muted-foreground mt-0.5">{report.description}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.60rem] font-bold border shrink-0 ${
                        report.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        report.status === 'Generating' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        report.status === 'Scheduled' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-destructive/10 text-destructive border-destructive/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                          report.status === 'Ready' ? 'bg-emerald-400' :
                          report.status === 'Generating' ? 'bg-blue-400' :
                          report.status === 'Scheduled' ? 'bg-amber-400' : 'bg-destructive'
                        }`} />
                        {report.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[0.70rem] text-muted-foreground">
                      <Badge variant="outline" className="text-[0.60rem] font-bold px-1.5 py-0">{report.type}</Badge>
                      <span className="capitalize">{report.period}</span>
                      <span className="w-px h-3 bg-border/40" />
                      <span>{report.generated}</span>
                      {report.records > 0 && <><span className="w-px h-3 bg-border/40" /><span>{report.records.toLocaleString()} records</span></>}
                    </div>
                    {report.status === 'Ready' && (
                      <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button variant="outline" size="sm" className="h-7 text-[0.70rem] gap-1 rounded-md"><Eye className="w-3 h-3" />View</Button>
                        <Button variant="outline" size="sm" className="h-7 text-[0.70rem] gap-1 rounded-md"><Download className="w-3 h-3" />Download</Button>
                        <Button variant="outline" size="sm" className="h-7 text-[0.70rem] gap-1 rounded-md"><Printer className="w-3 h-3" />Print</Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </PageWrapper>
  );
}

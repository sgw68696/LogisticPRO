'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Ship,
  Anchor,
  Package,
  Container,
  Sailboat,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Dock,
  Bell,
  Activity,
  CalendarDays,
  FileText,
  DollarSign,
  Wrench,
  Eye,
  ArrowRight,
  Navigation,
  Timer,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────
type ActivityType = 'arrival' | 'departure' | 'berthing' | 'cargo' | 'document' | 'alert' | 'clearance';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
  status: 'completed' | 'in-progress' | 'pending' | 'alert';
}

interface VesselArrival {
  vessel: string;
  imo: string;
  carrier: string;
  eta: string;
  berth: string;
  cargo: string;
  status: string;
  flag: string;
}

interface ContainerMovement {
  id: string;
  container: string;
  type: string;
  status: string;
  vessel: string;
  yard: string;
  gateIn: string;
  hold: boolean;
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  time: string;
  module: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────
const upcomingArrivals: VesselArrival[] = [
  { vessel: 'CMA CGM ALTAMIRA', imo: '9961350', carrier: 'CMA CGM', eta: '13 May 08:15', berth: 'B-12', cargo: '34 TEU', status: 'Berthing', flag: '🇫🇷' },
  { vessel: 'MAERSK GUJARAT', imo: '9345821', carrier: 'Maersk', eta: '14 May 14:00', berth: 'C-03', cargo: '52 TEU', status: 'Sailing', flag: '🇩🇰' },
  { vessel: 'MSC ZOE', imo: '9212345', carrier: 'MSC', eta: '13 May 22:45', berth: 'A-07', cargo: '18 TEU', status: 'Expected', flag: '🇨🇭' },
  { vessel: 'OOCL HONG KONG', imo: '9705123', carrier: 'OOCL', eta: '15 May 06:10', berth: 'D-04', cargo: '28 TEU', status: 'Expected', flag: '🇭🇰' },
];

const containerMovements: ContainerMovement[] = [
  { id: 'C-001', container: 'MAEU123456', type: '40ft HC', status: 'Loaded', vessel: 'CMA CGM ALTAMIRA', yard: 'Yard-A-01', gateIn: '13 May 06:30', hold: false },
  { id: 'C-002', container: 'OOLU789012', type: '20ft', status: 'Unloading', vessel: 'MSC ZOE', yard: 'Yard-B-02', gateIn: '13 May 07:15', hold: true },
  { id: 'C-003', container: 'COSCO345678', type: '40ft', status: 'Loaded', vessel: 'MAERSK GUJARAT', yard: 'Yard-C-03', gateIn: '12 May 22:00', hold: false },
  { id: 'C-004', container: 'APL901234', type: '20ft HC', status: 'Pending', vessel: 'OOCL HONG KONG', yard: 'Yard-D-01', gateIn: '—', hold: false },
  { id: 'C-005', container: 'MSC567890', type: '40ft', status: 'Loaded', vessel: 'MSC ZOE', yard: 'Yard-A-04', gateIn: '12 May 18:45', hold: false },
];

const alerts: Alert[] = [
  { id: 'A-001', severity: 'critical', message: 'Berth B-02 maintenance overrun — vessel ETA in 3 hours', time: '10 min ago', module: 'Berth' },
  { id: 'A-002', severity: 'warning', message: 'Container OOLU789012 on customs hold — docs pending', time: '25 min ago', module: 'Customs' },
  { id: 'A-003', severity: 'warning', message: 'Yard utilization at 88% — consider re-routing', time: '1 hour ago', module: 'Yard' },
  { id: 'A-004', severity: 'info', message: 'Cargo manifest for MSC ZOE received — 18 containers', time: '2 hours ago', module: 'Cargo' },
  { id: 'A-005', severity: 'info', message: 'Port charges invoice INV-2026-0421 generated', time: '3 hours ago', module: 'Finance' },
];

const recentActivity: Activity[] = [
  { id: 'ACT-001', type: 'arrival', title: 'CMA CGM ALTAMIRA Arrived', description: 'Berth B-12 — 34 TEU', time: '2 min ago', status: 'completed' },
  { id: 'ACT-002', type: 'clearance', title: 'Customs Clearance Approved', description: 'Container MAEU123456 — Export', time: '15 min ago', status: 'completed' },
  { id: 'ACT-003', type: 'berthing', title: 'Berthing Started', description: 'MSC ZOE at Berth A-07', time: '30 min ago', status: 'in-progress' },
  { id: 'ACT-004', type: 'cargo', title: 'Unloading Completed', description: '22 containers from COSCO PRIDE', time: '1 hour ago', status: 'completed' },
  { id: 'ACT-005', type: 'departure', title: 'EVERGREEN LOTUS Departed', description: 'Berth E-01 — 45 TEU to Shanghai', time: '2 hours ago', status: 'completed' },
  { id: 'ACT-006', type: 'document', title: 'Manifest Filed', description: 'MAERSK GUJARAT — 52 containers', time: '3 hours ago', status: 'completed' },
];

// ─── Helpers ────────────────────────────────────────────────────────────
const statusPill = (status: string) => {
  const map: Record<string, string> = {
    Berthing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Sailing: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Expected: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Arrived: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return map[status] || 'bg-muted/50 text-muted-foreground border-border/40';
};

const activityIcon = (type: ActivityType) => {
  const map: Record<ActivityType, { icon: typeof Ship; color: string; bg: string }> = {
    arrival: { icon: ArrowDownLeft, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    departure: { icon: ArrowUpRight, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    berthing: { icon: Anchor, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    cargo: { icon: Package, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    document: { icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    alert: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
    clearance: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  };
  return map[type];
};

const severityColor = (severity: string) => {
  if (severity === 'critical') return 'border-l-destructive bg-destructive/5';
  if (severity === 'warning') return 'border-l-amber-400 bg-amber-500/5';
  return 'border-l-sky-400 bg-sky-500/5';
};

const containerStatusPill = (status: string) => {
  const map: Record<string, string> = {
    Loaded: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Unloading: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return map[status] || 'bg-muted/50 text-muted-foreground border-border/40';
};

// ─── Main Component ─────────────────────────────────────────────────────
export default function PortDashboard() {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Today');

  // Simulated stats refresh
  const stats = useMemo(() => ({
    vesselsToday: upcomingArrivals.length,
    cargoVolume: '2,450T',
    containers: '1,248',
    berthsOccupied: '4 / 6',
    occupancyPct: 67,
    pendingClearance: 3,
    activeAlerts: alerts.filter(a => a.severity === 'critical' || a.severity === 'warning').length,
  }), []);

  return (
    <PageWrapper
      title="Port Operations Dashboard"
      description="Real-time overview of vessel traffic, cargo operations, berth allocation, and port activities"
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2 text-[0.78rem] text-muted-foreground">
            <Activity className={`w-3.5 h-3.5 ${stats.activeAlerts > 0 ? 'text-destructive animate-pulse' : 'text-emerald-400'}`} />
            <span className={stats.activeAlerts > 0 ? 'text-destructive font-semibold' : ''}>
              {stats.activeAlerts} alert{stats.activeAlerts !== 1 ? 's' : ''}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 800); }}
            className="gap-2 rounded-[9px]"
          >
            <Loader2 className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:from-sky-600 hover:to-indigo-600 rounded-[10px] gap-2">
            <FileText className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-6">
          <SkeletonLoader variant="card" count={5} />
          <SkeletonLoader variant="table" count={4} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── KPI Strip ────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <KPICard title="Vessels Today" value={stats.vesselsToday} icon={<Ship className="w-5 h-5" />} iconColor="cyan" description="Arrivals & departures" />
            <KPICard title="Cargo Volume" value={stats.cargoVolume} icon={<Package className="w-5 h-5" />} iconColor="indigo" description="Total weight in port" />
            <KPICard title="Containers" value={stats.containers} icon={<Container className="w-5 h-5" />} iconColor="teal" trend={{ value: 42, isPositive: true }} description="In yard / on vessels" />
            <KPICard title="Berths Occupied" value={stats.berthsOccupied} icon={<Dock className="w-5 h-5" />} iconColor="amber" description={`${stats.occupancyPct}% utilization`} />
            <KPICard title="Pending Clearance" value={stats.pendingClearance} icon={<FileText className="w-5 h-5" />} iconColor="red" description="Customs holds" />
          </div>

          {/* ── Period Selector ──────────────────────────────── */}
          <div className="flex items-center gap-2">
            {['Today', 'This Week', 'This Month'].map(p => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`px-3 py-1.5 rounded-full text-[0.72rem] font-medium border transition-all ${
                  selectedPeriod === p
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-card text-muted-foreground border-border/40 hover:text-foreground'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* ── Main Grid: 2-column layout ───────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Left column (2/3): Vessel Schedule + Container Movements */}
            <div className="xl:col-span-2 space-y-6">

              {/* Vessel Schedule */}
              <Card className="border-border/60 bg-card shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-5 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Ship className="w-4 h-4 text-sky-400" />
                    <CardTitle className="text-sm font-semibold">Vessel Schedule</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                    View All
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/20">
                        <TableRow className="border-b border-border/40 hover:bg-transparent">
                          <TableHead className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">Vessel</TableHead>
                          <TableHead className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">IMO</TableHead>
                          <TableHead className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">ETA</TableHead>
                          <TableHead className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">Berth</TableHead>
                          <TableHead className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">Cargo</TableHead>
                          <TableHead className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingArrivals.map(row => (
                          <TableRow key={row.imo} className="border-b border-border/25 hover:bg-primary/[0.03] transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-base">{row.flag}</span>
                                <span className="text-[0.82rem] font-semibold text-foreground">{row.vessel}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-[0.82rem] text-muted-foreground font-mono">{row.imo}</TableCell>
                            <TableCell className="text-[0.82rem] text-muted-foreground">{row.eta}</TableCell>
                            <TableCell className="text-[0.82rem] text-muted-foreground font-mono">{row.berth}</TableCell>
                            <TableCell className="text-[0.82rem] text-muted-foreground">{row.cargo}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.65rem] font-bold border ${statusPill(row.status)}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  row.status === 'Berthing' ? 'bg-blue-400' :
                                  row.status === 'Sailing' ? 'bg-indigo-400' :
                                  row.status === 'Arrived' ? 'bg-emerald-400' : 'bg-amber-400'
                                }`} />
                                {row.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Container Movements */}
              <Card className="border-border/60 bg-card shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-5 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Container className="w-4 h-4 text-indigo-400" />
                    <CardTitle className="text-sm font-semibold">Container Movements</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                    View All
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/20">
                        <TableRow className="border-b border-border/40 hover:bg-transparent">
                          <TableHead className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">Container</TableHead>
                          <TableHead className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">Type</TableHead>
                          <TableHead className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">Vessel</TableHead>
                          <TableHead className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">Yard Location</TableHead>
                          <TableHead className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">Gate In</TableHead>
                          <TableHead className="text-[0.70rem] font-bold text-muted-foreground uppercase tracking-widest">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {containerMovements.map(row => (
                          <TableRow key={row.id} className="border-b border-border/25 hover:bg-primary/[0.03] transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-[0.82rem] font-semibold text-foreground font-mono">{row.container}</span>
                                {row.hold && <Badge variant="outline" className="text-[0.60rem] px-1 py-0 bg-destructive/10 text-destructive border-destructive/20">HOLD</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className="text-[0.82rem] text-muted-foreground">{row.type}</TableCell>
                            <TableCell className="text-[0.82rem] text-muted-foreground">{row.vessel}</TableCell>
                            <TableCell className="text-[0.82rem] text-muted-foreground">{row.yard}</TableCell>
                            <TableCell className="text-[0.82rem] text-muted-foreground">{row.gateIn}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold border ${containerStatusPill(row.status)}`}>
                                {row.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right column (1/3): Alerts + Activity Feed */}
            <div className="space-y-6">

              {/* Operational Alerts */}
              <Card className="border-border/60 bg-card shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-5 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <CardTitle className="text-sm font-semibold">Alerts</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[0.60rem] px-1.5">
                    {alerts.length}
                  </Badge>
                </CardHeader>
                <CardContent className="px-4 pt-3 pb-4 space-y-2">
                  {alerts.slice(0, 4).map(alert => (
                    <div
                      key={alert.id}
                      className={`border-l-2 pl-3 py-2 rounded-r-lg ${severityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[0.78rem] font-medium text-foreground leading-snug">{alert.message}</p>
                        {alert.severity === 'critical' && <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5 animate-pulse" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[0.60rem] font-bold uppercase tracking-wide text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded border border-border/30">
                          {alert.module}
                        </span>
                        <span className="text-[0.65rem] text-muted-foreground">{alert.time}</span>
                      </div>
                    </div>
                  ))}
                  {alerts.length > 4 && (
                    <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground gap-1 mt-1">
                      View All ({alerts.length})
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-border/60 bg-card shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-5 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
                  </div>
                  <span className="text-[0.65rem] text-muted-foreground">Live</span>
                </CardHeader>
                <CardContent className="px-4 pt-3 pb-4 space-y-0">
                  {recentActivity.map((act, i) => {
                    const meta = activityIcon(act.type);
                    const Icon = meta.icon;
                    return (
                      <div key={act.id} className="flex items-start gap-3 pb-3 mb-3 border-b border-border/20 last:border-0 last:mb-0 last:pb-0">
                        <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center shrink-0 ${meta.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[0.78rem] font-medium text-foreground">{act.title}</p>
                            <span className="text-[0.60rem] text-muted-foreground shrink-0">{act.time}</span>
                          </div>
                          <p className="text-[0.72rem] text-muted-foreground mt-0.5">{act.description}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                          act.status === 'completed' ? 'bg-emerald-400' :
                          act.status === 'in-progress' ? 'bg-blue-400 animate-pulse' :
                          act.status === 'alert' ? 'bg-destructive animate-pulse' : 'bg-amber-400'
                        }`} />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

            </div>
          </div>

          {/* ── Bottom Strip: Quick Stats ─────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Yard Utilization', value: '82%', sub: '12,400 sqm used', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', bar: 82 },
              { label: 'Berth Occupancy', value: '67%', sub: '4 of 6 berths active', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', bar: 67 },
              { label: 'Equipment Available', value: '14/18', sub: '4 units in maintenance', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', bar: 78 },
              { label: 'Customs Clearance', value: '92%', sub: '24 of 26 cleared today', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', bar: 92 },
            ].map(stat => (
              <div key={stat.label} className="bg-card border border-border/60 rounded-xl p-4 shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[0.70rem] font-bold uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                  <span className={`text-[0.70rem] font-bold px-2 py-0.5 rounded-full border ${stat.color}`}>
                    {stat.value}
                  </span>
                </div>
                <p className="text-[0.72rem] text-muted-foreground">{stat.sub}</p>
                <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden mt-2">
                  <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500" style={{ width: `${stat.bar}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

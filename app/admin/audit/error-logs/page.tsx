'use client';

import { useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  AlertCircle, Search, Download, RefreshCw,
  Bug, Server, Database, Globe, Code,
  ChevronDown, ChevronRight,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';

type ErrorLevel = 'Critical' | 'Error' | 'Warning' | 'Info';
type ErrorSource = 'API' | 'Database' | 'Auth' | 'Frontend' | 'Integration' | 'Background Job';

interface ErrorLog {
  id: string;
  level: ErrorLevel;
  message: string;
  source: ErrorSource;
  endpoint: string;
  user: string;
  ip: string;
  timestamp: string;
  count: number;
  stackTrace: string;
  resolved: boolean;
}

const SOURCES: ErrorSource[] = ['API', 'Database', 'Auth', 'Frontend', 'Integration', 'Background Job'];

const generateErrors = (): ErrorLog[] => {
  const messages = [
    'Connection pool exhausted after 30s timeout',
    'Null pointer exception in shipment tracking service',
    'Failed to parse customs declaration XML',
    'Rate limit exceeded for tracking API endpoint',
    'Database query timeout on shipments table',
    'JWT token verification failed — expired signature',
    'Failed to send SMS notification via Twilio',
    'Redis cache miss rate exceeding 90% threshold',
    'SSL handshake failed with carrier API gateway',
    'OutOfMemoryError in report generation service',
    'Failed to sync container status with port system',
    'Webhook delivery failed after 3 retries',
    'Invalid HS code format in customs declaration',
    'Deadlock detected in invoice processing queue',
    'File upload size exceeded 50MB limit',
  ];
  const errors: ErrorLog[] = [];
  for (let i = 0; i < 50; i++) {
    const hoursAgo = Math.floor(Math.random() * 168);
    const date = new Date(Date.now() - hoursAgo * 3600000);
    const level: ErrorLevel = (['Critical', 'Error', 'Warning', 'Info'] as ErrorLevel[])[Math.floor(Math.random() * 4)];
    errors.push({
      id: `err-${String(i + 1).padStart(3, '0')}`,
      level: level === 'Critical' && Math.random() > 0.7 ? 'Critical' : level,
      message: messages[Math.floor(Math.random() * messages.length)],
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
      endpoint: ['/api/v1/shipments', '/api/v1/tracking', '/api/v1/customs', '/api/v1/auth/login', '/api/v1/invoices', '/api/v1/containers', '/api/webhooks/carrier'][Math.floor(Math.random() * 7)],
      user: ['Rajesh Kumar', 'System', 'Priya Sharma', 'Anonymous', 'API Client'][Math.floor(Math.random() * 5)],
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      timestamp: date.toISOString(),
      count: Math.floor(Math.random() * 25) + 1,
      stackTrace: `at ShipmentService.getStatus (shipment.ts:142)\nat TrackingController.handle (tracking.ts:89)\nat Router.process (router.ts:45)`,
      resolved: Math.random() > 0.4,
    });
  }
  return errors.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const levelStyles: Record<ErrorLevel, string> = {
  Critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  Error: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const sourceIcon: Record<ErrorSource, any> = {
  API: Globe,
  Database: Database,
  Auth: Shield,
  Frontend: Code,
  Integration: Server,
  'Background Job': Bug,
};

export default function ErrorLogsPage() {
  const errors = useMemo(() => generateErrors(), []);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const criticalCount = errors.filter(e => e.level === 'Critical').length;
  const errorCount = errors.filter(e => e.level === 'Error').length;
  const warningCount = errors.filter(e => e.level === 'Warning').length;
  const resolvedCount = errors.filter(e => e.resolved).length;

  const levelData = [
    { name: 'Critical', count: criticalCount, color: '#ef4444' },
    { name: 'Error', count: errorCount, color: '#f59e0b' },
    { name: 'Warning', count: warningCount, color: '#eab308' },
    { name: 'Info', count: errors.filter(e => e.level === 'Info').length, color: '#3b82f6' },
  ];

  const filtered = errors.filter(e => {
    if (search) {
      const q = search.toLowerCase();
      if (!e.message.toLowerCase().includes(q) && !e.endpoint.toLowerCase().includes(q) && !e.id.toLowerCase().includes(q)) return false;
    }
    if (levelFilter !== 'all' && e.level !== levelFilter) return false;
    if (sourceFilter !== 'all' && e.source !== sourceFilter) return false;
    return true;
  });

  return (
    <PageWrapper
      title="Error Logs"
      description="System error monitoring, tracking, and diagnostics"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 gap-2"><Download className="w-4 h-4" />Export</Button>
          <Button variant="outline" className="h-9 gap-2"><RefreshCw className="w-4 h-4" />Refresh</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-card border border-border/60 rounded-xl p-4">
          <p className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">Total Errors</p>
          <p className="text-2xl font-extrabold text-foreground mt-1">{errors.length}</p>
        </div>
        <div className="bg-card border border-border/60 rounded-xl p-4">
          <p className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">Critical</p>
          <p className="text-2xl font-extrabold text-red-400 mt-1">{criticalCount}</p>
        </div>
        <div className="bg-card border border-border/60 rounded-xl p-4">
          <p className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">Errors</p>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">{errorCount}</p>
        </div>
        <div className="bg-card border border-border/60 rounded-xl p-4">
          <p className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">Warnings</p>
          <p className="text-2xl font-extrabold text-yellow-400 mt-1">{warningCount}</p>
        </div>
        <div className="bg-card border border-border/60 rounded-xl p-4">
          <p className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">Resolved</p>
          <p className="text-2xl font-extrabold text-success mt-1">{resolvedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><BarChart className="w-4 h-4 text-muted-foreground" />Error Distribution by Level</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={levelData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0d1f38', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '8px', color: '#e0f2fe' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {levelData.map(e => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4 text-muted-foreground" />Top Error Sources</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SOURCES.map(source => {
                const count = errors.filter(e => e.source === source).length;
                const maxCount = Math.max(...SOURCES.map(s => errors.filter(e => e.source === s).length));
                return (
                  <div key={source}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground text-xs">{source}</span>
                      <span className="text-foreground font-semibold text-xs">{count}</span>
                    </div>
                    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#ef4444] to-[#f59e0b]" style={{ width: `${(count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><Bug className="w-4 h-4 text-muted-foreground" />Error Details</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="Search errors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 w-[180px] text-xs" />
              </div>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue placeholder="Level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Error">Error</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                  <SelectItem value="Info">Info</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Source" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {filtered.map(err => (
              <div key={err.id}>
                <button
                  onClick={() => setExpandedId(expandedId === err.id ? null : err.id)}
                  className="w-full flex items-start gap-3 px-6 py-3.5 hover:bg-muted/10 transition-colors text-left"
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    err.level === 'Critical' && 'bg-red-500/10 text-red-400',
                    err.level === 'Error' && 'bg-amber-500/10 text-amber-400',
                    err.level === 'Warning' && 'bg-yellow-500/10 text-yellow-400',
                    err.level === 'Info' && 'bg-blue-500/10 text-blue-400',
                  )}>
                    {expandedId === err.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={cn('text-[0.6rem] px-1.5 py-0', levelStyles[err.level])}>{err.level}</Badge>
                        <span className="text-sm font-medium text-foreground">{err.message}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className={cn('text-[0.6rem] px-1.5 py-0', err.resolved ? 'bg-success/10 text-success border-success/20' : 'bg-muted/30 text-muted-foreground border-border/40')}>
                          {err.resolved ? 'Resolved' : 'Open'}
                        </Badge>
                        <span className="text-[0.65rem] text-muted-foreground whitespace-nowrap">{err.count}x</span>
                        <span className="text-[0.65rem] text-muted-foreground whitespace-nowrap">
                          {new Date(err.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[0.65rem] font-mono text-muted-foreground/60">{err.endpoint}</span>
                      <span className="text-[0.65rem] text-muted-foreground/60">{err.source}</span>
                      {err.user !== 'System' && <span className="text-[0.65rem] text-muted-foreground/60">{err.user}</span>}
                    </div>
                  </div>
                </button>
                {expandedId === err.id && (
                  <div className="px-6 pb-4">
                    <div className="bg-muted/20 rounded-lg p-4 border border-border/40">
                      <p className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide mb-2">Stack Trace</p>
                      <pre className="text-[0.7rem] font-mono text-muted-foreground/80 whitespace-pre-wrap">{err.stackTrace}</pre>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="outline" className="text-[0.6rem] px-1.5 py-0 border-border/40 text-muted-foreground">IP: {err.ip}</Badge>
                        <Badge variant="outline" className="text-[0.6rem] px-1.5 py-0 border-border/40 text-muted-foreground">ID: {err.id}</Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

function Shield(props: any) { return <span {...props} />; }

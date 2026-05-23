'use client';

import { useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { mockUsers } from '@/data/mockData';
import {
  Activity, Search, RefreshCw, Filter,
  UserPlus, Edit3, Trash2, LogIn, LogOut,
  Upload, Download, Settings, Shield,
  FileText, CheckCircle, XCircle,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ActivityType = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'upload' | 'settings' | 'approve' | 'reject';

interface ActivityEvent {
  id: string;
  type: ActivityType;
  user: string;
  avatar: string;
  action: string;
  target: string;
  module: string;
  details: string;
  timestamp: string;
  ip: string;
}

const ACTIVITY_TYPES: { type: ActivityType; icon: any; color: string; label: string }[] = [
  { type: 'create', icon: UserPlus, color: 'text-success bg-success/10', label: 'Created' },
  { type: 'update', icon: Edit3, color: 'text-sky-400 bg-sky-500/10', label: 'Updated' },
  { type: 'delete', icon: Trash2, color: 'text-destructive bg-destructive/10', label: 'Deleted' },
  { type: 'login', icon: LogIn, color: 'text-green-400 bg-green-500/10', label: 'Logged In' },
  { type: 'logout', icon: LogOut, color: 'text-muted-foreground bg-muted/20', label: 'Logged Out' },
  { type: 'export', icon: Download, color: 'text-indigo-400 bg-indigo-500/10', label: 'Exported' },
  { type: 'upload', icon: Upload, color: 'text-cyan-400 bg-cyan-500/10', label: 'Uploaded' },
  { type: 'settings', icon: Settings, color: 'text-amber-400 bg-amber-500/10', label: 'Settings Changed' },
  { type: 'approve', icon: CheckCircle, color: 'text-success bg-success/10', label: 'Approved' },
  { type: 'reject', icon: XCircle, color: 'text-destructive bg-destructive/10', label: 'Rejected' },
];

const MODULES = ['Users', 'Shipments', 'Companies', 'Organizations', 'Fleet', 'Drivers', 'Warehouse', 'Finance', 'Settings', 'Compliance', 'Bookings'];

const generateActivity = (): ActivityEvent[] => {
  const events: ActivityEvent[] = [];
  const details: Record<ActivityType, string[]> = {
    create: ['New user account created', 'Company registration completed', 'Shipment order created', 'Organization created', 'New driver added to fleet'],
    update: ['Profile information updated', 'Shipment status changed to In Transit', 'Company details modified', 'Role permissions updated', 'Password changed'],
    delete: ['User account deactivated', 'Shipment record archived', 'Company removed from platform', 'Driver record deleted'],
    login: ['Login from Bangalore office', 'Login via SSO', 'API authentication', 'Mobile app login', '2FA verification successful'],
    logout: ['Session expired', 'Manual logout', 'Concurrent session terminated'],
    export: ['Shipment report exported as CSV', 'Revenue report generated', 'User list exported', 'Audit log export'],
    upload: ['Document uploaded to shipment LOG-10056', 'Bulk user import CSV', 'Container inspection photos uploaded'],
    settings: ['Password policy updated', '2FA enforcement changed', 'Session timeout modified', 'Rate limiting configured'],
    approve: ['Company registration approved', 'User access request approved', 'Customs clearance approved', 'Invoice payment approved'],
    reject: ['User access request rejected', 'Document verification failed', 'Company application rejected'],
  };

  const actionPhrases: Record<ActivityType, string> = {
    create: 'created', update: 'updated', delete: 'deleted',
    login: 'logged in', logout: 'logged out', export: 'exported',
    upload: 'uploaded', settings: 'modified', approve: 'approved', reject: 'rejected',
  };

  for (let i = 0; i < 100; i++) {
    const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const type = ACTIVITY_TYPES[Math.floor(Math.random() * ACTIVITY_TYPES.length)].type;
    const module = MODULES[Math.floor(Math.random() * MODULES.length)];
    const detailList = details[type];
    const hoursAgo = Math.floor(Math.random() * 168);
    const date = new Date(Date.now() - hoursAgo * 3600000 - Math.floor(Math.random() * 60) * 60000);

    events.push({
      id: `act-${String(i + 1).padStart(3, '0')}`,
      type,
      user: user.name,
      avatar: user.avatar || user.name.charAt(0),
      action: `${type === 'settings' ? 'System settings' : `${module} ${actionPhrases[type]}`}`,
      target: module,
      module,
      details: detailList[Math.floor(Math.random() * detailList.length)],
      timestamp: date.toISOString(),
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    });
  }
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export default function SystemActivityPage() {
  const activity = useMemo(() => generateActivity(), []);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = activity.filter(e => {
    if (search) {
      const q = search.toLowerCase();
      if (!e.user.toLowerCase().includes(q) && !e.details.toLowerCase().includes(q) && !e.action.toLowerCase().includes(q)) return false;
    }
    if (moduleFilter !== 'all' && e.module !== moduleFilter) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    return true;
  });

  const getTypeConfig = (type: ActivityType) => ACTIVITY_TYPES.find(t => t.type === type)!;

  return (
    <PageWrapper
      title="System Activity"
      description="Real-time activity feed tracking all user actions and system events across the platform"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 gap-2"><RefreshCw className="w-4 h-4" />Refresh</Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {ACTIVITY_TYPES.slice(0, 5).map(({ type, icon: Icon, color, label }) => {
          const count = activity.filter(e => e.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
              className={cn(
                'bg-card border rounded-xl p-3 text-left transition-all hover:border-primary/30',
                typeFilter === type ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border/60',
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', color)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[0.65rem] font-bold text-muted-foreground">{label}</p>
                  <p className="text-sm font-extrabold text-foreground">{count}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              Activity Timeline
              <Badge variant="outline" className="text-[0.6rem] px-1.5 py-0 border-border/40 text-muted-foreground ml-1">{filtered.length} events</Badge>
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="Search activity..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 w-[160px] text-xs" />
              </div>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Module" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative">
            <div className="absolute left-[52px] top-0 bottom-0 w-px bg-border/30" />
            <div className="divide-y divide-border/20">
              {filtered.map((event) => {
                const config = getTypeConfig(event.type);
                const Icon = config.icon;
                return (
                  <div key={event.id} className="relative flex items-start gap-4 px-6 py-4 hover:bg-muted/10 transition-colors">
                    <div className={cn(
                      'relative z-10 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border',
                      config.color.replace('text-', 'border-').split(' ')[0] + '/20 ' + config.color.split(' ')[0],
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#6366f1] flex items-center justify-center text-white text-[0.55rem] font-bold">
                              {event.avatar}
                            </div>
                            <span className="text-sm font-semibold text-foreground">{event.user}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{event.action}</span>
                        </div>
                        <span className="text-[0.65rem] text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {new Date(event.timestamp).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-[600px]">{event.details}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={cn('text-[0.55rem] px-1.5 py-0', config.color.split(' ').slice(0, 2).join(' ') + ' border-current/20')}>
                          {config.label}
                        </Badge>
                        <Badge variant="outline" className="text-[0.55rem] px-1.5 py-0 border-border/40 text-muted-foreground">{event.module}</Badge>
                        <span className="text-[0.55rem] font-mono text-muted-foreground/50">{event.ip}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

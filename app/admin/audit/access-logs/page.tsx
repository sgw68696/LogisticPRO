'use client';

import { useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { mockUsers } from '@/data/mockData';
import {
  Eye, Search, Download, RefreshCw, Filter,
  CheckCircle, XCircle, Clock, Globe, Monitor,
  Smartphone, Laptop, Shield,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

type AccessStatus = 'Success' | 'Failed' | 'Blocked';
type DeviceType = 'Desktop' | 'Mobile' | 'Tablet' | 'API';

interface AccessLog {
  id: string;
  user: string;
  email: string;
  role: string;
  ip: string;
  location: string;
  device: DeviceType;
  browser: string;
  status: AccessStatus;
  timestamp: string;
  duration: string;
  action: string;
}

const DEVICES: DeviceType[] = ['Desktop', 'Mobile', 'Tablet', 'API'];
const BROWSERS = ['Chrome 120', 'Firefox 121', 'Safari 17', 'Edge 120', 'Chrome 119', 'Safari 16', 'Postman', 'cURL'];

const generateLogs = (): AccessLog[] => {
  const logs: AccessLog[] = [];
  const actions = ['Logged in', 'Logged out', 'Password change', 'Profile update', 'Export data', 'API call', 'View report', 'Settings change'];
  const locations = ['Bangalore, IN', 'Mumbai, IN', 'Delhi, IN', 'Chennai, IN', 'New York, US', 'London, UK', 'Dubai, AE', 'Singapore, SG'];
  const statuses: AccessStatus[] = ['Success', 'Success', 'Success', 'Success', 'Failed', 'Blocked', 'Success', 'Success'];

  for (let i = 0; i < 50; i++) {
    const user = mockUsers[i % mockUsers.length];
    const hoursAgo = Math.floor(Math.random() * 72);
    const minutesAgo = Math.floor(Math.random() * 60);
    const date = new Date(Date.now() - hoursAgo * 3600000 - minutesAgo * 60000);
    logs.push({
      id: `log-${String(i + 1).padStart(3, '0')}`,
      user: user.name,
      email: user.email,
      role: user.role,
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      device: DEVICES[Math.floor(Math.random() * DEVICES.length)],
      browser: BROWSERS[Math.floor(Math.random() * BROWSERS.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      timestamp: date.toISOString(),
      duration: `${Math.floor(Math.random() * 30) + 1}s`,
      action: actions[Math.floor(Math.random() * actions.length)],
    });
  }
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const statusBadge = (status: AccessStatus) => {
  const map: Record<AccessStatus, string> = {
    Success: 'bg-success/10 text-success border-success/20',
    Failed: 'bg-destructive/10 text-destructive border-destructive/20',
    Blocked: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return map[status];
};

const deviceIcon: Record<DeviceType, any> = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Laptop,
  API: Globe,
};

export default function AccessLogsPage() {
  const logs = useMemo(() => generateLogs(), []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');

  const total = logs.length;
  const successCount = logs.filter(l => l.status === 'Success').length;
  const failedCount = logs.filter(l => l.status === 'Failed').length;
  const blockedCount = logs.filter(l => l.status === 'Blocked').length;

  const columns: Column<AccessLog>[] = [
    {
      key: 'user', header: 'User', sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#6366f1] flex items-center justify-center text-white text-[0.55rem] font-bold">
            {r.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-medium">{r.user}</p>
            <p className="text-[0.65rem] text-muted-foreground">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (r) => (
        <Badge variant="outline" className={cn('text-[0.65rem] px-2 py-0.5', statusBadge(r.status))}>
          {r.status === 'Success' ? <CheckCircle className="w-3 h-3 mr-1" /> : r.status === 'Failed' ? <XCircle className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}
          {r.status}
        </Badge>
      ),
    },
    { key: 'action', header: 'Action' },
    {
      key: 'ip', header: 'IP Address',
      render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.ip}</span>,
    },
    {
      key: 'location', header: 'Location',
      render: (r) => <span className="text-xs">{r.location}</span>,
    },
    {
      key: 'device', header: 'Device',
      render: (r) => {
        const Icon = deviceIcon[r.device];
        return (
          <div className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs">{r.device}</span>
          </div>
        );
      },
    },
    {
      key: 'timestamp', header: 'Timestamp', sortable: true,
      render: (r) => (
        <span className="text-xs text-muted-foreground">
          {new Date(r.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      key: 'duration', header: 'Duration',
      render: (r) => <span className="text-xs text-muted-foreground">{r.duration}</span>,
    },
  ];

  const filteredLogs = logs.filter(l => {
    if (search) {
      const q = search.toLowerCase();
      if (!l.user.toLowerCase().includes(q) && !l.email.toLowerCase().includes(q) && !l.ip.includes(q)) return false;
    }
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (deviceFilter !== 'all' && l.device !== deviceFilter) return false;
    return true;
  });

  return (
    <PageWrapper
      title="Access Logs"
      description="Detailed audit trail of all user access attempts, logins, and API requests"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 gap-2"><Download className="w-4 h-4" />Export CSV</Button>
          <Button variant="outline" className="h-9 gap-2"><RefreshCw className="w-4 h-4" />Refresh</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border/60 rounded-xl p-4">
          <p className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">Total Requests</p>
          <p className="text-2xl font-extrabold text-foreground mt-1">{total}</p>
        </div>
        <div className="bg-card border border-border/60 rounded-xl p-4">
          <p className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">Successful</p>
          <p className="text-2xl font-extrabold text-success mt-1">{successCount}</p>
        </div>
        <div className="bg-card border border-border/60 rounded-xl p-4">
          <p className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">Failed</p>
          <p className="text-2xl font-extrabold text-destructive mt-1">{failedCount}</p>
        </div>
        <div className="bg-card border border-border/60 rounded-xl p-4">
          <p className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wide">Blocked</p>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">{blockedCount}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><Eye className="w-4 h-4 text-muted-foreground" />Access Log Entries</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="Search user, email, IP..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 w-[180px] text-xs" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue placeholder="Device" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  {DEVICES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={filteredLogs} columns={columns} pageSize={15} searchKey="user" searchPlaceholder="Search within results..." />
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

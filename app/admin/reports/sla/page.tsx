'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  Download,
  RefreshCw,
  BarChart3,
  XCircle,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockShipments, mockAnalytics, mockCustomers } from '@/data/mockData';

const totalShipments = mockShipments.length;
const delivered = mockShipments.filter(s => s.status === 'Delivered').length;
const onTimeRate = mockAnalytics.kpiSummary.onTimeDeliveryRate;
const breachedCount = Math.floor(totalShipments * (1 - onTimeRate / 100));

const slaComplianceTrend = Array.from({ length: 12 }, (_, i) => {
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return {
    month: monthNames[i],
    compliance: Math.round((85 + Math.random() * 12) * 10) / 10,
    target: 95,
  };
});

const breachReasons = [
  { name: 'Weather Conditions', value: 35, color: '#0ea5e9' },
  { name: 'Traffic / Route Delay', value: 25, color: '#f59e0b' },
  { name: 'Driver Availability', value: 18, color: '#a855f7' },
  { name: 'Documentation Issues', value: 12, color: '#ef4444' },
  { name: 'Vehicle Breakdown', value: 10, color: '#22c55e' },
];

const slaByCompany = mockCustomers
  .filter(c => c.slaContract)
  .slice(0, 10)
  .map(c => ({
    company: c.name,
    contractId: c.slaContract || '',
    compliance: Math.round((80 + Math.random() * 18) * 10) / 10,
    breaches: Math.floor(Math.random() * 8),
    status: Math.random() > 0.75 ? 'At Risk' : 'Compliant',
  }));

const slaCompanyColumns: Column<typeof slaByCompany[number]>[] = [
  { key: 'company', header: 'Company', sortable: true },
  { key: 'contractId', header: 'Contract ID', sortable: true, render: (i) => <span className="font-mono text-xs">{i.contractId}</span> },
  {
    key: 'compliance', header: 'Compliance %', sortable: true, className: 'text-right',
    render: (i) => {
      const color = i.compliance >= 95 ? 'text-green-400' : i.compliance >= 85 ? 'text-amber-400' : 'text-red-400';
      return <span className={`font-semibold ${color}`}>{i.compliance}%</span>;
    },
  },
  { key: 'breaches', header: 'Breaches', sortable: true, className: 'text-right' },
  {
    key: 'status', header: 'Status',
    render: (i) => (
      <Badge variant="outline" className={i.status === 'Compliant' ? 'border-green-500/30 text-green-400' : 'border-amber-500/30 text-amber-400'}>
        {i.status}
      </Badge>
    ),
  },
];

const recentBreaches = mockShipments
  .filter(s => s.status !== 'Delivered' && s.status !== 'Pending')
  .slice(0, 8)
  .map(s => ({
    tracking: s.trackingNumber,
    customer: s.senderName,
    route: `${s.pickupAddress.split(',').pop()?.trim() || ''} → ${s.deliveryAddress.split(',').pop()?.trim() || ''}`,
    delay: `${Math.floor(Math.random() * 48) + 2}h`,
    reason: ['Weather delay', 'Traffic congestion', 'Driver reassignment', 'Documentation hold', 'Vehicle issue', 'Route deviation'][Math.floor(Math.random() * 6)],
    status: Math.random() > 0.6 ? 'Open' : 'Resolved',
  }));

const breachColumns: Column<typeof recentBreaches[number]>[] = [
  { key: 'tracking', header: 'Tracking', sortable: true, render: (i) => <span className="font-mono text-xs">{i.tracking}</span> },
  { key: 'customer', header: 'Customer', sortable: true },
  { key: 'route', header: 'Route', render: (i) => <span className="text-xs text-muted-foreground">{i.route}</span> },
  { key: 'delay', header: 'Delay', className: 'text-right', render: (i) => <Badge variant="outline" className="border-red-500/30 text-red-400">{i.delay}</Badge> },
  { key: 'reason', header: 'Reason', sortable: true },
  {
    key: 'status', header: 'Status',
    render: (i) => (
      <Badge variant="outline" className={i.status === 'Open' ? 'border-amber-500/30 text-amber-400' : 'border-green-500/30 text-green-400'}>{i.status}</Badge>
    ),
  },
];

const chartConfig = {
  compliance: { label: 'Compliance %', color: '#22c55e' },
  target: { label: 'Target', color: '#f59e0b' },
};

export default function SLAReportsPage() {
  const [period, setPeriod] = useState('1y');

  return (
    <PageWrapper
      title="SLA Reports"
      description="Service Level Agreement compliance tracking, breach analysis, and performance metrics"
      actions={
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Period" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1q">Last Quarter</SelectItem>
              <SelectItem value="1y">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-9 gap-2"><Download className="w-4 h-4" />Export</Button>
          <Button variant="outline" className="h-9 gap-2"><RefreshCw className="w-4 h-4" />Refresh</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="SLA Compliance Rate" value={`${onTimeRate}%`} icon={<CheckCircle className="w-5 h-5" />} trend={{ value: 2.1, isPositive: true }} iconColor="green" />
        <KPICard title="Breached SLAs" value={breachedCount} icon={<AlertCircle className="w-5 h-5" />} trend={{ value: 3, isPositive: false }} iconColor="red" />
        <KPICard title="Avg Response Time" value="2.4h" icon={<Clock className="w-5 h-5" />} trend={{ value: 8, isPositive: true }} iconColor="cyan" />
        <KPICard title="On-Time Delivery" value={`${onTimeRate}%`} icon={<TrendingUp className="w-5 h-5" />} trend={{ value: 1.5, isPositive: true }} iconColor="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" />SLA Compliance Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart data={slaComplianceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="complianceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 12 }} />
                  <YAxis domain={[70, 100]} tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Area type="monotone" dataKey="compliance" stroke="#22c55e" fill="url(#complianceGrad)" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4 }} name="Compliance %" />
                  <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="8 4" dot={false} name="Target (95%)" />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4 text-muted-foreground" />Breach Reasons Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center">
              <div className="w-[50%] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={breachReasons} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" nameKey="name">
                      {breachReasons.map(e => <Cell key={e.name} fill={e.color} stroke="rgba(255,255,255,0.05)" />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0d1f38', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '8px', color: '#e0f2fe' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[50%] space-y-2.5 pl-4">
                {breachReasons.map(e => (
                  <div key={e.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                      <span className="text-muted-foreground text-xs">{e.name}</span>
                    </div>
                    <span className="text-foreground font-semibold text-xs">{e.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-muted-foreground" />Monthly Breach Count</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ChartContainer config={{}} className="h-full w-full">
                <BarChart data={slaComplianceTrend.map(m => ({ month: m.month, breaches: Math.floor(Math.random() * 15) + 2 }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="breaches" fill="#ef4444" radius={[4, 4, 0, 0]} name="Breaches" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><CheckCircle className="w-4 h-4 text-muted-foreground" />SLA Performance Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Current Compliance vs Target</span>
                  <span className="text-foreground font-semibold">{onTimeRate}% / 95%</span>
                </div>
                <div className="h-3 bg-muted/30 rounded-full overflow-hidden relative">
                  <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: `${onTimeRate}%` }} />
                  <div className="absolute top-0 right-[5%] h-full w-0.5 bg-amber-400" style={{ right: '5%' }} />
                </div>
                <div className="flex justify-between text-[0.6rem] text-muted-foreground mt-0.5">
                  <span>0%</span>
                  <span className="text-amber-400">Target 95%</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/30">
                {[
                  { label: 'Active SLA Contracts', value: mockCustomers.filter(c => c.slaContract).length, color: 'text-cyan-400' },
                  { label: 'Companies At Risk', value: slaByCompany.filter(c => c.status === 'At Risk').length, color: 'text-amber-400' },
                  { label: 'Avg Breach Resolution', value: '4.2h', color: 'text-green-400' },
                  { label: 'Worst Month', value: slaComplianceTrend.reduce((min, m) => m.compliance < min.compliance ? m : min).month, color: 'text-red-400' },
                ].map(s => (
                  <div key={s.label} className="text-center p-2 rounded-lg bg-muted/10">
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[0.65rem] text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><CheckCircle className="w-4 h-4 text-muted-foreground" />Company-wise SLA Compliance</CardTitle></CardHeader>
          <CardContent>
            <DataTable data={slaByCompany} columns={slaCompanyColumns} searchKey="company" searchPlaceholder="Search companies..." pageSize={8} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4 text-muted-foreground" />Recent SLA Breaches</CardTitle>
              <Badge variant="outline" className="border-amber-500/30 text-amber-400">{breachedCount} Total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable data={recentBreaches} columns={breachColumns} pageSize={5} />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

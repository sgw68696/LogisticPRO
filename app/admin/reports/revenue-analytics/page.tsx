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
  DollarSign,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area, PieChart as RePieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockAnalytics, mockInvoices, mockCompanies } from '@/data/mockData';

const monthlyData = mockAnalytics.monthlyRevenue.map(m => ({
  ...m,
  profit: m.revenue - m.expenses,
  margin: ((m.revenue - m.expenses) / m.revenue * 100).toFixed(1),
}));

const revenueByRegion = mockAnalytics.revenueByRegion;

const revenueByService = [
  { name: 'Express', value: Math.floor(mockAnalytics.kpiSummary.revenueThisMonth * 0.4) },
  { name: 'Standard', value: Math.floor(mockAnalytics.kpiSummary.revenueThisMonth * 0.35) },
  { name: 'Freight', value: Math.floor(mockAnalytics.kpiSummary.revenueThisMonth * 0.25) },
];

const expenseBreakdown = [
  { name: 'Fuel', value: 250000, color: '#f59e0b' },
  { name: 'Maintenance', value: 150000, color: '#ef4444' },
  { name: 'Salaries', value: 450000, color: '#0ea5e9' },
  { name: 'Infrastructure', value: 180000, color: '#a855f7' },
  { name: 'Other', value: 80000, color: '#6b7280' },
];

const totalExpenses = expenseBreakdown.reduce((s, e) => s + e.value, 0);

const companyRevenue = mockCompanies.map(c => ({
  name: c.name,
  revenue: Math.floor(Math.random() * 500000) + 100000,
  plan: c.plan,
  growth: (Math.random() * 30 - 10).toFixed(1),
}));

const companyRevColumns: Column<typeof companyRevenue[number]>[] = [
  { key: 'name', header: 'Company', sortable: true },
  {
    key: 'revenue', header: 'Revenue', sortable: true, className: 'text-right',
    render: (i) => <span className="font-semibold">₹{i.revenue.toLocaleString('en-IN')}</span>,
  },
  {
    key: 'plan', header: 'Plan', sortable: true,
    render: (i) => (
      <Badge variant="outline" className={
        i.plan === 'Enterprise' ? 'border-purple-500/30 text-purple-400' :
        i.plan === 'Professional' ? 'border-blue-500/30 text-blue-400' :
        'border-slate-500/30 text-slate-400'
      }>{i.plan}</Badge>
    ),
  },
  {
    key: 'growth', header: 'Growth', sortable: true, className: 'text-right',
    render: (i) => (
      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${Number(i.growth) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {Number(i.growth) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(Number(i.growth))}%
      </span>
    ),
  },
];

const chartConfig = {
  revenue: { label: 'Revenue', color: '#22c55e' },
  expenses: { label: 'Expenses', color: '#ef4444' },
  profit: { label: 'Profit', color: '#0ea5e9' },
};

const PAYMENT_METHOD_COLORS = ['#0ea5e9', '#22c55e', '#a855f7', '#f59e0b'];

export default function RevenueAnalyticsPage() {
  const [period, setPeriod] = useState('1y');
  const totalRevenue = mockAnalytics.monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const currentMRR = mockAnalytics.kpiSummary.revenueThisMonth;
  const prevMRR = mockAnalytics.monthlyRevenue[mockAnalytics.monthlyRevenue.length - 2]?.revenue || 0;
  const mrrGrowth = prevMRR > 0 ? ((currentMRR - prevMRR) / prevMRR * 100).toFixed(1) : '0';
  const netProfit = monthlyData.reduce((s, m) => s + m.profit, 0);
  const avgMargin = monthlyData.reduce((s, m) => s + Number(m.margin), 0) / monthlyData.length;

  return (
    <PageWrapper
      title="Revenue Analytics"
      description="Deep analysis of platform revenue, expenses, and profitability"
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
        <KPICard title="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} icon={<DollarSign className="w-5 h-5" />} trend={{ value: 15, isPositive: true }} iconColor="green" />
        <KPICard title="Monthly Recurring Revenue" value={`₹${currentMRR.toLocaleString('en-IN')}`} icon={<TrendingUp className="w-5 h-5" />} trend={{ value: Number(mrrGrowth), isPositive: Number(mrrGrowth) > 0 }} iconColor="cyan" />
        <KPICard title="Net Profit" value={`₹${netProfit.toLocaleString('en-IN')}`} icon={<BarChart3 className="w-5 h-5" />} trend={{ value: 10, isPositive: true }} iconColor="indigo" />
        <KPICard title="Avg Profit Margin" value={`${avgMargin.toFixed(1)}%`} icon={<PieChart className="w-5 h-5" />} trend={{ value: 2.5, isPositive: true }} iconColor="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" />Revenue vs Expenses</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-muted-foreground" />Profit Margin Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4 }} name="Revenue" />
                  <Line type="monotone" dataKey="profit" stroke="#0ea5e9" strokeWidth={2.5} dot={{ fill: '#0ea5e9', r: 4 }} name="Profit" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#ef4444', r: 3 }} name="Expenses" />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><PieChart className="w-4 h-4 text-muted-foreground" />Revenue by Service</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={revenueByService} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" nameKey="name">
                      {revenueByService.map(e => (
                        <Cell key={e.name} fill={e.name === 'Express' ? '#0ea5e9' : e.name === 'Standard' ? '#22c55e' : '#a855f7'} stroke="rgba(255,255,255,0.05)" />
                      ))}
                    </Pie>
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {revenueByService.map(e => (
                  <div key={e.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.name === 'Express' ? '#0ea5e9' : e.name === 'Standard' ? '#22c55e' : '#a855f7' }} />
                    <span className="text-muted-foreground">{e.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4 text-muted-foreground" />Expense Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenseBreakdown.map(e => (
                <div key={e.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{e.name}</span>
                    <span className="text-foreground font-semibold">₹{(e.value / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(e.value / totalExpenses) * 100}%`, backgroundColor: e.color }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border/30 flex justify-between text-sm">
                <span className="text-muted-foreground font-semibold">Total Expenses</span>
                <span className="text-foreground font-bold">₹{(totalExpenses / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-muted-foreground" />Revenue by Region</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueByRegion.map(r => {
                const maxRev = Math.max(...revenueByRegion.map(x => x.revenue));
                return (
                  <div key={r.region}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{r.region}</span>
                      <span className="text-foreground font-semibold">₹{(r.revenue / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#6366f1]" style={{ width: `${(r.revenue / maxRev) * 100}%` }} />
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4 text-muted-foreground" />Revenue by Company</CardTitle>
            <Badge variant="outline" className="border-green-500/30 text-green-400">{mockCompanies.length} companies</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable data={companyRevenue} columns={companyRevColumns} searchKey="name" searchPlaceholder="Search companies..." pageSize={10} />
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

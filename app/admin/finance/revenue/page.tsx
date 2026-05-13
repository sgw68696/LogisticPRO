'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, BarChart3, Percent } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, LineChart } from 'recharts';
import { mockAnalytics, mockInvoices } from '@/data/mockData';

const monthlyData = mockAnalytics.monthlyRevenue.map(m => ({
  ...m,
  profit: m.revenue - m.expenses,
}));

const revenueByRegion = mockAnalytics.revenueByRegion;

const regionChartConfig = {
  revenue: { label: 'Revenue', color: '#0ea5e9' },
};

const monthlyChartConfig = {
  revenue: { label: 'Revenue', color: '#22c55e' },
  expenses: { label: 'Expenses', color: '#ef4444' },
  profit: { label: 'Profit', color: '#0ea5e9' },
};

const planRevenue = [
  { plan: 'Starter', revenue: 358800, companies: 1 },
  { plan: 'Professional', revenue: 958800, companies: 1 },
  { plan: 'Enterprise', revenue: 0, companies: 0 },
];

export default function RevenuePage() {
  const totalRevenue = mockAnalytics.kpiSummary.revenueThisMonth;
  const avgInvoiceValue = mockInvoices.length
    ? Math.round(mockInvoices.reduce((s, i) => s + i.amount, 0) / mockInvoices.length)
    : 0;
  const prevMonthRevenue = 1520000;
  const growth = ((totalRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1);

  return (
    <PageWrapper title="Revenue Analytics" description="Platform-wide revenue tracking and insights">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Monthly Recurring Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: Number(growth), isPositive: Number(growth) > 0 }}
          iconColor="green"
        />
        <KPICard
          title="Total Revenue (All Time)"
          value={`₹${mockAnalytics.monthlyRevenue.reduce((s, m) => s + m.revenue, 0).toLocaleString('en-IN')}`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: 15, isPositive: true }}
          iconColor="cyan"
        />
        <KPICard
          title="Avg Invoice Value"
          value={`₹${avgInvoiceValue.toLocaleString('en-IN')}`}
          icon={<BarChart3 className="w-5 h-5" />}
          trend={{ value: 4, isPositive: true }}
          iconColor="indigo"
        />
        <KPICard
          title="Growth Rate"
          value={`${growth}%`}
          icon={<Percent className="w-5 h-5" />}
          trend={{ value: Number(growth), isPositive: Number(growth) > 0 }}
          iconColor="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={monthlyChartConfig} className="h-full w-full">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 12 }} />
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
          <CardHeader>
            <CardTitle className="text-base font-semibold">Revenue by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByRegion.map((region) => {
                const maxRevenue = Math.max(...revenueByRegion.map(r => r.revenue));
                const pct = (region.revenue / maxRevenue) * 100;
                return (
                  <div key={region.region}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{region.region}</span>
                      <span className="text-foreground font-semibold">₹{(region.revenue / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #0ea5e9, #6366f1)' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Profit Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ChartContainer config={monthlyChartConfig} className="h-full w-full">
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} name="Revenue" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} name="Expenses" />
                  <Line type="monotone" dataKey="profit" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#0ea5e9', r: 4 }} name="Profit" />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Revenue by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planRevenue.map((plan) => {
                const maxRev = Math.max(...planRevenue.map(p => p.revenue), 1);
                const pct = maxRev > 0 ? (plan.revenue / maxRev) * 100 : 0;
                return (
                  <div key={plan.plan}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{plan.plan}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{plan.companies} company{plan.companies !== 1 ? 'ies' : ''}</span>
                        <span className="text-foreground font-semibold">₹{(plan.revenue / 100).toFixed(0)}K</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: plan.plan === 'Enterprise'
                            ? 'linear-gradient(90deg, #a855f7, #d946ef)'
                            : plan.plan === 'Professional'
                            ? 'linear-gradient(90deg, #0ea5e9, #6366f1)'
                            : 'linear-gradient(90deg, #94a3b8, #64748b)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

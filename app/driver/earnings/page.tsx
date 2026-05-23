'use client';

import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { KPICard } from '@/components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockDrivers, mockShipments, mockInvoices } from '@/data/mockData';
import {
  Wallet, TrendingUp, DollarSign, Receipt,
  Calendar, ArrowRight, Clock, CheckCircle2,
  Download, Eye, ChevronDown, ChevronRight,
  BarChart3, Plus,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip,
} from 'recharts';

const DRIVER_ID = 'drv-001';

const weeklyEarnings = Array.from({ length: 12 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (11 - i) * 7);
  return {
    week: `W${Math.ceil((i + 1) / 4) + 1}`,
    label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: Math.floor(Math.random() * 8000) + 2000,
    trips: Math.floor(Math.random() * 8) + 2,
  };
});

export default function EarningsPage() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const driver = useMemo(() => mockDrivers.find(d => d.id === DRIVER_ID)!, []);
  const myDeliveries = useMemo(() =>
    mockShipments.filter(s => s.assignedDriver === DRIVER_ID && s.status === 'Delivered'),
  []);

  const totalEarnings = useMemo(() =>
    myDeliveries.length * 450 + Math.floor(Math.random() * 5000),
  [myDeliveries.length]);

  const monthlyAvg = useMemo(() =>
    Math.round(totalEarnings / Math.max(1, Math.ceil(myDeliveries.length / 5))),
  [totalEarnings, myDeliveries.length]);

  return (
    <PageWrapper title="Earnings" description="Track your trips, earnings, and payment history">
      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Earnings" value={`$${totalEarnings.toLocaleString()}`} icon={<Wallet className="w-5 h-5" />} iconColor="green" />
        <KPICard title="Completed Trips" value={myDeliveries.length} icon={<CheckCircle2 className="w-5 h-5" />} iconColor="indigo" />
        <KPICard title="Monthly Avg" value={`$${monthlyAvg.toLocaleString()}`} icon={<TrendingUp className="w-5 h-5" />} iconColor="cyan" />
        <KPICard title="Rating" value={driver.rating} icon={<BarChart3 className="w-5 h-5" />} iconColor="amber" />
      </div>

      {/* Earnings Chart */}
      <Card className="bg-card border border-border/60 shadow-soft mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-[0.82rem] font-bold font-display flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Weekly Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyEarnings} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" opacity={0.3} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'oklch(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'oklch(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ background: 'oklch(var(--card))', border: '1px solid oklch(var(--border))', borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Earnings']} />
                <Bar dataKey="amount" radius={[3, 3, 0, 0]} fill="url(#earningsGrad)">
                  <defs>
                    <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payouts */}
      <Card className="bg-card border border-border/60 shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-[0.82rem] font-bold font-display">Trip Earnings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {myDeliveries.length > 0 ? (
            <div className="divide-y divide-border/40">
              {myDeliveries.slice(0, 10).map((d, idx) => {
                const amount = Math.floor(Math.random() * 800) + 200;
                return (
                  <div key={d.id} className="px-4 py-3 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[0.72rem] font-medium text-foreground font-mono">{d.trackingNumber}</span>
                          <span className="text-[0.6rem] text-muted-foreground">{d.receiverName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[0.6rem] text-muted-foreground">
                          <Calendar className="w-2.5 h-2.5" />
                          {d.actualDelivery ? new Date(d.actualDelivery).toLocaleDateString() : new Date(d.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[0.82rem] font-bold text-success">${amount}</p>
                        <p className="text-[0.55rem] text-muted-foreground">{d.packageWeight}kg</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Receipt className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-[0.82rem] text-muted-foreground">No completed trips yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { BarChart3, TrendingUp, DollarSign, Package, Users as UsersIcon } from 'lucide-react';

export default function OrgAdminAnalyticsPage() {
  return (
    <PageWrapper title="Analytics" description="Organization-wide analytics and KPIs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Revenue" value="₹8.7Cr" icon={<DollarSign size={18} />} iconColor="green" description="FY 2024-25" trend={{ value: 18, isPositive: true }} />
        <KPICard title="Avg per Company" value="₹72L" icon={<TrendingUp size={18} />} iconColor="indigo" description="Revenue per company" />
        <KPICard title="Shipments" value="4,892" icon={<Package size={18} />} iconColor="cyan" description="This year" trend={{ value: 24, isPositive: true }} />
        <KPICard title="Total Users" value={156} icon={<UsersIcon size={18} />} iconColor="amber" description="Across all companies" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/60 rounded-xl p-6 shadow-soft">
          <h3 className="text-[0.94rem] font-bold font-display text-foreground mb-4">Revenue by Company</h3>
          <div className="space-y-4">
            {[
              { name: 'FastTrack Logistics', revenue: '₹3.2Cr', pct: 37 },
              { name: 'Oceanic Shipping Co', revenue: '₹2.8Cr', pct: 32 },
              { name: 'Global Cargo Movers', revenue: '₹1.5Cr', pct: 17 },
              { name: 'AirCargo Express', revenue: '₹0.9Cr', pct: 10 },
              { name: 'Others', revenue: '₹0.3Cr', pct: 4 },
            ].map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-[0.82rem] mb-1">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="text-muted-foreground">{item.revenue}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-6 shadow-soft">
          <h3 className="text-[0.94rem] font-bold font-display text-foreground mb-4">Monthly Shipment Growth</h3>
          <div className="flex items-end gap-3 h-40">
            {[320, 450, 380, 520, 610, 490, 580, 720, 650, 810, 760, 890].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary/20 rounded-t-md" style={{ height: `${(val / 890) * 100}%` }} />
                <span className="text-[0.60rem] text-muted-foreground">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

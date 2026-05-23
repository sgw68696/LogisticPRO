'use client';

import { useAuth } from '@/context/AuthContext';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Building2, Users, TrendingUp, DollarSign, Package, Truck } from 'lucide-react';

export default function OrgAdminDashboardPage() {
  const { user } = useAuth();

  return (
    <PageWrapper
      title={`Welcome, ${user?.name ?? 'Organization Admin'}`}
      description="Manage and monitor your organization's companies"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Companies" value={12} icon={<Building2 size={18} />} iconColor="indigo" description="Active companies" trend={{ value: 2, isPositive: true }} />
        <KPICard title="Active Users" value={156} icon={<Users size={18} />} iconColor="cyan" description="Across all companies" trend={{ value: 8, isPositive: true }} />
        <KPICard title="Monthly Revenue" value="₹2.4Cr" icon={<DollarSign size={18} />} iconColor="green" description="Current month" trend={{ value: 12, isPositive: true }} />
        <KPICard title="Total Shipments" value={1247} icon={<Package size={18} />} iconColor="amber" description="This quarter" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border/60 rounded-xl p-5 shadow-soft">
          <h3 className="text-[0.94rem] font-bold font-display text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Create Company', icon: Building2, href: '/orgadmin/companies/create', color: 'bg-primary/10 text-primary border-primary/20' },
              { label: 'View Companies', icon: Building2, href: '/orgadmin/companies', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
              { label: 'Analytics', icon: TrendingUp, href: '/orgadmin/analytics', color: 'bg-success/10 text-success border-success/20' },
              { label: 'Users', icon: Users, href: '/orgadmin/users', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className={`flex items-center gap-3 p-3 rounded-xl border ${action.color} hover:opacity-80 transition-opacity`}
              >
                <action.icon size={18} />
                <span className="text-[0.82rem] font-semibold">{action.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-5 shadow-soft">
          <h3 className="text-[0.94rem] font-bold font-display text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { text: 'New company "FastTrack Logistics" was created', time: '2 hours ago', icon: Building2 },
              { text: 'Shipment SHP-2024-001 arrived at destination', time: '5 hours ago', icon: Truck },
              { text: 'User "Priya Sharma" joined ABC Corp', time: '1 day ago', icon: Users },
              { text: 'Company "Global Cargo" upgraded to Enterprise plan', time: '2 days ago', icon: TrendingUp },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <activity.icon size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-[0.82rem] text-foreground">{activity.text}</p>
                  <p className="text-[0.70rem] text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

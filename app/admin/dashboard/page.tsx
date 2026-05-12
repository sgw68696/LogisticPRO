'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Button } from '@/components/ui/button';
import {
  Building2, Users, TrendingUp, AlertCircle,
} from 'lucide-react';

export default function SuperAdminDashboard() {
  return (
    <PageWrapper title="SuperAdmin Dashboard" description="Platform overview and key metrics">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Companies"
          value="24"
          icon={<Building2 className="w-5 h-5" />}
          trend={{ value: 12, isPositive: true }}
          iconColor="cyan"
        />
        <KPICard
          title="Active Users"
          value="456"
          icon={<Users className="w-5 h-5" />}
          trend={{ value: 8, isPositive: true }}
          iconColor="green"
        />
        <KPICard
          title="Platform Revenue"
          value="$124.5K"
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: 15, isPositive: true }}
          iconColor="indigo"
        />
        <KPICard
          title="Pending Approvals"
          value="3"
          icon={<AlertCircle className="w-5 h-5" />}
          description="Needs review"
          iconColor="amber"
        />
      </div>

      <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg p-8">
        <h2 className="text-xl font-semibold mb-4 text-[#e0f2fe]">Welcome to SuperAdmin Panel</h2>
        <p className="text-[rgba(148,163,184,0.8)] mb-6">
          Manage all aspects of the LogisticsPro platform including companies, users, configurations, and system settings.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline">View All Companies</Button>
          <Button variant="outline">Manage Users</Button>
          <Button variant="outline">System Settings</Button>
        </div>
      </div>
    </PageWrapper>
  );
}

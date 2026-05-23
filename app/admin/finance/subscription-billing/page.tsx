'use client';

import { useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  TrendingUp,
  Users,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { mockCompanies } from '@/data/mockData';

type PlanTier = 'Starter' | 'Professional' | 'Enterprise';
type BillingCycle = 'Monthly' | 'Quarterly' | 'Yearly';

interface SubscriptionPlan {
  tier: PlanTier;
  priceMonthly: number;
  companies: number;
  maxOrganizations: number;
  maxAgents: number;
  features: string[];
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    tier: 'Starter',
    priceMonthly: 299,
    companies: mockCompanies.filter(c => c.plan === 'Starter').length,
    maxOrganizations: 3,
    maxAgents: 30,
    features: ['Basic tracking', 'Email support', 'Up to 500 shipments/month', 'Standard reports'],
  },
  {
    tier: 'Professional',
    priceMonthly: 799,
    companies: mockCompanies.filter(c => c.plan === 'Professional').length,
    maxOrganizations: 5,
    maxAgents: 50,
    features: ['Advanced tracking', 'Priority support', 'Up to 2000 shipments/month', 'Custom reports', 'API access'],
  },
  {
    tier: 'Enterprise',
    priceMonthly: 1999,
    companies: mockCompanies.filter(c => c.plan === 'Enterprise').length,
    maxOrganizations: 20,
    maxAgents: 200,
    features: ['Real-time tracking', 'Dedicated support', 'Unlimited shipments', 'Full analytics', 'API + Webhooks', 'Custom integrations'],
  },
];

const billingCycles: BillingCycle[] = ['Monthly', 'Quarterly', 'Yearly'];

const totalMRR = subscriptionPlans.reduce((sum, p) => sum + p.priceMonthly * p.companies, 0);
const totalCompanies = mockCompanies.filter(c => c.status === 'Active').length;

interface SubscriptionActivity {
  company: string;
  action: string;
  plan: PlanTier;
  date: string;
  status: 'active' | 'expired' | 'cancelled';
}

const recentActivities: SubscriptionActivity[] = [
  { company: 'TechLogistics India', action: 'Plan Upgraded', plan: 'Professional', date: '2025-01-14', status: 'active' },
  { company: 'Global Express Cargo', action: 'Subscription Created', plan: 'Starter', date: '2025-01-12', status: 'active' },
  { company: 'FastMove Logistics', action: 'Payment Received', plan: 'Enterprise', date: '2025-01-10', status: 'active' },
  { company: 'CargoMax Solutions', action: 'Plan Downgraded', plan: 'Professional', date: '2025-01-08', status: 'active' },
  { company: 'ShipRight Inc.', action: 'Subscription Expired', plan: 'Starter', date: '2025-01-05', status: 'expired' },
  { company: 'TransGlobal Logistics', action: 'Subscription Cancelled', plan: 'Enterprise', date: '2025-01-03', status: 'cancelled' },
];

const activityColumns: Column<SubscriptionActivity>[] = [
  { key: 'company', header: 'Company', sortable: true },
  { key: 'action', header: 'Action', sortable: true },
  {
    key: 'plan',
    header: 'Plan',
    sortable: true,
    render: (item) => (
      <Badge variant="outline" className={
        item.plan === 'Enterprise' ? 'border-purple-500/30 text-purple-400' :
        item.plan === 'Professional' ? 'border-blue-500/30 text-blue-400' :
        'border-slate-500/30 text-slate-400'
      }>{item.plan}</Badge>
    ),
  },
  { key: 'date', header: 'Date', sortable: true },
  {
    key: 'status',
    header: 'Status',
    render: (item) => (
      <div className="flex items-center gap-1.5">
        {item.status === 'active' ? (
          <CheckCircle className="w-3.5 h-3.5 text-green-400" />
        ) : item.status === 'expired' ? (
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-red-400" />
        )}
        <span className="capitalize text-xs">{item.status}</span>
      </div>
    ),
  },
];

type CompanySubscription = typeof mockCompanies[number];
const companyColumns: Column<CompanySubscription>[] = [
  { key: 'name', header: 'Company', sortable: true },
  {
    key: 'plan',
    header: 'Plan',
    sortable: true,
    render: (item) => (
      <Badge variant="outline" className={
        item.plan === 'Enterprise' ? 'border-purple-500/30 text-purple-400' :
        item.plan === 'Professional' ? 'border-blue-500/30 text-blue-400' :
        'border-slate-500/30 text-slate-400'
      }>{item.plan}</Badge>
    ),
  },
  {
    key: 'billingCycle',
    header: 'Billing Cycle',
    sortable: true,
  },
  {
    key: 'status',
    header: 'Status',
    render: (item) => (
      <Badge variant="outline" className={
        item.status === 'Active' ? 'border-green-500/30 text-green-400' :
        item.status === 'Pending' ? 'border-amber-500/30 text-amber-400' :
        'border-red-500/30 text-red-400'
      }>{item.status}</Badge>
    ),
  },
  { key: 'currentOrganizations', header: 'Orgs Used', sortable: true, className: 'text-right' },
  { key: 'currentAgents', header: 'Agents Used', sortable: true, className: 'text-right' },
];

export default function SubscriptionBillingPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'companies'>('plans');

  return (
    <PageWrapper title="Subscription Billing" description="Manage platform subscription plans and billing">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Active Subscriptions"
          value={totalCompanies}
          icon={<Building2 className="w-5 h-5" />}
          trend={{ value: 2, isPositive: true }}
          iconColor="cyan"
        />
        <KPICard
          title="Monthly Recurring Revenue"
          value={`₹${(totalMRR * 100).toLocaleString('en-IN')}`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: 8, isPositive: true }}
          iconColor="green"
        />
        <KPICard
          title="Churn Rate"
          value="2.4%"
          icon={<Users className="w-5 h-5" />}
          trend={{ value: 0.3, isPositive: true }}
          iconColor="indigo"
        />
        <KPICard
          title="Pending Renewals"
          value="5"
          icon={<Calendar className="w-5 h-5" />}
          description="Next 30 days"
          iconColor="amber"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.tier}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className={
                  plan.tier === 'Enterprise' ? 'text-purple-400' :
                  plan.tier === 'Professional' ? 'text-blue-400' :
                  'text-slate-300'
                }>{plan.tier}</span>
                <span className="text-lg font-bold text-foreground">₹{plan.priceMonthly * 100}<span className="text-xs text-muted-foreground font-normal">/mo</span></span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{plan.companies} company{plan.companies !== 1 ? 'ies' : 'y'}</span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max Organizations</span>
                  <span className="text-foreground font-medium">{plan.maxOrganizations}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max Agents</span>
                  <span className="text-foreground font-medium">{plan.maxAgents}</span>
                </div>
              </div>
              <ul className="space-y-1.5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              Subscription Details
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant={activeTab === 'plans' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('plans')}
              >
                Recent Activity
              </Button>
              <Button
                variant={activeTab === 'companies' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('companies')}
              >
                All Companies
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'plans' ? (
            <DataTable
              data={recentActivities}
              columns={activityColumns}
              searchKey="company"
              searchPlaceholder="Search by company..."
              pageSize={5}
            />
          ) : (
            <DataTable
              data={mockCompanies}
              columns={companyColumns}
              searchKey="name"
              searchPlaceholder="Search companies..."
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

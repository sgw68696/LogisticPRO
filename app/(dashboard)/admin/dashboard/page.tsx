"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { useAuth } from '@/context/AuthContext';
import { mockCompanies, mockOrganizations, mockAgents, mockUsers } from '@/data/mockData';
import {
  Building2, Briefcase, Users, BarChart3, CheckCircle, Clock,
  AlertTriangle, TrendingUp, ArrowRight, Plus, Eye, Edit2, Trash2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const { user, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSuperAdmin) {
      router.push('/dashboard');
      return;
    }
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [isSuperAdmin, router]);

  if (loading) {
    return (
      <PageWrapper title="Super Admin Dashboard">
        <SkeletonLoader variant="card" count={6} />
      </PageWrapper>
    );
  }

  // Calculate metrics
  const totalCompanies = mockCompanies.length;
  const activeCompanies = mockCompanies.filter(c => c.status === 'Active').length;
  const pendingCompanies = mockCompanies.filter(c => c.registrationStatus === 'Submitted').length;
  const totalOrganizations = mockOrganizations.length;
  const totalAgents = mockAgents.length;
  const totalUsers = mockUsers.length;

  // Chart data for company growth
  const companyGrowthData = [
    { month: 'Jan', companies: 2, organizations: 2, agents: 3 },
    { month: 'Feb', companies: 3, organizations: 3, agents: 6 },
    { month: 'Mar', companies: 5, organizations: 6, agents: 12 },
    { month: 'Apr', companies: 8, organizations: 10, agents: 18 },
    { month: 'May', companies: 12, organizations: 15, agents: 28 },
    { month: 'Jun', companies: 15, organizations: 20, agents: 35 },
  ];

  // Chart data for registration status
  const registrationData = mockCompanies.map(c => ({
    name: c.name.split(' ')[0],
    status: c.registrationStatus,
    date: c.registrationDate,
  }));

  const tooltipStyle = {
    backgroundColor: 'rgba(8, 14, 28, 0.97)',
    border: '1px solid rgba(14, 165, 233, 0.2)',
    borderRadius: '10px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.82rem',
  };

  return (
    <PageWrapper
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'Admin'}`}
      description="Super Admin dashboard - Manage all companies, organizations, and system operations"
    >
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <KPICard
          title="Total Companies"
          value={totalCompanies}
          icon={<Building2 className="w-5 h-5" />}
          iconColor="purple"
          trend={{ value: 25, isPositive: true }}
          description="Active & pending"
        />
        <KPICard
          title="Active Companies"
          value={activeCompanies}
          icon={<CheckCircle className="w-5 h-5" />}
          iconColor="green"
          trend={{ value: 8, isPositive: true }}
          description="vs last month"
        />
        <KPICard
          title="Total Organizations"
          value={totalOrganizations}
          icon={<Briefcase className="w-5 h-5" />}
          iconColor="blue"
          trend={{ value: 12, isPositive: true }}
          description="Across all companies"
        />
        <KPICard
          title="Total Agents"
          value={totalAgents}
          icon={<Users className="w-5 h-5" />}
          iconColor="cyan"
          trend={{ value: 18, isPositive: true }}
          description="Active users"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Growth Chart */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Platform Growth</h3>
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={companyGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,165,233,0.1)" />
              <XAxis dataKey="month" stroke="rgba(148,163,184,0.5)" />
              <YAxis stroke="rgba(148,163,184,0.5)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="companies" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="organizations" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="agents" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Registration Status */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Registration Status</h3>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Approved</p>
                <p className="text-xs text-muted-foreground">Active registrations</p>
              </div>
              <Badge variant="default" className="bg-green-500/20 text-green-400">
                {activeCompanies}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </div>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                {pendingCompanies}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Organizations</p>
                <p className="text-xs text-muted-foreground">Total created</p>
              </div>
              <Badge variant="outline">{totalOrganizations}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Companies Table */}
      <div className="mt-6 bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Companies</h3>
          <Link href="/companies">
            <Button size="sm" variant="outline">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Company</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Plan</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Orgs</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockCompanies.map(company => (
                <tr key={company.id} className="border-b border-border hover:bg-background/50 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-foreground">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{company.businessType}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={company.status === 'Active' ? 'default' : 'secondary'}
                      className={company.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}
                    >
                      {company.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{company.plan}</td>
                  <td className="py-3 px-4 text-muted-foreground">{company.currentOrganizations}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/companies/${company.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}

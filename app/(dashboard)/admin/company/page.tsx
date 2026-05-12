"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { useAuth } from '@/context/AuthContext';
import { mockCompanies, mockOrganizations, mockAgents, mockUsers } from '@/data/mockData';
import {
  Briefcase, Users, TrendingUp, Settings, Plus, Eye, Edit2,
  DollarSign, BarChart3, AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function CompanyAdminDashboardPage() {
  const router = useRouter();
  const { user, isCompanyAdmin, getCurrentCompanyId } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isCompanyAdmin && user?.role !== 'CompanyAdmin') {
      router.push('/dashboard');
      return;
    }
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [isCompanyAdmin, user, router]);

  const companyId = getCurrentCompanyId() || user?.companyId;
  const company = mockCompanies.find(c => c.id === companyId);
  const organizations = mockOrganizations.filter(o => o.companyId === companyId);
  const agents = mockAgents.filter(a => a.companyId === companyId);

  if (loading || !company) {
    return (
      <PageWrapper title="Company Administration">
        <SkeletonLoader variant="card" count={4} />
      </PageWrapper>
    );
  }

  // Chart data for agent distribution by organization
  const agentDistribution = organizations.map(org => ({
    name: org.name.split(' ')[0],
    agents: agents.filter(a => a.organizationId === org.id).length,
  }));

  const departmentMetrics = [
    { name: 'Bangalore', value: 45 },
    { name: 'Mumbai', value: 35 },
  ];

  const tooltipStyle = {
    backgroundColor: 'rgba(8, 14, 28, 0.97)',
    border: '1px solid rgba(14, 165, 233, 0.2)',
    borderRadius: '10px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.82rem',
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  return (
    <PageWrapper
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'Admin'}`}
      description={`Managing ${company.name} - Company Administration Dashboard`}
    >
      {/* Company Header Card */}
      <div className="mb-8 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-500/20 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{company.name}</h2>
            <p className="text-muted-foreground mb-3">{company.registeredAddress}, {company.city}</p>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                {company.plan} Plan
              </Badge>
              <Badge variant="default" className={
                company.status === 'Active' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }>
                {company.status}
              </Badge>
            </div>
          </div>
          <Link href="/company">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Company Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <KPICard
          title="Organizations"
          value={organizations.length}
          icon={<Briefcase className="w-5 h-5" />}
          iconColor="blue"
          description="Departments & divisions"
        />
        <KPICard
          title="Total Agents"
          value={agents.length}
          icon={<Users className="w-5 h-5" />}
          iconColor="purple"
          description="Active users"
        />
        <KPICard
          title="Subscription"
          value={company.plan}
          icon={<DollarSign className="w-5 h-5" />}
          iconColor="green"
          description={company.billingCycle} 
        />
        <KPICard
          title="Capacity Usage"
          value={`${Math.round((agents.length / company.maxAgents) * 100)}%`}
          icon={<BarChart3 className="w-5 h-5" />}
          iconColor="cyan"
          description={`${agents.length}/${company.maxAgents} agents`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Agent Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Agent Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={agentDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,165,233,0.1)" />
              <XAxis dataKey="name" stroke="rgba(148,163,184,0.5)" />
              <YAxis stroke="rgba(148,163,184,0.5)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="agents" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Overview */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Department Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={departmentMetrics}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentMetrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Organizations List */}
      <div className="mt-6 bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Organizations</h3>
          <Link href="/organizations">
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Organization
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Organization</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Agents</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map(org => (
                <tr key={org.id} className="border-b border-border hover:bg-background/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-foreground">{org.name}</p>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{org.type}</td>
                  <td className="py-3 px-4 text-muted-foreground">{org.city}, {org.state}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">
                      {agents.filter(a => a.organizationId === org.id).length}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={org.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                      {org.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Agents */}
      <div className="mt-6 bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Agents</h3>
          <Link href="/agents">
            <Button size="sm" variant="outline">View All</Button>
          </Link>
        </div>
        <div className="space-y-3">
          {agents.slice(0, 5).map(agent => (
            <div key={agent.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg hover:bg-background transition-colors">
              <div className="flex-1">
                <p className="font-medium text-foreground">{agent.name}</p>
                <p className="text-xs text-muted-foreground">{agent.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <RoleBadge role={agent.roleAssignments[0]?.roleType || 'Staff'} size="sm" />
                <Badge variant="outline">{agent.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

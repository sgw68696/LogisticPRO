"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { useAuth } from '@/context/AuthContext';
import { mockAgents, mockShipments } from '@/data/mockData';
import {
  Users, Activity, TrendingUp, Award, Plus, MessageSquare,
  Clock, CheckCircle, AlertCircle, Target
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export default function ManagerDashboardPage() {
  const { user, getCurrentCompanyId, getCurrentOrganizationId } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const companyId = getCurrentCompanyId();
  const orgId = getCurrentOrganizationId();
  
  // Filter agents for this manager's organization
  const teamAgents = mockAgents.filter(a => 
    a.companyId === companyId && (orgId ? a.organizationId === orgId : true)
  );

  const activeAgents = teamAgents.filter(a => a.status === 'Active').length;
  const teamShipments = mockShipments.slice(0, 10);
  
  if (loading) {
    return (
      <PageWrapper title="Team Dashboard">
        <SkeletonLoader variant="card" count={4} />
      </PageWrapper>
    );
  }

  // Performance data
  const performanceData = [
    { name: 'Efficiency', value: 85 },
    { name: 'Delivery', value: 92 },
    { name: 'Compliance', value: 88 },
    { name: 'Safety', value: 95 },
    { name: 'Satisfaction', value: 87 },
    { name: 'Response', value: 90 },
  ];

  // Team activity trend
  const activityTrend = [
    { week: 'W1', shipments: 45, deliveries: 42, issues: 3 },
    { week: 'W2', shipments: 52, deliveries: 48, issues: 2 },
    { week: 'W3', shipments: 48, deliveries: 46, issues: 4 },
    { week: 'W4', shipments: 61, deliveries: 59, issues: 2 },
  ];

  const tooltipStyle = {
    backgroundColor: 'rgba(8, 14, 28, 0.97)',
    border: '1px solid rgba(14, 165, 233, 0.2)',
    borderRadius: '10px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.82rem',
  };

  return (
    <PageWrapper
      title={`Team Management - ${user?.name?.split(' ')[0]}`}
      description="Monitor team performance, assignments, and operational metrics"
    >
      {/* Team Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <KPICard
          title="Team Members"
          value={teamAgents.length}
          icon={<Users className="w-5 h-5" />}
          iconColor="blue"
          trend={{ value: 2, isPositive: true }}
          description="Active agents"
        />
        <KPICard
          title="Active Now"
          value={activeAgents}
          icon={<Activity className="w-5 h-5" />}
          iconColor="green"
          description="On duty"
        />
        <KPICard
          title="This Week"
          value={`${teamShipments.length}`}
          icon={<TrendingUp className="w-5 h-5" />}
          iconColor="cyan"
          description="Shipments managed"
        />
        <KPICard
          title="Avg Rating"
          value="4.6"
          icon={<Award className="w-5 h-5" />}
          iconColor="purple"
          description="out of 5.0"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Team Performance Radar */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Team Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={performanceData}>
              <PolarGrid stroke="rgba(14,165,233,0.1)" />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <PolarRadiusAxis stroke="rgba(14,165,233,0.2)" />
              <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Trend */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,165,233,0.1)" />
              <XAxis dataKey="week" stroke="rgba(148,163,184,0.5)" />
              <YAxis stroke="rgba(148,163,184,0.5)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="shipments" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="deliveries" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Members */}
      <div className="mt-6 bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Team Members ({teamAgents.length})</h3>
          <Link href="/agents">
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Agent
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {teamAgents.map(agent => (
            <div
              key={agent.id}
              className="flex items-center justify-between p-4 bg-background/50 rounded-lg hover:bg-background transition-colors border border-border/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-medium text-foreground">{agent.name}</p>
                  <RoleBadge role={agent.roleAssignments[0]?.roleType || 'Staff'} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">{agent.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={agent.status === 'Active' ? 'default' : 'secondary'}>
                  {agent.status}
                </Badge>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="mt-6 bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Team Shipments</h3>
          <Link href="/shipments">
            <Button size="sm" variant="outline">View All</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Shipment ID</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">From</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">To</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Handler</th>
              </tr>
            </thead>
            <tbody>
              {teamShipments.slice(0, 5).map(shipment => (
                <tr key={shipment.id} className="border-b border-border hover:bg-background/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{shipment.id}</td>
                  <td className="py-3 px-4 text-muted-foreground">{shipment.origin}</td>
                  <td className="py-3 px-4 text-muted-foreground">{shipment.destination}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">{shipment.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">Driver {shipment.assignedDriver}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}

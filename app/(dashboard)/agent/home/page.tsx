"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KPICard } from '@/components/shared/KPICard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { useAuth } from '@/context/AuthContext';
import { mockShipments, mockNotifications } from '@/data/mockData';
import {
  CheckCircle, Clock, AlertCircle, Package, Calendar, Zap,
  ChevronRight, FileCheck, MapPin
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AgentDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Get agent's assigned shipments
  const assignedShipments = mockShipments.filter(s => 
    s.status !== 'Delivered' && s.status !== 'Cancelled'
  ).slice(0, 10);

  const completedToday = mockShipments.filter(s => 
    s.status === 'Delivered'
  ).length;

  const pendingTasks = assignedShipments.filter(s => 
    s.status === 'Pending' || s.status === 'Picked Up'
  ).length;

  const inTransit = assignedShipments.filter(s => 
    s.status === 'In Transit'
  ).length;

  const recentNotifications = mockNotifications.slice(0, 5);

  if (loading) {
    return (
      <PageWrapper title="Agent Dashboard">
        <SkeletonLoader variant="card" count={4} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={`Welcome, ${user?.name?.split(' ')[0] || 'Agent'}`}
      description="Your daily operations and task assignments"
    >
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <KPICard
          title="Assigned"
          value={assignedShipments.length}
          icon={<Package className="w-5 h-5" />}
          iconColor="blue"
          description="Active shipments"
        />
        <KPICard
          title="In Transit"
          value={inTransit}
          icon={<MapPin className="w-5 h-5" />}
          iconColor="cyan"
          description="On the road"
        />
        <KPICard
          title="Pending"
          value={pendingTasks}
          icon={<Clock className="w-5 h-5" />}
          iconColor="amber"
          description="Action needed"
        />
        <KPICard
          title="Completed"
          value={completedToday}
          icon={<CheckCircle className="w-5 h-5" />}
          iconColor="green"
          description="This month"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* My Tasks */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Active Assignments
            </h3>
            <Link href="/shipments">
              <Button size="sm" variant="outline" className="flex items-center gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {assignedShipments.slice(0, 6).map((shipment, idx) => (
              <div
                key={shipment.id}
                className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50 hover:border-primary/50 transition-colors group cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-foreground">{shipment.id}</span>
                    <Badge 
                      variant="secondary"
                      className={
                        shipment.status === 'In Transit' ? 'bg-blue-500/20 text-blue-400' :
                        shipment.status === 'Out for Delivery' ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }
                    >
                      {shipment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {shipment.origin} → {shipment.destination}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString() : 'TBD'}
                  </p>
                  <Button size="sm" variant="ghost" className="h-8 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            Updates
          </h3>
          <div className="space-y-3">
            {recentNotifications.slice(0, 5).map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-lg border ${
                  notif.read
                    ? 'bg-background/30 border-border/50'
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <p className="text-sm font-medium text-foreground mb-1">
                  {notif.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notif.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <Link href="/shipments/create">
            <Button variant="outline" className="w-full h-auto py-3 flex items-center justify-center gap-2 hover:bg-blue-500/10">
              <Package className="w-4 h-4" />
              New Shipment
            </Button>
          </Link>
          <Link href="/dispatch">
            <Button variant="outline" className="w-full h-auto py-3 flex items-center justify-center gap-2 hover:bg-cyan-500/10">
              <MapPin className="w-4 h-4" />
              View Map
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline" className="w-full h-auto py-3 flex items-center justify-center gap-2 hover:bg-purple-500/10">
              <FileCheck className="w-4 h-4" />
              My Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Schedule */}
      <div className="mt-6 bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Schedule
        </h3>
        <div className="grid gap-4 md:grid-cols-7">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
            <div
              key={day}
              className={`p-3 rounded-lg text-center border ${
                idx < 5
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-background/50 border-border'
              }`}
            >
              <p className="text-xs font-medium text-muted-foreground mb-2">{day}</p>
              <p className="text-lg font-bold text-foreground">
                {Math.floor(Math.random() * 8) + 1}
              </p>
              <p className="text-xs text-muted-foreground">tasks</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
